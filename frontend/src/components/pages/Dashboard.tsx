import KPICards from "../displays/KPICards";
import KPICards2 from "../displays/KPICards2";
import deco from "../../assets/deco";
import CPU_RAM_GeneralGraph from "../displays/CPU_RAM_GeneralGraph";
import BriefAlertLog from "../displays/briefAlertLog/BriefAlertLog";

export default function Dashboard() {
    return (
        <div className="h-full w-full flex flex-col gap-12">
            <div className="flex gap-6">
                <KPICards on={7} total={10} title="Total Nodes" info="Online" icon={deco.totalNodes} />
                <KPICards on={12} total={12} title="Total VMs" info="Running" icon={deco.totalVMs} />
                <KPICards2 on={67} total={100} title="CPU Usage" info="System Load" icon={deco.cpuUsage} />
                <KPICards2 on={45} total={100} title="Memory Usage" info="Usage" icon={deco.memoryUsage} />
            </div>
            <CPU_RAM_GeneralGraph />
            <BriefAlertLog />
        </div>
    )
}