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
                diskread = node.get("diskread", 0)
                diskwrite = node.get("diskwrite", 0)
                p = (
                    Point("node_metrics")
                    .tag("node", name)
                    .tag("status", status)
                    .field("status_online", 1 if status == "online" else 0)
                    .field("cpu_used", cpu)
                    .field("maxcpu", maxcpu)
                    .field("mem_used", mem)
                    .field("mem_total", maxmem)
                    .field("disk_used", disk)
                    .field("disk_total", maxdisk)
                    .field("uptime", uptime)
                    .field("netin", netin)
                    .field("netout", netout)
                    .field("diskread", diskread)
                    .field("diskwrite", diskwrite)
                    .time(now, WritePrecision.S)
                )

            points.append(p)

        self.write_api.write(bucket=self.bucket, org=self.org, record=points)


