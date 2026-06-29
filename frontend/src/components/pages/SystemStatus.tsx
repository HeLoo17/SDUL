import { useOutletContext } from "react-router-dom";
import ConnectionStatusCard from "../displays/connectionStatusCard/ConnectionStatusCard";
import type { UseSocketReturn, SystemStatus } from "../../hooks/useSocket";
import SystemEventLog from "../displays/SystemEventLog";
import UpstreamConnectionStatusCard from "../displays/connectionStatusCard/UpstreamConnectionStatusCard";



export default function SystemStatus() {
    const { rawData } = useOutletContext<{ rawData: UseSocketReturn }>();
    const { systemStatus: rawStatus, allEvents } = rawData;

    return (
        <div className="h-full w-full flex flex-col gap-6">
            <div className="h-fit w-full flex gap-8">
                <UpstreamConnectionStatusCard upstreamStatus={rawStatus.upstream.proxmox} service="proxmox" />
                <UpstreamConnectionStatusCard upstreamStatus={rawStatus.upstream.wazuh} service="wazuh" />
            </div>
            <div className="h-fit w-full flex gap-8">
                <ConnectionStatusCard systemStatus={rawStatus} />
            </div>
            <SystemEventLog systemStatus={rawStatus} allSocketEvents={allEvents} />
        </div>
    )
}