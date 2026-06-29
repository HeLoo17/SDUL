import { useEffect, useRef, useState } from "react";
import type { SystemStatus } from "../../hooks/useSocket";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventKind = "success" | "warning" | "error" | "info" | "tier";

interface SystemEvent {
    id: number;
    kind: EventKind;
    title: string;
    detail?: string;
    timestamp: Date;
}

const MAX_EVENTS = 50;
let _id = 0;

// ─── Style Maps ───────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function make(kind: EventKind, title: string, detail?: string): SystemEvent {
    return { id: ++_id, kind, title, detail, timestamp: new Date() };
}

function formatTime(d: Date): string {
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ─── Timeline Row ─────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    systemStatus: SystemStatus;
    allSocketEvents: Array<{ timestamp: string; [key: string]: unknown }>;
}

export default function SystemEventLog({ systemStatus, allSocketEvents }: Props) {
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const prevTierRef            = useRef<number | null | undefined>(undefined);
    const prevErrorRef           = useRef<string | null>(null);
    const prevSocketCountRef     = useRef(0);
    const scrollRef              = useRef<HTMLDivElement>(null);

    const push = (ev: SystemEvent) => {
        setEvents(prev => {
            const next = [ev, ...prev];
            return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
        });
    };

    // Seed startup event once
    useEffect(() => {
        push(make("info", "Dashboard initialised", "Connecting to data sources…"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tier transitions
    useEffect(() => {
        const tier = systemStatus.tier;
        if (prevTierRef.current === undefined) {
            prevTierRef.current = tier;
            if (tier === 1)      push(make("success", "WebSocket connected",       "Tier 1 live push active"));
            else if (tier === 2) push(make("warning", "REST polling active",        "Tier 2 fallback — WebSocket unavailable"));
            else if (tier === 3) push(make("tier",    "InfluxDB stale data",        "Tier 3 fallback — REST also unavailable"));
            else                 push(make("error",   "No data source available",   "All tiers unreachable"));
            return;
        }
        if (tier === prevTierRef.current) return;

        if (tier === 1)      push(make("success", "WebSocket reconnected",        "Switched back to Tier 1 live push"));
        else if (tier === 2) push(make("warning", "Switched to REST polling",     "Tier 2 fallback — WebSocket lost"));
        else if (tier === 3) push(make("tier",    "Switched to InfluxDB stale",   "Tier 3 — REST also unreachable"));
        else                 push(make("error",   "Connection lost",              "All data sources unreachable"));

        prevTierRef.current = tier;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [systemStatus.tier]);

    // Collector errors
    useEffect(() => {
        const err = systemStatus.error;
        if (err && err !== prevErrorRef.current) push(make("error",   "Collector error",    err));
        if (!err && prevErrorRef.current)         push(make("success", "Collector recovered","No active errors reported"));
        prevErrorRef.current = err;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [systemStatus.error]);

    // Socket node / vm events
    useEffect(() => {
        if (allSocketEvents.length <= prevSocketCountRef.current) return;
        const newEvs = allSocketEvents.slice(0, allSocketEvents.length - prevSocketCountRef.current);
        prevSocketCountRef.current = allSocketEvents.length;

        newEvs.forEach(ev => {
            const raw = ev as Record<string, unknown>;
            if ("node" in raw) {
                const node = String(raw.node ?? "unknown");
                const curr = String(raw.curr_status ?? "?");
                const prev = String(raw.prev_status ?? "?");
                push(make(
                    curr === "online" ? "success" : "warning",
                    `Node ${node} → ${curr}`,
                    `Was ${prev}`,
                ));
            } else if ("vm" in raw) {
                const vm   = String(raw.vm   ?? "unknown");
                const curr = String(raw.curr_status ?? "?");
                const prev = String(raw.prev_status ?? "?");
                const kind: EventKind =
                    curr === "running" ? "success" :
                    curr === "error"   ? "error"   : "warning";
                push(make(kind, `VM ${vm} → ${curr}`, `Was ${prev}`));
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allSocketEvents]);

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
                    onClick={() => setEvents([make("info", "Log cleared", "Manual clear by user")])}
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