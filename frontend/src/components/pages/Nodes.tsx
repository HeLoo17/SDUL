import NodeStatusLayout from "../displays/nodeStatus/NodeStatusLayout";
import ThroughputBarChartCard from "../displays/ThroughputBarChartCard";
import { type UseSocketReturn } from "../../hooks/useSocket";
import { transformNodes, type TimeSlice} from "../../types";
import { useOutletContext } from "react-router-dom";

export default function Nodes() {
    const { rawData, slices } = useOutletContext<{rawData: UseSocketReturn, slices: TimeSlice[]}>();
    const { nodes: rawNodes } = rawData;

    const nodes = transformNodes(rawNodes);

    return (
        <div className="h-full w-full flex flex-col gap-12">
            <NodeStatusLayout nodes={nodes} />

            <div className="w-full">
                <ThroughputBarChartCard slices={slices} />
            </div>
        </div> 
    )
}