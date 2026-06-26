import { formatUptime, type VM } from "../../../types";
import VWMResourcesRing from "./VMResourcesRing";
import VMPaused from "../../../assets/icons/vm_paused.svg?react";

export default function VMStatusCard({ vmid, vmName, status, cpuUsage, memoryUsage, diskUsage, uptime, node, template, tags }: Omit<VM, 'id'>) {
    const backgroundColor = template ? 'bg-primary-BACK' : status == 'running' ? 'bg-primary-BACK' : status == 'paused' ? 'bg-primary-BACK opacity-60' : 'bg-primary-BACK opacity-40';
    const vmUptime = status == 'running' ? formatUptime(uptime) : '-';
    const formattedVmName = vmName.length > 8 ? vmName.slice(0, 8) + '...' : vmName;
    const trimmedNodeName = node.slice(14); 

    return (
        <div className={`h-fit w-full px-8 py-6 rounded-xl ${backgroundColor} flex gap-3 items-center justify-center transition-opacity ${template ? 'ring-[#4a3a18] ring-4 ring-inset' : 'border-transparent'}`}>
            {/* RESOURCES CHART CONTAINER */}
            <div className="flex-[3] h-fit flex items-center justify-center">
                <VWMResourcesRing tags={tags} template={template} status={status} cpu={cpuUsage} memory={memoryUsage} disk={diskUsage} />
            </div>
            <div className="flex-[4] flex flex-col items-start gap-1 ">
                <div className="w-full flex gap-1 items-baseline justify-between">
                    <span className="text-[18px] font-inter font-bold text-graph-TITLE text-center">{vmid}</span>
                    {status === 'paused' && <VMPaused className="h-4 w-4 text-t3" />}
                </div>
                <span className="text-[12px] font-inter font-black text-t1">{`${formattedVmName}`}</span>
                <span className="text-[10px] font-inter font-normal text-t1">{trimmedNodeName}</span>
                <span className="text-[8px] font-inter font-light text-t1 opacity-50">{vmUptime}</span>
            </div>
        </div>
    )
}