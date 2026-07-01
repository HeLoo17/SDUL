import type { UpstreamService } from "../../../hooks/useSocket";
import ConnectionStatusTag from "./ConnectionStatusTag";


function formatDateTime(value: string | null): string {
    if (!value) return "-";

    const date = new Date(value);

    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function setTitleDescription(type: 'proxmox' | 'wazuh'): string[] {
    return type === 'proxmox' ? ['Proxmox VE API', 'Infrastructure Hypervisor'] : ['Wazuh API', 'Centralized Logging Management'];
}


function formatMs(ms: number | null): string {
    if (ms === null) return "-";

    if (ms < 1000) return `${ms} ms`;

    return `${(ms / 1000).toFixed(2)} s`;
}


export default function UpstreamConnectionStatusCard( { upstreamStatus, service } : { upstreamStatus: UpstreamService, service: 'proxmox' | 'wazuh' }) {
    const formatedLastSync = formatDateTime(upstreamStatus.last_success);
    const formatedLastAttempt = formatDateTime(upstreamStatus.last_attempt);
    const [connection_service, description] = setTitleDescription(service);
    const formattedError = upstreamStatus.error ? upstreamStatus.error.length > 55 ? upstreamStatus.error.slice(0, 55) + '...' : upstreamStatus.error : '-';

    return (
        <div className="flex flex-col w-full h-fit gap-8 p-8 bg-primary-BACK rounded-lg">
            <div className="w-full flex justify-between">
                <div className="w-full flex flex-col">
                    <span className="text-[20px] text-graph-TITLE font-space font-bold">{connection_service}</span>
                    <span className="text-[11px] text-t1 font-inter uppercase"> {description} </span>
                </div>
                <div>
                    <ConnectionStatusTag value={upstreamStatus.reachable ? 1 : null} />
                </div>
            </div>
            <div className="flex flex-col gap-4 ">
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> Last Sync </span>
                    <span className="font-mono text-graph-TITLE font-normal text-xs"> {formatedLastSync} </span>
                </div>
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> Last Attempt </span>
                    <span className="font-mono text-t3 font-normal text-xs"> {formatedLastAttempt} </span>
                </div>
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> Response Time </span>
                    <span className="font-mono text-t3 font-normal text-xs"> {formatMs(upstreamStatus.response_ms)} </span>
                </div>
                <div className="w-full flex justify-between border-b-[1px] border-t2/10 py-2">
                    <span className="font-inter text-t1 font-normal text-xs"> Error </span>
                    <span className="font-mono text-t3 font-normal text-xs"> {formattedError} </span>
                </div>
            </div>
        </div>
    )
}