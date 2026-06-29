"""
app.py
Flask API server

DATA TIERS:
    T1 - WebSocket: live push every 5s (primary)
    T2 - REST API: poll every 5 seconds if WebSocket fails (secondary)
    T3 - InfluxDB: stale last-known data, historical queries if REST API also fails (last resort)

WebSocket Events (Server -> Client):
    metrics - Full snapshot on vms, nodes and summary (every 5s)
    node_status_change - node goes online/offline (instant)
    vm_status_change - VM start/stop/paused - instant
    collector_error - collector failed (instant)

REST Endpoints available:
    GET /api/status                         Health Check for all TIERS
    GET /api/nodes                          All nodes (raw) - T2
    GET /api/nodes/<name>                   Single node by name (raw) - T2
    GET /api/vms                            All VMs (raw) - T2
    GET /api/vms/<vmid>                     Single VM by ID (raw) - T2
    GET /api/summary                        Processed totals — the only place maths happens - T2

    GET /api/history/cluster?hours=N        Cluster history - T3/Chart
    GET /api/history/nodes/<name>?hours=N   Node history -T3/Chart
    GET /api/history/vms/<vmid>?hours=N     VM history - T3/Chart

Authentication:
    REST: X-API-KEY header on each request
    WebSocket: api_key used as auth object
    
"""

import os
import threading
import time
from datetime import timezone, datetime
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, disconnect

from proxmox_client import ProxmoxClient
from collector import fetch_all
from cache import DataCache
from influx_controller import InfluxController

load_dotenv()

PVE_HOST = os.getenv("PVE_HOST", "https://192.168.0.2:8006")
PVE_API_TOKEN = os.getenv("PVE_API_TOKEN", "apiuser@pve!labtoken")
PVE_API_KEY = os.getenv("PVE_API_KEY", "")
VERIFY_SSL = os.getenv("PVE_VERIFY_SSL", "false").lower() == "true"
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))   # seconds between collections
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")

INFLUXDB_URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN", "")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG", "")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "proxmox")

DASHBOARD_API_KEY = os.getenv("DASHBOARD_API_KEY", "")

# Early validation - alert missing config early
_missing = [name for name, val in {
    "PVE_API_KEY": PVE_API_KEY,
    "INFLUXDB_TOKEN": INFLUXDB_TOKEN,
    "INFLUXDB_ORG": INFLUXDB_ORG,
    "DASHBOARD_API_KEY": DASHBOARD_API_KEY
}.items() if not val]

if _missing:
    raise RuntimeError(f"Missing required .env varaible(s): {', '.join(_missing)}")

cache = DataCache()
client = ProxmoxClient(PVE_HOST, PVE_API_TOKEN, PVE_API_KEY, VERIFY_SSL)
influx = InfluxController(INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET)


# FLASK APP
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")


# ----- HELPER SECTION -----
def build_summary(nodes: list, vms: list) -> dict:
    # Node Counts
    total_nodes = len(nodes)
    online_nodes = sum(1 for n in nodes if n.get("status") == "online")
    offline_nodes = total_nodes - online_nodes

    # VM Counts
    total_vms = len(vms)
    running_vms = sum(1 for v in vms if v.get("status") == "running")
    stopped_vms = sum(1 for v in vms if v.get("status") == "stopped")
    other_vms = total_vms - running_vms - stopped_vms

    # Total Physical Resources across Online Nodes
    online = [n for n in nodes if n.get("status") == "online"]
    node_maxcpu = sum(n.get("maxcpu", 0) for n in online)
    node_cpu_usage = round(sum(n.get("cpu", 0) for n in online) / len(online) * 100, 1) if online else 0
    node_maxmem = sum(n.get("maxmem", 0) for n in online)
    node_mem = sum(n.get("mem", 0) for n in online)
    node_maxdisk = sum(n.get("maxdisk", 0) for n in online)
    node_disk = sum(n.get("disk", 0) for n in online)

    return {
        "nodes": {
            "total": total_nodes,
            "online": online_nodes,
            "offline": offline_nodes
        },
        "vms": {
            "total": total_vms,
            "running": running_vms,
            "stopped": stopped_vms,
            "other": other_vms
        },
        "node_resources": {
            "cpu": {
                "total_cores": node_maxcpu,
                "used_pct": node_cpu_usage,
                "free_pct": round(100 - node_cpu_usage, 2)
            },
            "memory": {
                "total_bytes": node_maxmem,
                "used_bytes": node_mem,
                "free_bytes": node_maxmem - node_mem,
                "used_pct": round(node_mem / node_maxmem * 100, 2) if node_maxmem else 0
            },
            "disk": {
                "total_bytes": node_maxdisk,
                "used_bytes": node_disk,
                "free_bytes": node_maxdisk - node_disk,
                "used_pct": round(node_disk / node_maxdisk * 100, 2) if node_maxdisk else 0
            }
        }
    }


