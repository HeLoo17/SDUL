import { formatLogTime, type Alert } from '../../../types';

const LEVEL_COLORS: Record<string, [string, string]> = {
        critical: ['#FC5844', '#2D1414'],
        notice:  ['#C1C6D7', '#31353F'],
        warning: ['#FFD5AB', '#4E3D2C']
    };

// Supporting components
function LevelTag({ level }: { level: string }) {
    const [textColor, bgColor] = LEVEL_COLORS[level] || ['#FFFFFF', '#31353F'];
    return (
        <div className="w-fit flex items-center justify-center px-3 py-1 rounded-full gap-2" style={{ backgroundColor: bgColor, borderWidth: "1px", borderColor: textColor, borderStyle: "solid" }}>
            <div style={{ backgroundColor: textColor}} className="h-1 w-1 rounded-full" />
            <span className="text-[10px] font-inter font-bold capitalize items-center" style={{ color: textColor}}>{level}</span>
        </div>
    );
}

export default function BriefAlertLogRecords({ severity, host, description, time }: Omit<Alert, 'id'>) {
    return (
        <div className="grid grid-cols-[100px_120px_1fr_150px] items-center gap-4 px-8 py-4">
            <LevelTag level={severity} />
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{host}</span>
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{description}</span>
            <span className="text-[10px] text-graph-LEGEND font-inter font-semiBold uppercase">{formatLogTime(time)}</span>
        </div>
    )
}