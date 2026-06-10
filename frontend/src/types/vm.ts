export type vmStatus = 'running' | 'stopped' | 'error';

export interface RawVM {
    id: number;
    vmid: string;
    vmName: string;
    status: vmStatus;
    totalCpu: number;
    cpuUsed: number;
    totalMemory: number;
    memoryUsed: number;
    totalDisk: number;
    diskUsed: number;
    uptime: number;
    node: string;
}

export interface VM {
    id: number;
    vmid: string;
    vmName: string;
    status: vmStatus;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
    node: string;
}