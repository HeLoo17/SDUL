import { useEffect, useRef, useState } from "react";
import type { EventKind, SystemEvent } from "../../hooks/useChartData";

const MAX_EVENTS = 50;

// Style Maps 
const KIND_STYLES: Record<EventKind, {
    dot: string;
    dotGlow: string;
    cardBorder: string;
    cardBg: string;
    titleColor: string;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    icon: string;
}> = {
    success: {
        dot:         "#4ADE80",
        dotGlow:     "rgba(74,222,128,0.35)",
        cardBorder:  "rgba(74,222,128,0.20)",
        cardBg:      "rgba(74,222,128,0.04)",
        titleColor:  "#4ADE80",
        iconBg:      "#1E2A24",
        iconColor:   "#4ADE80",
        iconBorder:  "rgba(74,222,128,0.30)",
        icon:        "✓",
    },
    warning: {
        dot:         "#FDBA74",
        dotGlow:     "rgba(253,186,116,0.35)",
        cardBorder:  "rgba(253,186,116,0.20)",
        cardBg:      "rgba(253,186,116,0.04)",
        titleColor:  "#FDBA74",
        iconBg:      "#3B2A1A",
        iconColor:   "#FDBA74",
        iconBorder:  "rgba(253,186,116,0.30)",
        icon:        "⚠",
    },
    error: {
        dot:         "#FFB4AB",
        dotGlow:     "rgba(255,180,171,0.35)",
        cardBorder:  "rgba(255,180,171,0.20)",
        cardBg:      "rgba(255,180,171,0.04)",
        titleColor:  "#FFB4AB",
        iconBg:      "#2D1414",
        iconColor:   "#FFB4AB",
        iconBorder:  "rgba(255,180,171,0.30)",
        icon:        "✕",
    },
    info: {
        dot:         "#A9C7FF",
        dotGlow:     "rgba(169,199,255,0.30)",
        cardBorder:  "rgba(169,199,255,0.15)",
        cardBg:      "rgba(169,199,255,0.03)",
        titleColor:  "#A9C7FF",
        iconBg:      "#1A2340",
        iconColor:   "#A9C7FF",
        iconBorder:  "rgba(169,199,255,0.25)",
        icon:        "i",
    },
    tier: {
        dot:         "#8B90A1",
        dotGlow:     "rgba(139,144,161,0.25)",
        cardBorder:  "rgba(139,144,161,0.15)",
        cardBg:      "rgba(139,144,161,0.03)",
        titleColor:  "#C1C6D7",
        iconBg:      "#252830",
        iconColor:   "#8B90A1",
        iconBorder:  "rgba(139,144,161,0.25)",
        icon:        "⇄",
    },
};

//  Helpers 
function formatTime(d: Date): string {
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

//  Timeline Row 

function TimelineRow({ ev }: { ev: SystemEvent; isFirst: boolean }) {
    const s = KIND_STYLES[ev.kind];
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 20);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className="flex items-start gap-0"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(-6px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
        >
            {/* LEFT: timestamp */}
            <div className="w-[72px] flex-shrink-0 flex justify-end pr-4 pt-[3px]">
                <span className="text-[11px] font-mono text-t2 select-none whitespace-nowrap">
                    {formatTime(ev.timestamp)}
                </span>
            </div>

            {/* CENTER: dot + vertical line */}
            <div className="relative flex flex-col items-center flex-shrink-0" style={{ width: "20px" }}>
                {/* dot */}
                <div
                    className="relative z-10 rounded-full flex-shrink-0"
                    style={{
                        width:  "10px",
                        height: "10px",
                        marginTop: "5px",
                        background: s.dot,
                        boxShadow: `0 0 0 3px ${s.dotGlow}`,
                    }}
                />
                {/* line segment below dot — always rendered, hidden for last item via parent */}
                <div
                    className="flex-1 w-px"
                    style={{
                        background: "rgba(65,71,85,0.40)",
                        minHeight: "32px",
                    }}
                />
            </div>

            {/* RIGHT: card */}
            <div className="flex-1 pl-4 pb-5">
                <div
                    className="rounded-lg px-4 py-3 flex items-start gap-3"
                    style={{
                        background:  s.cardBg,
                        border:      `1px solid ${s.cardBorder}`,
                        borderLeft:  `3px solid ${s.dot}`,
                    }}
                >
                    {/* icon badge */}
                    <div
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                        style={{
                            background:  s.iconBg,
                            color:       s.iconColor,
                            border:      `1px solid ${s.iconBorder}`,
                        }}
                    >
                        {s.icon}
                    </div>

                    {/* text */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span
                            className="text-[12px] font-inter font-semibold leading-tight"
                            style={{ color: s.titleColor }}
                        >
                            {ev.title}
                        </span>
                        {ev.detail && (
                            <span className="text-[11px] font-inter text-t1 leading-snug">
                                {ev.detail}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Log Returns 

interface Props {
    events: SystemEvent[];
    onClear: () => void;
}

export default function SystemEventLog({ events, onClear }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to top only if user hasn't scrolled away to read old logs
    useEffect(() => {
        const el = scrollRef.current;
        if (el && el.scrollTop < 80) {
            el.scrollTop = 0;
        }
    }, [events]);

    return (
        <div className="w-full flex flex-col">
            {/* Count label */}
            <div className="flex items-center justify-between px-1 pb-3">
                <p className="text-[10px] font-inter text-t2 uppercase tracking-wider">
                    Last {MAX_EVENTS} · {events.length} recorded
                </p>
                <button
                    onClick={onClear}
                    className="text-[10px] font-inter text-t2 hover:text-t1 uppercase tracking-widest transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Timeline — hidden scrollbar */}
            <style>{`
                .event-scroll::-webkit-scrollbar { display: none; }
                .event-scroll { scrollbar-width: none; -ms-overflow-style: none; }
            `}</style>
            <div
                ref={scrollRef}
                className="event-scroll overflow-y-auto"
                style={{ maxHeight: "640px" }}
            >
                {events.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="text-[11px] text-t2 font-inter uppercase tracking-widest animate-pulse">
                            Awaiting events…
                        </span>
                    </div>
                ) : (
                    <div className="relative">
                        {events.map((ev, i) => (
                            <TimelineRow key={ev.id} ev={ev} isFirst={i === 0} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}