import type { ComponentType } from "react";

interface HistoryPeak_KPICardsProps {
    time: string;
    on: number;
    title: string;
    icon: ComponentType<{ className?: string }>;
}

function formatTimestamp( input: string): string {
    const date = new Date(input);
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date).toUpperCase();
    const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
    const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

    return `${month} ${day} - ${time}`;
}

export default function HistoryPeak_KPICards({ time, on, title, icon:IconComponent }: HistoryPeak_KPICardsProps) {
    // Live data can be empty during first load or fallback transitions; clamp values so never render negative/overflow states.
    const safeTime = time ? formatTimestamp(time): "N/A";
    const safeOn = Math.max(0, on);
    
    return (
        <div className="relative w-full h-fit flex p-6 gap-2 bg-primary-BACK rounded-lg border-l-2 border-red-500">
            <IconComponent className="absolute top-6 right-6 w-15 h-15 text-t2 opacity-10 z-0 pointer-events-none overflow-hidden" />
            <div className="relative z-10 w-full h-fit flex flex-col gap-2">
                <span className="text-t2 text-[10px] font-inter font-bold uppercase">{title}</span>
                <div className="h-1 w-full" />
                <div>
                    <span className="text-white text-[30px] font-inter font-bold">{safeOn.toFixed(1)}%</span>
                    <span className="text-white text-[15px] font-inter font-bold"> @ {safeTime} </span>
                </div>
            </div>
        </div>
    )
}
