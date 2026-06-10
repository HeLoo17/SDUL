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


class InfluxWriter:
    def __init__(self, url: str, token: str, org: str, bucket: str):
        self.bucket = bucket
        self.org = org
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()