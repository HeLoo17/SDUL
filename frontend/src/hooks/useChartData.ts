import { useState, useRef, useEffect, useCallback } from "react";
import { type UseSocketReturn } from "./useSocket";
import { sumThroughput, transformVMs, type VM } from "../types";

const MAX_SLICES = 30;
const VM_TAGS_CHART_MAX_SLICES = 300;
const MAX_EVENTS = 50;

function nowLabel(): string {
    return new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

// Fallback logic for cluster nodes
function averageCpuUsage(nodes: any[]): number {
    const onlineNodes = nodes.filter((n) => n.status === "online");
    if (onlineNodes.length === 0) return 0;
    return onlineNodes.reduce((sum, n) => sum + ((n.cpu ?? 0) * 100), 0) / onlineNodes.length;
}

function memoryUsage(nodes: any[]): number {
    const onlineNodes = nodes.filter((n) => n.status === "online");
    const totalMemory = onlineNodes.reduce((sum, n) => sum + (n.maxmem ?? 0), 0);
    if (totalMemory === 0) return 0;
    return (onlineNodes.reduce((sum, n) => sum + (n.mem ?? 0), 0) / totalMemory) * 100;
}

// Event Log 
export type EventKind = "success" | "warning" | "error" | "info" | "tier";
 
export interface SystemEvent {
    id: number;
    kind: EventKind;
    title: string;
    detail?: string;
    timestamp: Date;
}
 
let _eventId = 0;
 
function makeEvent(kind: EventKind, title: string, detail?: string): SystemEvent {
    return { id: ++_eventId, kind, title, detail, timestamp: new Date() };
}

// VM Tags Graph


export type VMTypeData = {
  time: string;
  [vmType: string]: number | string;
};

function buildVMTagSnapshot(vms: VM[]): Record<string, number> {
    const result: Record<string, number> = {};

    for (const vm of vms) {
        const tag =
            vm.tags && vm.tags.length > 0
                ? vm.tags[0]
                : "untagged";
        result[tag] = (result[tag] || 0) + 1;
    }
    return result;
}



// Return data shape
export interface ChartDataReturn {
    slices: any[];
    resourceHistory: any[];
    vmTypeHistory: any[];
    eventLog: SystemEvent[];
    clearEventLog: () => void;
}


// Hook
export function useChartData(rawData: UseSocketReturn): ChartDataReturn {
    const [slices, setSlices] = useState<any[]>([]);
    const [resourceHistory, setResourceHistory] = useState<any[]>([]);
    const [vmTypeHistory, setVmTypeHistory] = useState<VMTypeData[]>([]);

    const prevNodesRef = useRef<any[]>([]);
    const prevSignatureRef = useRef<string>("");
    const knownTagsRef = useRef<Set<string>>(new Set());

    // IMPORTANT: stabilize nodes reference
    const nodes = rawData?.nodes ?? [];
    const vms = rawData?.vms ?? [];

    useEffect(() => {
        if (!rawData || !nodes || nodes.length === 0) return;

        const time = nowLabel();

        const network = sumThroughput(nodes, "net");
        const rawDisk = sumThroughput(nodes, "disk");
        const disk = rawDisk < 1 ? rawDisk * 100 : rawDisk;

        const liveSummary =
            rawData.summary && typeof rawData.summary === "object"
                ? (rawData.summary as any)
                : null;

        const currentCpu =
            liveSummary?.node_resources?.cpu?.used_pct ??
            averageCpuUsage(nodes);

        const currentMem =
            liveSummary?.node_resources?.memory?.used_pct ??
            memoryUsage(nodes);

        const signature = `${network.toFixed(0)}-${disk.toFixed(2)}-${currentCpu.toFixed(1)}-${currentMem.toFixed(1)}`;

        if (prevSignatureRef.current === signature) return;

        prevSignatureRef.current = signature;

        // 1. Accumulate Throughput Slices (Network & Disk for Nodes Page)
        setSlices((prev) => {
            const next = [...prev, { time, network, disk }];
            return next.length > MAX_SLICES ? next.slice(-MAX_SLICES) : next;
        });

        // 2. Accumulate Resource History (CPU & RAM for Dashboard Page)
        setResourceHistory((prev) => {
            const next = [...prev, { time, cpu: currentCpu, memory: currentMem }];
            return next.length > MAX_SLICES ? next.slice(-MAX_SLICES) : next;
        });

        prevNodesRef.current = nodes;

        const vmTypeSnapshot = buildVMTagSnapshot(transformVMs(vms).filter(vm => vm.status === 'running'));

        Object.keys(vmTypeSnapshot).forEach(tag =>
            knownTagsRef.current.add(tag)
        );

        const completeSnapshot: Record<string, number> = {};

        knownTagsRef.current.forEach(tag => {
            completeSnapshot[tag] = vmTypeSnapshot[tag] ?? 0;
        });

        setVmTypeHistory((prev) => {
            const next = [
                ...prev,
                {
                    time,
                    ...completeSnapshot,
                },
            ];
            return next.slice(-VM_TAGS_CHART_MAX_SLICES);
        });
    }, [rawData]);

    // Event Log State
    const [eventLog, setEventLog] = useState<SystemEvent[]>([]);
 
    const pushEvent = useCallback((ev: SystemEvent) => {
        setEventLog(prev => {
            const next = [ev, ...prev];
            return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
        });
    }, []);
 
    const clearEventLog = useCallback(() => {
        setEventLog([makeEvent("info", "Log cleared", "Manual clear by user")]);
    }, []);
 
    // Seed once
    const seededRef = useRef(false);
    useEffect(() => {
        if (seededRef.current) return;
        seededRef.current = true;
        pushEvent(makeEvent("info", "Dashboard initialised", "Connecting to data sources…"));
    }, [pushEvent]);
 
    // Tier / data-source transitions
    const prevTierRef = useRef<number | null | undefined>(undefined);
    const { dataSource } = rawData;
 
    useEffect(() => {
        const tier =
            dataSource === "websocket" ? 1 :
            dataSource === "rest" ? 2 :
            dataSource === "influx_stale" ? 3 : null;
 
        if (prevTierRef.current === undefined) {
            prevTierRef.current = tier;
            if (tier === 1) pushEvent(makeEvent("success", "WebSocket connected", "Tier 1 live push active"));
            else if (tier === 2) pushEvent(makeEvent("warning", "REST polling active", "Tier 2 fallback — WebSocket unavailable"));
            else if (tier === 3) pushEvent(makeEvent("tier", "InfluxDB stale data", "Tier 3 fallback — REST also unavailable"));
            else pushEvent(makeEvent("error", "No data source available","All tiers unreachable"));
            return;
        }
        if (tier === prevTierRef.current) return;
 
        if (tier === 1) pushEvent(makeEvent("success", "WebSocket reconnected", "Switched back to Tier 1 live push"));
        else if (tier === 2) pushEvent(makeEvent("warning", "Switched to REST polling", "Tier 2 fallback — WebSocket lost"));
        else if (tier === 3) pushEvent(makeEvent("tier", "Switched to InfluxDB stale", "Tier 3 — REST also unreachable"));
        else pushEvent(makeEvent("error", "Connection lost", "All data sources unreachable"));
 
        prevTierRef.current = tier;
    }, [dataSource, pushEvent]);
 
    // Collector errors
    const { collectorError } = rawData;
    const prevErrorRef = useRef<string | null>(null);
 
    useEffect(() => {
        if (collectorError && collectorError !== prevErrorRef.current)
            pushEvent(makeEvent("error",   "Collector error",    collectorError));
        if (!collectorError && prevErrorRef.current)
            pushEvent(makeEvent("success", "Collector recovered","No active errors reported"));
        prevErrorRef.current = collectorError;
    }, [collectorError, pushEvent]);
 
    // Node / VM socket events
    const { allEvents } = rawData;
    const prevSocketCountRef = useRef(0);
 
    useEffect(() => {
        if (allEvents.length <= prevSocketCountRef.current) return;
        const newEvs = allEvents.slice(0, allEvents.length - prevSocketCountRef.current);
        prevSocketCountRef.current = allEvents.length;
 
        newEvs.forEach(ev => {
            const raw = ev as Record<string, unknown>;
            if ("node" in raw) {
                const node = String(raw.node ?? "unknown");
                const curr = String(raw.curr_status ?? "?");
                const prev = String(raw.prev_status ?? "?");
                pushEvent(makeEvent(
                    curr === "online" ? "success" : "warning",
                    `Node ${node} → ${curr}`,
                    `Was ${prev}`,
                ));
            } else if ("vm" in raw) {
                const vm   = String(raw.vm ?? "unknown");
                const curr = String(raw.curr_status ?? "?");
                const prev = String(raw.prev_status ?? "?");
                const kind: EventKind =
                    curr === "running" ? "success" :
                    curr === "error"   ? "error"   : "warning";
                pushEvent(makeEvent(kind, `VM ${vm} → ${curr}`, `Was ${prev}`));
            }
        });
    }, [allEvents, pushEvent]);

    return { slices, resourceHistory, vmTypeHistory, eventLog, clearEventLog };
}
