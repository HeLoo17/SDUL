import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavItem({ label, icon: IconComponent, to }: { label: string; icon: React.ComponentType<{ className?: string }>; to: string }) {
    return (
        <NavLink
            to={to}
            className={({isActive}) =>`relative w-full h-fit px-4 py-3 rounded justify-start flex gap-3 items-center group transition-colors 
                    ${isActive ? 'bg-primary-BACK': 'hover:bg-primary-BACK/50'}`}
        >
            {({isActive}) => (
                <>
                    {/* ACTIVE TAB INDICATOR */}
                    {isActive && (
                        <div className='absolute w-1 h-full left-0 top-0 bg-dodgerBlue rounded-l-full'></div>
                    )}
                    <IconComponent className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-t3' : 'text-t2 group-hover:text-t3'}`} />
                    <span className={`text-[14px] font-space font-medium uppercase transition-colors ${isActive ? 'text-t3' : 'text-t2 group-hover:text-t3'}`}>{label}</span>
                </>
            )}
        </NavLink>
    );
}
