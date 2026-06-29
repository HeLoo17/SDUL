"""
wazuh_collector.py
Fetch and normalise data from Wazuh APIs

Functions:
- fetch_alerts
- fetch_logs
"""

from wazuh_client import WazuhClient


# Severity helpers (rule level 1 - 16)
def _severity(level: int) -> str:
    if level >= 12:
        return "critical"
    if level >= 7:
        return "warning"
    return "notice"


# Alerts (wazuh-alerts-* index)
# Return recent security alerts from all agents
def fetch_alerts(client: WazuhClient, limit: int = 50, min_level: int = 3, hours: int = 24) -> list[dict]:
    body = {
        "size": limit,
        "sort": [{"timestamp": {"order": "desc"}}],
        "query": {
            "bool": {
                "filter": [
                    {"range": {"rule.level": {"gte": min_level}}},
                    {"range": {"timestamp": {"gte": f"now-{hours}h"}}},
                ]
            }
        },
        # Only pull what the frontend uses — keeps payload small
        "_source": [
            "timestamp",
            "rule.id",
            "rule.level",
            "rule.description",
            "rule.groups",
            "agent.id",
            "agent.name",
            "data.srcip",
            "data.srcuser",
            "data.dstuser",
            "location",
        ],
    }

    raw = client.indexer_search("wazuh-alerts-*", body)
    hits = raw.get("hits", {}).get("hits", [])

    alerts = []
    for hit in hits:
        src = hit.get("_source", {})
        rule = src.get("rule", {})
        agent = src.get("agent", {})
        data = src.get("data", {})
        level = rule.get("level", 0)

        alerts.append({
            "id": hit.get("_id", ""),
            "timestamp": src.get("timestamp", ""),
            "severity": _severity(level),
            "rule_id": rule.get("id", "—"),
            "rule_level": level,
            "description": rule.get("description", "No description"),
            "host": agent.get("name", "unknown"),
            "agent_id": agent.get("id", "—"),
            "src_ip": data.get("srcip"),
            "src_user": data.get("srcuser") or data.get("dstuser"),
            "groups": rule.get("groups", []),
            "location": src.get("location", "—"),
        })

    return alerts


# Manager logs
def fetch_logs(client: WazuhClient, limit: int = 100, level: str | None = None, tag: str | None = None,) -> list[dict]:
    params: dict = {
        "limit": limit,
        "sort": "-timestamp",
        "pretty": "false",
    }
    if level:
        params["level"] = level
    if tag and tag != "all":
        params["tag"] = tag

    raw = client.server_get("/manager/logs", params=params)
    print("RAW LOG RESPONSE:", raw)

    data = raw.get("data", {})

    items = (
            data.get("affected_items")
            or data.get("items")
            or []
    )

    logs = []
    for item in items:
        logs.append({
            "timestamp": item.get("timestamp", ""),
            "tag": item.get("tag", "—"),
            "level": item.get("level", "info"),
            "description": item.get("description", ""),
        })

    return logs
