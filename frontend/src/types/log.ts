// Alerts
export type AlertSeverity = "notice" | "warning" | "critical";
 
export interface WazuhAlert {
    id: string;
    timestamp: string;
    severity: AlertSeverity;
    rule_id: string;
    rule_level: number;
    description: string;
    host: string;
    agent_id: string;
    src_ip?: string | null;
    src_user?: string | null;
    groups: string[];
    location: string;
}


// Logs 
export type LogLevel = "info" | "warning" | "error" | "debug";
 
export interface WazuhLog {
    timestamp: string;
    tag: string;           // daemon name e.g. wazuh-analysisd
    level: LogLevel;
    description: string;
    src_ip?: string;    // Change regarding WazuhManager ip
    host?: string;
}

export function formatLogTime(time: string | number | null | undefined) {
  if (!time) return "-";

  const date = new Date(time);

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
