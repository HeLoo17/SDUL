import NodeStatusLayout from "../displays/nodeStatus/NodeStatusLayout";
import ThroughputBarChartCard from "../displays/ThroughputBarChartCard";
import { useSocket } from "../../hooks/useSocket";
import { transformNodes} from "../../types";

export default function Nodes() {
    const { nodes: rawNodes } = useSocket();

    const nodes = transformNodes(rawNodes);

    return (
        <div className="h-full w-full flex flex-col gap-12">
            <NodeStatusLayout nodes={nodes} />

            <div className="w-full">
                <ThroughputBarChartCard rawNodes={rawNodes} />
            </div>
        </div> 
    )
}