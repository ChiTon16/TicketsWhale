import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { stadiumApi, type StadiumDto } from "@/api/stadium.api";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const StadiumCardSkeleton: React.FC = () => (
    <div className="rounded-2xl overflow-hidden bg-surface-container-lowest animate-pulse">
        <div className="aspect-[16/10] bg-surface-container-high" />
        <div className="p-5 space-y-3">
            <div className="h-5 w-2/3 rounded bg-surface-container-high" />
            <div className="h-4 w-1/2 rounded bg-surface-container-high" />
            <div className="flex gap-2 pt-1">
                <div className="h-6 w-24 rounded-full bg-surface-container-high" />
                <div className="h-6 w-16 rounded-full bg-surface-container-high" />
            </div>
        </div>
    </div>
);

// ─── Stadium Card ─────────────────────────────────────────────────────────────

const FALLBACK_IMAGE = "https://nguoinoitieng.tv/images/nnt/106/0/bi3n.jpg";

const StadiumCard: React.FC<{ stadium: StadiumDto; onClick: () => void }> = ({ stadium, onClick }) => (
    <div
        onClick={onClick}
        className="group relative rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/50 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 cursor-pointer">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
            <img
                src={stadium.imageUrl || FALLBACK_IMAGE}
                alt={stadium.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />

            {/* Capacity badge */}
            <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                    <MaterialIcon name="group" className="text-sm" />
                    {stadium.capacity.toLocaleString()}
                </span>
            </div>

            {/* Bottom overlay text */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-black text-lg leading-tight tracking-tight">
                    {stadium.name}
                </h3>
                <p className="text-white/70 text-sm font-medium flex items-center gap-1 mt-0.5">
                    <MaterialIcon name="sports_soccer" className="text-sm" />
                    {stadium.team}
                </p>
            </div>
        </div>

        {/* Body */}
        <div className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                    <MaterialIcon name="location_on" className="text-primary text-base" />
                    {stadium.city}, {stadium.location}
                </div>
                <span className="text-outline text-xs font-bold">Est. {stadium.yearOpened}</span>
            </div>
        </div>
    </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const StadiumsPage: React.FC = () => {
    const navigate = useNavigate();
    const [stadiums, setStadiums] = useState<StadiumDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true); setError(null);
            try {
                const data = await stadiumApi.getAll();
                if (!cancelled) setStadiums(data);
            } catch {
                if (!cancelled) setError("Không thể tải danh sách sân vận động");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return stadiums;
        return stadiums.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.team.toLowerCase().includes(q) ||
                s.city.toLowerCase().includes(q)
        );
    }, [stadiums, search]);

    return (
        <div className="bg-background text-on-surface min-h-screen">
            <Navbar />

            <main className="pt-20">

                {/* ── Hero ── */}
                <section className="relative h-[420px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-transparent to-transparent z-10" />
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHFh28gLiYj1ej0PYxWoEWAGpyQkrWu0WWlG1p9ynl7FaankUGnHY0GS3c9KaZNbtDglKzCsEDOyrhu7L2KXM-h6YMxOya8hYcP4huFDdK2SaOHab40hRiF_nJ53vpB2I8Wwlza4HW2wKTWm7Ru3zP4QFtLxgHaPo7wdPG5Lg4I2cMtFwNPquK8YuNLIdpSmxAjRcKzlaiiwzabzRnkaZHTItyYFR5YEX8M7w1EuPoeGj_p-d2BYhjHKMqJ_hmn7WZR6TUojpXqg"
                            alt="Stadium"
                            className="w-full h-full object-cover opacity-50"
                        />
                    </div>
                    <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
                        <span className="uppercase tracking-[0.3em] text-primary font-bold mb-4 block text-xs">
                            Premier League Venues
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface mb-6 italic">
                            THE ARENAS OF GLORY
                        </h1>
                        <p className="text-on-surface-variant text-lg font-medium max-w-xl mx-auto">
                            All 20 Premier League stadiums — from historic cathedrals to modern engineering marvels.
                        </p>
                    </div>
                </section>

                {/* ── Search ── */}
                <section className="max-w-7xl mx-auto px-8 py-10">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                        <div>
                            <p className="text-on-surface-variant text-sm font-medium">
                                {isLoading ? "Loading..." : `${filtered.length} stadiums`}
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-white">
                                All Stadiums
                            </h2>
                        </div>

                        {/* Search bar */}
                        <div className="relative w-full md:w-80">
                            <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by team, stadium or city..."
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-12 pr-10 py-3 text-white placeholder:text-outline outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-white transition-colors"
                                >
                                    <MaterialIcon name="close" className="text-base" />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Grid ── */}
                <section className="max-w-7xl mx-auto px-8 pb-24">
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                            <MaterialIcon name="error_outline" className="text-5xl text-error/50" />
                            <p className="text-on-surface-variant font-medium">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 text-primary font-bold hover:underline"
                            >
                                <MaterialIcon name="refresh" className="text-sm" />Thử lại
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => <StadiumCardSkeleton key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                            <MaterialIcon name="search_off" className="text-6xl text-on-surface-variant/40" />
                            <p className="text-on-surface-variant font-medium">No stadiums found.</p>
                            <button
                                onClick={() => setSearch("")}
                                className="text-primary font-bold hover:underline text-sm"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((s) => (
                                <StadiumCard
                                    key={s.name}
                                    stadium={s}
                                    onClick={() => navigate(`/stadiums/${encodeURIComponent(s.name)}`)}
                                />
                            ))}
                        </div>
                    )}
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default StadiumsPage;