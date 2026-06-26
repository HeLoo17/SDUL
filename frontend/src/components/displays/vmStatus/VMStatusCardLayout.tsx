import type { VM, vmDisplayFilterStatus } from "../../../types";
import VMStatusCard from "./VMStatusCard";
import { useEffect, useMemo, useRef, useState } from "react";
import { VM_FILTER_OPTIONS } from "../../../constants";

export default function VMStatusCardLayout({ vms }: { vms: VM[] }) {
    const [activeFilter, setActiveFilter] = useState<vmDisplayFilterStatus>('All');
    
    const [activeTag, setActiveTag] = useState<string>('All');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    const filteredVMs = vms.filter(vm => {
        const statusMatch = (() => {
            if (activeFilter === 'Running') return vm.status === 'running';
            if (activeFilter === 'Paused') return vm.status === 'paused';
            if (activeFilter === 'Stopped') return vm.status === 'stopped';
            if (activeFilter === 'Error') return vm.status === 'error';
            return true
        })();

        const tagMatch = activeTag === 'All' || vm.tags?.includes(activeTag);
 
        return statusMatch && tagMatch;
    });


    const tagOptions = useMemo(() => {
        const tags = new Set<string>();
        vms.forEach(vm => vm.tags?.forEach(tag => tags.add(tag)));
        return ['All', ...Array.from(tags).sort()];
    }, [vms]);

    useEffect(() => {
        if (!tagOptions.includes(activeTag)) {
            setActiveTag('All');
        }
    }, [tagOptions, activeTag]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-baseline pb-6">
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


                <div className="flex gap-4">
                     {/* ACTIVE TAG BADGE */}
                    {activeTag !== 'All' && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-t2/20 border border-t2/30">
                            <span className="text-[11px] text-t3 font-inter font-semibold">{activeTag}</span>
                            <button
                                onClick={() => setActiveTag('All')}
                                className="text-t1 hover:text-t3 leading-none"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div ref={dropdownRef} className="relative inline-block w-[140px]">
                        {/* DROPDOWN TRIGGER BUTTON */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center justify-between w-full bg-primary-BACK text-t1 text-[12px] font-inter font-bold px-4 py-3 rounded-md hover:bg-t2/20 transition-colors"
                        >
                            <span>{activeFilter}</span>
                            {/* Minimal SVG Chevron Arrow */}
                            <svg 
                                className={`w-3 h-3 text-t1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth="3"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {/* DROPDOWN MENU LIST */}
                        {isOpen && (
                            <div className="absolute left-0 right-0 mt-1 bg-primary-BACK border border-t2/10 rounded-lg p-1 flex flex-col gap-1 z-50 shadow-xl">
                                {tagOptions.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setActiveTag(tag);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left text-[12px] text-t1 font-inter font-bold px-4 py-2 rounded-md transition-colors
                                            ${activeFilter === tag
                                                ? 'bg-t2 text-t3'
                                                : 'hover:bg-t2/30 hover:text-t3'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
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