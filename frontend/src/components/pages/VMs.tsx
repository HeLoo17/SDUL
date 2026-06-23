import deco from "../../assets/deco";
import VM_KPICards from "../displays/VM_KPICards";
import type { VM } from '../../types';
import VmDetailedTable from "../displays/vmDetailTable/VmDetailedTable";
import VMStausCardLayout from "../displays/vmStatus/VMStatusCardLayout";

export const sampleVMs: VM[] = [
    { id: 1, vmid: "101", vmName: "web-server-prod", status: "running", cpuUsage: 45.2, memoryUsage: 62.5, diskUsage: 40.0, uptime: 1209600, node: "pve-01" },
    { id: 2, vmid: "102", vmName: "database-primary", status: "running", cpuUsage: 78.1, memoryUsage: 88.4, diskUsage: 72.1, uptime: 3600, node: "pve-01" },
    { id: 3, vmid: "103", vmName: "mail-server", status: "stopped", cpuUsage: 0, memoryUsage: 0, diskUsage: 15.4, uptime: 0, node: "pve-02" },
    { id: 4, vmid: "104", vmName: "dev-playground", status: "running", cpuUsage: 12.5, memoryUsage: 30.2, diskUsage: 10.0, uptime: 43200, node: "pve-03" },
    { id: 5, vmid: "105", vmName: "backup-agent", status: "error", cpuUsage: 2.1, memoryUsage: 12.0, diskUsage: 95.5, uptime: 864600, node: "pve-02" },
    { id: 6, vmid: "201", vmName: "nginx-proxy-01", status: "running", cpuUsage: 5.4, memoryUsage: 18.2, diskUsage: 8.5, uptime: 259450, node: "pve-01" },
    { id: 7, vmid: "202", vmName: "nginx-proxy-02", status: "running", cpuUsage: 6.2, memoryUsage: 19.5, diskUsage: 8.5, uptime: 2592000, node: "pve-03" },
    { id: 8, vmid: "301", vmName: "k8s-worker-01", status: "running", cpuUsage: 65.0, memoryUsage: 75.0, diskUsage: 50.2, uptime: 604800, node: "pve-02" },
    { id: 9, vmid: "302", vmName: "k8s-worker-02", status: "stopped", cpuUsage: 0, memoryUsage: 0, diskUsage: 50.2, uptime: 0, node: "pve-03" },
    { id: 10, vmid: "404", vmName: "legacy-app-server", status: "running", cpuUsage: 100, memoryUsage: 100, diskUsage: 100, uptime: 31536000, node: "pve-01" }
];

export default function VMs() {
    const onlineVMs = sampleVMs.filter(sampleVMs => sampleVMs.status === 'running').length;
    const offlineVMs = sampleVMs.filter(sampleVMs => sampleVMs.status === 'error' || sampleVMs.status === 'stopped').length;


    return (
        <div className="h-full w-full flex flex-col gap-12">
            {/* KPI CARD HOLDER */}
            <div className="w-full flex gap-5">
                <VM_KPICards title='TOTAL VM' data={sampleVMs.length} info='Registered' icon={deco.vmTotal} color="#3C90FF" />
                <VM_KPICards title='RUNNING VM' data={onlineVMs} info='Online' icon={deco.vmOnline} color="#4ADE80" />
                <VM_KPICards title='OFFLINE/ERROR VM' data={offlineVMs} info='Needs Attention' icon={deco.vmOffline} color="#FFB4AB" />
            </div>

            <div className="w-full h-fit">
                <VMStausCardLayout vms={sampleVMs} />
            </div>
            {/* VM DETAILS TABLE */}
            <div>
                <VmDetailedTable vms={sampleVMs} />
            </div>
        </div>
    )
}