import { useOutletContext } from "react-router-dom";
import BriefAlertLogRecords from "./BriefAlertLogRecords";
import type { UseWazuhAlertsReturn } from "../../../hooks/useWazuhAlert";

export default function BriefAlertLog() {
    const { wazuhAlerts } = useOutletContext<{wazuhAlerts: UseWazuhAlertsReturn}>();
    const { alerts, isLoading, error } = wazuhAlerts;
 
    // Show only the 3 most recent on the dashboard summary
    const recent = alerts.slice(0, 3);
    
    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg'>
            {/* HEADERS */}
            <div className="flex justify-between items-end px-8 py-6">
                <h2 className="text-[20px] text-graph-TITLE font-space font-bold">Recent Alerts</h2>
                <button className="text-[12px] text-graph-CPU font-inter font-regular uppercase">view all logs</button>
            </div>
            {/* COLUMN HEADERS */}
            <div className="grid grid-cols-[100px_120px_1fr_150px] items-center gap-4 bg-[#262A34]/80 px-8 py-4">
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">severity</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">host </span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">description</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">time</span>
            </div>
            {isLoading && alerts.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                    <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                        fetching alerts...
                    </span>
                </div>
            ) : error ? (
                <div className="px-8 py-6">
                    <span className="text-[11px] text-[#FFB4AB] font-inter">{error}</span>
                </div>
            ) : recent.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                    <span className="text-[11px] text-t2 font-inter uppercase tracking-widest">
                        no alerts in the last 24 h
                    </span>
                </div>
            ) : (
                recent.map((alert) => (
                    <BriefAlertLogRecords
                        key={alert.id}
                        severity={alert.severity}
                        host={alert.host}
                        description={alert.description}
                        time={alert.timestamp}
                    />
                ))
            )}
            <div className="h-2" />
        </div>
    )
}