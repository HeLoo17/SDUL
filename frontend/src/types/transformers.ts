/**
 * transformers.ts
 * Converts raw ProxmoxAPI responses into typed shapes for frontend use
 */

import type { Node } from "./node";
import type { VM, vmStatus } from "./vm";


// ----- NODES -----
// Raw shape returned by /api/nodes, listed used fields only
export interface RawNodeAPI {
    node: string;
    status: string;
    cpu?: number;
    maxcpu?: number;
    mem?: number;
    maxmem?: number;
    disk?: number;
    maxdisk?: number;
    netin?:    number;
    netout?:   number;
    iowait?: number;
    ip_address?: string | null;
    storages?: StorageItem[];
}

export interface StorageItem {
    active: number;
    avail: number;
    content: string;
    enabled: number;
    shared: number;
    storage: string;
    total: number;
    type: string;
    used: number
    used_fraction: number;
}

// Normalized for a node
export function transformNode(raw: RawNodeAPI, index: number): Node {
    const cpuUsage = raw.maxcpu  && raw.cpu != null ? Math.round(raw.cpu * 100) : 0;
    const memoryUsage = raw.maxmem  && raw.mem != null ? Math.round((raw.mem / raw.maxmem) * 100) : 0;
    // const diskUsage = raw.maxdisk && raw.disk != null ? Math.round((raw.disk / raw.maxdisk) * 100) : 0;

    const storageList = raw.storages || [];
    const realDiskData = storageList.filter(storage => storage.shared !== 1 && storage.type !== 'rbd').reduce((sum, cur) => { return { totalStorage: sum.totalStorage + cur.total, usedStorage: sum.usedStorage + cur.used}; }, {totalStorage: 0, usedStorage: 0});
    const realDiskUsage = realDiskData.totalStorage > 0 ? (realDiskData.usedStorage / realDiskData.totalStorage) * 100 : 0;

    return {
        id: index + 1,
        nodeName: raw.node,
        status: raw.status === "online",
        cpuUsage,
        memoryUsage,
        diskUsage: realDiskUsage,
        ipAddress: raw.ip_address ?? "unknown",
    };
}

// Batch process list of nodes
export function transformNodes(raws: RawNodeAPI[]): Node[] {
    return raws.map(transformNode);
}


// ----- VMs -----
// Raw shape returned of VMs
export interface RawVMAPI {
    vmid: number;
    name?: string;
    status: string;
    cpu?: number;
    cpus?: number;      //number of cores assigned
    mem?: number;
    maxmem?: number;
    disk?: number;
    maxdisk?: number;   
    uptime?: number;    //seconds
    node?: string;
    tags?: string;
    template: boolean;
    lock?: string | null;
}

// Normalized for a VM
function normaliseVMStatus(raw: string): vmStatus {
    if (raw === "running") return "running";
    if (raw === "stopped") return "stopped";
    if (raw === "paused") return "paused";
    return "error";     // unknown and others treat as error
}

export function transformVM(raw: RawVMAPI, index: number): VM {
    const cpuUsage = raw.cpu != null ? Math.round(raw.cpu * 100) : 0;
    const memoryUsage = raw.maxmem && raw.mem != null ? Math.round((raw.mem / raw.maxmem) * 100) : 0;
    const diskUsage = raw.maxdisk && raw.disk != null ? Math.round((raw.disk / raw.maxdisk) * 100) : 0;

    return {
    id: index + 1,
    vmid: String(raw.vmid),
    vmName: raw.name ?? `vm-${raw.vmid}`,
    status: normaliseVMStatus(raw.status),
    cpuUsage,
    memoryUsage,
    diskUsage,
    uptime: raw.uptime ?? 0,
    node: raw.node ?? "—",
    tags: raw.tags ? raw.tags.split(/[;,]/).map(tag => tag.trim().toLowerCase()).filter(Boolean) : [],
    template: raw.template,
    };
}

// Batch process of list of VMs
export function transformVMs(raws: RawVMAPI[]): VM[] {
  return raws.map(transformVM);
}

//----- ThroughPut Bar -----
// Build bar-chart data from raw node list
export function sumThroughput(nodes: RawNodeAPI[], key: 'net' | 'disk'): number {
  return nodes
    .filter((n) => n.status === 'online')
    .reduce((acc, n) => {
      if (key === 'net')  return acc + (n.netin  ?? 0) + (n.netout  ?? 0);
      if (key === 'disk') return acc + ((n.iowait ?? 0) * 100);
      return acc;
    }, 0);
}

// Uptime transformer
export function formatUptime(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return "-";

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}
