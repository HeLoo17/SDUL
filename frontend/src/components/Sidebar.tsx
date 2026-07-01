import NavItem from "./buttons/NavItem";
import logo from "../assets/logo.svg";
import simple_logo from "../public/simple_logo.svg"
import navi from "../assets/icons";
import { useState } from "react";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { label: "Dashboard", icon: navi.dashboard, path: "/dashboard" },
        { label: "Nodes", icon: navi.nodes, path: "/nodes" },
        { label: "Virtual Machines", icon: navi.vm, path:"/vms" },
        { label: "Logs", icon: navi.logs, path: "/logs" },
        { label: "Historical Trends", icon: navi.historicalTrends, path: "historical-trends" },
        { label: "System Status", icon: navi.systemStatus, path: "/system-status" },
    ];

    return (
        <div 
            className="h-screen bg-primary flex flex-col px-4 py-8"
            style={{width: collapsed ? '80px' : '256px', minWidth: collapsed ? '80px' : '256px'}}
        >
            <button 
                onClick={() => setCollapsed(prev => !prev)}
                className="flex items-center px-4 py-8 hover:opacity-70 transition-opacity"
                style={{ height: '83px', minHeight: '83px' }}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? (
                    <div className="flex-col w-full flex justify-center">
                        <img src={simple_logo} alt="LabEye" className="w-[90px] h-[21px]" />
                        <div className="h-[16px]"/>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center text-left">
                        <img src={logo} alt="LabEye" className="w-[90px] h-[23px]" />
                        <span className="text-[8px] text-t1 font-inter font-bold uppercase">observer of laboratory</span>
                    </div>
                )}
            </button>

            <nav className="w-full h-fit " aria-label="Main Navigation">
                <ul className="flex flex-col gap-2">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <NavItem label={item.label} icon={item.icon} to={item.path} collapsed={collapsed}/>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="w-full flex-1 justify-end items-end flex" aria-label="Settings">
                <nav className="w-full h-fit " aria-label="System Settings">
                    <ul>
                        <li>
                            <NavItem label="Settings" icon={navi.settings} to={"/settings"} collapsed={collapsed}/>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}