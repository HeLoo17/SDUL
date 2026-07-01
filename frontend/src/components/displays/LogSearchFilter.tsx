import { useRef, useState } from 'react';
import SearchIcon from '../../assets/buttons/search.svg?react'
import CalendarIcon from '../../assets/buttons/calendar.svg?react'
import navi from '../../assets/icons';


interface LogSearchFilterProps {
    value: string;
    onChange: (value: string) => void;
    timeFilter: string;
    setTimeFilter: (timeFilter: string) => void;
    timeFilterList: string[];
    onApplyFilters?: (filters: Filter[]) => void;
}

interface Filter {
    field: string;
    operator: string;
    value: string | number;
    valueTo?: string | number;
}

const FIELDS = [
    "message",
    "ip",
    "level",
    "service",
    "timestamp"
];

const OPERATORS = [
    "is",
    "is not",
    "contains",
    "is between"
];

export default function LogSearchFilter({value, onChange, timeFilter, setTimeFilter, timeFilterList, onApplyFilters}: LogSearchFilterProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isFieldsOpen, setIsFieldsOpen] = useState(false);

    const [filters, setFilters] = useState<Filter[]>([]);

    // builder state
    const [field, setField] = useState(FIELDS[0]);
    const [operator, setOperator] = useState(OPERATORS[0]);
    const [val, setVal] = useState("");
    const [valTo, setValTo] = useState("");

    const addFilter = () => {
        if (!field || !operator || !val) return;

        const newFilter: Filter = {
            field,
            operator,
            value: val,
            valueTo: operator === "is between" ? valTo : undefined
        };

        setFilters(prev => [...prev, newFilter]);

        // reset builder
        setVal("");
        setValTo("");
    };

    const removeFilter = (index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
    };

    const applyFilters = () => {
        onApplyFilters?.(filters);
        setIsOpen(false);
    };

    return (
        <div className="w-full p-4 gap-4 flex flex-col bg-primary-BACK rounded-lg">
            <div className="w-full flex p-2 bg-primary rounded-lg items-center gap-2">
                <SearchIcon className='text-[16px] text-graph-TITLE/50' />
                <input 
                    type="text" value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder="Search logs by keyword, IP, or message content..." 
                    className="w-full bg-transparent text-[16px] text-graph-TITLE
                        placeholder:text-graph-TITLE/50 placeholder:text-[14px] placeholder:font-regular placeholder:font-space
                        outline-none focus:outline-none focus:ring-0 focus:border-none border-none"
                />
            </div>
            <div className="w-full flex flex-col gap-3">
                {/* TIME FILTER BUTTON DROPBOX */}
                <div ref={dropdownRef} className="relative inline-block w-fit">
                    {/* DROPDOWN TRIGGER BUTTON */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between w-full bg-[#262A34]/50 text-t1 text-[12px] font-inter font-bold px-4 py-3 rounded-md hover:bg-t2/20 transition-colors gap-1"
                    >
                        <CalendarIcon className='h-5 w-5 text-t3' />
                        <span className='uppercase w-28 leading-none'>{timeFilter}</span>
                        {/* Minimal SVG Chevron Arrow */}
                        <svg 
                            className={`w-3 h-3 text-t1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth="3"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {/* DROPDOWN MENU LIST */}
                    {false && (
                        <div className="absolute left-0 right-0 mt-1 bg-primary-BACK border border-t2/10 rounded-lg p-1 flex flex-col gap-1 z-50 shadow-xl">
                            {timeFilterList.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setTimeFilter(tag);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left text-[12px] text-t1 font-inter font-bold px-4 py-2 rounded-md transition-colors uppercase
                                        ${timeFilter === tag
                                            ? 'bg-[#262A34]/50 text-t3'
                                            : 'hover:bg-t2/30 hover:text-t3'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* MODERN FILTER  */}
                {/* FILTER BUTTON & APPLIE FILTER TAGS*/}
                <div className="w-full flex items-center justify-between">
                    <div className="w-fit flex gap-2 items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center justify-between w-full bg-[#262A34]/60 text-t1 text-[12px] font-inter font-bold px-4 py-3 rounded-md hover:bg-t2/20 transition-colors gap-1"
                        >
                            <CalendarIcon className='h-5 w-5 text-t3' />
                            <span className='uppercase w-20 leading-none'>Filter ({filters.length})</span>
                        </button>
                    </div>

                    <div>
                        <span className='text-graph-TITLE'>I AM TAG</span>
                    </div>
                </div>

                {/* FILTER PANEL */}
                {isOpen && (
                    <div className="w-full bg-t2/10 rounded-lg py-4 px-6 flex flex-col gap-4 border border-t2/10">
                        {/* BUILDER ROW */}
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                            <span className="text-graph-TITLE text-[12px] font-space font-bold">Where</span>

                            {/* FIELDS DROPDOWN TRIGGER BUTTON */}
                            <div className="relative gap-3 w-30">
                                <button
                                    onClick={() => setIsFieldsOpen(!isFieldsOpen)}
                                    className="flex items-center justify-between bg-[#262A34]/50 text-t1 text-[12px] font-inter font-bold px-4 py-3 rounded-md hover:bg-t2/20 transition-colors gap-1"
                                >
                                    <CalendarIcon className='h-5 w-5 text-t3' />
                                    <span className='uppercase w-28 leading-none'>{FIELDS[0]}</span>
                                    {/* Minimal SVG Chevron Arrow */}
                                    <svg 
                                        className={`w-3 h-3 text-t1 transition-transform duration-200 ${isFieldsOpen ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor" 
                                        strokeWidth="3"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>

                                {/* DROPDOWN MENU LIST */}
                                {isFieldsOpen && (
                                    <div className="w-full absolute left-0 right-0 mt-1 bg-primary-BACK border border-t2/50 rounded-lg p-1 flex flex-col gap-1 z-50 shadow-xl">
                                        {FIELDS.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    setTimeFilter(tag); //TODO: Changes needed
                                                    setIsFieldsOpen(false);
                                                }}
                                                className={`w-full text-left text-[12px] text-t1 font-inter font-bold px-4 py-2 rounded-md transition-colors uppercase
                                                    ${timeFilter === tag
                                                        ? 'bg-[#262A34]/50 text-t3'
                                                        : 'hover:bg-t2/30 hover:text-t3'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* FIELD */}
                            <div className="items-center p-2 bg-primary  rounded-lg ">
                                <select
                                    value={field}
                                    onChange={(e) => setField(e.target.value)}
                                    className="bg-primary px-4 text-sm text-t1 focus:outline-none "
                                >
                                    {FIELDS.map(f => (
                                        <option key={f} value={f} className='focus:outline-none outline-none ring-0'>{f}</option>
                                    ))}
                                </select>
                            </div>

                            {/* OPERATOR */}
                            <div className="items-center p-2 bg-primary  rounded-lg ">
                                <select
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}
                                    className="bg-primary px-4 text-sm text-t1 focus:outline-none "
                                >
                                    {OPERATORS.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                            </div>

                            {/* VALUE */}
                            <input
                                value={val}
                                onChange={(e) => setVal(e.target.value)}
                                placeholder="value"
                                className="bg-[#1f2330] px-3 py-2 rounded text-sm"
                            />

                            {/* BETWEEN */}
                            {operator === "is between" && (
                                <input
                                    value={valTo}
                                    onChange={(e) => setValTo(e.target.value)}
                                    placeholder="to"
                                    className="bg-[#1f2330] px-3 py-2 rounded text-sm"
                                />
                            )}

                            {/* ADD BUTTON */}
                            <button
                                onClick={addFilter}
                                className="p-2 bg-blue-600 rounded-full"
                            >
                                <navi.addIcon className="h-5 w-5 text-graph-TITLE" />
                            </button>
                        </div>

                        {/* ACTIVE FILTERS */}
                        <div className="flex flex-wrap gap-2">
                            {filters.map((f, i) => (
                                <div
                                    key={i}
                                    className="px-3 py-1 bg-[#262A34] rounded-full text-xs flex items-center gap-2"
                                >
                                    <span>
                                        {f.field} {f.operator} {f.value}
                                        {f.valueTo ? ` - ${f.valueTo}` : ""}
                                    </span>

                                    <button
                                        onClick={() => removeFilter(i)}
                                        className="text-red-400 ml-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* APPLY */}
                        <div className="flex justify-end">
                            <button
                                onClick={applyFilters}
                                className="px-5 py-2 bg-green-600 text-white text-sm font-space rounded-full"
                            >
                                Apply Filters
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}