import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { VMTypeData } from "../../hooks/useChartData";
import { useMemo, useState } from "react";


type Props = {
    data: VMTypeData[];
};

const COLORS = [
    "#3b82f6",
    "#2dd4bf",
    "#a855f7",
    "#f59e0b",
    "#ef4444",
    "#10b981",
    "#f97316",
    "#14b8a6",
];

export default function VMTagsChart({ data }: Props) {
    const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

    const emptyFrame: Record<string, number | string> = { time: "--:--:--" };

    const toggleKey = (key: string) => {
        setHiddenKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
        });
    };

    const vmKeys = useMemo(() => {
        const keys = new Set<string>();

        for (const item of data) {
            Object.keys(item).forEach((k) => {
            if (k !== "time") keys.add(k);
            });
        }
        keys.add("total");

        return Array.from(keys);
    }, [data]);

    const chartData = useMemo(() => {
        return data.map((item) => {
            let total = 0;

            for (const [key, value] of Object.entries(item)) {
            if (key !== "time" && typeof value === "number") {
                total += value;
            }
            }

            return {
            ...item,
            total,
            };
        });
    }, [data]);
        
    vmKeys.forEach((k) => {
        emptyFrame[k] = 0;
    });

    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg p-8 gap-8'>
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div >
                    <h2 className="text-[20px] text-graph-TITLE font-space font-bold">VM Distribution Timeline By Tags</h2>
                    <p className="text-[14px] text-t2 font-inter font-regular">Real-time Virtual Machine Online</p>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="w-full h-[220px] flex items-center justify-center">
                    <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                        awaiting data...
                    </span>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#4147551A" />

                    <XAxis 
                        dataKey="time" 
                    tick={{ fill: "#8B90A1", fontSize: 10 }} 
                        axisLine={false}
                        tickLine={false}
                        interval={chartData.length > 6 ? Math.floor(chartData.length / 6) : 0}
                        />
                    <YAxis 
                        stroke="#9ca3af" 
                        tick={{ fill: "#8B90A1", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={35}    
                    />

                    <Tooltip
                        contentStyle={{
                        backgroundColor: "#111827",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        }}
                    />

                    <Legend
                        onClick={(e: any) => {
                        if (e?.dataKey) toggleKey(e.dataKey);
                        }}
                        wrapperStyle={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-evenly",
                        }}
                />

                    {vmKeys.map((key, idx) =>{
                        const isHidden = hiddenKeys.has(key);

                        return (
                            <Line
                            key={key}
                            dataKey={key}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            hide={isHidden}
                            />
                        )
                    } )}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}