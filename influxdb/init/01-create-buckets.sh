#!/bin/bash
set -e
echo "Waiting for InfluxDB..."

until influx ping >/dev/null 2>&1; do
  sleep 2
done

ORG="${INFLUXDB_ORG}"
TOKEN="${INFLUXDB_TOKEN}"

echo "Creating buckets..."

influx bucket create \
  --name proxmox_history \
  --org "$ORG" \
  --retention 168h \
  --token "$TOKEN" || true

influx bucket create \
  --name proxmox_history_5m \
  --org "$ORG" \
  --retention 720h \
  --token "$TOKEN" || true

influx bucket create \
  --name proxmox_history_1h \
  --org "$ORG" \
  --retention 2160h \
  --token "$TOKEN" || true

influx bucket create \
  --name proxmox_history_1d \
  --org "$ORG" \
  --retention 0 \
  --token "$TOKEN" || true

echo "Buckets created"