"""
influx_controller.py
Write node and VM metrices into InfluxDB
Called by collector loop when successful fetch

Influx structure:
    measurement: proxmox metrics (e.g. "node_metric")
    tags: indexed labels for filtering (node namem, vmid, status)
    fields: actual numeric values (cpu, mem, disk)
    timestamp: when data collected
"""
from datetime import datetime, timezone
from influxdb_client.client.influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS
from influxdb_client.client.write.point import Point
from influxdb_client.domain.write_precision import WritePrecision


class InfluxController:
    def __init__(self, url: str, token: str, org: str, bucket: str):
        self.bucket = bucket
        self.org = org
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()

    # --- Write functions ---
    # write a data point per online node
    def write_nodes(self, nodes: list[dict]):
        points = []
        now = datetime.now(timezone.utc)

        for node in nodes:
            name = node.get("node", "unknown")
            status = node.get("status", "unknown")
            p = (
                Point("node_metrics")
                .tag("node", name)
                .tag("status", status)
                .field("status_online", 1 if status == "online" else 0)
                .time(now, WritePrecision.S)
            )

            # Live metrics for online nodes only
            if status == "online":
                maxmem = node.get("maxmem", 0)
                mem = node.get("mem", 0)
                maxdisk = node.get("maxdisk", 0)
                disk = node.get("disk", 0)
                cpu = node.get("cpu", 0)
                maxcpu = node.get("maxcpu", 0)
                uptime = node.get("uptime", 0)
                netin = node.get("netin", 0)
                netout = node.get("netout", 0)
                iowait = node.get("iowait", 0)
                p = (
                    Point("node_metrics")
                    .tag("node", name)
                    .tag("status", status)
                    .field("status_online", 1 if status == "online" else 0)
                    .field("cpu", cpu)
                    .field("maxcpu", maxcpu)
                    .field("mem", mem)
                    .field("maxem", maxmem)
                    .field("disk", disk)
                    .field("maxdisk", maxdisk)
                    .field("uptime", uptime)
                    .field("netin", netin)
                    .field("netout", netout)
                    .field("iowait", iowait)
                    .time(now, WritePrecision.S)
                )

            points.append(p)

        self.write_api.write(bucket=self.bucket, org=self.org, record=points)

    # Write a data point per VM
    def write_vms(self, vms: list[dict]):
        points = []
        now = datetime.now(timezone.utc)

        for vm in vms:
            vmid = vm.get("vmid", 0)
            name = vm.get("name", f"vm-{vmid}")
            status = vm.get("status", "unknown")
            node = vm.get("node", "unknown")
            cpu = vm.get("cpu", 0)
            cpu_assigned = vm.get("cpus", 0)
            disk = vm.get("disk", 0)
            maxdisk = vm.get("maxdisk", 0)
            mem = vm.get("mem", 0)
            maxmem = vm.get("maxmem", 0)
            uptime = vm.get("uptime", 0)
            netin = vm.get("netin", 0)
            netout = vm.get("netout", 0)

            p = (
                Point("vm_metrics")
                .tag("vmid", str(vmid))
                .tag("name", name)
                .tag("node", node)
                .tag("status", status)
                .field("status_running", 1 if status == "running" else 0)
                .field("cpu_usage", cpu)
                .field("cpu_assigned", cpu_assigned)
                .field("mem_used", mem)
                .field("mem_total", maxmem)
                .field("disk_used", disk)
                .field("disk_total", maxdisk)
                .field("uptime", uptime)
                .field("netin", netin)
                .field("netout", netout)
                .time(now, WritePrecision.S)
            )

            points.append(p)

        self.write_api.write(bucket=self.bucket, org=self.org, record=points)

    # Single call to write both, used by collector loop
    def write_all(self, nodes: list[dict], vms: list[dict]):
        self.write_nodes(nodes)
        self.write_vms(vms)

    # --- Query Functions ---
    # Raw metrics of a single node over N hours
    # Return: time, cpu_used, maxcpu, mem_used, mem_total, disk_usage, disk_total,
    #         uptime, netin, netout, diskread, diskwrite, status_online
    def query_node_history(self, node_name: str, hours: int=24) -> list[dict]:
        query = f'''
         from(bucket: "{self.bucket}")
           |> range(start: -{hours}h)
           |> filter(fn: (r) => r._measurement == "node_metrics")
           |> filter(fn: (r) => r.node == "{node_name}")
           |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
           |> sort(columns: ["_time"], desc: false)
        '''
        return self._run_query(query)
    
    # Raw metrics of a single VM over N hours
    # Return: time, cpu_used, maxcpu, mem_used, mem_total, disk_usage, disk_total,
    #         uptime, netin, netout, status_online
    def query_vm_history(self, vmid: int, hours: int = 24) -> list[dict]:
        query = f'''
        from(bucket: "{self.bucket}")
            |> range(start: -{hours}h)
            |> filter(fn: (r) => r._measurement == "vm_metrics")
            |> filter(fn: (r) => r.vmid == "{vmid}")
            |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> sort(columns: ["_time"], desc: false)
        '''
        return self._run_query(query)
    
    # Raw metrics of all nodes over N hours
    # Return all data of all nodes on the same timestamp
    def query_cluster_history(self, hours: int = 24) -> list[dict]:
        query = f'''
        from(bucket: "{self.bucket}")
            |> range(start: -{hours}h)
            |> filter(fn: (r) => r._measurement == "node_metrics")
            |> pivot(rowKey: ["_time", "node"], columnKey: ["_field"], valueColumn: "_value")
            |> sort(columns: ["_time"], desc: false)
        '''
        return self._run_query(query)

    # Execute Flex query and return results as list of dicts
    def _run_query(self, query: str) -> list[dict]:
        result = self.query_api.query(org=self.org, query=query)
        records = []
        for table in result:
            for record in table.records:
                row = dict(record.values)
                # Remove InfluxDB internal fields
                for key in ("result", "table", "_start", "_stop", "_measurement"):
                    row.pop(key, None)
                
                # Rename _time to time and ISO format
                if "_time" in row:
                    row["time"] = row.pop("_time").isoformat()
                records.append(row)
        return records
    
    def close(self):
        self.client.close()
