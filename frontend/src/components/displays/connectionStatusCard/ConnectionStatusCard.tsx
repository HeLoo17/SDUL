import type { SystemStatus } from "../../../hooks/useSocket";
import ConnectionStatusTag from "./ConnectionStatusTag";


function formatDateTime(value: string | null): string {
    if (!value) return "-";

    const date = new Date(value);

    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function setTitleDescription(value: number | null): string[] {
    return value === 1 ? ['Flask WebSocket', 'Infrastructure Hypervisor'] : value === 2 ? ['Flask REST API', 'Infrastructure Hypervisor'] : value === 3 ? ['Stale InfluxDB Data', 'Stale Historical Data'] : ['No Connection', 'Please check data connection']
}

function formatMs(ms: number | null): string {
    if (ms === null) return "-";

    if (ms < 1000) return `${ms} ms`;

    return `${(ms / 1000).toFixed(2)} s`;
}


export default function ConnectionStatusCard( { systemStatus } : { systemStatus: SystemStatus }) {
    const formatedLastSync = formatDateTime(systemStatus.lastUpdated);
    const [connection_service, description] = setTitleDescription(systemStatus.tier);

    return (
        <div className="flex flex-col w-full h-fit gap-8 p-8 bg-primary-BACK rounded-lg">
            <div className="w-full flex justify-between">
                <div className="w-full flex flex-col">
                    <span className="text-[20px] text-graph-TITLE font-space font-bold">{connection_service}</span>
                    <span className="text-[11px] text-t1 font-inter uppercase"> {description} </span>
                </div>
                <div>
                    <ConnectionStatusTag value={systemStatus.tier} />
                </div>
            </div>
            <div className="flex flex-col gap-4 ">
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> Last Sync </span>
                    <span className="font-mono text-graph-TITLE font-normal text-xs"> {formatedLastSync} </span>
                </div>
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> Response Time </span>
                    <span className="font-mono text-t3 font-normal text-xs"> {formatMs(systemStatus.frontendResponseMs)} </span>
                </div>
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> Nodes Reachable </span>
                    <span className="font-mono text-t3 font-normal text-xs"> {systemStatus.nodesCached} </span>
                </div>
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> VMs Reachable </span>
                    <span className="font-mono text-t3 font-normal text-xs"> {systemStatus.vmsCached} </span>
                </div>
            </div>
        </div>
    )
}