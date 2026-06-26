import ConnectionStatusCard from "../displays/ConnectionStatusCard";

export default function SystemStatus() {
    return (
        <div className="h-full w-full flex flex-col gap-12">
            <div className="h-fit w-full flex gap-8">
                <ConnectionStatusCard connection_service="testing text" description="lepus lorem" status={true} last_sync={10086} response_time={0.1} />
                <ConnectionStatusCard connection_service="testing text" description="lepus lorem" status={true} last_sync={10086} response_time={0.1} />
            </div>
            
        </div>
    )
}