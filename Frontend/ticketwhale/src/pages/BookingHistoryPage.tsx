import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { bookingApi } from "@/api/booking.api";
import type { Booking, BookingStatus, ApiError } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " · " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_CONFIG: Record<BookingStatus, {
  label: string;
  badgeClass: string;
  cardClass: string;
  imageClass: string;
  opacity: string;
}> = {
  CONFIRMED: {
    label: "Đã xác nhận",
    badgeClass: "bg-primary/10 text-primary border border-primary/20",
    cardClass: "border-outline-variant/50 hover:border-primary/30 hover:shadow-xl",
    imageClass: "grayscale group-hover:grayscale-0",
    opacity: "opacity-100",
  },
  PENDING: {
    label: "Chờ thanh toán",
    badgeClass: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    cardClass: "border-outline-variant/50 hover:border-yellow-300 hover:shadow-xl",
    imageClass: "grayscale group-hover:grayscale-0",
    opacity: "opacity-100",
  },
  CANCELLED: {
    label: "Đã huỷ",
    badgeClass: "bg-error/10 text-error border border-error/20",
    cardClass: "border-outline-variant/20 bg-surface-container-low",
    imageClass: "grayscale opacity-30",
    opacity: "opacity-60",
  },
  EXPIRED: {
    label: "Hết hạn",
    badgeClass: "bg-surface-container-highest text-on-surface-variant border border-outline-variant",
    cardClass: "border-outline-variant/20 bg-surface-container-low",
    imageClass: "grayscale opacity-50",
    opacity: "opacity-60",
  },
};

const STADIUM_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAH19BxaPAX1GlCNCIZNtlpsUNWDNSuVVU8g4-r7QI4K2i3aXGwwsEl2uQvdBO_D6u62_VI_3LOqmfa8MRiafSv-PYX-Qvv2tFA8G_U9Q_nWz2iC6UCteDp45WAuk8wTNWbaAeydT1fbaYJeNhyzFf8xtTj_oHt9mkCNEPR8GfRTns5x0anHBPvdBa2HA32bH3UHHUgl1UiR9nLSKzCe_epmh5JyUWHx2UyOOcQecSUOR71AaD4PEXPwgUkG9LD0h3OEaHlglIUbQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBbyofdRBjgYctlhiMJZusygs3BlF92MYZpTbksAVhQ1sL1p9ip1CSPX20Fmdu8H5EwOrTFHc6VmzqGJMDg0yffoSyDlvinen4KN6wQRzrMRVqRd1-JCsYTBYAl59N224cjB76EIy_a4idpkLyjHVtQHaOpvCMFLiDjBEwXINt87jKo3FAqEn2lAEsZEgmy18G6gRz9tGvm8WWSLVFMH2ieYsYjSEA6fi6ivaisGfkuGxpJSSvOKo_wyKBorEU3yQMYPeVppSseIg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCXpzY108rSFrih3OPN0RLhbjz51WQWgY5n8lz8HwHvjStS1wtjwV304eJ4wv4Rk_-E6a1y8178I6RB_XdffniP8Yrnv-CG1weiSPt2HuprpDWbyE9GEUmmarkrguhxR3v0U7VlRi_nqkgXv7UCyjGOUlRkCcy4aY746jHmuesz2aI9bReEZgZ52VMs1S06RZYk2DFuIldk26u0tewpYHNR9nXkYYAGh_glr_9cI9M275dqp37unVCqG8g4iaAzSAAXMMilhUmjNA",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const BookingCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-white border border-outline-variant/50 shadow-sm overflow-hidden animate-pulse">
    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-48 h-48 rounded-xl bg-surface-container-high flex-shrink-0" />
      <div className="flex-grow space-y-4 w-full">
        <div className="h-4 w-24 rounded bg-surface-container-high" />
        <div className="h-7 w-2/3 rounded bg-surface-container-high" />
        <div className="h-4 w-1/3 rounded bg-surface-container-high" />
        <div className="flex gap-4">
          <div className="h-14 w-20 rounded-lg bg-surface-container-high" />
          <div className="h-14 w-20 rounded-lg bg-surface-container-high" />
          <div className="h-14 w-20 rounded-lg bg-surface-container-high" />
        </div>
      </div>
      <div className="w-full md:w-32 h-12 rounded-xl bg-surface-container-high flex-shrink-0" />
    </div>
  </div>
);

