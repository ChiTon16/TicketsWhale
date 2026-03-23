import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { newsApi, type NewsArticle } from "@/api/news.api";

const FALLBACK_IMAGE = "https://nguoinoitieng.tv/images/nnt/106/0/bi3n.jpg";
const PAGE_SIZE = 6;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const NewsCardSkeleton: React.FC = () => (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
        <div className="h-48 bg-surface-container-high" />
        <div className="p-6 space-y-3">
            <div className="h-3 w-20 rounded bg-surface-container-high" />
            <div className="h-5 w-full rounded bg-surface-container-high" />
            <div className="h-5 w-3/4 rounded bg-surface-container-high" />
            <div className="h-3 w-full rounded bg-surface-container-high" />
            <div className="h-3 w-2/3 rounded bg-surface-container-high" />
        </div>
    </div>
);

const FeaturedSkeleton: React.FC = () => (
    <div className="h-[500px] rounded-3xl bg-surface-container-high animate-pulse mb-16" />
);

// ─── News Card ────────────────────────────────────────────────────────────────

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <article
        onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
    >
        <div className="relative h-48 overflow-hidden shrink-0">
            <img
                src={article.imageUrl || FALLBACK_IMAGE}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
            <div className="absolute top-4 left-4">
                <span className="bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                    {article.source}
                </span>
            </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 font-medium">
                <MaterialIcon name="schedule" className="text-sm" />
                {article.publishedAt}
            </div>

            <h3 className="text-base font-bold mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2 flex-1">
                {article.title}
            </h3>

            {article.description && (
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 font-light">
                    {article.description}
                </p>
            )}

            <div className="flex items-center gap-1 text-primary font-bold text-sm mt-auto group-hover:gap-2 transition-all">
                Read More
                <MaterialIcon name="arrow_right_alt" className="text-sm group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </article>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const NewsPage: React.FC = () => {
    const navigate = useNavigate();

    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [email, setEmail] = useState("");

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true); setError(null);
            try {
                const data = await newsApi.getAll();
                if (!cancelled) setArticles(data);
            } catch {
                if (!cancelled) setError("Không thể tải tin tức");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const featured = articles[0] ?? null;
    const rest = articles.slice(1);
    const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
    const paginated = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const trending = useMemo(() => articles.slice(0, 3), [articles]);

    const handlePageChange = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="bg-background text-on-surface min-h-screen">
            <Navbar />

            <main className="pt-24 pb-20 max-w-7xl mx-auto px-8">

                {/* ── Featured ── */}
                {isLoading ? <FeaturedSkeleton /> : featured && (
                    <section className="mb-16">
                        <div
                            onClick={() => window.open(featured.url, "_blank", "noopener,noreferrer")}
                            className="relative w-full h-[500px] rounded-3xl overflow-hidden group shadow-xl cursor-pointer"
                        >
                            <img
                                src={featured.imageUrl || FALLBACK_IMAGE}
                                alt={featured.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-10 md:p-14 max-w-4xl">
                                <span className="inline-block bg-white/20 backdrop-blur-md text-white font-bold text-xs tracking-widest uppercase px-3 py-1 rounded-full mb-5 border border-white/30">
                                    {featured.source}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-4 leading-tight text-white italic line-clamp-3">
                                    {featured.title}
                                </h1>
                                {featured.description && (
                                    <p className="text-white/80 text-base mb-6 leading-relaxed max-w-2xl font-light line-clamp-2">
                                        {featured.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-white/60 text-xs mb-6">
                                    <MaterialIcon name="schedule" className="text-sm" />
                                    {featured.publishedAt}
                                </div>
                                <button className="bg-primary hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95">
                                    Read Full Story
                                    <MaterialIcon name="arrow_forward" />
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Main + Sidebar ── */}
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* ── News feed ── */}
                    <div className="lg:w-2/3 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-extrabold tracking-tight italic text-on-surface">
                                Latest News
                            </h2>
                            {!isLoading && (
                                <span className="text-sm text-on-surface-variant font-medium">
                                    {rest.length} articles
                                </span>
                            )}
                        </div>

                        {/* Error */}
                        {error ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                                <MaterialIcon name="error_outline" className="text-5xl text-error/50" />
                                <p className="text-on-surface-variant font-medium">{error}</p>
                                <button onClick={() => window.location.reload()}
                                    className="flex items-center gap-2 text-primary font-bold hover:underline">
                                    <MaterialIcon name="refresh" className="text-sm" />Thử lại
                                </button>
                            </div>
                        ) : isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: PAGE_SIZE }).map((_, i) => <NewsCardSkeleton key={i} />)}
                            </div>
                        ) : paginated.length === 0 ? (
                            <div className="text-center py-16 text-on-surface-variant font-medium">
                                Không có tin tức nào.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {paginated.map((article, i) => (
                                        <NewsCard key={i} article={article} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center pt-4">
                                        <nav className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                                disabled={page === 1}
                                                className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-30"
                                            >
                                                <MaterialIcon name="chevron_left" />
                                            </button>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .reduce<(number | "...")[]>((acc, p) => {
                                                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                                        acc.push(p);
                                                    } else if (acc[acc.length - 1] !== "...") {
                                                        acc.push("...");
                                                    }
                                                    return acc;
                                                }, [])
                                                .map((p, i) =>
                                                    p === "..." ? (
                                                        <span key={`e-${i}`} className="w-8 text-center text-gray-400 text-sm">...</span>
                                                    ) : (
                                                        <button key={p} onClick={() => handlePageChange(p)}
                                                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${p === page
                                                                ? "bg-primary text-white"
                                                                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                                                }`}>
                                                            {p}
                                                        </button>
                                                    )
                                                )
                                            }

                                            <button
                                                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                                disabled={page === totalPages}
                                                className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-30"
                                            >
                                                <MaterialIcon name="chevron_right" />
                                            </button>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="lg:w-1/3 space-y-8">

                        {/* Trending */}
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-on-surface">
                                <MaterialIcon name="trending_up" className="text-primary" />
                                Trending Stories
                            </h3>
                            <div className="space-y-6">
                                {isLoading
                                    ? Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex gap-4 animate-pulse">
                                            <div className="w-10 h-8 rounded bg-surface-container-high shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 rounded bg-surface-container-high" />
                                                <div className="h-3 w-1/2 rounded bg-surface-container-high" />
                                            </div>
                                        </div>
                                    ))
                                    : trending.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                                            className="flex gap-4 group text-left w-full"
                                        >
                                            <span className="text-3xl font-black text-gray-200 group-hover:text-primary/40 transition-colors shrink-0">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">
                                                    {item.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 block">
                                                    {item.source}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold mb-5 text-on-surface">Quick Links</h3>
                            <div className="space-y-2">
                                {[
                                    { label: "View all matches", icon: "sports_soccer", path: "/matches" },
                                    { label: "Explore stadiums", icon: "stadium", path: "/stadiums" },
                                    { label: "My bookings", icon: "confirmation_number", path: "/my-bookings" },
                                ].map(({ label, icon, path }) => (
                                    <button
                                        key={label}
                                        onClick={() => navigate(path)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface transition-colors text-sm font-medium text-left"
                                    >
                                        <MaterialIcon name={icon} className="text-primary text-base" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="bg-primary p-8 rounded-3xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black italic tracking-tighter text-white mb-2">
                                    NEVER MISS A BEAT
                                </h3>
                                <p className="text-white/80 text-sm mb-6">
                                    Get exclusive transfer news and ticket alerts delivered to your inbox.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 placeholder:text-white/60 text-white outline-none focus:ring-2 focus:ring-white"
                                    />
                                    <button className="bg-white text-primary px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-widest active:scale-95 transition-transform hover:bg-gray-50">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                            <MaterialIcon
                                name="mail"
                                className="absolute -bottom-4 -right-4 text-white/10 rotate-12 group-hover:scale-110 transition-transform"
                                style={{ fontSize: "9rem" }}
                            />
                        </div>

                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NewsPage;