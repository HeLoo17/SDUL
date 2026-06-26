type VMMetricsBarProps =  {
    status: boolean
    percentage: number
    type: string
}

export default function VMMetricsBar({ status, percentage, type}: VMMetricsBarProps) {
    const text_color = status ? 'text-graph-TITLE' : 'text-graph-TITLE opacity-50';
    const barColor = type === 'cpu' ? 'bg-[#60A5FA]' : 'bg-[#FDBA74]';

    return(
        <div className="w-full pe-9 flex flex-col"> 
            {status ? (<div className="h-1 w-full bg-black rounded-full">
                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percentage}%` }}/>
            </div>): null}
            <span className={`text-[10px] font-inter ${text_color}`}>{percentage}%</span>
        </div>
    )
}