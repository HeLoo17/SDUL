import { useOutletContext } from "react-router-dom";
import ConnectionStatusCard from "../displays/connectionStatusCard/ConnectionStatusCard";
import type { UseSocketReturn, SystemStatus } from "../../hooks/useSocket";



export default function SystemStatus() {
    const { rawData } = useOutletContext<{ rawData: UseSocketReturn }>();
    const { systemStatus: rawStatus } = rawData;

    return (
        <div className="h-full w-full flex flex-col gap-12">
            <div className="h-fit w-full flex gap-8">
                <ConnectionStatusCard systemStatus={rawStatus} />
            </div>
        </div>
    )
}