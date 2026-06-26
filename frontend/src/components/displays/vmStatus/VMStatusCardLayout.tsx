import type { VM, vmDisplayFilterStatus } from "../../../types";
import VMStatusCard from "./VMStatusCard";
import { useState } from "react";
import { VM_FILTER_OPTIONS } from "../../../constants";

export default function VMStatusCardLayout({ vms }: { vms: VM[] }) {
    const [activeFilter, setActiveFilter] = useState<vmDisplayFilterStatus>('All');
    
    const filteredVMs = vms.filter(vm => {
        if (activeFilter === 'Running') return vm.status === 'running';
        if (activeFilter === 'Paused') return vm.status === 'paused';
        if (activeFilter === 'Stopped') return vm.status === 'stopped';
        if (activeFilter === 'Error') return vm.status === 'error';
        return true;
    })

    return (
        <div>
            <div className="flex justify-between items-baseline pb-3">
                <div className="flex justify-end items-baseline">
                    {/* VMS FILTER BY STATUS */}
                    <div className="flex justify-between bg-primary-BACK rounded-lg p-1 gap-1">
                        {VM_FILTER_OPTIONS.map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`w-[80px] text-[12px] text-t1 font-inter font-bold px-4 py-2 rounded-md
                                    ${activeFilter === filter
                                        ? 'bg-t2 text-t3'
                                        : 'hover:bg-t2/30 hover:text-t3'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {/* CHART LEGEND */}
            <div className="flex justify-end pb-3">
                <div className="flex justify-between gap-6">
                    <div className="flex gap-2 items-center">
                        <span className="font-inter text-[#60A5FA] text-[10px]">CPU</span>
                        <div className="h-1 w-10 bg-[#60A5FA] rounded-full" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="font-inter text-[#FDBA74] text-[10px]">Memory</span>
                        <div className="h-1 w-10 bg-[#FDBA74] rounded-full" />
                    </div>
                </div>
            </div>
            
            {filteredVMs.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-6 rounded-xl border border-dashed border-t2/20 bg-primary-BACK/10">
                    <p className="text-[14px] font-inter text-t1 font-medium mb-2">
                        No Virtual Machines Found
                    </p>
                    <p className="text-[12px] font-inter text-t1/60">
                        There are currently no instances with a "{activeFilter}" status.
                    </p>
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredVMs.map((vm) => (
                        <VMStatusCard key={vm.id} {...vm} />
                    ))}
                </div>
            )}
        </div>
    );
}