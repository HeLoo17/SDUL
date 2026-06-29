import { useState, useEffect, useCallback } from "react";
import type { WazuhLog, LogLevel } from "../types/log";
 
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const API_KEY  = import.meta.env.VITE_API_KEY  ?? "";

// Filter parameters
export interface LogFilters {
    level?: LogLevel | "all";
    tag?: string;
    limit?: number;
}

// Shape 
export interface UseWazuhLogsReturn {
    logs: WazuhLog[];
    isLoading: boolean;
    error: string | null;
    lastFetched: string | null;
    refetch: () => void;
}

// Hook
export function useWazuhLogs(filters: LogFilters = {}): UseWazuhLogsReturn {
    const [logs, setLogs]               = useState<WazuhLog[]>([]);
    const [isLoading, setIsLoading]     = useState(false);
    const [error, setError]             = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<string | null>(null);
 
    const { level, tag, limit = 100 } = filters;
 
    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("limit", String(limit));
            if (level && level !== "all") params.set("level", level);
            if (tag)                       params.set("tag",   tag);
 
            const resp = await fetch(`${API_BASE}/api/logs?${params.toString()}`, {
                headers: { "X-API-Key": API_KEY },
            });
 
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
 
            const json = await resp.json();
            if (!json.ok) throw new Error(json.error ?? "API error");
 
            setLogs(json.data as WazuhLog[]);
            setError(null);
            setLastFetched(new Date().toISOString());
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            setError(msg);
            console.error("[useWazuhLogs]", msg);
        } finally {
            setIsLoading(false);
        }
    }, [level, tag, limit]);
 
    // Fetch on mount and whenever filters change
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
 
    return { logs, isLoading, error, lastFetched, refetch: fetchLogs };
}
