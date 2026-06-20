# Security Dashboard for University Laboratory (SDUL)
A real-time monitoring dashboard for Proxmox VE university-lab environments. A Python/Flask backend polls the Proxmox API on a background thread and exposes a lightweight REST API; a React frontend consumes it and auto-refreshes every 5 seconds.

---

## Docker Deployment

This project can be deployed as two Docker services:

- `backend`: Python Flask + Socket.IO API, private on the Docker network
- `frontend`: React static build served by Nginx, the only externally exposed service

The browser should access only the frontend URL. Nginx proxies `/api/*` and `/socket.io/*` to the backend container internally, so the backend port is not published for external use.

### Prerequisites

On the LXC container, install Docker Engine and the Docker Compose plugin. If this is an unprivileged LXC, enable Docker support from the host side, usually with nesting/keyctl enabled.

### Configure Environment

From the project root:

```bash
cp .env.docker.example .env
cp backend/.env.example backend/.env
```

Edit `.env`:

```env
FRONTEND_PORT=80
VITE_API_URL=
DASHBOARD_API_KEY=<same-value-as-backend-env>
```

Keep `VITE_API_URL` empty for Docker deployment. This makes the React app call same-origin `/api` and `/socket.io`, which Nginx forwards to the private backend service.

Edit `backend/.env` and fill in the Proxmox, InfluxDB, and dashboard secrets:

```env
PVE_HOST=https://<proxmox-host>:8006
PVE_API_TOKEN=<token-user-and-token-name>
PVE_API_KEY=<token-secret>
PVE_VERIFY_SSL=false
POLL_INTERVAL=3
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

INFLUXDB_URL=http://<influx-host>:8086
INFLUXDB_TOKEN=<influx-token>
INFLUXDB_ORG=<influx-org>
INFLUXDB_BUCKET=<bucket-name>

DASHBOARD_API_KEY=<same-value-as-root-env>
```

### Start The Stack

Build and run:

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Open the dashboard:

```text
http://<lxc-ip-or-hostname>/
```

Only the frontend port, usually `80`, should be exposed from the LXC. The backend stays private inside Docker.

### Stop Or Restart

```bash
docker compose down
docker compose up -d --build
```

### Start Automatically On LXC Boot

The repository includes a systemd unit template at `deploy/sdul-dashboard.service`. It assumes the project is located at `/opt/sdul`.

```bash
sudo cp deploy/sdul-dashboard.service /etc/systemd/system/sdul-dashboard.service
sudo systemctl daemon-reload
sudo systemctl enable --now sdul-dashboard.service
```

Check boot service status:

```bash
sudo systemctl status sdul-dashboard.service
```

---

## Backend Architecture

```mermaid
flowchart TD

    subgraph server["Flask Server"]
        APP["Flask + CORS - app.py \n(e.g. localhost:5000)"]
        CACHE["DataCache (thread-safe) - cache.py"]
        THREAD["Daemon Thread - collector_loop"]
    end
    subgraph historical["InfluxDB - Historical Database"]
        INFLUXWRITER["InfluxWriter - influx - \nwriter.py"]
        INFLUXDB[("InfluxDB\n(localhost:8086)")]
    end
    PVE["Proxmox VE API (e.g. HTTPS:8006)"]
    CLIENT["ProxmoxClient - proxmox_client.py"]
    COLLECTOR["Fetch Nodes/VMs/All - collector.py"]
    FRONTEND["React Frontend - useSocket.ts hook"]

    COLLECTOR -- "uses" --> CLIENT -- "HTTP GET" --> PVE
    APP -- "runs" ---> THREAD
    THREAD -- "call fetch_all 
    (every 5s)" --> COLLECTOR
    THREAD -- "cache.update()" --> CACHE
    APP -- "read" --> CACHE
    FRONTEND -- "poll every 5s" ---> APP
    APP -- "api_response" ---> FRONTEND
    INFLUXWRITER -- "write" --> INFLUXDB
    INFLUXDB -- "read" --> INFLUXWRITER
    THREAD -- "write nodes, vms data" --> INFLUXWRITER
    APP -- "query" --> INFLUXWRITER
    INFLUXWRITER -- "query result" --> APP

```
