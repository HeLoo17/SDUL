import { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Rectangle, Tooltip, XAxis} from 'recharts';
import type { TimeSlice } from '../../types';

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB/s`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB/s`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB/s`;
  return `${bytes.toFixed(0)} B/s`;
}

function changeDataDisplay(currentData: string, data: number): string {
    return currentData == 'network' ? formatBytes(data) : `${(data).toFixed(2)}%`;
}

// CustomTooltip to handle both units
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    
    const value = payload[0]?.value ?? 0;
    const isNetwork = payload[0]?.dataKey === 'network';
    
    return (
        <div className="bg-primary border border-t2/30 rounded-md px-3 py-2 text-[11px] font-inter shadow-xl">
            <p className="text-t1 mb-1">{label}</p>
            <p style={{ color: payload[0]?.fill ?? '#7F9CF5' }}>
                {isNetwork ? formatBytes(value) : `${value.toFixed(2)}% iowait`}
            </p>
        </div>
    );
}

interface Props {
    slices: TimeSlice[];
}


export default function ThroughputBarChartCard({ slices }: Props) {
    const [activeTab, setActiveTab] = useState<'Network' | 'Disk'>('Network');

    const currentData = activeTab == 'Network' ? 'network' : 'disk';
    const latest = slices[slices.length - 1]?.[currentData] ?? 0;

    // MaxValue floor — use a small floor for disk so bars are visible
    const maxValue = currentData === 'network'
        ? Math.max(...slices.map((s: any) => s[currentData]), 1)
        : Math.max(...slices.map((s: any) => s[currentData]), 0.0001);

    // Show every N-th label on chart axis
    const labelStep = Math.max(1, Math.floor(slices.length / 6));
    

    // Rate-change header label
    let changeLabel = '-';
    if (slices.length >= 2) {
        const prev = slices[slices.length - 2][currentData];
        const diff = latest - prev;
        const sign = diff >= 0 ? '+' : '';
        
        if (currentData === 'network') {
            changeLabel = prev > 0
                ? `${sign}${((diff / prev) * 100).toFixed(1)}% vs prev`
                : `${sign}${formatBytes(Math.abs(diff))}`;
        } else {
            // disk iowait — show absolute change in % points
            changeLabel = `${sign}${diff.toFixed(2)}pp vs prev`;
        }
    }

    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg p-6 gap-8'>
            
            {/* HEADER */}
            <div className='w-full flex justify-between items-start'>
                <div className='flex flex-col gap-1'>
                    <h2 className='text-[11px] text-graph-TITLE font-inter font-semibold uppercase'>aggregate throughput</h2>
                    <span className='text-[24px] text-t1 font-space fond-bold'>{changeDataDisplay(currentData, latest)}</span>
                    
                    {/* SOURCE SELECTION BUTTON */}
                    <div className="flex justify-between bg-primary-BACK rounded-lg gap-1">
                        <button onClick={() => setActiveTab('Network')} className={`w-[80px] text-[12px] text-t1 font-inter font-bold px-3 py-2 rounded-md ${activeTab === 'Network' ? 'bg-t2 text-t3' : 'hover:bg-t2/30 hover:text-t3'}`}>Network</button>
                        <button onClick={() => setActiveTab('Disk')} className={`w-[80px] text-[12px] text-t1 font-inter font-bold px-3 py-2 rounded-md ${activeTab === 'Disk' ? 'bg-t2 text-t3' : 'hover:bg-t2/30 hover:text-t3'}`}>Disk</button>
                    </div>
                </div>
                <span className='text-[12px] text-[#00FFD9] font-inter font-semibold'>{changeLabel}</span>
            </div>

            {/* CHART BODY */}
            {slices.length === 0 ? (
                /* Waiting for first data push */
                <div className="w-full h-24 flex items-center justify-center">
                <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                    awaiting data…
                </span>
                </div>
            ) : (
                <div className="w-full h-24">
                <ResponsiveContainer width="100%" height={100}>
                    <BarChart
                    data={slices}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    barCategoryGap="20%"
                    >
                    <XAxis
                        dataKey="time"
                        tick={{ fill: '#414755', fontSize: 9, fontFamily: 'Inter' }}
                        axisLine={false}
                        tickLine={false}
                        interval={labelStep - 1}
                    />
        
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
        
                    <Bar
                        key={currentData}
                        dataKey={currentData}
                        shape={(prop: any) => {
                        const ratio   = prop.value / maxValue;
                        const opacity = Math.max(0.15, ratio * 0.85);
                        return (
                            <Rectangle
                            {...prop}
                            fill={`rgba(127, 156, 245, ${opacity})`}
                            radius={[2, 2, 0, 0]}
                            />
                        );
                        }}
                    />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
