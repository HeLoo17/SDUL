import { formatUptime, type VM } from "../../../types";
import VWMResourcesRing from "./VMResourcesRing";

export default function VMStatusCard({ vmid, vmName, status, cpuUsage, memoryUsage, diskUsage, uptime, node }: Omit<VM, 'id'>) {
    const backgroundColor = status == 'running' ? 'bg-primary-BACK' : 'bg-primary-BACK opacity-40';
    const vmUptime = status == 'running' ? formatUptime(uptime) : '-';

    return (
        <div className={`h-fit w-full p-8 rounded-xl ${backgroundColor} flex gap-3 items-center justify-center transition-opacity`}>
            {/* RESOURCES CHART CONTAINER */}
            <div className="flex-[3] h-fit flex items-center justify-center">
                <VWMResourcesRing cpu={cpuUsage} memory={memoryUsage} disk={diskUsage} />
            </div>
            <div className="flex-[5] flex flex-col items-start gap-1 ">
                <span className="text-[18px] font-inter font-bold text-graph-TITLE text-center">{vmid}</span>
                <span className="text-[10px] font-inter font-semiBold text-t1">{vmName}</span>
                <span className="text-[10px] font-inter font-semiBold text-t1">{vmUptime}</span>
                <span className="text-[10px] font-inter font-semiBold text-t1">{node}</span>
            </div>
        </div>
    )
}