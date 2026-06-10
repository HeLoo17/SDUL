export default function KPICards({ total, on, title, info, icon:IconComponent }: { total: number, on: number, title: string, info: string, icon: React.ComponentType<{ className?: string }> }) {
    const progressPercentage = total > 0 ? (on / total) * 100 : 0;
    
    return (
        <div className="relative w-full h-fit flex p-6 gap-2 bg-primary-BACK rounded-lg">
            <IconComponent className="absolute top-6 right-6 w-15 h-15 text-t2 opacity-10 z-0 pointer-events-none overflow-hidden" />
            <div className="relative z-10 w-full h-fit flex flex-col gap-2">
                <span className="text-t2 text-[10px] font-inter font-bold uppercase">{title}</span>
                <div>
                    <span className="text-white text-[30px] font-inter font-bold">{progressPercentage.toFixed(1)}% </span>
                    <span className="text-t3 text-[12px] font-inter font-medium">{info}</span>
                </div>
                <div className="h-1 w-full bg-black rounded-full">
                    <div className="h-full bg-white rounded-full" style={{ width: `${progressPercentage}%` }}/>
                </div>
            </div>
        </div>
    )
}