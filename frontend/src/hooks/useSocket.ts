/**
 * useSocket.ts
 * 3-Tier data source with automatics fallback
 * 
 * T1 - WebSocekt
 * T2 - REST API
 * T3 - InfluxDB Stale Data
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { io } from "socket.io-client";
import type { RawNodeAPI, RawVMAPI } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const MAX_EVENTS = 100;
const REST_INTERVAL = 3000;         //Tier 2: poll every 5 seconds
const INFLUX_INTERVAL = 3000;       //Tier 3: poll every 5 seconds
const TIER_CHECK_DELAY = 3000;      //Tier 1 disconnect buffer time before switch to Tier 2

type DataSource = "websocket" | "rest" | "influx_stale" | "unavailable";

interface SummaryData {
    tier: number;
    last_update: number;
    nodes_reached: number;
    vms_reached: number;
}

interface ApiResponse<T> {
    ok: boolean;
    error?: string;
    data: T;
}

interface HistoryRow {
    time: string | number;
    node: string;
    status_online?: number;
    cpu?: number;
    maxcpu?: number;
    mem?: number;
    maxmem?: number;
    disk?: number;
    maxdisk?: number;
    uptime?: number;
    netin?: number;
    netout?: number;
    iowait?: number;
}

interface SocketMetricsPayload {
    nodes?: RawNodeAPI[] | null;
    vms?: RawVMAPI[] | null;
    summary?: SummaryData;
    timestamp?: string | null;
}

interface SocketEvent {
    timestamp: string;
    message?: string;
    [key: string]: unknown;
}

export interface UseSocketReturn {
    nodes: RawNodeAPI[];
    vms: RawVMAPI[];
    summary: SummaryData;
    dataSource: DataSource;
    dataTimestamp: string | null;
    nodeEvents: SocketEvent[];
    vmEvents: SocketEvent[];
    allEvents: SocketEvent[];
    collectorError: string | null;
}

// Fetch helper 
async function apiFetch<T>(path: string): Promise<T> {
    const resp = await fetch(`${API_BASE}${path}`, {
        headers: {"X-API-Key": API_KEY}
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json() as ApiResponse<T>;
    if (!json.ok) throw new Error(json.error || "API error");
    return json.data;
}


// Tier 3 - InfluxDB helper
function deriveSnapshotFromHistory(rows: HistoryRow[] | null | undefined): {
    nodes: RawNodeAPI[];
    vms: RawVMAPI[];
    summary: SummaryData;
} {
    if (!rows || rows.length === 0) return { nodes: [], vms: [], summary: null };
 
    // Keep only the most recent row per node
    const latestByNode: Record<string, HistoryRow> = {};
    rows.forEach(row => {
        const existing = latestByNode[row.node];
        if (!existing || row.time > existing.time) {
            latestByNode[row.node] = row;
        }
    });
 
    const nodes: RawNodeAPI[] = Object.values(latestByNode).map(row => ({
        node: row.node,
        status: row.status_online === 1 ? "online" : "offline",
        cpu: row.cpu ?? 0,
        maxcpu: row.maxcpu ?? 0,
        mem: row.mem ?? 0,
        maxmem: row.maxmem ?? 0,
        disk: row.disk ?? 0,
        maxdisk: row.maxdisk ?? 0,
        uptime: row.uptime ?? 0,
        netin: row.netin ?? 0,
        netout: row.netout ?? 0,
        iowait: row.iowait ?? 0,
    }));
 
    return { nodes, vms: [], summary: null };
}


// Hook to trigger React re-render comonents using this hook with new value
export function useSocket(): UseSocketReturn {
    const [nodes, setNodes] = useState<RawNodeAPI[]>([]);
    const [vms, setVms] = useState<RawVMAPI[]>([]);
    const [summary, setSummary] = useState<SummaryData>([]);
    const [dataSource, setDataSource] = useState<DataSource>("unavailable");
    const [dataTimestamp, setDataTimestamp] = useState<string | null>(null);
    const [collectorError, setCollectorError] = useState<string | null>(null);
    const [nodeEvents, setNodeEvents] = useState<SocketEvent[]>([])
    const [vmEvents, setVmEvents] =  useState<SocketEvent[]>([])

    const wsConnectedRef = useRef(false);
    const restWorkingRef = useRef(false);
    const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const influxIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const addEvent = useCallback((
        setter: Dispatch<SetStateAction<SocketEvent[]>>,
        event: SocketEvent,
    ) => {
        setter(prev => [event, ...prev].slice(0, MAX_EVENTS));
    }, []);


    // Setters - used by all tiers to update the same state fields
    const applyMetrics = useCallback((
        nodes: RawNodeAPI[] | null | undefined,
        vms: RawVMAPI[] | null | undefined,
        summary: SummaryData,
        source: DataSource,
        timestamp?: string | null,
    ) => {
        setNodes(nodes ?? []);
        setVms(vms ?? []);
        setSummary(summary ?? null);
        setDataSource(source);
        setDataTimestamp(timestamp ?? new Date().toISOString());
    }, []);


    //Tier 3 - InfluxDB stale fallback
    const fetchInfuxFallBack = useCallback(async () => {
        //Check if T1/T2 is working
        if (wsConnectedRef.current || restWorkingRef.current) return;

        try {
            const rows = await apiFetch<HistoryRow[]>("/api/history/cluster?hours=1");
            const { nodes, vms, summary } = deriveSnapshotFromHistory(rows);

            if(nodes.length > 0) {
                applyMetrics(nodes, vms, summary, "influx_stale", new Date().toISOString());
                console.log("[tier3] Showing stale InfluxDB data");
            }
        }
        catch (err) {
            setDataSource("unavailable");
            console.error("[tier3] InfluxDB fallback failed:", err instanceof Error ? err.message : err);
        }
    }, [applyMetrics]);


    //Tier 2 - REST API fallback
    const restTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const stopRestPolling = useCallback(() => {
    if (restTimeoutRef.current) {
        clearTimeout(restTimeoutRef.current);
        restTimeoutRef.current = null;
    }
    if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
    }
    restWorkingRef.current = false;
}, []);

    const stopInfluxPolling = useCallback(() => {
        if(influxIntervalRef.current) {
            clearInterval(influxIntervalRef.current);
            influxIntervalRef.current = null;
        }
    }, []);


    const fetchRest = useCallback(async () => {
        // Check if T1 is working
        if (wsConnectedRef.current) {
            stopRestPolling();
            return;
        }

        try {
            const [nodesData, vmsData, summaryData] = await Promise.all([
                apiFetch<RawNodeAPI[]>("/api/nodes"),
                apiFetch<RawVMAPI[]>("/api/vms"),
                apiFetch<SummaryData>("/api/summary")
            ]);

            // Stop InfluxDB fallback (Tier 3) if REST API is working
            stopInfluxPolling();

            applyMetrics(nodesData, vmsData, summaryData, "rest", new Date().toISOString());
            console.log("[tier2] REST polling active");
        }
        catch (err) {
            restWorkingRef.current = false;
            console.warn("[tier2] REST failed:", err instanceof Error ? err.message : err);

            // Start InfluxDB stale data (Tier 3) if it wasn't running
            if (!influxIntervalRef.current) {
                fetchInfuxFallBack(); //immediate start InfluxDB fallback
                influxIntervalRef.current = setInterval(fetchInfuxFallBack, INFLUX_INTERVAL);
                console.log("[tier3] InfluxDB fallback started");
            }
        }
    }, [applyMetrics, fetchInfuxFallBack, stopRestPolling, stopInfluxPolling]);


    const startRestPolling = useCallback(() => {
        if (restIntervalRef.current || restTimeoutRef.current) return; // guard both

        restTimeoutRef.current = setTimeout(() => {
            restTimeoutRef.current = null;
            if (!wsConnectedRef.current) {
                fetchRest();
                restIntervalRef.current = setInterval(fetchRest, REST_INTERVAL);
            }
        }, TIER_CHECK_DELAY);
    }, [fetchRest]);


    // Tier 1 - Websocket (Priamry)
    useEffect(() => {
        const socket = io(API_BASE, {
            auth: {key: API_KEY},
            reconnection: true,
            reconnectionDelay: 3000,
        });

        // Connected
        socket.on("connect", () => {
            console.log("[tier1] WebSocket connected");
            wsConnectedRef.current = true;

            // Stop other tiers when WebSocket is up
            stopRestPolling();
            stopInfluxPolling();
            setCollectorError(null);
        });

        // Disconnected from WebSocket -> start Tier 2 fallback
        socket.on("disconnect", () => {
            console.warn("[tier1] WewbSocket disconnected - starting Tier 2");
            wsConnectedRef.current = false;
            startRestPolling();
        });

        socket.on("connect_error", () => {
            wsConnectedRef.current = false;
            startRestPolling();
        });

        // Main metrics push
        socket.on("metrics", (data: SocketMetricsPayload) => {
            applyMetrics(
                data.nodes,
                data.vms,
                data.summary,
                "websocket",
                data.timestamp
            );
        });

        // State change events
        socket.on("node_status_change", (event: SocketEvent) => {
            console.log("[ws] node_status_change:", event);
            addEvent(setNodeEvents, event);
        });

        socket.on("vm_status_change", (event: SocketEvent) => {
            console.log("[ws] vm_status_change:", event);
            addEvent(setVmEvents, event);
        });

        socket.on("collector_error", (event: SocketEvent) => {
            console.error("[ws] collector_error:", event.message);
            setCollectorError(event.message ?? null);
        });

        // Clean up when unmounted
        return () => {
            socket.disconnect();
            stopRestPolling();
            stopInfluxPolling();
            if (restTimeoutRef.current) clearTimeout(restTimeoutRef.current);
        };
    }, [applyMetrics, addEvent, startRestPolling, stopRestPolling, stopInfluxPolling]);


    // Combine event logs into newest align
    const allEvents = useMemo(() =>
        [...nodeEvents, ...vmEvents]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, MAX_EVENTS),
        [nodeEvents, vmEvents]
    );

    return {
        nodes,
        vms,
        summary,
        dataSource,              // "websocket" | "rest" | "influx_stale" | "unavailable"
        dataTimestamp,
        nodeEvents,
        vmEvents,
        allEvents,
        collectorError
    }
}
