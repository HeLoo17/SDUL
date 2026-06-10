import NodeStatusLayout from "../displays/nodeStatus/NodeStatusLayout";
import ThroughputBarChartCard from "../displays/ThroughputBarChartCard";
import type { Node, ThroughputDataPoint} from "../../types";

export default function Nodes() {
    const nodes: Node[] = [
        { id: 1, nodeName: "Node 1", status: true, cpuUsage: 72, memoryUsage: 58, diskUsage: 85, ipAddress: "192.168.1.1" },
        { id: 2, nodeName: "Node 2", status: false, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, ipAddress: "192.168.1.2" },
        { id: 3, nodeName: "Node 3", status: true, cpuUsage: 45, memoryUsage: 30, diskUsage: 60, ipAddress: "192.168.1.3" },
        { id: 4, nodeName: "Node 4", status: true, cpuUsage: 80, memoryUsage: 70, diskUsage: 90, ipAddress: "192.168.1.4" },
        { id: 5, nodeName: "Node 5", status: false, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, ipAddress: "192.168.1.5" },
        { id: 6, nodeName: "Node 6", status: true, cpuUsage: 60, memoryUsage: 50, diskUsage: 75, ipAddress: "192.168.1.6" }
    ];

    const networkData: ThroughputDataPoint[] = [
        { node: "Node 1", value: 40 }, { node: "Node 2", value: 60 }, { node: "Node 3", value: 30 }, { node: "Node 4", value: 90 }, 
        { node: "Node 5", value: 70 }, { node: "Node 6", value: 110 }, { node: "Node 7", value: 50 }, { node: "Node 8", value: 35 }, 
        { node: "Node 9", value: 95 }, { node: "Node 10", value: 120 }
    ];

    const diskData: ThroughputDataPoint[] = [
        { node: "Node 1", value: 90 }, { node: "Node 2", value: 40 }, { node: "Node 3", value: 110 }, { node: "Node 4", value: 55 }, 
        { node: "Node 5", value: 85 }, { node: "Node 6", value: 30 }, { node: "Node 7", value: 75 }, { node: "Node 8", value: 100 }, 
        { node: "Node 9", value: 45 }, { node: "Node 10", value: 60 }
    ];

    return (
        <div className="h-full w-full flex flex-col gap-12">
            <NodeStatusLayout nodes={nodes} />

            <div className="w-full">
                <ThroughputBarChartCard networkData={networkData} diskData={diskData} />
            </div>
        </div> 
    )
}