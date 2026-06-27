import type { VM } from "../../../types";
import VmDetailedRecords from "./VmDetailedRecords";

export default function VmDetailedTable({ vms }: { vms: VM[]}) {
    const lowerBoarderBg = vms.length%2 === 0 ? 'bg-[#262A34]/80' : 'bg-[#262A34]/50';

    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg'>
            {/* COLUMN HEADERS */}
            <div className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr_2fr_2fr] items-center gap-4 px-8 py-4">
               <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">vm id</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">vm name </span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">status</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">assigned node</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">cpu%</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">memory%</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">uptime</span>
            </div> 
            {/* LOG RECORDS */}
            {vms.map((vm) => (
                    <VmDetailedRecords key={vm.id} vm={vm} />
                ))}
            <div className={`h-2 ${lowerBoarderBg} rounded-b-lg`} />
        </div>
    )
}