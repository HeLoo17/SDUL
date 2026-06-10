export default function VM_KPICards({ data, title, info, icon:IconComponent, color }: { data: number, title: string, info: string, icon: React.ComponentType<{ className?: string, style?: React.CSSProperties }>, color: string }) {
    const formattedData = String(data).padStart(2, '0');

    return (
        <div className="relative w-full h-fit flex p-6 gap-2 bg-primary-BACK rounded-lg">
            <IconComponent style={{ color: color }}  className="absolute top-6 right-6 w-15 h-15 opacity-10 z-0 pointer-events-none overflow-hidden" />
            <div className="relative z-10 w-full h-fit flex flex-col gap-2">
                <span className="text-t2 text-[10px] font-inter font-bold uppercase">{title}</span>
                <div>
                    <span style={{ color: color }} className="text-[30px] font-inter font-bold">{formattedData} </span>
                    <span style={{ color: color }} className="text-[12px] font-inter font-medium">{info}</span>
                </div>
            </div>
        </div>
    )
}