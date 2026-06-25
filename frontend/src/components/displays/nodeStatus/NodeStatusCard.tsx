import RadialUsageChart from "./RadialUsageChart";
import type { Node } from '../../../types';


export default function NodeStatusCard({ nodeName, status, cpuUsage, memoryUsage, diskUsage, ipAddress }: Omit<Node, 'id'>) {    
    const backgroundColor = status ? 'bg-primary-BACK' : 'bg-primary-BACK opacity-40';
    const ipAddressDisplay = status ? ipAddress : 'DISCONNECTED';
    
    // Trim node name for better dispaly
    const trimmedNodeName = nodeName.slice(14);

    return (
        <div className={`h-fit w-full p-8 rounded-xl ${backgroundColor} flex flex-col gap-6 items-center justify-center transition-opacity`}>
            {/* CIRCLE CHART CONTAINER */}
            <div className="w-full h-fit flex items-center justify-center">
                <RadialUsageChart status={status} cpuUsage={cpuUsage} memoryUsage={memoryUsage} diskUsage={diskUsage} />
            </div>
            {/* INFO */}
            <div className="flex flex-col items-center justify-center">
                <span className="text-[18px] font-inter font-bold text-graph-TITLE text-center">{trimmedNodeName}</span>
                <span className="text-[10px] font-inter font-semiBold text-t1">{ipAddressDisplay}</span>
            </div>
        </div>
    )
}