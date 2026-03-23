import React from "react";
import LeagueCard from "@/components/features/leagues/LeagueCard";
import { LEAGUES } from "@/data/matches";

const LeaguesSection: React.FC = () => (
    <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">

            <h2 className="text-4xl font-black tracking-tight text-on-surface uppercase italic mb-12">
                Giải đấu hàng đầu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[600px]">
                {LEAGUES.map((league, i) => (
                    <LeagueCard key={i} {...league} />
                ))}
            </div>

        </div>
    </section>
);

export default LeaguesSection;