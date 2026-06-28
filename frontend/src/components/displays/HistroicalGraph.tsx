// displays/HistoricalGraph.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { type HistoricalPoint, type TimeRange } from "../../hooks/useHistoricalData";


interface HistoricalGraphProps {
    data: HistoricalPoint[];
    loading: boolean;
    error: string | null;
    range: TimeRange;
}


function formatTick(isoTime: string, range: TimeRange): string {
    const d = new Date(isoTime);
    if (range === "24h") {
        return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

const CustomLegend = () => (
    <div className="flex gap-4 items-center">

        {/* CPU */}
        <div className="flex gap-2 items-center">
            <svg width="20" height="20" style={{ filter: "drop-shadow(0px 0px 2px #A9C7FF)" }}>
                <circle cx="10" cy="10" r="4" fill="#A9C7FF" />
            </svg>
            <span className="text-[12px] text-graph-LEGEND font-inter font-regular uppercase">CPU Usage</span>
        </div>

        {/* MEMORY */}
        <div className="flex gap-2 items-center">
            <svg
                width="24" height="12"
                overflow="visible"
                style={{ filter: "drop-shadow(0px 0px 2px #B7C7E7)" }}
            >
                <line
                    x1="0" y1="6" x2="24" y2="6"
                    stroke="#B7C7E7"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    strokeLinecap="round"
                />
            </svg>
            <span className="text-[12px] text-graph-LEGEND font-inter font-regular uppercase">Memory Usage</span>
        </div>

    </div>
);

export default function HistoricalGraph({data, loading, error, range }: HistoricalGraphProps) {

    const tickInterval = data.length > 12 ? Math.floor(data.length / 12) : 0;

    return (
        <div className="w-full flex flex-col bg-primary-BACK rounded-lg p-8 gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[20px] text-graph-TITLE font-space font-bold">
                        Historical Telemetry
                    </h2>
                    <p className="text-[14px] text-t2 font-inter">
                        CPU and Memory over time
                    </p>
                </div>
                <CustomLegend />
            </div>

            {loading && (
                <div className="w-full h-[220px] flex items-center justify-center">
                    <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                        loading…
                    </span>
                </div>
            )}

            {error && (
                <div className="w-full h-[220px] flex items-center justify-center">
                    <span className="text-[11px] text-warning font-inter">{error}</span>
                </div>
            )}

            {!loading && !error && data.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#4147551A" />
                        <XAxis
                            dataKey="time"
                            tickFormatter={t => formatTick(t, range)}
                            tick={{ fill: "#8B90A1", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            interval={tickInterval}
                        />
                        <YAxis
                            domain={[0, 100]}
                            ticks={[25, 50, 75, 100]}
                            tick={{ fill: "#8B90A1", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "#0f1117",
                                border: "1px solid #2d3148",
                                borderRadius: 8,
                                fontSize: 12,
                                color: "#e2e8f0",
                            }}
                            labelFormatter={t => formatTick(t, range)}
                            formatter={(v, name) => [
                                `${Number(v).toFixed(1)}%`,
                                name === "cpu" ? "CPU" : "Memory",
                            ]}
                        />
                        <Line type="monotone" dataKey="cpu"    stroke="#A9C7FF" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="memory" stroke="#B7C7E7" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}