import threading
from datetime import datetime, timezone


class DataCache:
    def __init__(self):
        self._lock = threading.Lock()
        self._data = {
            "nodes": [],
            "vms": [],
            "last_updated": None,       # timestamp of last successful collection from Proxmox
            "error": None,              # Last error message
            "upstream": {
                "proxmox": {
                    "reachable":    False,
                    "last_success": None,   
                    "last_attempt": None,   
                    "response_ms":  None,   
                    "error":        None,   
                },
                "wazuh": {
                    "reachable":    False,
                    "last_success": None,
                    "last_attempt": None,
                    "response_ms":  None,
                    "error":        None,
                },
            }
        }

    # Used by collector to update data it fetched into cache
    def update(self, nodes: list, vms: list):
        with self._lock:
            self._data["nodes"] = nodes
            self._data["vms"] = vms
            self._data["last_updated"] = datetime.now(timezone.utc).isoformat()
            self._data["error"] = None

    # Called by collector when fetch errors
    def set_error(self, message: str):
        with self._lock:
            self._data["error"] = message

    # Called by collector to update each Proxmox fetch attempt
    def set_upstream_result(self, service: str, reachable: bool, response_ms: float | None, error: str | None):
        now = datetime.now(timezone.utc).isoformat()
        with self._lock:
            entry = self._data["upstream"].get(service)
            if entry is None:
                return
            entry["reachable"]    = reachable
            entry["last_attempt"] = now
            entry["response_ms"]  = round(response_ms, 1) if response_ms is not None else None
            entry["error"]        = error
            if reachable:
                entry["last_success"] = now

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
