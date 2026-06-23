import type { VM } from "../../../types";
import VMStatusCard from "./VMStatusCard";

export default function VMStatusCardLayout({ vms }: { vms: VM[] }) {
    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vms.map(({ id, ...vm }) => (
                <VMStatusCard key={id} {...vm} />
            ))}
        </div>
    );
}