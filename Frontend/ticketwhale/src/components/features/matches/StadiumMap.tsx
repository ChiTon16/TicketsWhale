import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StandKey = "NORTH" | "SOUTH" | "EAST" | "WEST";

interface StandConfig {
    key: StandKey;
    label: string;
    /** SVG <path> d attribute */
    d: string;
    /** Label position */
    textX: number;
    textY: number;
    textRotate?: string;
}

interface StadiumMapProps {
    activeStand: StandKey | null;
    onStandClick: (stand: StandKey) => void;
}

// ─── Stand Definitions ────────────────────────────────────────────────────────

const STANDS: StandConfig[] = [
    {
        key: "NORTH",
        label: "NORTH STAND",
        d: "M200 50 L600 50 L630 130 L170 130 Z",
        textX: 400,
        textY: 100,
    },
    {
        key: "SOUTH",
        label: "SOUTH STAND",
        d: "M170 370 L630 370 L600 450 L200 450 Z",
        textX: 400,
        textY: 420,
    },
    {
        key: "WEST",
        label: "WEST STAND",
        d: "M50 100 L150 135 L150 365 L50 400 Z",
        textX: 100,
        textY: 255,
        textRotate: "rotate(-90, 100, 255)",
    },
    {
        key: "EAST",
        label: "EAST STAND",
        d: "M650 135 L750 100 L750 400 L650 365 Z",
        textX: 700,
        textY: 255,
        textRotate: "rotate(90, 700, 255)",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

const StadiumMap: React.FC<StadiumMapProps> = ({ activeStand, onStandClick }) => (
    <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="mb-8 text-center">
            <h2 className="font-headline text-2xl font-black text-on-surface-variant/40 italic uppercase tracking-widest">
                Interactive Stadium Overview
            </h2>
            <p className="text-sm font-medium text-on-surface-variant">
                Tap a stand to filter results
            </p>
        </div>

        {/* SVG */}
        <svg
            viewBox="0 0 800 500"
            className="w-full h-auto drop-shadow-2xl"
        >
            {/* ── Pitch ── */}
            <rect x={250} y={150} width={300} height={200} rx={4} fill="#00694d" />
            <rect
                x={260} y={160} width={280} height={180}
                fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2}
            />
            <circle cx={400} cy={250} r={30} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
            <line x1={400} y1={160} x2={400} y2={340} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />

            {/* ── Stands ── */}
            {STANDS.map((stand) => {
                const isActive = activeStand === stand.key;
                return (
                    <g
                        key={stand.key}
                        onClick={() => onStandClick(stand.key)}
                        className="cursor-pointer"
                    >
                        <path
                            d={stand.d}
                            fill={isActive ? "#6082B6" : "#e2e2e5"}
                            stroke={isActive ? "#ffffff" : "none"}
                            strokeWidth={isActive ? 2 : 0}
                            style={{ transition: "fill 0.2s ease" }}
                        />
                        <text
                            x={stand.textX}
                            y={stand.textY}
                            textAnchor="middle"
                            fontFamily="Plus Jakarta Sans"
                            fontSize={14}
                            fontWeight={800}
                            fill={isActive ? "#ffffff" : "#404b58"}
                            transform={stand.textRotate}
                            style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                            {stand.label}
                        </text>
                    </g>
                );
            })}
        </svg>

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {[
                { color: "bg-primary", label: "Your Selection" },
                { color: "bg-surface-container-highest", label: "Available" },
                { color: "bg-surface-dim opacity-30", label: "Sold Out" },
            ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span>{label}</span>
                </div>
            ))}
        </div>
    </div>
);

export default StadiumMap;
export type { StadiumMapProps };