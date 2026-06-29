import { useState, useEffect, useCallback, useRef } from "react";
import type { WazuhAlert } from "../types/log";
 
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const API_KEY  = import.meta.env.VITE_API_KEY  ?? "";
const POLL_MS  = 30_000;

// Shapes
export interface UseWazuhAlertsReturn {
    alerts: WazuhAlert[];
    isLoading: boolean;
    error: string | null;
    lastFetched: string | null;
    refetch: () => void;
}


// Hooks
export function useWazuhAlerts(): UseWazuhAlertsReturn {
    const [alerts, setAlerts]           = useState<WazuhAlert[]>([]);
    const [isLoading, setIsLoading]     = useState(false);
    const [error, setError]             = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<string | null>(null);
 
    const mountedRef  = useRef(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
    const fetchAlerts = useCallback(async () => {
        setIsLoading(true);
        try {
            const resp = await fetch(`${API_BASE}/api/alerts?limit=50&min_level=3&hours=24`, {
                headers: { "X-API-Key": API_KEY },
            });
 
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
 
            const json = await resp.json();
            if (!json.ok) throw new Error(json.error ?? "API error");
 
            if (!mountedRef.current) return;
            setAlerts(json.data as WazuhAlert[]);
            setError(null);
            setLastFetched(new Date().toISOString());
        } catch (err) {
            if (!mountedRef.current) return;
            const msg = err instanceof Error ? err.message : "Unknown error";
            setError(msg);
            console.error("[useWazuhAlerts]", msg);
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    }, []);
 
    useEffect(() => {
        mountedRef.current = true;
 
        fetchAlerts();
        intervalRef.current = setInterval(fetchAlerts, POLL_MS);
 
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") fetchAlerts();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
 
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [fetchAlerts]);
 
    return { alerts, isLoading, error, lastFetched, refetch: fetchAlerts };
}
