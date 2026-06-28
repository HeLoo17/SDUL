import { useState } from "react";
import { useHistoricalData, type TimeRange } from "../../hooks/useHistoricalData";
import HistoricalGraph from "../displays/HistroicalGraph";
import KPICards2 from "../displays/KPICards2";
import deco from "../../assets/deco";
import HistoryPeak_KPICards from "../displays/HistoryPeak_KPICards";

function setDisplayRange(timeRange: TimeRange): string {
    const display = timeRange === "24h" ? "last 24 hours" : timeRange === "7d" ? "last 7 days" : "last 30 days";

    return display;
}

export default function HistoricalTrend() {
    const RANGES: TimeRange[] = ["24h", "7d", "30d"];

    const [range, setRange] = useState<TimeRange>("24h");
    const { data, loading, error } = useHistoricalData(range);

    const avgCpu = data.length > 0 ? data.reduce((sum, cur) => sum + cur.cpu, 0) / data.length : 0;
    const avgMemory = data.length > 0 ? data.reduce((sum, cur) => sum + cur.memory, 0) / data.length : 0;
    const peakCpu = data.length > 0 ? [data.reduce((peak, cur) => {return cur.cpu >= peak.cpu ? cur: peak})] : [{cpu: 0, time: ""}];
    const peakMemory = data.length > 0 ? [data.reduce((peak, cur) => {return cur.memory >= peak.memory ? cur: peak})] : [{memory: 0, time: ""}];


    return (
        <div className="h-full w-full flex flex-col gap-12">
            <div>
                {/* TIME RANGE SELECTOR */}
                <div className="w-fit flex bg-primary-BACK rounded-lg p-1 gap-1">
                    {RANGES.map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`w-[144px] text-[12px] font-inter font-bold px-3 py-2 rounded-md uppercase
                                ${range === r ? "bg-t2 text-t3" : "text-t1 hover:bg-t2/30 hover:text-t3"}`}
                        >
                            {setDisplayRange(r)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-6">
                <KPICards2 on={avgCpu} total={100} title="AVG CPU Usage" info="System Load" icon={deco.cpuUsage} />
                <HistoryPeak_KPICards on={peakCpu[0].cpu} title="Peak CPU Usage" time={peakCpu[0].time} icon={deco.peakCpu} />
                <KPICards2 on={avgMemory} total={100} title="AVG Memory Usage" info="Usage" icon={deco.memoryUsage} />
                <HistoryPeak_KPICards on={peakMemory[0].memory} title="Peak Memeory Usage" time={peakMemory[0].time} icon={deco.peakMemory} />
            </div>
            <HistoricalGraph data={data} loading={loading} error={error} range={range}/>
        </div>
    )
}