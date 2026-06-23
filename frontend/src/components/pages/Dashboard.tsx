import KPICards from "../displays/KPICards";
import KPICards2 from "../displays/KPICards2";
import deco from "../../assets/deco";
import CPU_RAM_GeneralGraph from "../displays/CPU_RAM_GeneralGraph";
import BriefAlertLog from "../displays/briefAlertLog/BriefAlertLog";
import { type UseSocketReturn } from "../../hooks/useSocket";
import type { RawNodeAPI, RawVMAPI } from "../../types";
import { useOutletContext } from "react-router-dom";

// Shape returned by backend build_summary(). Fields are optional because the hook can briefly return null/empty data while WebSocket or REST reconnects.
interface DashboardSummary {
    nodes?: {
        total?: number;
        online?: number;
        offline?: number;
    };
    vms?: {
        total?: number;
        running?: number;
        stopped?: number;
        other?: number;
    };
    node_resources?: {
        cpu?: {
            used_pct?: number;
        };
        memory?: {
            used_pct?: number;
        };
    };
}

function isDashboardSummary(value: unknown): value is DashboardSummary {
    return typeof value === "object" && value !== null;
}

// Fallback CPU calculation for raw node data. Backend node.cpu is a 0-1 ratio so this converts each online node to a percentage before averaging.
function averageCpuUsage(nodes: RawNodeAPI[]): number {
    const onlineNodes = nodes.filter((node) => node.status === "online");
    if (onlineNodes.length === 0) return 0;

    const totalCpu = onlineNodes.reduce((sum, node) => sum + ((node.cpu ?? 0) * 100), 0);
    return totalCpu / onlineNodes.length;
}

// Fallback memory calculation for raw node data. This weights usage by total memory capacity instead of averaging node percentages, matching cluster usage.
function memoryUsage(nodes: RawNodeAPI[]): number {
    const onlineNodes = nodes.filter((node) => node.status === "online");
    const totalMemory = onlineNodes.reduce((sum, node) => sum + (node.maxmem ?? 0), 0);
    if (totalMemory === 0) return 0;

    const usedMemory = onlineNodes.reduce((sum, node) => sum + (node.mem ?? 0), 0);
    return (usedMemory / totalMemory) * 100;
}

function onlineNodeCount(nodes: RawNodeAPI[]): number {
    return nodes.filter((node) => node.status === "online").length;
}

function runningVmCount(vms: RawVMAPI[]): number {
    return vms.filter((vm) => vm.status === "running").length;
}

export default function Dashboard() {
    const { rawData } = useOutletContext<{rawData: UseSocketReturn}>();
    const { nodes, vms, summary, dataTimestamp } = rawData;
    const liveSummary = isDashboardSummary(summary) ? summary : null;

    // Prefer backend summary values when available, then fall back to raw WebSocket/REST data so the dashboard still renders during degraded tiers.
    const totalNodes = liveSummary?.nodes?.total ?? nodes.length;
    const onlineNodes = liveSummary?.nodes?.online ?? onlineNodeCount(nodes);
    const totalVms = liveSummary?.vms?.total ?? vms.length;
    const runningVms = liveSummary?.vms?.running ?? runningVmCount(vms);
    const cpuUsage = liveSummary?.node_resources?.cpu?.used_pct ?? averageCpuUsage(nodes);
    const memoryUsed = liveSummary?.node_resources?.memory?.used_pct ?? memoryUsage(nodes);

    return (
        <div className="h-full w-full flex flex-col gap-12">
            <div className="flex gap-6">
                <KPICards on={onlineNodes} total={totalNodes} title="Total Nodes" info="Online" icon={deco.totalNodes} />
                <KPICards on={runningVms} total={totalVms} title="Total VMs" info="Running" icon={deco.totalVMs} />
                <KPICards2 on={cpuUsage} total={100} title="CPU Usage" info="System Load" icon={deco.cpuUsage} />
                <KPICards2 on={memoryUsed} total={100} title="Memory Usage" info="Usage" icon={deco.memoryUsage} />
            </div>
            <CPU_RAM_GeneralGraph cpuUsage={cpuUsage} memoryUsage={memoryUsed} timestamp={dataTimestamp} />
            <BriefAlertLog />
        </div>
    )
}
