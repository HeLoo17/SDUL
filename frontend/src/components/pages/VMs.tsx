import deco from "../../assets/deco";
import VM_KPICards from "../displays/VM_KPICards";
import { transformVMs, type VM } from '../../types';
import VmDetailedTable from "../displays/vmDetailTable/VmDetailedTable";
import VMStausCardLayout from "../displays/vmStatus/VMStatusCardLayout";
import { useOutletContext } from "react-router-dom";
import type { UseSocketReturn } from "../../hooks/useSocket";
import navi from "../../assets/icons";
import VMTagsGraph from "../displays/VMTagsGraph";

const mockVMs: VM[] = [
  {
    id: 1,
    vmid: "101",
    vmName: "web-server-production",
    status: "running",
    cpuUsage: 42.5,
    memoryUsage: 68.2,
    diskUsage: 55.0,
    uptime: 1209600, // 14 days in seconds
    node: "lab-d-proxmox-node-01",
    tags: ["production", "frontend", "nginx"],
    template: false,
    lock: null
  },
  {
    id: 2,
    vmid: "102",
    vmName: "db-backup-replica",
    status: "stopped",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 89.1,
    uptime: 0,
    node: "lab-d-proxmox-node-01",
    tags: ["database", "backup"],
    template: true,
    lock: null
  },
  {
    id: 3,
    vmid: "103",
    vmName: "analytics-worker-01",
    status: "paused",
    cpuUsage: 1.2,
    memoryUsage: 90.5,
    diskUsage: 34.7,
    uptime: 345600, // 4 days in seconds
    node: "lab-d-proxmox-node-02",
    tags: ["worker", "paused-state"],
    template: false,
    lock: "suspended"
  },
  {
    id: 4,
    vmid: "104",
    vmName: "legacy-ubuntu-template",
    status: "error",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 12.4,
    uptime: 0,
    node: "lab-d-proxmox-node-02",
    template: false,
    lock: "mounted"
  }
];

export default function VMs() {
    const { rawData, vmTypeHistory } = useOutletContext<{ rawData: UseSocketReturn, vmTypeHistory: any[] }>();
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
                <VMStausCardLayout vms={mockVMs} />
            </div>
            <div>
                <VMTagsGraph data={vmTypeHistory}/>
            </div>
        </div>
    )
}