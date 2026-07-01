import { useWazuhLogs } from "../../../hooks/useWazuhLogs";
// import type { WazuhLog } from "../../../types";
import LogRows from "./LogRows";

// const LEVEL_OPTIONS = ["all", "info", "warning", "error", "debug"] as const;
 
// const TAG_OPTIONS = [
//     "all",
//     "wazuh-analysisd",
//     "wazuh-remoted",
//     "wazuh-modulesd",
//     "wazuh-integratord",
//     "wazuh-authd",
//     "wazuh-apid",
// ];


// const fakeLogs: WazuhLog[] = [
//     {
//       timestamp: "2026-06-30T08:15:23Z",
//       tag: "wazuh-analysisd",
//       level: "info",
//       description: "Analysis daemon started successfully.Analysis daemon started succesdadadaadssssssssssssssssssssssssssssssssssssssssssssssssssssssss.",
//     },
//     {
//       timestamp: "2026-06-30T08:16:02Z",
//       tag: "wazuh-remoted",
//       level: "warning",
//       description: "Agent 001 disconnected unexpectedly.",
//     },
//     {
//       timestamp: "2026-06-30T08:16:40Z",
//       tag: "wazuh-modulesd",
//       level: "info",
//       description: "Vulnerability detector scan completed.",
//     },
//     {
//       timestamp: "2026-06-30T08:17:14Z",
//       tag: "wazuh-authd",
//       level: "error",
//       description: "Failed authentication attempt from 192.168.1.105.",
//     },
//     {
//       timestamp: "2026-06-30T08:18:55Z",
//       tag: "wazuh-db",
//       level: "warning",
//       description: "Database connection lost.",
//     },
//     {
//       timestamp: "2026-06-30T08:20:11Z",
//       tag: "wazuh-analysisd",
//       level: "info",
//       description: "Rule 5710 matched for SSH login.",
//     },
//     {
//       timestamp: "2026-06-30T08:21:47Z",
//       tag: "wazuh-monitord",
//       level: "warning",
//       description: "Disk usage exceeded 85% on /var/ossec.",
//     },
//     {
//       timestamp: "2026-06-30T08:22:59Z",
//       tag: "wazuh-clusterd",
//       level: "info",
//       description: "Cluster synchronization completed.",
//     },
//     {
//       timestamp: "2026-06-30T08:24:18Z",
//       tag: "wazuh-remoted",
//       level: "error",
//       description: "Agent 005 failed integrity check.",
//     },
//     {
//       timestamp: "2026-06-30T08:25:36Z",
//       tag: "wazuh-execd",
//       level: "info",
//       description: "Active response executed successfully.",
//     },
//     {
//       timestamp: "2026-06-30T08:18:55Z",
//       tag: "wazuh-db",
//       level: "warning",
//       description: "Database connection lost.",
//     },
//     {
//       timestamp: "2026-06-30T08:20:11Z",
//       tag: "wazuh-analysisd",
//       level: "debug",
//       description: "Rule 5710 matched for SSH login.",
//     },
//     {
//       timestamp: "2026-06-30T08:21:47Z",
//       tag: "wazuh-monitord",
//       level: "warning",
//       description: "Disk usage exceeded 85% on /var/ossec.",
//     },
//     {
//       timestamp: "2026-06-30T08:22:59Z",
//       tag: "wazuh-clusterd",
//       level: "info",
//       description: "Cluster synchronization completed.",
//     },
//     {
//       timestamp: "2026-06-30T08:24:18Z",
//       tag: "wazuh-remoted",
//       level: "error",
//       description: "Agent 005 failed integrity check.",
//     },
//     {
//       timestamp: "2026-06-30T08:25:36Z",
//       tag: "wazuh-execdadasdasdasdasd",
//       level: "debug",
//       description: "Active response executed successfully.",
//     },
// ];

// const fakeWazuhLogs: UseWazuhLogsReturn = {
//     logs: fakeLogs,
//     isLoading: false,
//     error: null,
//     lastFetched: new Date().toISOString(),
//     refetch: () => {
//       console.log("Fake refetch called");
//     },
// };


export default function LogTable() {
    // const [level, setLevel] = useState<LogLevel | "all">("all");
    // const [tag,   setTag]   = useState<string>("all");
    
    const { logs, isLoading } = useWazuhLogs({ limit: 100 });
    // const { logs, isLoading } = fakeWazuhLogs;
    const lowerBoarderBg = logs.length%2 === 0 ? 'bg-[#262A34]/80' : 'bg-[#262A34]/50';

    return (
        <div className="w-full flex flex-col bg-primary-BACK rounded-lg">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_3fr] items-center gap-4 px-8 py-4">
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">timestamp</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">host</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">level</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">source</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">ip</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">message</span>
            </div>

            {/* ROWS */}
            {isLoading && logs.length === 0 ? (
                <div className="w-full flex items-center justify-center py-16 bg-[#262A34]/80">
                    <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                      fetching logs...
                    </span>
                  </div>
              ) : logs.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-16 bg-[#262A34]/80">
                        <p className="text-[14px] text-t1 font-inter font-medium">No log entries found</p>
                        <p className="text-[12px] text-t1/60 font-inter mt-1">
                            Try adjusting the level or daemon filter.
                        </p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <LogRows i={i} log={log} />
                    )))}
            
            <div className={`h-2 ${lowerBoarderBg} rounded-b-lg`} />
        </div>
    )
}
