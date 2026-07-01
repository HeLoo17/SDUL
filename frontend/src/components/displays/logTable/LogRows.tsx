import type { WazuhLog } from "../../../types";
 
const LEVEL_COLORS: Record<string, [string, string]> = {
        debug: ['#B74ADE', '#271E2A'],
        error: ['#FC5844', '#2D1414'],
        info:  ['#C1C6D7', '#31353F'],
        warning: ['#FFD5AB', '#4E3D2C']
    };

// Supporting components
function LevelTag({ level }: { level: string }) {
    const [textColor, bgColor] = LEVEL_COLORS[level] || ['#FFFFFF', '#31353F'];
    return (
        <div className="w-fit flex items-center justify-center px-3 py-1 rounded-full gap-2" style={{ backgroundColor: bgColor, borderWidth: "1px", borderColor: textColor, borderStyle: "solid" }}>
            <div style={{ backgroundColor: textColor}} className="h-1 w-1 rounded-full" />
            <span className="text-[10px] font-inter font-bold capitalize items-center" style={{ color: textColor}}>{level}</span>
        </div>
    );
}


function formatTimestamp(ts: string): string {
    if (!ts) return "—";
    try {
        const d = new Date(ts);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
             + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
        return ts;
    }
}

export default function LogRows({i, log}: {i: number, log: WazuhLog}) {
    const formattedDescription = log.description.length > 68 ? log.description.slice(0, 67) + '...' : log.description;


    return (
        <div
            key={i}
            className={`grid grid-cols-[1fr_1fr_1fr_1fr_1fr_3fr] items-center gap-4 px-8 py-4
                        ${i % 2 === 0 ? "bg-[#262A34]/50" : "bg-[#262A34]/80"}`}
        >
            {/* TIMESTAMP */}
            <span className="text-[10px] text-graph-LEGEND font-mono">
                {formatTimestamp(log.timestamp)}
            </span>
            {/* HOST - DEFAULT WAZUH-MANAGER */}
            <span className="text-[10px] text-graph-LEGEND font-inter">
                {log.host ? log.host: "wazuh-manager"}
            </span>
            {/* SEVERITY LEVEL */}
            <LevelTag level={log.level} />
            <span className="text-[10px] text-graph-LEGEND font-inter font-semibold uppercase truncate">
                {log.tag.replace("wazuh-", "")}
            </span>
            {/* IP ADDRESS */}
            <span className="text-[10px] text-graph-LEGEND font-inter">
                {log.src_ip ? log.src_ip: "172.29.0.100"}
            </span>
            {/* LOG DESCRIPTION */}
            <span className="text-[10px] text-graph-LEGEND font-mono">
                {formattedDescription}
            </span>
        </div>
    )
}