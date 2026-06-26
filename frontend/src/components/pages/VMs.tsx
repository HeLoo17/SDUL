import deco from "../../assets/deco";
import VM_KPICards from "../displays/VM_KPICards";
import { transformVMs } from '../../types';
import VmDetailedTable from "../displays/vmDetailTable/VmDetailedTable";
import VMStausCardLayout from "../displays/vmStatus/VMStatusCardLayout";
import { useOutletContext } from "react-router-dom";
import type { UseSocketReturn } from "../../hooks/useSocket";
import navi from "../../assets/icons";


export default function VMs() {
    const { rawData } = useOutletContext<{ rawData: UseSocketReturn }>();
    const { vms: rawVMs  } = rawData;

    const vms = transformVMs(rawVMs);

    const onlineVMs = vms.filter(vms => vms.status === 'running').length;
    const pausedVMs = vms.filter(vms => vms.status  === 'paused').length;
    const offlineVMs = vms.filter(vms => vms.status === 'error').length;


    return (
        <div className="h-full w-full flex flex-col gap-12">
            {/* KPI CARD HOLDER */}
            <div className="w-full flex gap-5">
                <VM_KPICards title='TOTAL VM' data={vms.length} info='Registered' icon={deco.vmTotal} color="#3C90FF" />
                <VM_KPICards title='RUNNING VM' data={onlineVMs} info='Online' icon={deco.vmOnline} color="#4ADE80" />
                <VM_KPICards title='PAUSED VM' data={pausedVMs} info='Paused' icon={navi.vmPaused} color="#FA9943" />
                <VM_KPICards title='ERROR VM' data={offlineVMs} info='Needs Attention' icon={deco.vmOffline} color="#FFB4AB" />
            </div>

            <div className="w-full h-fit">
                <VMStausCardLayout vms={vms} />
            </div>
            {/* VM DETAILS TABLE */}
            <div>
                <VmDetailedTable vms={vms} />
            </div>
        </div>
    )
}