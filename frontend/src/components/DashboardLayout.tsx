import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSocket, type UseSocketReturn } from "../hooks/useSocket";

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
    const rawData: UseSocketReturn = useSocket();

    return (
        <div className="h-screen w-full flex overflow-hidden">
            <Sidebar />

            <div className="h-full flex flex-col flex-1 overflow-hidden">
                <div className="relative z-10 shadow-[0_24px_20px_-20px_rgba(169,199,255,0.08)]">
                    <Topbar title={currentTitle} />
                </div>

                <main className="h-full w-full p-4 bg-primary flex flex-col overflow-y-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-[#262A34]">
                    <Outlet context={{rawData}}/>
                </main>
                <div className="h-4 bg-primary" />
            </div>
        </div>
    )
}