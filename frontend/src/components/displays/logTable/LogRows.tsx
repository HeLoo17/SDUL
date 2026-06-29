import type { WazuhLog } from "../../../types";
 
const LEVEL_COLORS: Record<string, string> = {
    info:    "#A6B6D5",
    warning: "#FE651E",
    error:   "#93000A",
    debug:   "#414755",
};

// Supporting components
function LevelTag({ level }: { level: string }) {
    const color = LEVEL_COLORS[level] ?? LEVEL_COLORS.info;
    return (
        <div
            className="h-fit w-16 px-2 py-1 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: color }}
        >
            <span className="text-[10px] text-white font-inter font-semibold uppercase">
                {level}
            </span>
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
    return (
        <div className="h-full w-full flex flex-col gap-8">
            <div
                key={i}
                className={`grid grid-cols-[100px_160px_160px_1fr] items-center gap-4 px-8 py-4
                            ${i % 2 === 0 ? "bg-[#262A34]/50" : "bg-[#262A34]/80"}`}
            >
                <LevelTag level={log.level} />
                <span className="text-[10px] text-graph-LEGEND font-inter font-semibold uppercase truncate">
                    {log.tag.replace("wazuh-", "")}
                </span>
                <span className="text-[10px] text-graph-LEGEND font-inter">
                    {formatTimestamp(log.timestamp)}
                </span>
                <span className="text-[10px] text-graph-LEGEND font-inter">
                    {log.description}
                </span>
            </div>
        </div>
    )
}