import React from "react";
import { useNavigate } from "react-router-dom";
import MatchCard from "@/components/features/matches/MatchCard";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useMatches } from "@/hooks/useMatches";

const MatchCardSkeleton: React.FC = () => (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden animate-pulse">
        <div className="h-48 bg-surface-container-high" />
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high" />
                    <div className="h-2 w-14 rounded bg-surface-container-high" />
                </div>
                <div className="h-6 w-10 rounded bg-surface-container-high" />
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high" />
                    <div className="h-2 w-14 rounded bg-surface-container-high" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-3 w-3/4 rounded bg-surface-container-high" />
                <div className="h-3 w-1/2 rounded bg-surface-container-high" />
            </div>
            <div className="h-11 rounded-lg bg-surface-container-high" />
        </div>
    </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="col-span-3 flex flex-col items-center justify-center py-16 gap-4 text-center">
        <MaterialIcon name="error_outline" className="text-5xl text-error/60" />
        <p className="text-on-surface-variant font-medium">{message}</p>
        <button onClick={onRetry} className="flex items-center gap-2 text-primary font-bold hover:underline">
            <MaterialIcon name="refresh" className="text-sm" />Thử lại
        </button>
    </div>
);

const FEATURED_COUNT = 3;

const FeaturedMatchesSection: React.FC = () => {
    const navigate = useNavigate();

    // Lấy tất cả rồi lọc + sort tại client
    const { matches: allMatches, isLoading, error, refetch } = useMatches();

    // Chỉ hiện SCHEDULED hoặc ONGOING, sắp xếp theo thời gian gần nhất, lấy 3
    const matches = allMatches
        .filter((m) => m.status === "SCHEDULED" || m.status === "ONGOING")
        .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
        .slice(0, FEATURED_COUNT);

    return (
        <section className="py-20 max-w-7xl mx-auto px-8">

            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-on-surface uppercase italic">
                        Trận Đấu Nổi Bật
                    </h2>
                    <p className="text-on-surface-variant mt-2 font-medium">
                        Đừng bỏ lỡ những khoảnh khắc lịch sử trên sân cỏ.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/matches")}
                    className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all group"
                >
                    Xem tất cả
                    <MaterialIcon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: FEATURED_COUNT }).map((_, i) => <MatchCardSkeleton key={i} />)
                ) : error ? (
                    <ErrorState message={error} onRetry={refetch} />
                ) : matches.length === 0 ? (
                    <div className="col-span-3 text-center py-16 text-on-surface-variant font-medium">
                        Hiện chưa có trận đấu nào sắp diễn ra.
                    </div>
                ) : (
                    matches.map((match) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            onClick={() => navigate(`/matches/${match.id}`)}
                        />
                    ))
                )}
            </div>

        </section>
    );
};

export default FeaturedMatchesSection;