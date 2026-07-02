#!/bin/bash
set -e

echo "Waiting for InfluxDB..."

until influx ping --host http://influxdb:8086 >/dev/null 2>&1; do
  sleep 2
done

ORG="${INFLUXDB_ORG}"
TOKEN="${INFLUX_TOKEN}"
BUCKET="${INFLUXDB_BUCKET}"

echo "Creating buckets..."

create_bucket () {
  NAME=$1
  RETENTION=$2

  influx bucket create \
    --host http://influxdb:8086 \
    --org "$ORG" \
    --token "$TOKEN" \
    --name "$NAME" \
    --retention "$RETENTION" || true
}

create_bucket "${BUCKET}_raw" 168h
create_bucket "${BUCKET}_5m" 720h
create_bucket "${BUCKET}_1h" 2160h
create_bucket "${BUCKET}_1d" 0

echo "Creating Flux tasks..."

bash /scripts/02-create-tasks.sh

echo "Initialization complete."