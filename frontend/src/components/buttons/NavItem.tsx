import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    to: string;
    collapsed?: boolean;
}
 
export default function NavItem({ label, icon: IconComponent, to, collapsed = false }: NavItemProps) {
    return (
        <NavLink
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
                `relative w-full h-[44px] rounded flex items-center group transition-colors
                ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}
                ${isActive ? 'bg-primary-BACK' : 'hover:bg-primary-BACK/50'}`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <div className='absolute w-1 h-full left-0 top-0 bg-dodgerBlue rounded-l-full' />
                    )}
                    <IconComponent
                        className={`w-[18px] h-[18px] flex-shrink-0 transition-colors
                            ${isActive ? 'text-t3' : 'text-t2 group-hover:text-t3'}`}
                    />
                    {!collapsed && (
                        <span className={`text-[14px] font-space font-medium uppercase transition-colors
                            ${isActive ? 'text-t3' : 'text-t2 group-hover:text-t3'}`}>
                            {label}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
}
