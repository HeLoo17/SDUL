# SDUL Docker Deployment

This setup runs the Python backend and React frontend as two Docker services.
It is intended for an LXC container that already has Docker and the Compose plugin installed.

## 1. Prepare Environment Files

Copy the Docker template:

```bash
cp .env.docker.example .env
```

Copy and fill the backend secret file:

```bash
cp backend/.env.example backend/.env
```

Set `DASHBOARD_API_KEY` to the same value in both `.env` and `backend/.env`.
Leave `VITE_API_URL` empty for Docker deployment. The browser talks only to the
frontend origin, and Nginx proxies `/api/*` and `/socket.io/*` to the private
backend container.

The backend port is not published externally by `docker-compose.yml`.

## 2. Start Manually

From the project root:

```bash
docker compose up -d --build
```

Then open:

```text
http://<lxc-ip-or-hostname>/
```

## 3. Start Automatically On LXC Boot

Place the project at `/opt/sdul`, then install the systemd unit:

```bash
sudo cp deploy/sdul-dashboard.service /etc/systemd/system/sdul-dashboard.service
sudo systemctl daemon-reload
sudo systemctl enable --now sdul-dashboard.service
```

Check status:

```bash
sudo systemctl status sdul-dashboard.service
docker compose ps
```

View logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## LXC Notes

The LXC container must allow Docker to run, usually by enabling nesting/keyctl in the host LXC config.
Expose or forward only the frontend port, usually `80`. The backend remains reachable only on the Docker network.
