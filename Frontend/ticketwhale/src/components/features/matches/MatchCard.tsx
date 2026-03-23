import React from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import type { Match, MatchStatus } from "@/types";
import { formatMatchShortVN } from "@/utils/DateUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format ISO datetime UTC → UTC+7 "HH:mm · DD/MM" */
function formatMatchTime(iso: string): { time: string; date: string } {
    return formatMatchShortVN(iso);
}

/** Map MatchStatus → badge config */
const STATUS_BADGE: Partial<Record<MatchStatus, { label: string; className: string }>> = {
    ONGOING: {
        label: "LIVE",
        className: "bg-tertiary text-on-tertiary",
    },
    SCHEDULED: {
        label: "Sắp diễn ra",
        className: "bg-primary-container text-on-primary-container",
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface MatchCardProps {
    match: Match;
    /** Optional cover image for the card (API không cung cấp, truyền từ ngoài) */
    imageSrc?: string;
    imageAlt?: string;
    /** Optional starting price text, e.g. "Từ 150.000đ" */
    priceLabel?: string;
    onClick?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
    match,
    imageSrc,
    imageAlt,
    priceLabel,
    onClick,
}) => {
    const { time, date } = formatMatchTime(match.matchTime);
    const badge = STATUS_BADGE[match.status];

    return (
        <div
            onClick={onClick}
            className={`group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${onClick ? "cursor-pointer" : ""}`}
        >

            {/* ── Image ── */}
            <div className="h-48 overflow-hidden relative bg-surface-container-high">
                {!imageSrc && (
                    <img
                        src="https://nguoinoitieng.tv/images/nnt/106/0/bi3n.jpg"
                        alt={imageAlt ?? `${match.homeTeam} vs ${match.awayTeam}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                )}

                {badge && (
                    <div className="absolute top-4 left-4">
                        <span className={`${badge.className} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5`}>
                            {match.status === "ONGOING" && (
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                            {badge.label}
                        </span>
                    </div>
                )}

                {match.status === "CANCELLED" && (
                    <div className="absolute inset-0 bg-on-surface/60 flex items-center justify-center">
                        <span className="text-white font-black text-lg uppercase tracking-widest">Đã huỷ</span>
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="p-6">

                {/* Teams */}
                <div className="flex justify-between items-center mb-6">
                    <TeamLabel name={match.homeTeam} crest={match.homeCrest} />

                    <div className="text-center px-2">
                        <span className="text-2xl font-black text-on-surface italic">VS</span>
                        <p className="text-[10px] font-medium text-outline whitespace-nowrap">
                            {time} · {date}
                        </p>
                    </div>

                    <TeamLabel name={match.awayTeam} crest={match.awayCrest} align="end" />
                </div>

                {/* Meta */}
                <div className="space-y-3 mb-6">
                    {match.stadiumName && (
                        <div className="flex items-center gap-2 text-on-surface-variant">
                            <MaterialIcon name="stadium" className="text-sm" />
                            <span className="text-sm font-medium">{match.stadiumName}</span>
                        </div>
                    )}
                    {match.matchday && (
                        <div className="flex items-center gap-2 text-on-surface-variant">
                            <MaterialIcon name="sports_soccer" className="text-sm" />
                            <span className="text-sm font-medium">Vòng {match.matchday}</span>
                        </div>
                    )}
                    {priceLabel && (
                        <div className="flex items-center gap-2 text-on-surface-variant">
                            <MaterialIcon name="confirmation_number" className="text-sm" />
                            <span className="text-sm font-medium">{priceLabel}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                    disabled={match.status === "CANCELLED" || match.status === "FINISHED"}
                    className="w-full bg-surface-container-highest text-primary font-bold py-3 rounded-lg hover:bg-primary hover:text-on-primary transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

// ─── Private sub-component ────────────────────────────────────────────────────

interface TeamLabelProps {
    name: string;
    crest: string | null;
    align?: "start" | "end";
}

const TeamLabel: React.FC<TeamLabelProps> = ({ name, crest, align = "start" }) => (
    <div className={`flex flex-col items-center gap-2 flex-1 ${align === "end" ? "items-end" : "items-start"} items-center`}>
        <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center border border-outline-variant/30 overflow-hidden">
            {crest
                ? <img src={crest} alt={name} className="w-8 h-8 object-contain" />
                : <MaterialIcon name="sports_soccer" className="text-primary" />
            }
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center leading-tight">
            {name}
        </span>
    </div>
);

export default MatchCard;