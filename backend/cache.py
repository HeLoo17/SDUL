import threading
from datetime import datetime, timezone


class DataCache:
    def __init__(self):
        self._lock = threading.Lock()
        self._data = {
            "nodes": [],
            "vms": [],
            "last_updated": None,       # timestamp of last successful collection from Proxmox
            "error": None       # Last error message
        }

    # Used by collector to update data it fetched into cache
    def update(self, nodes: list, vms: list):
        with self._lock:
            self._data["nodes"] = nodes
            self._data["vms"] = vms
            self._data["last_updated"] = datetime.now(timezone.utc).isoformat()
            self._data["error"] = None

    # Called nby collector when fetch errors
    def set_error(self, message: str):
        with self._lock:
            self._data["error"] = message

    # Returns copy to Flask
    def get(self) -> dict:
        with self._lock:
            return dict(self._data)

    def get_nodes(self) -> list:
        with self._lock:
            return list(self._data["nodes"])

    def get_vms(self) -> list:
        with self._lock:
            return list(self._data["vms"])
