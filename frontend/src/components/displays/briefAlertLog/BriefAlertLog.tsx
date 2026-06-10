import BriefAlertLogRecords from "./BriefAlertLogRecords";

export default function BriefAlertLog() {
    return (
        <div className='w-full flex flex-col bg-primary-BACK rounded-lg'>
            {/* HEADERS */}
            <div className="flex justify-between items-end px-8 py-6">
                <h2 className="text-[20px] text-graph-TITLE font-space font-bold">Recent Alerts</h2>
                <button className="text-[12px] text-graph-CPU font-inter font-regular uppercase">view all logs</button>
            </div>
            {/* COLUMN HEADERS */}
            <div className="grid grid-cols-[100px_120px_1fr_150px] items-center gap-4 bg-[#262A34]/80 px-8 py-4">
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">severity</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">host </span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">description</span>
                <span className="text-[10px] text-t2 font-inter font-semiBold uppercase">time</span>
            </div>
            {/* LOG RECORDS */}
            <BriefAlertLogRecords severity="critical" host="Node 3" description="Unusual outbound traffic detected" time="2024-06-15 14:32:10" />
            <BriefAlertLogRecords severity="warning" host="Node 5" description="Multiple failed login attempts" time="2024-06-15 13:45:22" />
            <BriefAlertLogRecords severity="notice" host="Node 2" description="New software installed" time="2024-06-15 12:20:05" />
            <div className="h-2" />
        </div>
    )
}