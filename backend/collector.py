"""
collector.py
Fetch raw data from ProxmoxVE API and return structured (unprocessed)
"""

from proxmox_client import ProxmoxClient


# Raw node list from '/nodes', ip_address is also added
# Offline nodes will not have metrics field
def fetch_nodes(client: ProxmoxClient) -> list[dict]:
    raw_nodes = client.get("/nodes")["data"]
    nodes = []

    for node in raw_nodes:
        entry = dict(node)
        entry["ip_address"] = None
        entry["storages"] = []

        if node.get("status") == "online":
            # Get IP Address
            try:
                interfaces = client.get(f"/nodes/{node['node']}/network")["data"]
                # Primarily grab standard Proxmox management bridge - vmbr0
                vmbr0 = next(
                    (i for i in interfaces
                     if i.get("iface") == "vmbr0"
                     and i.get("address")),
                    None
                )
                # Other options of ip
                other = next(
                    (i for i in interfaces
                     if i.get("address")
                     and i.get("type") != "loopback"
                     and i.get("address") != "127.0.0.1"),
                    None
                )
                choose = vmbr0 or other
                entry["ip_address"] = choose.get("address") if choose else None
            except RuntimeError:
                pass

            # Get storages
            try:
                entry["storages"] = client.get(f"/nodes/{node['node']}/storage")["data"]
            except RuntimeError:
                pass

            # Get throughput of network and disks
            try:
                status = client.get(f"/nodes/{node['node']}/status")["data"]
                entry["netin"] = status.get("netin", 0)
                entry["netout"] = status.get("netout", 0)
                entry["diskread"] = status.get("diskread", 0)
                entry["diskwrite"] = status.get("diskwrite", 0)
            except RuntimeError:
                entry["netin"] = 0
                entry["netout"] = 0
                entry["diskread"] = 0
                entry["diskwrite"] = 0

        nodes.append(entry)

    return nodes


# Raw VM list from '/nodes/{node}/qemu' for online nodes
# Add 'node' field to tag where the VM is hosted
def fetch_vms(client: ProxmoxClient, nodes: list[dict]) -> list[dict]:
    vms = []
    online = [n["node"] for n in nodes if n.get("status") == "online"]

    for node_name in online:
        try:
            raw_vms = client.get(f"/nodes/{node_name}/qemu")["data"]
            for vm in raw_vms:
                entry = dict(vm)
                entry["node"] = node_name
                vms.append(entry)
        except RuntimeError:
            pass

    return vms


# Single call to return both nodes and vms data
# Used by background thread
def fetch_all(client: ProxmoxClient) -> dict:
    nodes = fetch_nodes(client)
    vms = fetch_vms(client, nodes)

    return {"nodes": nodes, "vms": vms}
