"""
proxmox_client.py
Authenticate and HTTP raw calls to ProxmoxAPI

"""

import requests
import urllib3
from urllib3.exceptions import InsecureRequestWarning


class ProxmoxClient:
    def __init__(self, host: str, api_token: str, api_key: str, verify_ssl: bool = False):
        self.base_url = host.rstrip("/") + "/api2/json"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"PVEAPIToken={api_token}={api_key}",
            "Content-Type": "application/json",
        })
        self.session.verify = verify_ssl
        if not verify_ssl:
            urllib3.disable_warnings(InsecureRequestWarning)

    # Get function to request for json
    def get(self, path: str) -> dict:
        resp = None
        url = f"{self.base_url}/{path.lstrip('/')}"
        try:
            resp = self.session.get(url, timeout=10)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.SSLError as exc:
            raise RuntimeError(f"SSL error - set PVE_VERIFY_SSL=false: {exc}") from exc
        except requests.exceptions.ConnectionError as exc:
            raise RuntimeError(f"Connection error {url}: {exc}") from exc
        except requests.exceptions.HTTPError as exc:
            status = resp.status_code if resp else "unknown"
            body = resp.text if resp else "no response"
            raise RuntimeError(f"HTTP {status} {url}: {body}") from exc

    # End connection session
    def close(self):
        self.session.close()
