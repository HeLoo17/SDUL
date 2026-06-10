export interface RawNode {}

export interface Node {
    id: number;
    nodeName: string;
    status: boolean;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    ipAddress: string;
}

export interface RadialDataPoint {
    name: string;
    value: number;
    fill: string;
}

export type FilterRadialChartState = 'All' | 'Online' | 'Offline'
