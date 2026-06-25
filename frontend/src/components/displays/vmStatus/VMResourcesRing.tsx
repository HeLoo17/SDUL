import { Pie, PieChart, ResponsiveContainer } from "recharts";

import VMIcon from '../../../assets/icons/vm.svg?react';
import OfflineIcon from '../../../assets/icons/disconnected_node.svg?react';

interface VMREsourcesProps {
    status: boolean,
    cpu: number;
    memory: number;
    disk: number;
    size?: number;
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

// Each sector = 120°
const CPU_START = 90;
const RAM_START = -90;
// const DISK_START = -150;


export default function VWMResourcesRing({ status, cpu, memory, disk, size = 60 }: VMREsourcesProps) {

    const INNER = 3*size/8;
    const OUTER = size/2;

    const data = status ? { cpu: clamp(cpu), memory: clamp(memory), disk: clamp(disk) } : { cpu: 0, memory: 0, disk: 0 }

    const CenterIcon =  status ? VMIcon : OfflineIcon;

    return (
        <div className="relative w-full" style={{ height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                    {/* BACKGROUND RINGS */}
                    <Pie
                        data={[
                            { value: 1, fill: "#262A34" },
                            { value: 1, fill: "#262A34" },
                            // { value: 1, fill: "#262A34" }
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
                            { value: data.cpu, fill: "#60A5FA" },
                            { value: 100 - data.cpu, fill: "transparent" }
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={CPU_START}
                        endAngle={CPU_START - 180}
                        innerRadius={INNER}
                        outerRadius={OUTER}
                        stroke="none"
                        cornerRadius={8}
                    />

                    {/* RAM */}
                    <Pie
                        data={[
                            { value: data.memory, fill: "#FDBA74" },
                            { value: 100 - data.memory, fill: "transparent" }
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        startAngle={RAM_START}
                        endAngle={RAM_START - 180}
                        innerRadius={INNER}
                        outerRadius={OUTER}
                        stroke="none"
                        cornerRadius={8}
                    />

                    {/* DISK */}
                    {/* <Pie
                        data={[
                            { value: data.disk, fill: "#C4D4FF" },
                            { value: 100 - data.disk, fill: "transparent" }
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
                    /> */}

                </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center">
                <CenterIcon className="h-6 w-6 text-t3" />
            </div>
        </div>
    );
}