import type { Alert } from '../../../types';

const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'warning':
            return '#FE651E';
        case 'critical':
            return '#93000A';
        case 'notice':
        default:
            return '#A6B6D5';
    }
};

const SeverityTag = ({ tag }: { tag: string }) => (
    <div className="h-fit w-16 px-2 py-1 rounded-sm flex items-center justify-center" style={{ backgroundColor: getSeverityColor(tag) }}>
        <span className="text-[10px] text-white font-inter font-semiBold uppercase">{tag}</span>
    </div>
);

export default function BriefAlertLogRecords({ severity, host, description, time }: Omit<Alert, 'id'>) {
    return (
        <div className="grid grid-cols-[100px_120px_1fr_150px] items-center gap-4 px-8 py-4">
            <SeverityTag tag={severity} />
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{host}</span>
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{description}</span>
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{time}</span>
        </div>
    )
}