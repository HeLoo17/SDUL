import type { ComponentType } from "react";

interface KPICardsProps {
    total: number;
    on: number;
    title: string;
    info: string;
    icon: ComponentType<{ className?: string }>;
}

export default function KPICards({ total, on, title, info, icon:IconComponent }: KPICardsProps) {
    // Live data can be empty during first load or fallback transitions; clamp values so never render negative/overflow states.
    const safeTotal = Math.max(0, total);
    const safeOn = Math.max(0, on);
    const progressPercentage = safeTotal > 0 ? Math.min((safeOn / safeTotal) * 100, 100) : 0;
    
    return (
        <div className="relative w-full h-fit flex p-6 gap-2 bg-primary-BACK rounded-lg">
            <IconComponent className="absolute top-6 right-6 w-15 h-15 text-t2 opacity-10 z-0 pointer-events-none overflow-hidden" />
            <div className="relative z-10 w-full h-fit flex flex-col gap-2">
                <span className="text-t2 text-[10px] font-inter font-bold uppercase">{title}</span>
                <div>
                    <span className="text-white text-[30px] font-inter font-bold">{safeOn}</span>
                    <span className="text-white text-[15px] font-inter font-bold">/{safeTotal} </span>
                    <span className="text-t3 text-[12px] font-inter font-medium">{info}</span>
                </div>
                <div className="h-1 w-full bg-black rounded-full">
                    <div className="h-full bg-white rounded-full" style={{ width: `${progressPercentage}%` }}/>
                </div>
            </div>
        </div>
    )
}
