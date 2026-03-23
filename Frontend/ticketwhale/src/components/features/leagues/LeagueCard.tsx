import React from "react";
import type { LeagueCard as LeagueCardType } from "@/data/matches";

type LeagueCardProps = LeagueCardType;

const SIZE_GRID: Record<LeagueCardProps["size"], string> = {
    large: "md:col-span-2 md:row-span-2",
    medium: "md:col-span-2",
    small: "",
};

const SIZE_POSITION: Record<LeagueCardProps["size"], string> = {
    large: "bottom-8 left-8",
    medium: "bottom-6 left-6",
    small: "bottom-4 left-4",
};

const SIZE_TEXT: Record<LeagueCardProps["size"], string> = {
    large: "text-4xl",
    medium: "text-2xl",
    small: "text-xl",
};

const SIZE_OVERLAY: Record<LeagueCardProps["size"], string> = {
    large: "from-primary/90",
    medium: "from-on-surface/80",
    small: "from-on-surface/90",
};

const LeagueCard: React.FC<LeagueCardProps> = ({
    imageSrc,
    imageAlt,
    title,
    subtitle,
    size,
}) => (
    <div
        className={`${SIZE_GRID[size]} relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500`}
    >
        <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient overlay */}
        <div
            className={`absolute inset-0 bg-gradient-to-t ${SIZE_OVERLAY[size]} via-transparent to-transparent`}
        />

        {/* Label */}
        <div className={`absolute ${SIZE_POSITION[size]}`}>
            <h3 className={`${SIZE_TEXT[size]} font-black text-white italic uppercase leading-none`}>
                {title}
            </h3>
            {subtitle && (
                <span className="text-primary-fixed text-sm font-bold mt-1 inline-block">
                    {subtitle}
                </span>
            )}
        </div>
    </div>
);

export default LeagueCard;