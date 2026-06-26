"""
collector.py
Fetch raw data from ProxmoxVE API and return structured (unprocessed)
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from proxmox_client import ProxmoxClient

# Max threads — one per enrichment call per node
# 3 sub calls per node, (e.g. 10 nodes = 10 * 3 + 2 buffer => 32 WORKERS MAX)
MAX_WORKERS = 32


# Per-node enrichment helpers — each handles one extra API call for one node
def _enrich_ip(client: ProxmoxClient, entry: dict, node_name: str):
    try:
        interfaces = client.get(f"/nodes/{node_name}/network")["data"]

        # Kept vmbr0-first logic — most reliable for Proxmox
        vmbr0 = next(
            (i for i in interfaces
             if i.get("iface") == "vmbr0"
             and i.get("address")),
            None
        )
        other = next(
            (i for i in interfaces
             if i.get("address")
             and i.get("type") != "loopback"
             and i.get("address") != "127.0.0.1"),
            None
        )
        chosen = vmbr0 or other
        entry["ip_address"] = chosen.get("address") if chosen else None
    except RuntimeError:
        pass  # stays None


def _enrich_storages(client: ProxmoxClient, entry: dict, node_name: str):
    try:
        entry["storages"] = client.get(f"/nodes/{node_name}/storage")["data"]
    except RuntimeError:
        pass  # stays []


def _enrich_throughput(client: ProxmoxClient, entry: dict, node_name: str):
    try:
        # Use rrddata for actual live throughput rates
        rrd = client.get(f"/nodes/{node_name}/rrddata?timeframe=hour&cf=AVERAGE")["data"]

        # Get the most recent non-null data point
        latest = None
        for point in reversed(rrd):
            if point.get("netin") is not None:
                latest = point
                break

        if latest:
            entry["netin"] = latest.get("netin", 0)
            entry["netout"] = latest.get("netout", 0)
            entry["iowait"] = latest.get("iowait", 0)
        else:
            entry["netin"] = 0
            entry["netout"] = 0
            entry["iowait"] = 0

    except RuntimeError:
        entry["netin"] = 0
        entry["netout"] = 0
        entry["iowait"] = 0


# Per-node enrichment — fires all 3 sub-calls concurrently for one node
def _enrich_node(client: ProxmoxClient, node: dict) -> dict:
    entry = dict(node)
    entry["ip_address"] = None
    entry["storages"] = []
    entry["netin"] = 0
    entry["netout"] = 0
    entry["iowait"] = 0

    # Offline nodes — no enrichment calls possible
    if node.get("status") != "online":
        return entry

    node_name = node["node"]

    # CHANGE: fire all 3 enrichment calls at the same time for this node
    with ThreadPoolExecutor(max_workers=3) as node_pool:
        futures = [
            node_pool.submit(_enrich_ip, client, entry, node_name),
            node_pool.submit(_enrich_storages, client, entry, node_name),
            node_pool.submit(_enrich_throughput, client, entry, node_name),
        ]
        for future in as_completed(futures):
            exc = future.exception()
            if exc:
                print(f"  WARN: enrichment error for {node_name}: {exc}")

    return entry


# Raw node list from '/nodes', enriched concurrently per node
# Offline nodes will not have metrics fields
def fetch_nodes(client: ProxmoxClient) -> list[dict]:
    raw_nodes = client.get("/nodes")["data"]

    # CHANGE: one thread per node, all enrichments run simultaneously
    enriched = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(_enrich_node, client, node): node
            for node in raw_nodes
        }
        for future in as_completed(futures):
            try:
                enriched.append(future.result())
            except Exception as exc:
                node = futures[future]
                print(f"  WARN: failed to enrich node {node.get('node')}: {exc}")

    # Sort by node name for consistent ordering
    enriched.sort(key=lambda n: n.get("node", ""))
    return enriched


# Raw VM list from '/nodes/{node}/qemu' for online nodes
# Proxmox itself documents; treat any lock on a stopped VM as error.
_ERROR_LOCKS = {"backup", "snapshot", "migrate", "clone", "rollback", "suspended", "suspending", "block"}

# Check if VM status 'paused' for 'running' VMs
def _enrich_vm_status(client: ProxmoxClient, entry: dict, node_name: str, vmid: int):
    try:
        status_data = client.get(f"/nodes/{node_name}/qemu/{vmid}/status/current")["data"]
        qmp = status_data.get("qmpstatus")
        lock = status_data.get("lock")

        current_status = entry.get("status", "stopped")

        if current_status == "running":
            if qmp == "paused":
                entry["status"] = "paused"
        
        elif current_status == "stopped":
            if lock is not None:
                entry["status"] = "error"

        balloon = status_data.get("ballooninfo")

        if balloon:
            used = (
                balloon.get("total_mem", 0)
                - balloon.get("free_mem", 0)
                + balloon.get("mem_swapped_in", 0)
            )

            # Prevent invalid values
            used = max(0, min(used, balloon.get("max_mem", used)))

            entry["mem"] = used
            entry["maxmem"] = balloon.get("max_mem", entry.get("maxmem"))

    except RuntimeError:
        pass


# Add 'node' field to tag where the VM is hosted
def _fetch_node_vms(client: ProxmoxClient, node_name: str) -> list[dict]:
    try:
        raw_vms = client.get(f"/nodes/{node_name}/qemu")["data"]
        vms = []
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {}
            for vm in raw_vms:
                entry = dict(vm)
                entry["node"] = node_name
                entry["lock"] = entry.get("lock")
                # Only check paused state for "running" VMs
                f = pool.submit(_enrich_vm_status, client, entry, node_name, entry["vmid"])
                futures[f] = entry
            
            for future in as_completed(futures):
                exc = future.exception()
                if exc:
                    print(f"  WARN: VM status enrich error: {exc}")
                vms.append(futures[future])
        
        return vms
    except RuntimeError:
        return []


def fetch_vms(client: ProxmoxClient, nodes: list[dict]) -> list[dict]:
    online_nodes = [n["node"] for n in nodes if n.get("status") == "online"]

    all_vms = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(_fetch_node_vms, client, node_name): node_name
            for node_name in online_nodes
        }
        for future in as_completed(futures):
            try:
                all_vms.extend(future.result())
            except Exception as exc:
                node_name = futures[future]
                print(f"  WARN: failed to fetch VMs from {node_name}: {exc}")

    # Sort by vmid for consistent ordering
    all_vms.sort(key=lambda v: v.get("vmid", 0))
    return all_vms


# Single call to return both nodes and vms data
# Used by background thread in app.py
def fetch_all(client: ProxmoxClient) -> dict:
    nodes = fetch_nodes(client)
    vms = fetch_vms(client, nodes)
    return {"nodes": nodes, "vms": vms}
