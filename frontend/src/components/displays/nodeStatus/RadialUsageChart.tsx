import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import type { Node } from '../../../types';
import NodeIcon from '../../../assets/icons/nodes.svg?react';
import OfflineIcon from '../../../assets/icons/disconnected_node.svg?react';

// TODO: Status changes appearance -> gradient bar
export default function RadialUsageChart({ status, cpuUsage, memoryUsage, diskUsage }: Pick<Node, 'status' | 'cpuUsage' | 'memoryUsage' | 'diskUsage'>) {
    const data = [
    { name: 'CPU',    value: cpuUsage, fill: '#B166FF' },  
    { name: 'Memory', value: memoryUsage, fill: '#00FFCC' },  
    { name: 'Disk',   value: diskUsage, fill: '#3C90FF' },  
    ];

    const OnlineCard = () => (
        <div className='relative w-full h-[160px]'>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="40%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={13}>
                    {/* SET DOMAIN RANGE */}
                    <PolarAngleAxis 
                        type="number" 
                        domain={[0, 100]} 
                        angleAxisId={0} 
                        tick={false} 
                    />

                    <RadialBar
                        dataKey="value"
                        cornerRadius={8}
                        background={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                </RadialBarChart>
            </ResponsiveContainer>

             {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <NodeIcon className="h-6 w-6 text-t3" />
            </div>
        </div>
    );

    const OfflineCard = () => {
        const offlineData = [
        { name: 'CPU', value: 0, fill: 'transparent' },
        { name: 'Memory', value: 0, fill: 'transparent' },
        { name: 'Disk', value: 0, fill: 'transparent' },
    ];
    
        return (
            <div className='relative w-full h-[160px]'>
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="40%" outerRadius="100%" data={offlineData} startAngle={90} endAngle={-270} barSize={13}>
                        {/* SET DOMAIN RANGE */}
                        <PolarAngleAxis 
                            type="number" 
                            domain={[0, 100]} 
                            angleAxisId={0} 
                            tick={false} 
                        />

                        <RadialBar
                            dataKey="value"
                            cornerRadius={8}
                            background={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <OfflineIcon className="h-6 w-6 text-t3" />
                </div>
            </div>
        );
    };

    return (
        status ? <OnlineCard /> : <OfflineCard />
    )
}
