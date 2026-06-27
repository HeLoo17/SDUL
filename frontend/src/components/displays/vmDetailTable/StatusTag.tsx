import type {vmStatus} from "../../../types";

export default function StatusTag({ status }: {status: vmStatus}) {
    const statusColors: Record<vmStatus, [string, string]> = {
        running: ['#4ADE80', '#1E2A24'],
        error: ['#FFB4AB', '#2D1414'],
        stopped:  ['#C1C6D7', '#31353F'],
        paused: ['#FFD5AB', '#4E3D2C']
    };

    const [textColor, bgColor] = statusColors[status] || ['#FFFFFF', '#31353F'];

    return (
        <div className="w-fit flex items-center justify-center px-3 py-1 rounded-full gap-2" style={{ backgroundColor: bgColor, borderWidth: "1px", borderColor: textColor, borderStyle: "solid" }}>
            <div style={{ backgroundColor: textColor}} className="h-1 w-1 rounded-full" />
            <span className="text-[10px] font-inter font-bold capitalize items-center" style={{ color: textColor}}>{status}</span>
        </div>
    )
}
    