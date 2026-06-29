import { useState } from "react";
import { useWazuhLogs } from "../../../hooks/useWazuhLogs";
import type { LogLevel } from "../../../types";
import LogRows from "./LogRows";

const LEVEL_OPTIONS = ["all", "info", "warning", "error", "debug"] as const;
 
const TAG_OPTIONS = [
    "all",
    "wazuh-analysisd",
    "wazuh-remoted",
    "wazuh-modulesd",
    "wazuh-integratord",
    "wazuh-authd",
    "wazuh-apid",
];

export default function LogTable() {
    const [level, setLevel] = useState<LogLevel | "all">("all");
    const [tag,   setTag]   = useState<string>("all");
    
    const { logs, isLoading, error, lastFetched, refetch } = useWazuhLogs({
        level,
        tag,
        limit: 100,
    });
    return (
        <div className="h-full w-full flex flex-col gap-8">
            <div className="grid grid-cols-[100px_160px_160px_1fr] items-center gap-4 bg-[#262A34]/80 px-8 py-4">
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">level</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">daemon</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">time</span>
                <span className="text-[10px] text-t2 font-inter font-semibold uppercase">message</span>
            </div>

            {/* ROWS */}
            {isLoading && logs.length === 0 ? (
                    <div className="w-full flex items-center justify-center py-16">
                        <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                            fetching logs...
                        </span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-16">
                        <p className="text-[14px] text-t1 font-inter font-medium">No log entries found</p>
                        <p className="text-[12px] text-t1/60 font-inter mt-1">
                            Try adjusting the level or daemon filter.
                        </p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <LogRows i={i} log={log} />
                    )))}
        </div>

        
    )
}
