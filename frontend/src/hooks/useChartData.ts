import { useState, useRef, useEffect, useCallback } from "react";
import { type UseSocketReturn } from "./useSocket";
import { sumThroughput, transformVMs, type VM } from "../types";

const MAX_SLICES = 30;
const VM_TAGS_CHART_MAX_SLICES = 300;
const MAX_EVENTS = 50;

function nowLabel(): string {
    return new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

// ---------------- helpers ----------------

function averageCpuUsage(nodes: any[]): number {
    const online = nodes.filter(n => n.status === "online");
    if (!online.length) return 0;
    return online.reduce((s, n) => s + ((n.cpu ?? 0) * 100), 0) / online.length;
}

function memoryUsage(nodes: any[]): number {
    const online = nodes.filter(n => n.status === "online");
    const total = online.reduce((s, n) => s + (n.maxmem ?? 0), 0);
    if (!total) return 0;

    return (
        online.reduce((s, n) => s + (n.mem ?? 0), 0) / total
    ) * 100;
}

// ---------------- events ----------------

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

// ---------------- VM snapshot ----------------

function buildVMTagSnapshot(vms: VM[]): Record<string, number> {
    const result: Record<string, number> = {};

    for (const vm of vms) {
        const tag = vm.tags?.[0] ?? "untagged";
        result[tag] = (result[tag] || 0) + 1;
    }

    return result;
}

// ---------------- return type ----------------

export interface ChartDataReturn {
    slices: any[];
    resourceHistory: any[];
    vmTypeHistory: any[];
    eventLog: SystemEvent[];
    clearEventLog: () => void;
}

// ---------------- hook ----------------

export function useChartData(rawData: UseSocketReturn): ChartDataReturn {
    const [slices, setSlices] = useState<any[]>([]);
    const [resourceHistory, setResourceHistory] = useState<any[]>([]);
    const [vmTypeHistory, setVmTypeHistory] = useState<any[]>([]);
    const [eventLog, setEventLog] = useState<SystemEvent[]>([]);

    const prevSignatureRef = useRef("");

    const nodes = rawData?.nodes ?? [];
    const vms = rawData?.vms ?? [];

    // ---------------- MAIN UPDATE ----------------

    useEffect(() => {
        if (!nodes.length) return;

        const time = nowLabel();

        const network = sumThroughput(nodes, "net");
        const diskRaw = sumThroughput(nodes, "disk");
        const disk = diskRaw < 1 ? diskRaw * 100 : diskRaw;

        const summary =
            typeof rawData.summary === "object" ? rawData.summary : null;

        const cpu =  averageCpuUsage(nodes);

        const memory = memoryUsage(nodes);

        const signature =
            `${network.toFixed(0)}-${disk.toFixed(2)}-${cpu.toFixed(1)}-${memory.toFixed(1)}`;

        if (prevSignatureRef.current === signature) return;
        prevSignatureRef.current = signature;

        // ---------------- FIX 1: bounded slices ----------------

        setSlices(prev => {
            const next = [...prev, { time, network, disk }];
            return next.length > MAX_SLICES ? next.slice(-MAX_SLICES) : next;
        });

        setResourceHistory(prev => {
            const next = [...prev, { time, cpu, memory }];
            return next.length > MAX_SLICES ? next.slice(-MAX_SLICES) : next;
        });

        // ---------------- FIX 2: NO persistent tag accumulation ----------------
        // 🚨 removed knownTagsRef completely

        const runningVMs = transformVMs(vms).filter(vm => vm.status === "running");
        const snapshot = buildVMTagSnapshot(runningVMs);

        // derive only CURRENT keys (bounded, no growth)
        const allTags = Object.keys(snapshot);

        const completeSnapshot: Record<string, number> = {};
        for (const tag of allTags) {
            completeSnapshot[tag] = snapshot[tag] ?? 0;
        }

        setVmTypeHistory(prev => {
            const next = [
                ...prev,
                { time, ...completeSnapshot }
            ];

            return next.length > VM_TAGS_CHART_MAX_SLICES
                ? next.slice(-VM_TAGS_CHART_MAX_SLICES)
                : next;
        });

    }, [rawData, nodes, vms]);

    // ---------------- EVENT LOG ----------------

    const pushEvent = useCallback((ev: SystemEvent) => {
        setEventLog(prev => {
            const next = [ev, ...prev];
            return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
        });
    }, []);

    const clearEventLog = useCallback(() => {
        setEventLog([
            makeEvent("info", "Log cleared", "Manual clear by user")
        ]);
    }, []);

    // ---------------- SEED ----------------

    const seededRef = useRef(false);

    useEffect(() => {
        if (seededRef.current) return;
        seededRef.current = true;

        pushEvent(
            makeEvent("info", "Dashboard initialised", "Connecting to data sources…")
        );
    }, [pushEvent]);

    // ---------------- TIER EVENTS ----------------

    const prevTierRef = useRef<number | null | undefined>(undefined);
    const { dataSource } = rawData;

    useEffect(() => {
        const tier =
            dataSource === "websocket" ? 1 :
            dataSource === "rest" ? 2 :
            dataSource === "influx_stale" ? 3 : null;

        if (prevTierRef.current === undefined) {
            prevTierRef.current = tier;
            return;
        }

        if (tier === prevTierRef.current) return;

        prevTierRef.current = tier;

        if (tier === 1) pushEvent(makeEvent("success", "WebSocket active"));
        else if (tier === 2) pushEvent(makeEvent("warning", "REST fallback active"));
        else if (tier === 3) pushEvent(makeEvent("tier", "Influx fallback active"));
        else pushEvent(makeEvent("error", "No data source"));
    }, [dataSource, pushEvent]);

    return {
        slices,
        resourceHistory,
        vmTypeHistory,
        eventLog,
        clearEventLog
    };
}