#!/bin/bash
set -e

ORG="${INFLUXDB_ORG}"
TOKEN="${INFLUX_TOKEN}"
BUCKET="${INFLUXDB_BUCKET}"

INFLUX="influx --host http://influxdb:8086 --org $ORG --token $TOKEN"

echo "Creating Flux tasks..."

########################################
# RAW → 5m
########################################
$INFLUX task create \
  --name "downsample_5m" \
  --every 5m \
  --offset 1m \
  --flux "
option task = {name: \"downsample_5m\", every: 5m, offset: 1m}

from(bucket: \"${BUCKET}_raw\")
  |> range(start: -task.every * 2)
  |> filter(fn: (r) => r._measurement == \"node_metrics\" or r._measurement == \"vm_metrics\")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> to(bucket: \"${BUCKET}_5m\")
"

########################################
# 5m → 1h
########################################
$INFLUX task create \
  --name "downsample_1h" \
  --every 1h \
  --offset 5m \
  --flux "
option task = {name: \"downsample_1h\", every: 1h, offset: 5m}

from(bucket: \"${BUCKET}_5m\")
  |> range(start: -task.every * 2)
  |> filter(fn: (r) => r._measurement == \"node_metrics\" or r._measurement == \"vm_metrics\")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> to(bucket: \"${BUCKET}_1h\")
"

########################################
# 1h → 1d
########################################
$INFLUX task create \
  --name "downsample_1d" \
  --every 1d \
  --offset 1h \
  --flux "
option task = {name: \"downsample_1d\", every: 1d, offset: 1h}

from(bucket: \"${BUCKET}_1h\")
  |> range(start: -task.every * 2)
  |> filter(fn: (r) => r._measurement == \"node_metrics\" or r._measurement == \"vm_metrics\")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> to(bucket: \"${BUCKET}_1d\")
"

echo "Tasks created."