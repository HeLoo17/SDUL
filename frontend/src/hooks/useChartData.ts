import { useState, useRef, useEffect } from "react";
import { type UseSocketReturn } from "./useSocket";
import { sumThroughput, transformVMs, type VM } from "../types";

const MAX_SLICES = 30;
const VM_TAGS_CHART_MAX_SLICES = 300;

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

export interface ChartDataReturn {
    slices: any[];
    resourceHistory: any[];
    vmTypeHistory: any[];
}

export function useChartData(rawData: UseSocketReturn): ChartDataReturn {
    const [slices, setSlices] = useState<any[]>([]);
    const [resourceHistory, setResourceHistory] = useState<any[]>([]);
    const [vmTypeHistory, setVmTypeHistory] = useState<VMTypeData[]>([]);

    const prevNodesRef = useRef<any[]>([]);
    const prevSignatureRef = useRef<string>("");

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

        const vmTypeSnapshot = buildVMTagSnapshot(transformVMs(vms));

        setVmTypeHistory((prev) => {
            const next = [
                ...prev,
                {
                    time,
                    ...vmTypeSnapshot,
                },
            ];
            return next.slice(-VM_TAGS_CHART_MAX_SLICES);
        });
    }, [rawData]);

    return { slices, resourceHistory, vmTypeHistory };
}

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
