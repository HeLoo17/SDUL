import { formatUptime, type VM } from "../../../types";
import StatusTag from "./StatusTag";
import VMMetricsBar from "./VMMetricsBar";

export default function VmDetailedRecords({ vm }: { vm:VM }) {
    const vmUptime = vm.status === 'running' || vm.status === 'paused' ? formatUptime(vm.uptime) : '-';
    const formattedVmName = vm.vmName.length > 25 ? vm.vmName.slice(0, 25   ) + '...' : vm.vmName;
    const trimmedNodeName = vm.node.slice(14);
    const formattedStatus = vm.status == 'running' || vm.status === 'paused' ? true : false;
    const bgColor = vm.id%2 === 0 ? 'bg-[#262A34]/80' : 'bg-[#262A34]/50';

    return (
        <div className={`grid grid-cols-[1fr_3fr_2fr_2fr_2fr_2fr_2fr] items-center gap-4 ${bgColor} px-8 py-4`}>
            {/* VMID */}
            <span className="text-[10px] text-t3 font-inter font-semiBold uppercase">{vm.vmid}</span>
            {/* VM NAME */}
            <span className="text-[12px] text-graph-LEGEND font-inter font-semiBold capitalize  ">{formattedVmName}</span>
            {/* STATUS TAG */}
            <StatusTag status={vm.status} />
            {/* ASSIGNED NODE */}
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{trimmedNodeName}</span>
            {/* CPU BAR */}
            <VMMetricsBar status={formattedStatus} percentage={vm.cpuUsage} type="cpu"/>
            {/* MEMORY BAR */}
            <VMMetricsBar status={formattedStatus} percentage={vm.memoryUsage} type="memory"/>
            {/* UPTIME */}
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold">{vmUptime}</span>
        </div> 
    )
}