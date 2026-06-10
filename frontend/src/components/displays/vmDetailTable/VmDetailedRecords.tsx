import type { VM } from "../../../types";
import StatusTag from "./StatusTag";

export default function VmDetailedRecords({ vm }: { vm:VM }) {
    return (
        <div className="grid grid-cols-[1fr_2fr_1fr_2fr_1fr_1fr_1fr] items-center gap-4 bg-[#262A34]/80 px-8 py-4">
            <span className="text-[10px] text-t3 font-inter font-semiBold uppercase">{vm.id}</span>
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{vm.vmName}</span>
            {/* STATUS TAG */}
            <StatusTag status={vm.status} />

            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{vm.node}</span>
            {/* CPU AND MEMORY BAR */}
            
            
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{vm.uptime}</span>
        </div> 
    )
}