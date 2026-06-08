# Security Dashboard for University Laboratory (SDUL)
A real-time monitoring dashboard for Proxmox VE university-lab environments. A Python/Flask backend polls the Proxmox API on a background thread and exposes a lightweight REST API; a React frontend consumes it and auto-refreshes every 5 seconds.

---

## Backend Architecture

```mermaid
flowchart TD
    classDef primary fill:#4f6478,stroke:#378ADD

    subgraph server["Flask Server"]
        APP["Flask + CORS - app.py"]
        CACHE["DataCache (thread-safe) - cache.py"]
        THREAD["Daemon Thread - collector_loop"]
    end
    PVE["Proxmox VE API (e.g. HTTPS:8006)"]
    CLIENT["ProxmoxClient - proxmox_client.py"]
    COLLECTOR["Fetch Nodes/VMs/All - collector.py"]
    FRONTEND["REACT Frontend - useProxmoxAPI.js hook"]

    COLLECTOR -- "uses" --> CLIENT -- "HTTP GET" --> PVE
    APP -- "runs" ---> THREAD
    THREAD -- "call fetch_all 
    (every 5s)" --> COLLECTOR
    THREAD -- "cache.update()" --> CACHE
    APP -- "read" --> CACHE
    FRONTEND -- "poll every 5s" ---> APP
    APP -- "api_response" ---> FRONTEND

    class server primary
```

