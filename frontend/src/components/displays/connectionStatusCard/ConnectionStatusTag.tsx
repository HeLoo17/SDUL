export default function ConnectionStatusTag({ value }: {value: 1 | 2 | 3 | null;}) {
    const textColor = value === 1 ? "#4ADE80" : value === 2 ? "#FFD5AB" : value === 3 ? "#C1C6D7" : "#FFB4AB"
    const bgColor = value === 1 ? "#1E2A24" : value === 2 ? "#4E3D2C" : value === 3 ? "#31353F" : "#2D1414"
    const status = value !== null ? "Connected" : "Disconnected";

    return (
        <div className="w-fit flex items-center justify-center px-3 py-1 rounded-full gap-2" style={{ backgroundColor: bgColor, borderWidth: "1px", borderColor: textColor, borderStyle: "solid" }}>
            <div style={{ backgroundColor: textColor}} className="h-1 w-1 rounded-full" />
            <span className="text-[10px] font-inter font-bold capitalize items-center" style={{ color: textColor}}>{status}</span>
        </div>
    )
}
