import { useEffect, useRef, useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import type { Node } from '../../../types';
import NodeIcon from '../../../assets/icons/nodes.svg?react';
import OfflineIcon from '../../../assets/icons/disconnected_node.svg?react';

const LERP_SPEED = 0.08;

function lerp(current: number, target: number): number {
    if (Math.abs(target - current) < 0.05) return target;
    return current + (target - current) * LERP_SPEED;
}

function useSmoothedValues(cpuUsage: number, memoryUsage: number, diskUsage: number) {
    const [smoothed, setSmoothed] = useState({ cpu: cpuUsage, memory: memoryUsage, disk: diskUsage });
    const targetRef = useRef({ cpu: cpuUsage, memory: memoryUsage, disk: diskUsage });
    const rafRef = useRef<number | null>(null);

    targetRef.current = { cpu: cpuUsage, memory: memoryUsage, disk: diskUsage };

    useEffect(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

        const animate = () => {
            setSmoothed(prev => {
                const next = {
                    cpu:    lerp(prev.cpu,    targetRef.current.cpu),
                    memory: lerp(prev.memory, targetRef.current.memory),
                    disk:   lerp(prev.disk,   targetRef.current.disk),
                };

                const settled =
                    next.cpu    === targetRef.current.cpu &&
                    next.memory === targetRef.current.memory &&
                    next.disk   === targetRef.current.disk;

                rafRef.current = settled ? null : requestAnimationFrame(animate);
                return next;
            });
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [cpuUsage, memoryUsage, diskUsage]);

    return smoothed;
}

type Props = Pick<Node, 'status' | 'cpuUsage' | 'memoryUsage' | 'diskUsage'>;

export default function RadialUsageChart({ status, cpuUsage, memoryUsage, diskUsage }: Props) {
    const smoothed = useSmoothedValues(
        status ? cpuUsage    : 0,
        status ? memoryUsage : 0,
        status ? diskUsage   : 0,
    );

    const data = [
        { name: 'Disk',   value: smoothed.disk,   fill: '#B166FF' },
        { name: 'Memory', value: smoothed.memory, fill: '#00FFCC' },
        { name: 'CPU',    value: smoothed.cpu,    fill: '#3C90FF' },
    ];

    const offlineData = [
        { name: 'Disk',   value: 0, fill: 'transparent' },
        { name: 'Memory', value: 0, fill: 'transparent' },
        { name: 'CPU',    value: 0, fill: 'transparent' },
    ];

    const CenterIcon = status ? NodeIcon : OfflineIcon;

    return (
        <div className="relative w-full h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="40%"
                    outerRadius="100%"
                    data={status ? data : offlineData}
                    startAngle={90}
                    endAngle={-270}
                    barSize={13}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                        dataKey="value"
                        cornerRadius={8}
                        background={{ fill: 'rgba(255,255,255,0.05)' }}
                        isAnimationActive={false}
                    />
                </RadialBarChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center">
                <CenterIcon className="h-6 w-6 text-t3" />
            </div>
        </div>
    );
}