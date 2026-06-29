import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSocket, type UseSocketReturn } from "../hooks/useSocket";
import { useChartData } from "../hooks/useChartData";
import { useWazuhAlerts } from "../hooks/useWazuhAlert";

const DEFAULT_UPSTREAM_SERVICE = {
    reachable:    false,
    last_success: null,
    last_attempt: null,
    response_ms:  null,
    error:        null,
};

const EMPTY_SOCKET_DATA: UseSocketReturn = {
    nodes: [],
    vms: [],
    summary: {},
    dataSource: 'unavailable',
    dataTimestamp: null,
    nodeEvents: [],
    vmEvents: [],
    allEvents: [],
    collectorError: null,
    systemStatus: {
        tier:        null,
        lastUpdated: null,
        error:       null,
        nodesCached: 0,
        vmsCached:   0,
        dataSource:  'unavailable',
        frontendResponseMs: 0,
        upstream: {
            proxmox: DEFAULT_UPSTREAM_SERVICE,
            wazuh:   DEFAULT_UPSTREAM_SERVICE,
        },
    },
};

export default function DashboardLayout () {
    const location = useLocation();

    const titles: Record<string, string> = {
    "/dashboard": "System Overview",
    "/nodes": "Nodes",
    "/vms": "Virtual Machines",
    "/logs": "Logs",
    "/historical-trends": "Historical Trends",
    "/system-status": "System Status",
    "/settings": "Settings"
    };

    const currentTitle = titles[location.pathname] || "Dashboard";
    const rawData = useSocket() ?? EMPTY_SOCKET_DATA;

    const { slices, resourceHistory, vmTypeHistory, eventLog, clearEventLog } = useChartData(rawData) ?? {};
    const wazuhAlerts = useWazuhAlerts();

    return (
        <div className="h-screen w-full flex overflow-hidden">
            <Sidebar />

            <div className="h-full flex flex-col flex-1 overflow-hidden">
                <div className="relative z-10 shadow-[0_24px_20px_-20px_rgba(169,199,255,0.08)]">
                    <Topbar title={currentTitle} />
                </div>

                <main className="h-full w-full p-4 bg-primary flex flex-col overflow-y-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-[#262A34]">
                    <Outlet context={{rawData, slices, resourceHistory, vmTypeHistory, eventLog, clearEventLog, wazuhAlerts}}/>
                </main>
                <div className="h-4 bg-primary" />
            </div>
        </div>
    )
}