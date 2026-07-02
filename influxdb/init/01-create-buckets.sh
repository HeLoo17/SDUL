#!/bin/bash
set -e
echo "Waiting for InfluxDB..."

until influx ping >/dev/null 2>&1; do
  sleep 2
done

ORG="${INFLUXDB_ORG}"
TOKEN="${INFLUXDB_TOKEN}"
BUCKET="${INFLUXDB_BUCKET}"

echo "Creating buckets..."

influx bucket create \
  --name "${BUCKET}_raw" \
  --org "$ORG" \
  --retention 168h \
  --token "$TOKEN" || true

influx bucket create \
  --name "${BUCKET}_5m" \
  --org "$ORG" \
  --retention 720h \
  --token "$TOKEN" || true

influx bucket create \
  --name "${BUCKET}_1h" \
  --org "$ORG" \
  --retention 2160h \
  --token "$TOKEN" || true

influx bucket create \
  --name "${BUCKET}_1d" \
  --org "$ORG" \
  --retention 0 \
  --token "$TOKEN" || true

echo "Buckets created"