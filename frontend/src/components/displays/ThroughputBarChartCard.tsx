import { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Rectangle} from 'recharts';
import type { ThroughputDataPoint } from '../../types';

export default function ThroughputBarChartCard({ networkData, diskData }: { networkData: ThroughputDataPoint[], diskData: ThroughputDataPoint[] }) {
    const [activeTab, setActiveTab] = useState<'Network' | 'Disk'>('Network');
    const currentData = activeTab == 'Network' ? networkData : diskData;
    const maxValue = Math.max(...currentData.map(d => d.value)) || 1;
    
    // TODO: Temporary data, replace with real data
    const changeRate = Math.round((Math.random() * 20 - 10) * 100) / 100; // Random change rate between -10% and +10%
    const networkDataGbps = Math.round((Math.random() * 10) * 100) / 100; // Random network throughput between 0 and 10 Gbps
    const diskDataMbps = Math.round((Math.random() * 500 - 250) * 100) / 100; // Random change rate between -250 and +250

    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg p-6 gap-8'>
            {/* HEADER */}
            <div className='w-full flex justify-between items-start'>
                <div className='flex flex-col gap-1'>
                    <h2 className='text-[11px] text-graph-TITLE font-inter font-semibold uppercase'>aggregate throughput</h2>
                    <span className='text-[24px] text-t1 font-space fond-bold'>{activeTab === 'Network' ? `${networkDataGbps} Gbps` : `${diskDataMbps} MB/s`}</span>
                    {/* SOURCE SELECTION BUTTON */}
                    <div className="flex justify-between bg-primary-BACK rounded-lg gap-1">
                        <button onClick={() => setActiveTab('Network')} className={`w-[80px] text-[12px] text-t1 font-inter font-bold px-3 py-2 rounded-md ${activeTab === 'Network' ? 'bg-t2 text-t3' : 'hover:bg-t2/30 hover:text-t3'}`}>Network</button>
                        <button onClick={() => setActiveTab('Disk')} className={`w-[80px] text-[12px] text-t1 font-inter font-bold px-3 py-2 rounded-md ${activeTab === 'Disk' ? 'bg-t2 text-t3' : 'hover:bg-t2/30 hover:text-t3'}`}>Disk</button>
                    </div>
                </div>
                <span className='text-[12px] text-[#00FFD9] font-inter font-semibold'>{changeRate} vs last hour</span>
            </div>
            {/* CHART BODY */}
            <div className="w-full h-24 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                        <Bar
                            dataKey="value"
                            shape={(prop: any) => {
                                const { value } = prop;

                                const alphaRatio = value / maxValue;
                                const opacity = Math.max(0.15, alphaRatio * 0.85);

                                return (
                                    <Rectangle
                                    {...prop}
                                    fill={`rgba(127, 156, 245, ${opacity})`}
                                    />
                                );
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}