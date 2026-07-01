import deco from "../../assets/deco";
import VM_KPICards from "../displays/VM_KPICards";
import { transformVMs } from '../../types';
import VMStausCardLayout from "../displays/vmStatus/VMStatusCardLayout";
import { useOutletContext } from "react-router-dom";
import type { UseSocketReturn } from "../../hooks/useSocket";
import navi from "../../assets/icons";
import VMTagsGraph from "../displays/VMTagsGraph";
import { useMemo } from "react";


export default function VMs() {
    const { rawData, vmTypeHistory } = useOutletContext<{ rawData: UseSocketReturn, vmTypeHistory: any[] }>();
    const { vms: rawVMs  } = rawData;

    const vms = transformVMs(rawVMs);

    const { online, paused, offline } = useMemo(() => {
        let online = 0, paused = 0, offline = 0;

        for (const vm of vms) {
            if (vm.status === "running") online++;
            else if (vm.status === "paused") paused++;
            else offline++;
        }

        return { online, paused, offline };
    }, [vms]);

    return (
        <div className="h-full w-full flex flex-col gap-12">
            {/* KPI CARD HOLDER */}
            <div className="w-full flex gap-5">
                <VM_KPICards title='TOTAL VM' data={vms.length} info='Registered' icon={deco.vmTotal} color="#3C90FF" />
                <VM_KPICards title='RUNNING VM' data={online} info='Online' icon={deco.vmOnline} color="#4ADE80" />
                <VM_KPICards title='PAUSED VM' data={paused} info='Paused' icon={navi.vmPaused} color="#FA9943" />
                <VM_KPICards title='ERROR VM' data={offline} info='Needs Attention' icon={deco.vmOffline} color="#FFB4AB" />
            </div>

            <div className="w-full h-fit">
                <VMStausCardLayout vms={vms} />
            </div>
            <div>
                <VMTagsGraph data={vmTypeHistory}/>
            </div>
        </div>
    )
}