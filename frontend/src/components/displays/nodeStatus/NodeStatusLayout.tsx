import NodeStatusCard from "./NodeStatusCard";
import type { Node, FilterRadialChartState } from "../../../types";
import { useState } from "react";
import { FILTER_OPTIONS } from "../../../constants";

export default function NodeStatusLayout({ nodes }: { nodes: Node[] }) {
    const [activeFilter, setActiveFilter] = useState<FilterRadialChartState>('All');

    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter(node => node.status).length;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                            <div className="flex flex-col justify-start gap-2">
                                {/* TITLE */}
                                <h2 className="text-[20px] text-graph-TITLE font-space font-bold">Node Status</h2>
                                {/* ACTIVE REFRESH STATUS */}
                                <div className="flex gap-1 items-center">
                                    <svg width="20" height="20" style={{ filter: "drop-shadow(0px 0px 2px #00FF9D)" }}>
                                        <circle cx="10" cy="10" r="4" fill="#00FF9D" />
                                    </svg>
                                    <div className="h-full w-full items-center justify-center flex gap-1">
                                        <span className="text-[11px] text-t1 font-inter font-semiBold uppercase">live refresh:</span>
                                        {/* TODO: Implement live refresh functionality */}
                                        <span className="text-[11px] text-t1 font-inter font-semiBold uppercase">active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end items-end">
                                {/* NODES FILTER BY STATUS */}
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
                        <div className="w-full flex justify-between items-center">
                            {/* SHOW TOTAL NODES ONLINE */}
                            <div>
                               <span className="text-[30px] font-inter text-graph-TITLE">{onlineNodes}</span>
                               <span className="text-[15px] font-inter text-graph-TITLE">/{totalNodes}</span>
                               <span className="text-[15px] font-inter text-t3"> Online</span>
                            </div>
            
                            {/* CHART LEGEND */}
                            <div className="flex justify-between gap-6">
                                <div className="flex gap-2 items-center">
                                    <span className="font-inter text-[#3C90FF] text-[10px]">CPU</span>
                                    <div className="h-1 w-10 bg-[#3C90FF] rounded-full" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="font-inter text-[#00FFCC] text-[10px]">Memory</span>
                                    <div className="h-1 w-10 bg-[#00FFCC] rounded-full" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="font-inter text-[#B166FF] text-[10px]">Disk</span>
                                    <div className="h-1 w-10 bg-[#B166FF] rounded-full" />
                                </div>
                            </div>
                        </div>
            
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {/* MAP NODES */}
                            {nodes.filter(node => {
                                if (activeFilter === 'Online') return node.status === true;
                                if (activeFilter === 'Offline') return node.status === false;
                                return true;
                            }).map((node) => (
                                <NodeStatusCard key={node.id} nodeName={node.nodeName} status={node.status} cpuUsage={node.cpuUsage} memoryUsage={node.memoryUsage} diskUsage={node.diskUsage} ipAddress={node.ipAddress} />
                            ))}
                        </div>
        </div>
    )
}