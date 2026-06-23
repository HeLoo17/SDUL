import { Pie, PieChart, ResponsiveContainer } from "recharts";

import NodeIcon from '../../../assets/icons/nodes.svg?react';

interface VMREsourcesProps {
    cpu: number;
    memory: number;
    disk: number;
    size?: number;
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

// Each sector = 120°
const CPU_START = 90;
const RAM_START = -30;
const DISK_START = -150;

export default function VWMResourcesRing({
    cpu,
    memory,
    disk,
    size = 80
}: VMREsourcesProps) {

    const INNER = 30;
    const OUTER = 40;

    const CPU = clamp(cpu);
    const RAM = clamp(memory);
    const DISK = clamp(disk);

    return (
        <div className="relative w-full" style={{ height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                    {/* BACKGROUND RINGS */}
                    <Pie
                        data={[
                            { value: 1, fill: "#262A34" },
                            { value: 1, fill: "#262A34" },
                            { value: 1, fill: "#262A34" }
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={INNER}
                        outerRadius={OUTER}
                        stroke="none"
                        opacity={0.15}
                    />

                    {/* CPU */}
                    <Pie
                        data={[
                            { value: CPU, fill: "#60A5FA" },
                            { value: 100 - CPU, fill: "transparent" }
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={CPU_START}
                        endAngle={CPU_START - 120}
                        innerRadius={INNER}
                        outerRadius={OUTER}
                        stroke="none"
                        cornerRadius={8}
                    />

                    {/* RAM */}
                    <Pie
                        data={[
                            { value: RAM, fill: "#FDBA74" },
                            { value: 100 - RAM, fill: "transparent" }
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={RAM_START}
                        endAngle={RAM_START - 120}
                        innerRadius={INNER}
                        outerRadius={OUTER}
                        stroke="none"
                        cornerRadius={8}
                    />

                    {/* DISK */}
                    <Pie
                        data={[
                            { value: DISK, fill: "#C4D4FF" },
                            { value: 100 - DISK, fill: "transparent" }
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={DISK_START}
                        endAngle={DISK_START - 120}
                        innerRadius={INNER}
                        outerRadius={OUTER}
                        stroke="none"
                        cornerRadius={8}
                    />

                </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center">
                <NodeIcon className="h-6 w-6 text-t3" />
            </div>
        </div>
    );
}