import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useMatches } from "@/hooks/useMatches";
import type { Match, MatchStatus } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMatchDate(iso: string) {
    const d = new Date(iso);
    return {
        date: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
}

const STATUS_BADGE: Partial<Record<MatchStatus, { label: string; className: string }>> = {
    ONGOING: { label: "Đang diễn ra", className: "bg-error text-white" },
    SCHEDULED: { label: "Sắp diễn ra", className: "bg-primary text-white" },
    FINISHED: { label: "Đã kết thúc", className: "bg-surface-container-highest text-on-surface" },
    CANCELLED: { label: "Đã huỷ", className: "bg-surface-container-highest text-on-surface" },
};

type SortKey = "upcoming" | "name";
const PAGE_SIZE = 6;

const STADIUM_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCvs59Vss1jJwfJi9akJr5P_L5hDAgRtKrfFjGT-8AKnXrvRhvVpPAAOhHwa0NMpjhmWxtnSURTsD3GkS0hkdEP4iHmr6oqDrXRrMadI2EmjNPDYtAJ12qEpa9c-L3O8DC03B-CAelHXY8wqGNYgH5XC7DDN32fR65uCxFf8FNo7Mtp0ITIixTigewUWfg2P9CxfjrjS1i_BiWFQ-V9khTp7OvLBsyDvzCw_LsQsTdIzFWuxPONl6lOXLj_J4-jUc1pnbyMlsd65g",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCPNalSzmGcOy6mdTXKJ-KdNkVnbclviAhpNNkIHOwoTGbkj4_pJayYPqe4bnniUMdYAAPnwRBgexpL3mclzp24p6LTdTCzNN-k3pyqdfAtx6WnHxqrzl2gSOFx1vMj-9XZSwuL3hu9-4Dw0WKv_HNJ16OQZFeIhZLNAB4UQR8Vxemhdrm9b21-_kPwpjym0lmIBqNuyuAb6IUfyMLwYeY5f08Tlj2xxQPMQPhUkU19BmQuJ-Tqy3kWGpsFSFlZsGa1imfmmsF2UA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA5TmhJ96SOvfPBjibsgVGN4GT2tRFxRD05hN24cFdPYjGaTpK8kCtB3lEcAZBCFh36MbVw0Hr4VM_CoGwI6KT0tafRRvb0rsfQHToiVo7EdjjPliVIlS6d-60rnK_yOX2SCypcFgN5F50XHGkvBuc__x_2YJC0t-dGwLHzLV7yVmWuRt5-lph1xZvbI6wMIMIk8eKqrB8q-A_I5ELARLesY2C5r8cbvABu2j74G6XzythiPW90NR76jXl5ga5101FeMqnBte3Fng",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAqAelmdY4w4hKjyQUA08_-n09QhRtTxRyGs5ALrRbXVOCZQKAv7rDaRZfe66mHoIcJXahSSmjHMpx4ZuPnGx7eX2pxPbfLiUJ2yHyf3UE2WdpgmZDHfIKNjkf70Kxyvnpl48R59P9FJSLXeWP6_s7hOwwMzEn2VzAF4ShXZFioYLkLktrXBT1SmIyPIrLaIaGt0w5bL0cxhveAUI4CXvqcjhrNg9SNC733acj3jI80KfzJyRZZfirRmDJUbpRmekgMu76lqqVOEg",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const MatchCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl overflow-hidden border border-outline-variant animate-pulse">
        <div className="h-48 bg-surface-container-high" />
        <div className="p-6 space-y-4">
            <div className="h-5 w-3/4 rounded bg-surface-container-high" />
            <div className="h-4 w-1/2 rounded bg-surface-container-high" />
            <div className="h-px bg-surface-container-high" />
            <div className="flex justify-end">
                <div className="h-10 w-28 rounded-lg bg-surface-container-high" />
            </div>
        </div>
    </div>
);

// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
    match: Match;
    imgIndex: number;
    onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, imgIndex, onClick }) => {
    const { date, time } = formatMatchDate(match.matchTime);
    const badge = STATUS_BADGE[match.status];
    const isDisabled = match.status === "FINISHED" || match.status === "CANCELLED";
    const imgSrc = STADIUM_IMAGES[imgIndex % STADIUM_IMAGES.length];

    return (
        <div className="bg-white rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-outline-variant">

            {/* Image */}
            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={onClick}>
                <img src={imgSrc} alt={`${match.homeTeam} vs ${match.awayTeam}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {badge && (
                    <div className="absolute top-4 left-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${badge.className}`}>
                            {badge.label}
                        </span>
                    </div>
                )}

                {match.matchday && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                            <MaterialIcon name="sports_soccer" className="text-white text-sm" />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">
                            Vòng {match.matchday}
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={onClick}>
                    {match.homeCrest && <img src={match.homeCrest} alt={match.homeTeam} className="w-7 h-7 object-contain" />}
                    <h3 className="text-lg font-extrabold text-on-surface group-hover:text-primary transition-colors leading-tight">
                        {match.homeTeam} vs {match.awayTeam}
                    </h3>
                    {match.awayCrest && <img src={match.awayCrest} alt={match.awayTeam} className="w-7 h-7 object-contain ml-auto" />}
                </div>

                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                    <MaterialIcon name="calendar_today" className="text-sm" />
                    <span>{date} · {time}</span>
                </div>

                <div className="flex items-center gap-2 py-4 border-y border-outline-variant mb-5">
                    <MaterialIcon name="location_on" className="text-primary text-lg" />
                    <span className="text-xs font-bold uppercase text-on-surface-variant">
                        {match.stadiumName ?? "Chưa có địa điểm"}
                    </span>
                </div>

                <div className="flex justify-end">
                    <button onClick={onClick} disabled={isDisabled}
                        className="bg-primary text-on-primary font-black px-6 py-3 rounded-lg active:scale-95 transition-transform tracking-tight text-sm hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none">
                        XEM VÉ
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
    current: number;
    total: number;
    onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ current, total, onChange }) => {
    if (total <= 1) return null;

    // Build page numbers: always show first, last, current±1, ellipsis
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-10">
            {/* Prev */}
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
                <MaterialIcon name="chevron_left" className="text-base" />
            </button>

            {/* Pages */}
            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-on-surface-variant text-sm">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${p === current
                                ? "bg-primary text-on-primary shadow-md"
                                : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                            }`}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
                <MaterialIcon name="chevron_right" className="text-base" />
            </button>
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const MatchesPage: React.FC = () => {
    const navigate = useNavigate();
    const { matches, isLoading, error, refetch } = useMatches();

    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("upcoming");
    const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");
    const [page, setPage] = useState(1);

    // Reset page khi filter/search thay đổi
    const handleSearch = (v: string) => { setSearch(v); setPage(1); };
    const handleDate = (d: "all" | "today" | "week") => { setDateFilter(d); setPage(1); };
    const handleSort = (s: SortKey) => { setSortKey(s); setPage(1); };

    // Filter + sort
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        const now = new Date();
        const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
        const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + 7);

        return matches
            .filter((m) => {
                if (q && !m.homeTeam.toLowerCase().includes(q) &&
                    !m.awayTeam.toLowerCase().includes(q) &&
                    !(m.stadiumName ?? "").toLowerCase().includes(q)) return false;

                if (dateFilter === "today") {
                    const d = new Date(m.matchTime);
                    return d >= now && d <= endOfDay;
                }
                if (dateFilter === "week") {
                    const d = new Date(m.matchTime);
                    return d >= now && d <= endOfWeek;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortKey === "upcoming") return new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime();
                return a.homeTeam.localeCompare(b.homeTeam);
            });
    }, [matches, search, sortKey, dateFilter]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handlePageChange = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <Navbar />

            {/* Hero */}
            <header className="relative w-full py-20 px-8 overflow-hidden bg-surface-container-low border-b border-outline-variant">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#6082B6,transparent_50%)]" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="h-px w-8 bg-primary" />
                        <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Live Experiences</span>
                        <span className="h-px w-8 bg-primary" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 italic text-on-surface">
                        TẤT CẢ TRẬN ĐẤU
                    </h1>

                    {/* Search — outline-none xoá viền đen khi focus */}
                    <div className="w-full max-w-2xl bg-white rounded-xl p-2 flex items-center shadow-xl border border-outline-variant focus-within:border-primary transition-colors">
                        <MaterialIcon name="search" className="px-4 text-primary" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Tìm theo đội bóng, sân vận động..."
                            className="bg-transparent flex-grow text-base py-4 outline-none border-none ring-0 focus:ring-0 placeholder:text-on-surface-variant/40"
                        />
                        {search && (
                            <button onClick={() => handleSearch("")}
                                className="pr-4 text-on-surface-variant hover:text-primary transition-colors">
                                <MaterialIcon name="close" className="text-base" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-8 py-12 flex flex-col lg:flex-row gap-12">

                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Ngày thi đấu</h3>
                        <div className="flex flex-wrap lg:flex-col gap-2">
                            {(["all", "today", "week"] as const).map((d) => (
                                <button key={d} onClick={() => handleDate(d)}
                                    className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all text-left ${dateFilter === d
                                            ? "bg-primary text-on-primary border-primary"
                                            : "bg-surface-container border-outline-variant text-on-surface hover:bg-primary hover:text-white hover:border-primary"
                                        }`}>
                                    {d === "all" ? "TẤT CẢ" : d === "today" ? "HÔM NAY" : "TUẦN NÀY"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Chú thích</h3>
                        <div className="space-y-3">
                            {Object.entries(STATUS_BADGE).map(([, v]) => v && (
                                <div key={v.label} className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${v.className}`}>
                                        {v.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Match grid */}
                <section className="flex-grow">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="text-primary font-bold text-sm">
                                {isLoading ? "Đang tải..." : `${filtered.length} trận đấu`}
                            </span>
                            <h2 className="text-3xl font-bold tracking-tight text-on-surface">DANH SÁCH TRẬN ĐẤU</h2>
                        </div>

                        <select value={sortKey} onChange={(e) => handleSort(e.target.value as SortKey)}
                            className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-full border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:text-primary transition-colors">
                            <option value="upcoming">SẮP DIỄN RA</option>
                            <option value="name">TÊN ĐỘI</option>
                        </select>
                    </div>

                    {error ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                            <MaterialIcon name="error_outline" className="text-5xl text-error/50" />
                            <p className="text-on-surface-variant font-medium">{error}</p>
                            <button onClick={refetch} className="flex items-center gap-2 text-primary font-bold hover:underline">
                                <MaterialIcon name="refresh" className="text-sm" />Thử lại
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array.from({ length: PAGE_SIZE }).map((_, i) => <MatchCardSkeleton key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                            <MaterialIcon name="search_off" className="text-5xl text-on-surface-variant/30" />
                            <p className="text-on-surface-variant font-medium">Không tìm thấy trận đấu nào.</p>
                            <button onClick={() => { handleSearch(""); handleDate("all"); }}
                                className="text-primary font-bold hover:underline text-sm">
                                Xoá bộ lọc
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {paginated.map((match, i) => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        imgIndex={(safePage - 1) * PAGE_SIZE + i}
                                        onClick={() => navigate(`/matches/${match.id}`)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                current={safePage}
                                total={totalPages}
                                onChange={handlePageChange}
                            />

                            {/* Page info */}
                            <p className="text-center text-xs text-on-surface-variant mt-4">
                                Trang {safePage}/{totalPages} · {filtered.length} trận đấu
                            </p>
                        </>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default MatchesPage;