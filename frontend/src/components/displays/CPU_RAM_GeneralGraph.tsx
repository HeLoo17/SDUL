import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Values are derived by Dashboard from useSocket()
interface CPU_RAM_GeneralGraphProps {
    historyData: any[];
    cpuUsage: number;
    memoryUsage: number;
    timestamp: string | null;
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

export default function CPU_RAM_GeneralGraph({historyData }: CPU_RAM_GeneralGraphProps) {
    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg p-8 gap-8'>
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div >
                    <h2 className="text-[20px] text-graph-TITLE font-space font-bold">System Telemetry</h2>
                    <p className="text-[14px] text-t2 font-inter font-regular">Real-time CPU and Memory utilization</p>
                </div>
                <CustomLegend />
            </div>

            {historyData.length === 0 ? (
                <div className="w-full h-[220px] flex items-center justify-center">
                    <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                        awaiting data...
                    </span>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#4147551A" />

                        <XAxis
                            dataKey="time"
                            tick={{ fill: "#8B90A1", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            interval={historyData.length > 6 ? Math.floor(historyData.length / 6) : 0}
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
                            labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                            formatter={(value, name) => [
                            `${Number(value).toFixed(2)}%`,
                            name === "cpu" ? "CPU" : "Memory",
                            ] as [string, string]}
                        />

                        {/* CPU Line */}
                        <Line type="monotone" dataKey="cpu" stroke="#A9C7FF" strokeWidth={2} dot={false} />
                        {/* RAM Line */}
                        <Line type="monotone" dataKey="memory" stroke="#B7C7E7" strokeDasharray="6 4"strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