// ─── Booking Card ─────────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: Booking;
  imgIndex: number;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, imgIndex }) => {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[booking.status];
  const firstTicket = booking.tickets[0];
  const imgSrc = STADIUM_IMAGES[imgIndex % STADIUM_IMAGES.length];

  const isActive = booking.status === "CONFIRMED" || booking.status === "PENDING";

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white border transition-all duration-300 shadow-sm ${cfg.cardClass}`}>
      <div className={`relative p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center ${cfg.opacity}`}>

        {/* Image */}
        <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-highest">
          <img src={imgSrc}
            alt={booking.match ? `${booking.match.homeTeam} vs ${booking.match.awayTeam}` : "Match"}
            className={`w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-100 ${cfg.imageClass}`}
          />
        </div>

        {/* Info */}
        <div className="flex-grow space-y-4 min-w-0">
          {/* Status + Date */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.badgeClass}`}>
              {cfg.label}
            </span>
            <span className="text-on-surface-variant text-sm flex items-center gap-1 font-medium">
              <MaterialIcon name="event" className="text-sm" />
              {formatDate(booking.createdAt)}
            </span>
          </div>

          {/* Match name */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-on-surface mb-1 leading-tight">
              {booking.match
                ? `${booking.match.homeTeam} vs ${booking.match.awayTeam}`
                : "Trận đấu"
              }
            </h2>
            {booking.match?.stadiumName && (
              <p className="text-on-surface-variant flex items-center gap-1 text-sm">
                <MaterialIcon name="location_on" className="text-sm" />
                {booking.match.stadiumName}
              </p>
            )}
          </div>

          {/* Ticket meta */}
          {firstTicket && (
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30">
                <span className="block text-[10px] uppercase text-on-surface-variant font-bold">Khu vực</span>
                <span className="text-primary font-bold text-sm">{firstTicket.sectionName}</span>
              </div>
              <div className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30">
                <span className="block text-[10px] uppercase text-on-surface-variant font-bold">Số vé</span>
                <span className="text-primary font-bold text-sm">{booking.tickets.length}</span>
              </div>
              <div className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30">
                <span className="block text-[10px] uppercase text-on-surface-variant font-bold">Tổng tiền</span>
                <span className="text-primary font-bold text-sm">
                  {booking.totalAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          )}

          {/* Cancelled/expired note */}
          {booking.status === "CANCELLED" && (
            <p className="text-xs text-error font-medium italic">Đơn hàng đã bị huỷ</p>
          )}
          {booking.status === "EXPIRED" && (
            <p className="text-xs text-on-surface-variant font-medium italic">Đơn hàng đã hết hạn thanh toán</p>
          )}
        </div>

        {/* CTA */}
        <div className="w-full md:w-auto flex-shrink-0">
          {isActive ? (
            <button
              onClick={() => navigate(`/bookings/${booking.id}`)}
              className="w-full md:w-auto px-8 py-4 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all shadow-[0_8px_20px_rgba(96,130,182,0.2)] hover:shadow-primary/40"
            >
              Xem chi tiết
            </button>
          ) : (
            <button
              onClick={() => navigate(`/bookings/${booking.id}`)}
              className="w-full md:w-auto px-8 py-3 border border-outline-variant text-on-surface-variant font-semibold rounded-xl hover:bg-surface-container transition-all"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabKey = "active" | "past";

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("active");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const data = await bookingApi.getMyBookings();
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (cancelled) return;
        const apiErr = err as ApiError;
        // Token hết hạn → xoá storage + redirect về /auth
        if (apiErr.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('auth-storage');
          window.location.href = '/auth';
          return;
        }
        setError(apiErr.message ?? "Không thể tải lịch sử đặt vé");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Tab filter — active: PENDING + CONFIRMED, past: CANCELLED + EXPIRED
  const filtered = useMemo(() => {
    return bookings
      .filter((b) =>
        tab === "active"
          ? b.status === "CONFIRMED" || b.status === "PENDING"
          : b.status === "CANCELLED" || b.status === "EXPIRED"
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, tab]);

  const activeCount = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING").length;

  // Pagination
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleTab = (t: TabKey) => { setTab(t); setPage(1); };
  const handlePage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">
                Quản lý
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface leading-none">
                Lịch Sử Đặt Vé
              </h1>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 bg-surface-container p-1 rounded-full">
              <button
                onClick={() => handleTab("active")}
                className={`w-36 py-2 rounded-full text-sm font-semibold transition-all text-center ${tab === "active"
                    ? "bg-white shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Active
                {activeCount > 0 && (
                  <span className="ml-2 bg-primary text-on-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTab("past")}
                className={`w-36 py-2 rounded-full text-sm font-semibold transition-all text-center ${tab === "past"
                    ? "bg-white shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                History
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
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
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <MaterialIcon name="confirmation_number" className="text-6xl text-on-surface-variant/20" />
            <p className="text-xl font-bold text-on-surface">
              {tab === "active" ? "Bạn chưa có vé nào đang hoạt động" : "Chưa có lịch sử đặt vé"}
            </p>
            <p className="text-on-surface-variant text-sm">
              {tab === "active" && "Hãy khám phá các trận đấu sắp diễn ra!"}
            </p>
            {tab === "active" && (
              <button
                onClick={() => navigate("/matches")}
                className="mt-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                Xem trận đấu
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {paginated.map((booking, i) => (
                <BookingCard key={booking.id} booking={booking}
                  imgIndex={(safePage - 1) * PAGE_SIZE + i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePage(safePage - 1)}
                  disabled={safePage === 1}
                  className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <MaterialIcon name="chevron_left" className="text-base" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .reduce<(number | "...")[]>((acc, p) => {
                    if (p === 1 || p === totalPages || (p >= safePage - 1 && p <= safePage + 1)) {
                      acc.push(p);
                    } else if (acc[acc.length - 1] !== "...") {
                      acc.push("...");
                    }
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`e-${i}`} className="w-10 h-10 flex items-center justify-center text-on-surface-variant text-sm">...</span>
                    ) : (
                      <button key={p} onClick={() => handlePage(p)}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${p === safePage
                            ? "bg-primary text-on-primary shadow-md"
                            : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                          }`}>
                        {p}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => handlePage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <MaterialIcon name="chevron_right" className="text-base" />
                </button>
              </div>
            )}

            <p className="text-center text-xs text-on-surface-variant mt-4">
              Trang {safePage}/{totalPages} · {filtered.length} đơn hàng
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BookingHistoryPage;