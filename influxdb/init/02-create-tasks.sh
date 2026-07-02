#!/bin/bash
set -e

ORG="${INFLUXDB_ORG}"
TOKEN="${INFLUX_TOKEN}"
BUCKET="${INFLUXDB_BUCKET}"
HOST="http://influxdb:8086"

echo "Creating Flux tasks..."

########################################
# RAW → 5m
########################################
influx task create "
option task = {name: \"downsample_5m\", every: 5m, offset: 1m}

from(bucket: \"${BUCKET}_raw\")
  |> range(start: -2 * task.every)
  |> filter(fn: (r) => r._measurement == \"node_metrics\" or r._measurement == \"vm_metrics\")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> to(bucket: \"${BUCKET}_5m\")
" --host "$HOST" --org "$ORG" --token "$TOKEN"

########################################
# 5m → 1h
########################################
influx task create "
option task = {name: \"downsample_1h\", every: 1h, offset: 5m}

from(bucket: \"${BUCKET}_5m\")
  |> range(start: -2 * task.every)
  |> filter(fn: (r) => r._measurement == \"node_metrics\" or r._measurement == \"vm_metrics\")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> to(bucket: \"${BUCKET}_1h\")
" --host "$HOST" --org "$ORG" --token "$TOKEN"

########################################
# 1h → 1d
########################################
influx task create "
option task = {name: \"downsample_1d\", every: 1d, offset: 1h}

from(bucket: \"${BUCKET}_1h\")
  |> range(start: -2 * task.every)
  |> filter(fn: (r) => r._measurement == \"node_metrics\" or r._measurement == \"vm_metrics\")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> to(bucket: \"${BUCKET}_1d\")
" --host "$HOST" --org "$ORG" --token "$TOKEN"

echo "Tasks created."