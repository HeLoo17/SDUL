import type { VM } from "../../../types";
import VmDetailedRecords from "./VmDetailedRecords";
import { useState } from "react";
import FilterDropdown from "../../buttons/DropBox";

export default function VmDetailedTable({ vms }: { vms: VM[]}) {
    const [activeFilter, setActiveFilter] = useState('All');
    const filterOptions = ['All', 'Running', 'Stopped', 'Error'];
    
    const filteredVms = vms.filter(vm => {
        if (activeFilter === 'Error') return vm.status === 'error';
        if (activeFilter === 'Running') return vm.status === 'running';
        if (activeFilter === 'Stopped') return vm.status === 'stopped';
        return true;
    });

    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg'>
            {/* HEADERS */}
            <div className="flex justify-between items-end px-8 py-6">
                <h2 className="text-[20px] text-graph-TITLE font-space font-bold">Virtual Machines</h2>
                {/* FILTER DROPBOX */}
                <FilterDropdown 
                    activeFilter={activeFilter} 
                    onFilterChange={setActiveFilter} 
                    options={filterOptions} 
                    bgColor="bg-primary-BACK"
                    textColor="text-graph-TITLE"
                />
            </div>
            {/* COLUMN HEADERS */}
            <div className="grid grid-cols-[1fr_2fr_1fr_2fr_1fr_1fr_1fr] items-center gap-4 bg-[#262A34]/80 px-8 py-4">
               <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">vm id</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">vm name </span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">status</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">assigned node</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">cpu%</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">memory%</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">uptime</span>
            </div> 
            {/* LOG RECORDS */}
            {filteredVms.map((vm) => (
                    <VmDetailedRecords key={vm.id} vm={vm} />
                ))}
            <div className="h-4" />
        </div>
    )
}