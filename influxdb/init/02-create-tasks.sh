#!/bin/bash
set -e

echo "Waiting for InfluxDB..."

until influx ping >/dev/null 2>&1; do
  sleep 2
done

ORG="${INFLUXDB_ORG}"
TOKEN="${INFLUXDB_TOKEN}"

echo "Creating Flux tasks..."

########################################
# 1. RAW → 5m
########################################
influx task create \
  --name "downsample_5m" \
  --org "$ORG" \
  --token "$TOKEN" \
  --every 5m \
  --offset 1m \
  --flux '
option task = {name: "downsample_5m", every: 5m, offset: 1m}

from(bucket: "proxmox_raw")
  |> range(start: -task.every * 2)
  |> filter(fn: (r) => r._measurement == "node_metrics" or r._measurement == "vm_metrics")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> to(bucket: "proxmox_5m", org: "'"$ORG"'")
'

########################################
# 2. 5m → 1h
########################################
influx task create \
  --name "downsample_1h" \
  --org "$ORG" \
  --token "$TOKEN" \
  --every 1h \
  --offset 5m \
  --flux '
option task = {name: "downsample_1h", every: 1h, offset: 5m}

from(bucket: "proxmox_5m")
  |> range(start: -task.every * 2)
  |> filter(fn: (r) => r._measurement == "node_metrics" or r._measurement == "vm_metrics")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> to(bucket: "proxmox_1h", org: "'"$ORG"'")
'

########################################
# 3. 1h → 1d
########################################
influx task create \
  --name "downsample_1d" \
  --org "$ORG" \
  --token "$TOKEN" \
  --every 1d \
  --offset 1h \
  --flux '
option task = {name: "downsample_1d", every: 1d, offset: 1h}

from(bucket: "proxmox_1h")
  |> range(start: -task.every * 2)
  |> filter(fn: (r) => r._measurement == "node_metrics" or r._measurement == "vm_metrics")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> to(bucket: "proxmox_1d", org: "'"$ORG"'")
'

echo "Flux tasks created"