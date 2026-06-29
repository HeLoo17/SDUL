"""
wazuh_client.py
Authenticate and make raw HTTP calls to Wazuh APIs

APIs:
- Server API (port 55000) - JWT auth, auto-renew every 14 min
- Indexer API (port 9200) - HTTP Basic auth
"""
import base64
import time

import requests
import urllib3
from urllib3.exceptions import InsecureRequestWarning


class WazuhClient:
    def __init__(
            self,
            host: str,
            username: str,
            key: str,
            verify_ssl: bool = False
    ):
        self.host = host.rstrip("/")
        self.username = username
        self.key = key

        self.server_base = f"{self.host}:55000"
        self.indexer_base = f"{self.host}:9200"

        self._session = requests.Session()
        self._session.verify = verify_ssl

        if not verify_ssl:
            urllib3.disable_warnings(InsecureRequestWarning)

        # JWT states
        self._jwt_token: str | None = None
        # UNIX timestamp of token expire
        self._jwt_expires_at: float = 0.0
        self._jwt_renew = 14 * 60

        # Authentication header (Basic)
        raw = f"{username}:{key}".encode()
        self._basic_auth = f"Basic {base64.b64encode(raw).decode()}"

    def _refresh_jwt(self) -> None:
        url = f"{self.server_base}/security/user/authenticate"
        resp = None

        try:
            resp = self._session.post(url, auth=(self.username, self.key), timeout=10)
            resp.raise_for_status()
            data = resp.json()
            self._jwt_token = data["data"]["token"]
            self._jwt_expires_at = time.time() + self._jwt_renew
        except requests.exceptions.HTTPError as exc:
            status = resp.status_code if resp else "unknown"
            body = resp.text if resp else "no response"
            raise RuntimeError(f"Wazuh auth failed HTTP {status}: {body}") from exc
        except requests.exceptions.ConnectionError as exc:
            raise RuntimeError(f"Wazuh connection error {url}: {exc}") from exc

    def _get_jwt(self) -> str:
        if not self._jwt_token or time.time() >= self._jwt_expires_at:
            self._refresh_jwt()
        return self._jwt_token

    # Server API — GET(JWT bearer)
    def server_get(self, path: str, params: dict | None = None) -> dict:
        url = f"{self.server_base}/{path.lstrip('/')}"
        resp = None
        try:
            resp = self._session.get(
                url,
                headers={"Authorization": f"Bearer {self._get_jwt()}"},
                params=params or {},
                timeout=10,
            )
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as exc:
            status = resp.status_code if resp else "unknown"
            body = resp.text if resp else "no response"
            raise RuntimeError(f"Wazuh Server API HTTP {status} {url}: {body}") from exc
        except requests.exceptions.ConnectionError as exc:
            raise RuntimeError(f"Wazuh connection error {url}: {exc}") from exc

    # Indexer API — POST search (Basic auth)
    def indexer_search(self, index: str, body: dict) -> dict:
        url = f"{self.indexer_base}/{index}/_search"
        resp = None
        try:
            resp = self._session.post(
                url,
                headers={
                    "Authorization": self._basic_auth,
                    "Content-Type": "application/json",
                },
                json=body,
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as exc:
            status = resp.status_code if resp else "unknown"
            body_t = resp.text if resp else "no response"
            raise RuntimeError(f"Wazuh Indexer HTTP {status} {url}: {body_t}") from exc
        except requests.exceptions.ConnectionError as exc:
            raise RuntimeError(f"Wazuh Indexer connection error {url}: {exc}") from exc

    def close(self) -> None:
        self._session.close()
