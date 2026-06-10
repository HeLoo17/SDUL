import { useState } from "react";
import type { FilterDropDownProps } from "../../types/chart";

export default function DropBox({ activeFilter, onFilterChange, options, bgColor, textColor }: FilterDropDownProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* 3. Injected bgColor and textColor using template literals */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[12px] font-inter font-medium transition-colors shadow-sm
                    ${bgColor} ${textColor} hover:brightness-110`}
            >
                <span>{activeFilter}</span>
                <svg 
                    className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    
                    <ul className="absolute right-0 mt-2 w-40 bg-[#1C1F29] border border-[#262A34] rounded-lg shadow-xl z-20 overflow-hidden">
                        {options.map((option) => (
                            <li key={option}>
                                <button
                                    onClick={() => {
                                        onFilterChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-[12px] transition-colors ${activeFilter === option ? 'bg-dodgerBlue text-white' : 'text-t2 hover:bg-[#262A34] hover:text-white'}`}
                                >
                                    {option}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}