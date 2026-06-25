import type { VM, vmDisplayFilterStatus } from "../../../types";
import VMStatusCard from "./VMStatusCard";
import { useState } from "react";
import { FILTER_OPTIONS } from "../../../constants";

export default function VMStatusCardLayout({ vms }: { vms: VM[] }) {
    const [activeFilter, setActiveFilter] = useState<vmDisplayFilterStatus>('All');
    

    return (
        <div>
            <div className="flex justify-between items-baseline pb-6">
                <div className="flex justify-end items-baseline">
                    {/* VMS FILTER BY STATUS */}
                    <div className="flex justify-between bg-primary-BACK rounded-lg p-1 gap-1">
                        {FILTER_OPTIONS.map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`w-[70px] text-[12px] text-t1 font-inter font-bold px-4 py-2 rounded-md
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
            
            <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {vms.filter(vm => {
                    if (activeFilter === 'Online') return vm.status === 'running';
                    if (activeFilter === 'Offline') return vm.status === 'error' || vm.status === 'stopped';
                    return true;
                }).map((vm) => (
                    <VMStatusCard key={vm.id} {...vm} />
                ))}
            </div>
        </div>
    );
}