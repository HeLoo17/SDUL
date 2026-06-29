import { Pie, PieChart, ResponsiveContainer } from "recharts";

import navi from "../../../assets/icons";
import type { vmStatus } from "../../../types";

interface VMREsourcesProps {
    tags?: string[];
    template: boolean;
    status: vmStatus,
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


function IconMapping(tags?: string[]) {
    const tagsToIcon = [
        { tag: 'network-learning', icon: navi.network},
        { tag: 'main-infra', icon: navi.infra},
    ]

    const matchedTag = tags 
        ? tagsToIcon.find(item => tags.includes(item.tag))
        : null;

    const selectIcon = tags ? matchedTag ? matchedTag.icon : navi.vm: navi.vm;

    return selectIcon;
}


export default function VWMResourcesRing({ tags, template, status, cpu, memory, disk, size = 60 }: VMREsourcesProps) {

    const INNER = 3*size/8;
    const OUTER = size/2;

    const data = status ? { cpu: clamp(cpu), memory: clamp(memory), disk: clamp(disk) } : { cpu: 0, memory: 0, disk: 0 };

    const CenterIcon =  template ? navi.template : (status === "running" || status === "paused") ? IconMapping(tags) : (status === "error") ? navi.errorVm : navi.offlineIcon;
    const icon_color = (status === "error") ? 'text-[#d63636]' : 'text-t1';

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
                <CenterIcon className={`h-6 w-6 ${icon_color}`} />
            </div>
        </div>
    );
}