# ----- T1: WebSocket SECTION -----
# Authentication on connection - immidiate snapshot psuh on first successful connect
# TODO: ENCRYPTION/HASHING ON KEY TRANSFER
@socketio.on("connect")
def on_connect(auth):
    key = (auth or {}).get("key", "")
    if key != DASHBOARD_API_KEY:
        print("[WebSocket] Connection Rejected - invalid API Key")
        disconnect()
        return
    print("[WebSocket] Client connected")

    nodes = cache.get_nodes()
    vms = cache.get_vms()
    socketio.emit("metrics", {
        "nodes": nodes,
        "vms": vms,
        "summary": build_summary(nodes, vms),
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@socketio.on("disconnect")
def on_disconnect():
    print("[WebSocket] Client disconnected")


# --- Collector Loops and Threads ---
def _node_states(nodes: list[dict]) -> dict:
    return {n.get("node"): n.get("status") for n in nodes}


def _vm_states(vms: list[dict]) -> dict:
    return {v.get("vmid"): v.get("status") for v in vms}


# Collector that loops every POLL_INTERVAL, (Push live data over WebSocket (Tier 1), cache for Tier 2 to read, save cache into InfluxDB as history (Tier 3)
def collector_loop():
    prev_node_states: dict = {}
    prev_vm_states: dict = {}

    while True:
        t_start = time.monotonic()
        try:
            data = fetch_all(client)
            response_ms = (time.monotonic() - t_start) * 1000

            nodes = data["nodes"]
            vms = data["vms"]

            # Record Proxmox responses attempt
            cache.set_upstream_result(
                service="proxmox",
                reachable=True,
                response_ms=response_ms,
                error=None,
            )

            # Detect node state change (Primary)
            curr_node_states = _node_states(nodes)
            for node_name, curr_status in curr_node_states.items():
                prev_status = prev_node_states.get(node_name)
                if prev_status is not None and prev_status != curr_status:
                    socketio.emit("node_status_change", {
                        "node": node_name,
                        "prev_status": prev_status,
                        "curr_status": curr_status,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    print(f"[event] node: {node_name} {prev_status}→{curr_status}")

            # Detect vm state change (Primary)
            curr_vm_states = _vm_states(vms)
            for vmid, curr_status in curr_vm_states.items():
                prev_status = prev_vm_states.get(vmid)
                if prev_status is not None and prev_status != curr_status:
                    socketio.emit("vm_status_change", {
                        "vm": vmid,
                        "prev_status": prev_status,
                        "curr_status": curr_status,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    print(f"[event] node: {vmid} {prev_status}→{curr_status}")

            prev_node_states = curr_node_states
            prev_vm_states = curr_vm_states

            # Push metrics over WebSocket
            socketio.emit("metrics", {
                "nodes":     nodes,
                "vms":       vms,
                "summary":   build_summary(nodes, vms),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

            # Cache update 
            cache.update(nodes, vms)
            print(f"[collector] OK - {len(data['nodes'])} nodes, {len(data['vms'])} VMs")
            
            # Write to InfluxDB
            try:
                influx.write_all(data["nodes"], data["vms"])
                print (f"[influx] OK - {len(data['nodes'])} nodes and {len(data['vms'])} VMs written to InfluxDB")
            except Exception as exc:
                print(f"[influx] ERROR - failed to write into InfluxDB: {exc}")
        
        except RuntimeError as exc:
            response_ms = (time.monotonic() - t_start) * 1000  

            # Record failed Proxmox fetch attempt
            cache.set_upstream_result(
                service="proxmox",
                reachable=False,
                response_ms=response_ms,
                error=str(exc),
            )

            cache.set_error(str(exc))
            print(f"[collector] ERROR - {exc}")
            socketio.emit("websocket_collector_error", {
                "message": str(exc),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

        time.sleep(POLL_INTERVAL)


# Run before FLASK to early prepare data in cache before request
_thread = threading.Thread(target=collector_loop, daemon=True)
_thread.start()


# ----- REST API SECTION -----
# Wraps status and responses together
def api_response(data, status_code=200):
    return jsonify({"ok": True, "data": data}), status_code


# Wraps status and error message together
def api_error(message, status_code=500):
    return jsonify({"ok": False, "error": message}), status_code


# API Key authentication decorator for any route
def require_api_key(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        key = request.headers.get("X-API-Key", "")
        if not key:
            return api_error("Missing X-API-Key header", 401)
        if key != DASHBOARD_API_KEY:
            return api_error("Invalid X-API-Key", 403)
        return func(*args, **kwargs)
    return decorated


# API paths
# Live Data APIs
# --- /api/status --- RETURN STATUS OF API
@app.route("/api/status")
@require_api_key
def status():
    state = cache.get()
    return api_response({
        "last_updated": state["last_updated"],
        "error": state["error"],
        "nodes_cached": len(state["nodes"]),
        "vms_cached": len(state["vms"]),
        "upstream": state["upstream"]
    })


# --- /api/nodes --- RETURN NODES DATA
# all nodes data
@app.route("/api/nodes")
@require_api_key
def get_nodes():
    return api_response(cache.get_nodes())


# --- /api/node/{node_name} --- single specific node data
@app.route("/api/nodes/<string:node_name>")
@require_api_key
def get_node(node_name):
    node = next((n for n in cache.get_nodes() if n.get("node") == node_name), None)
    if node is None:
        return api_error(f"Node '{node_name}' not found", 404)
    return api_response(node)


# --- /api/vms --- RETURN VIRTUAL MACHINE DATA
# all vms data
@app.route("/api/vms")
@require_api_key
def get_vms():
    return api_response(cache.get_vms())


# --- /api/vm/{node_name} --- single specific vms data
@app.route("/api/vms/<int:vmid>")
@require_api_key
def get_vm(vmid):
    vm = next((v for v in cache.get_vms() if v.get("vmid") == vmid), None)
    if vm is None:
        return api_error(f"VM '{vmid}' not found", 404)
    return api_response(vm)


# --- /api/summary --- RETURN SUMMARIZED PROCESSED DATA
@app.route("/api/summary")
@require_api_key
def get_summary():
    nodes = cache.get_nodes()
    vms = cache.get_vms()
    return api_response(build_summary(nodes, vms))


# Historical Data API
# Retrieve historical data of single node
@app.route("/api/history/nodes/<string:node_name>")
@require_api_key
def history_node(node_name):
    hours = request.args.get("hours", 24, type=int)
    try:
        return api_response(influx.query_node_history(node_name=node_name, hours=hours))
    except Exception as exc:
        return api_error(f"History data query failed: {exc}")
    

# Retrieve historical data of single vm
@app.route("/api/history/vms/<int:vmid>")
@require_api_key
def history_vm(vmid):
    hours = request.args.get("hours", 24, type=int)
    try:
        return api_response(influx.query_vm_history(vmid=vmid, hours=hours))
    except Exception as exc:
        return api_error(f"History data query failed: {exc}")
    

# Retrieve historical data of cluster
@app.route("/api/history/cluster")
@require_api_key
def history_cluster():
    hours = request.args.get("hours", 24, type=int)
    try:
        rows = influx.query_cluster_history(hours=hours)
        
        # Aggregate per timestamp across all nodes
        from collections import defaultdict
        buckets = defaultdict(lambda: {"cpu_sum": 0, "cpu_count": 0,
                                        "mem_used": 0, "mem_total": 0})
        for row in rows:
            t = row["time"]
            buckets[t]["cpu_sum"]   += row.get("cpu_used", 0)
            buckets[t]["cpu_count"] += 1
            buckets[t]["mem_used"]  += row.get("mem_used", 0)
            buckets[t]["mem_total"] += row.get("mem_total", 0)
        
        chart_points = []
        for t in sorted(buckets):
            b = buckets[t]
            cpu_pct = round(b["cpu_sum"] / b["cpu_count"] * 100, 1) if b["cpu_count"] else 0
            mem_pct = round(b["mem_used"] / b["mem_total"] * 100, 2) if b["mem_total"] else 0
            chart_points.append({"time": t, "cpu": cpu_pct, "memory": mem_pct})
        
        return api_response(chart_points)
    except Exception as exc:
        return api_error(f"History query failed: {exc}")


if __name__ == "__main__":
    print(f"\n{'-'*30}")
    print(f"    Proxmox Dashboard API")
    print(f"    Listening: http://{FLASK_HOST}:{FLASK_PORT}")
    print(f"    Auth: X-API-Key required / auth.key (WebSocket)")
    print(f"\n{'-'*30}")

    socketio.run(app, host=FLASK_HOST, port=FLASK_PORT, debug=False, allow_unsafe_werkzeug=True)
