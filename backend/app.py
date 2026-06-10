"""
app.py
Flask API server

Endpoints available:
    GET /api/status                 Health Check + last_updated + error state
    GET /api/nodes                  All nodes (raw)
  GET /api/nodes/<name>             Single node by name (raw)
  GET /api/vms                      All VMs (raw)
  GET /api/vms/<vmid>               Single VM by ID (raw)
  GET /api/summary                  Processed totals — the only place maths happens
"""

import os
import threading
import time

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from functools import wraps

from proxmox_client import ProxmoxClient
from collector import fetch_all
from cache import DataCache

load_dotenv()

PVE_HOST = os.getenv("PVE_HOST", "https://192.168.0.2:8006")
PVE_API_TOKEN = os.getenv("PVE_API_TOKEN", "apiuser@pve!labtoken")
PVE_API_KEY = os.getenv("PVE_API_KEY", "")
VERIFY_SSL = os.getenv("PVE_VERIFY_SSL", "false").lower() == "true"
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))   # seconds between collections
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))

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


# Collector that loops every POLL_INTERVAL seconds to query from ProxmoxVE API
def collector_loop():
    while True:
        try:
            data = fetch_all(client)
            cache.update(data["nodes"], data["vms"])
            print(f"[collector] OK - {len(data['nodes'])} nodes, {len(data['vms'])} VMs")
            
            # TODO: Add wirte to InfluxDB
            # Write to InfluxDB
        
        except RuntimeError as exc:
            cache.set_error(str(exc))
            print(f"[collector] ERROR - {exc}")

        time.sleep(POLL_INTERVAL)


# Run before FLASK to early prepare data in cache before request
_thread = threading.Thread(target=collector_loop, daemon=True)
_thread.start()


# FLASK APP
app = Flask(__name__)
CORS(app)


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

# --- /api/status --- RETURN STATUS OF API
@app.route("/api/status")
@require_api_key
def status():
    state = cache.get()
    return api_response({
        "last_updated": state["last_updated"],
        "error": state["error"],
        "poll_interval": POLL_INTERVAL,
        "nodes_cached": len(state["nodes"]),
        "vms_cached": len(state["vms"])
    })


# --- /api/nodes --- RETURN NODES DATA
# all nodes data
@app.route("/api/nodes")
@require_api_key
def get_nodes():
    return api_response(cache.get_nodes())


# single specific node data
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


# single specific vms data
@app.route("/api/vm/<int:vmid>")
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

    return api_response({
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
    })


if __name__ == "__main__":
    print(f"\n{'-'*30}")
    print(f"    Proxmox Dashboard API")
    print(f"    Listening: https://127.0.0.1:{FLASK_PORT}")
    print(f"    Auth: X-API-Key required")
    print(f"\n{'-'*30}")

    app.run(host="127.0.0.1", port=FLASK_PORT,debug=False)
