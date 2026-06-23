import NodeStatusLayout from "../displays/nodeStatus/NodeStatusLayout";
import ThroughputBarChartCard from "../displays/ThroughputBarChartCard";
import { type UseSocketReturn } from "../../hooks/useSocket";
import { transformNodes} from "../../types";
import { useOutletContext } from "react-router-dom";

export default function Nodes() {
    const { rawData } = useOutletContext<{rawData: UseSocketReturn}>();
    const { nodes: rawNodes } = rawData;

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