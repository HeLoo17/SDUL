import NavItem from "./buttons/NavItem";
import logo from "../assets/logo.svg";
import navi from "../assets/icons";

export default function Sidebar() {

    const navItems = [
        { label: "Dashboard", icon: navi.dashboard, path: "/dashboard" },
        { label: "Nodes", icon: navi.nodes, path: "/nodes" },
        { label: "Virtual Machines", icon: navi.vm, path:"/vms" },
        { label: "Logs", icon: navi.logs, path: "/logs" },
        { label: "Historical Trends", icon: navi.historicalTrends, path: "historical-trends" },
        { label: "System Status", icon: navi.systemStatus, path: "/system-status" },
    ];

    return (
        <div className="w-[256px] h-screen bg-primary flex flex-col px-4 py-8">
            <div className="w-full h-[83px] px-4 px-3 flex flex-col justify-center">
                <img src={logo} alt="LabEye" className="w-[90px] h-[22px]" />
                <span className="text-[8px] text-t1 font-inter font-bold uppercase">observer of laboratory</span>
            </div>

            <nav className="w-full h-fit " aria-label="Main Navigation">
                <ul className="flex flex-col gap-2">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <NavItem label={item.label} icon={item.icon} to={item.path} />
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="w-full flex-1 justify-end items-end flex" aria-label="Settings">
                <nav className="w-full h-fit " aria-label="System Settings">
                    <ul>
                        <li>
                            <NavItem label="Settings" icon={navi.settings} to={"/settings"} />
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}