import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { stadiumApi, type StadiumDto } from "@/api/stadium.api";
import { useMatches } from "@/hooks/useMatches";
import { formatMatchDateTimeVN } from "@/utils/DateUtils";
import type { Match } from "@/types";

const FALLBACK_IMAGE = "https://nguoinoitieng.tv/images/nnt/106/0/bi3n.jpg";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const PageSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-[600px] bg-surface-container-high" />
        <div className="max-w-7xl mx-auto px-8 -mt-12 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-xl border border-surface-variant/50 h-24" />
                ))}
            </div>
        </div>
    </div>
);

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard: React.FC<{ match: Match; onClick: () => void }> = ({ match, onClick }) => {
    const { date, time } = formatMatchDateTimeVN(match.matchTime);
    const isOngoing = match.status === "ONGOING";

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    {match.matchday && (
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                            Vòng {match.matchday}
                        </span>
                    )}
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${isOngoing
                        ? "bg-error/10 text-error"
                        : match.status === "SCHEDULED"
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container-highest text-on-surface-variant"
                        }`}>
                        {isOngoing ? "LIVE" : match.status === "SCHEDULED" ? "SẮP DIỄN RA" : "ĐÃ KẾT THÚC"}
                    </span>
                </div>

                {/* Teams */}
                <div className="flex justify-between items-center gap-4 mb-8">
                    <div className="text-center flex-1">
                        <div className="w-16 h-16 mx-auto mb-3 bg-surface-container rounded-full flex items-center justify-center overflow-hidden">
                            {match.homeCrest
                                ? <img src={match.homeCrest} alt={match.homeTeam} className="w-10 h-10 object-contain" />
                                : <MaterialIcon name="sports_soccer" className="text-primary text-3xl" />
                            }
                        </div>
                        <p className="font-bold text-on-surface text-sm">{match.homeTeam}</p>
                    </div>
                    <div className="text-2xl font-black text-outline-variant">VS</div>
                    <div className="text-center flex-1">
                        <div className="w-16 h-16 mx-auto mb-3 bg-surface-container rounded-full flex items-center justify-center overflow-hidden">
                            {match.awayCrest
                                ? <img src={match.awayCrest} alt={match.awayTeam} className="w-10 h-10 object-contain" />
                                : <MaterialIcon name="sports_soccer" className="text-primary text-3xl" />
                            }
                        </div>
                        <p className="font-bold text-on-surface text-sm">{match.awayTeam}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-on-surface-variant text-sm mb-6">
                    <MaterialIcon name="calendar_today" className="text-primary text-base" />
                    <span>{date} · {time}</span>
                </div>

                <button
                    onClick={onClick}
                    disabled={match.status === "FINISHED" || match.status === "CANCELLED"}
                    className="w-full bg-surface-container-highest border border-transparent text-on-surface py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                    ĐẶT VÉ
                </button>
            </div>
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const StadiumDetailPage: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();

    const [stadium, setStadium] = useState<StadiumDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Matches tại sân này
    const { matches: allMatches } = useMatches();
    const stadiumMatches = allMatches
        .filter(m =>
            (m.status === "SCHEDULED" || m.status === "ONGOING") &&
            m.stadiumName?.toLowerCase().includes(stadium?.name.toLowerCase() ?? "___")
        )
        .slice(0, 3);

    useEffect(() => {
        if (!name) { navigate("/stadiums"); return; }
        let cancelled = false;

        const load = async () => {
            setIsLoading(true); setError(null);
            try {
                const data = await stadiumApi.getByName(decodeURIComponent(name));
                if (!cancelled) setStadium(data);
            } catch {
                if (!cancelled) setError("Không thể tải thông tin sân vận động");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [name]);

    if (isLoading) return (
        <div className="bg-white text-on-surface min-h-screen">
            <Navbar /><PageSkeleton />
        </div>
    );

    if (error || !stadium) return (
        <div className="bg-white text-on-surface min-h-screen">
            <Navbar />
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-8">
                <MaterialIcon name="error_outline" className="text-6xl text-error/50" />
                <p className="text-xl font-bold">{error ?? "Không tìm thấy sân vận động"}</p>
                <button onClick={() => navigate("/stadiums")}
                    className="flex items-center gap-2 text-primary font-bold hover:underline">
                    <MaterialIcon name="arrow_back" className="text-sm" />Quay lại
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white text-on-surface font-body min-h-screen">
            <Navbar />

            <main className="">

                {/* ── Hero ── */}
                <section className="relative h-[600px] md:h-[680px] w-full overflow-hidden">
                    <img
                        src={stadium.imageUrl || FALLBACK_IMAGE}
                        alt={stadium.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Back button */}
                    <button
                        onClick={() => navigate("/stadiums")}
                        className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium text-sm bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                        <MaterialIcon name="arrow_back" className="text-sm" />
                        Stadiums
                    </button>

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                        <div className="max-w-7xl mx-auto">
                            <span className="inline-block px-4 py-1 rounded-full bg-primary/30 backdrop-blur-md text-white text-xs font-bold tracking-widest mb-4 uppercase">
                                Premier League Venue
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 uppercase">
                                {stadium.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium text-sm">
                                <span className="flex items-center gap-1">
                                    <MaterialIcon name="location_on" className="text-primary-container text-sm" />
                                    {stadium.city}, {stadium.location}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                <span className="flex items-center gap-1">
                                    <MaterialIcon name="sports_soccer" className="text-primary-container text-sm" />
                                    {stadium.team}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Stats Grid ── */}
                <section className="max-w-7xl mx-auto px-8 -mt-12 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Capacity", value: stadium.capacity.toLocaleString() },
                            { label: "Opened", value: stadium.yearOpened.toString() },
                            { label: "Home Team", value: stadium.team.replace(" FC", "").replace(" United", " Utd") },
                            { label: "Location", value: stadium.city },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white p-6 rounded-2xl shadow-xl border border-surface-variant/50">
                                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                                <h3 className="text-2xl md:text-3xl font-black text-on-surface truncate">{value}</h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Content Bento ── */}
                <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* About */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-on-surface mb-6 uppercase">
                                {stadium.name}
                            </h2>
                            <p className="text-on-surface-variant text-lg leading-relaxed">
                                {stadium.name} là sân nhà của {stadium.team}, tọa lạc tại {stadium.city}, {stadium.location}.
                                Sân được khánh thành năm {stadium.yearOpened} với sức chứa {stadium.capacity.toLocaleString()} chỗ ngồi,
                                là một trong những địa điểm tổ chức thi đấu Premier League hàng đầu.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: "wifi", title: "High-Speed Wi-Fi", desc: "Phủ sóng toàn sân với kết nối tốc độ cao cho tất cả khán giả." },
                                { icon: "restaurant", title: "Premium Hospitality", desc: "Hệ thống nhà hàng và quầy bar cao cấp phục vụ trong ngày thi đấu." },
                                { icon: "local_parking", title: "Bãi Đậu Xe", desc: "Bãi đậu xe rộng rãi, cần đặt trước. Khuyến khích dùng phương tiện công cộng." },
                                { icon: "accessible", title: "Tiếp Cận Toàn Diện", desc: "Chỗ ngồi và lối đi dành cho người khuyết tật trên toàn bộ khu vực sân." },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className="bg-surface-container p-8 rounded-2xl border border-outline-variant/30">
                                    <MaterialIcon name={icon} className="text-primary mb-4 text-4xl" />
                                    <h4 className="text-xl font-bold text-on-surface mb-2">{title}</h4>
                                    <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-surface-container-high p-8 rounded-2xl border border-primary/10 shadow-lg">
                            <h3 className="text-xl font-bold text-on-surface mb-6">Dịch Vụ Sân Vận Động</h3>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Tour tham quan sân",
                                    "Khu vực khán giả đặc biệt",
                                    "Cửa hàng merchandise chính hãng",
                                    "Khu vực VIP & box seats",
                                    "Bãi đậu xe có bảo vệ",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-on-surface">
                                        <MaterialIcon name="check_circle" className="text-primary shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate("/matches")}
                                className="w-full bg-primary text-on-primary py-4 rounded-xl font-black text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                            >
                                XEM TRẬN ĐẤU
                            </button>
                        </div>

                        {/* Quick info */}
                        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
                            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Thông tin nhanh</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Năm thành lập</span>
                                    <span className="font-bold text-on-surface">{stadium.yearOpened}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Sức chứa</span>
                                    <span className="font-bold text-on-surface">{stadium.capacity.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Thành phố</span>
                                    <span className="font-bold text-on-surface">{stadium.city}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Đội chủ nhà</span>
                                    <span className="font-bold text-on-surface">{stadium.team}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Upcoming Matches ── */}
                <section className="bg-surface-container-low py-24">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <p className="text-primary font-bold tracking-[0.2em] mb-2 uppercase text-xs">Live Events</p>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface">
                                    UPCOMING MATCHES
                                </h2>
                            </div>
                            <button
                                onClick={() => navigate("/matches")}
                                className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all"
                            >
                                Xem tất cả <MaterialIcon name="arrow_forward" />
                            </button>
                        </div>

                        {stadiumMatches.length === 0 ? (
                            <div className="text-center py-16 text-on-surface-variant font-medium">
                                Hiện chưa có trận đấu nào sắp diễn ra tại sân này.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {stadiumMatches.map((match) => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        onClick={() => navigate(`/matches/${match.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Location ── */}
                <section className="max-w-7xl mx-auto px-8 py-24">
                    <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-12">LOCATION & ACCESS</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Map placeholder */}
                        <div className="rounded-3xl overflow-hidden h-[400px] bg-surface-container shadow-xl relative border border-outline-variant/30 flex items-center justify-center">
                            <div className="text-center">
                                <MaterialIcon name="map" className="text-primary text-6xl mb-4" />
                                <p className="text-on-surface font-bold">{stadium.name}</p>
                                <p className="text-on-surface-variant text-sm mt-1">{stadium.city}, {stadium.location}</p>
                            </div>
                        </div>

                        {/* Transport info */}
                        <div className="space-y-8">
                            {[
                                {
                                    icon: "train",
                                    title: "Tàu điện / Metro",
                                    desc: `Nhiều tuyến tàu điện và metro kết nối đến khu vực ${stadium.city}. Kiểm tra tuyến đường gần nhất với ${stadium.name} trên Google Maps.`,
                                },
                                {
                                    icon: "directions_bus",
                                    title: "Xe buýt",
                                    desc: "Nhiều tuyến xe buýt hoạt động trong ngày thi đấu để hỗ trợ khán giả di chuyển đến và từ sân vận động.",
                                },
                                {
                                    icon: "local_parking",
                                    title: "Bãi Đậu Xe",
                                    desc: "Bãi đậu xe chính thức cần đặt trước. Khuyến khích sử dụng phương tiện công cộng vào các ngày thi đấu.",
                                },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <MaterialIcon name={icon} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-on-surface mb-2">{title}</h4>
                                        <p className="text-on-surface-variant leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default StadiumDetailPage;