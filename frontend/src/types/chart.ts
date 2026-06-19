export interface TelemetryDataPoint {
    time: string;
    cpu: number;
    memory: number;
}

export interface ThroughputDataPoint {
    node: string;
    value: number;
}

export interface TimeSlice {
    time: string;
    network: number;
    disk: number;
}

export interface FilterDropDownProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    options: string[];
    bgColor?: string;
    textColor?: string;
}
