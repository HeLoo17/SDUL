// hooks/useHistoricalData.ts
import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const API_KEY  = import.meta.env.VITE_API_KEY  || "";

export type TimeRange = "24h" | "7d" | "30d";

const HOURS_MAP: Record<TimeRange, number> = {
    "24h":  24,
    "7d":   168,
    "30d":  720,
};

export interface HistoricalPoint {
    time: string;
    cpu: number;
    memory: number;
}

export function useHistoricalData(range: TimeRange) {
    const [data,    setData]    = useState<HistoricalPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const hours = HOURS_MAP[range];
            const resp  = await fetch(
                `${API_BASE}/api/history/cluster?hours=${hours}`,
                { headers: { "X-API-Key": API_KEY } }
            );
            const json = await resp.json();
            if (!json.ok) throw new Error(json.error);
            setData(json.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "fetch failed");
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { data, loading, error, refetch: fetch };
}