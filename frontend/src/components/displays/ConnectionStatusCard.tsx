interface ConnectionStatusCardProps {
    connection_service: string,
    description: string,
    status: boolean,
    last_sync: number,
    response_time: number,
}

export default function ConnectionStatusCard({ connection_service, description, status, last_sync, response_time }: ConnectionStatusCardProps) {
    return (
        <div className="w-full h-fit gap-8 p-8 bg-primary-BACK rounded-lg">
            <div className="w-full flex justify-between">
                <div className="w-full flex flex-col">
                    <span className="text-[20px] text-graph-TITLE font-space uppercase">{connection_service}</span>
                    <span> {description} </span>
                </div>
                <div>
                    <span> {status ? "Connected": "Disconnected"} </span>
                </div>
            </div>
            <div className="w-full flex justify-between">
                <span> Last Sync </span>
                <span> {last_sync} </span>
            </div>
            <div className="w-full flex justify-between">
                <span> Last Sync </span>
                <span> {last_sync} </span>
            </div>
            <div className="w-full flex justify-between">
                <span> Last Sync </span>
                <span> {last_sync} </span>
            </div>
            <div className="w-full flex justify-between">
                <span> Last Sync </span>
                <span> {last_sync} </span>
            </div>
        </div>
    )
}