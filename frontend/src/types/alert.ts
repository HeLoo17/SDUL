export type AlertSeverity = 'critical' | 'warning' | 'notice';

export interface Alert {
    id: number;
    severity: AlertSeverity;
    host: string;
    description: string;
    time: string;
}