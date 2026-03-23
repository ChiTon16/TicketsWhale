import React, { useState, useEffect, useRef } from "react"; import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { bookingApi, paymentApi } from "@/api/booking.api";
import type { Booking, ApiError } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
    const d = new Date(iso);
    return {
        date: d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
        time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
}

const STATUS_CONFIG: Record<string, { label: string; textClass: string; icon: string; bgClass: string }> = {
    PENDING: { label: "Chờ thanh toán", textClass: "text-yellow-700", bgClass: "bg-yellow-50", icon: "pending" },
    CONFIRMED: { label: "Đã xác nhận", textClass: "text-tertiary", bgClass: "bg-tertiary/10", icon: "check_circle" },
    CANCELLED: { label: "Đã huỷ", textClass: "text-error", bgClass: "bg-error/10", icon: "cancel" },
    EXPIRED: { label: "Hết hạn", textClass: "text-on-surface-variant", bgClass: "bg-surface-container-highest", icon: "timer" },
};

// ─── Poll interval (ms) ───────────────────────────────────────────────────────
const POLL_INTERVAL = 3000;
const POLL_MAX = 20; // 20 × 3s = 60s timeout

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const PageSkeleton: React.FC = () => (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pb-32 animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-surface-container-high" />
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <div className="h-56 rounded-xl bg-surface-container-high" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-44 rounded-xl bg-surface-container-high" />
                    <div className="h-44 rounded-xl bg-surface-container-high" />
                </div>
                <div className="h-52 rounded-xl bg-surface-container-high" />
            </div>
            <div className="lg:col-span-4">
                <div className="h-[420px] rounded-2xl bg-surface-container-high" />
            </div>
        </div>
    </div>
);

// ─── QR Section ───────────────────────────────────────────────────────────────

const QRSection: React.FC<{ booking: Booking }> = ({ booking }) => {
    const [qrSrc, setQrSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [qrError, setQrError] = useState(false);

    useEffect(() => {
        if (booking.status !== "CONFIRMED") return;

        setLoading(true);
        setQrError(false);

        paymentApi.getTicketQR(booking.id)
            .then(({ data }) => {
                // data.qrCode là base64 string → dùng thẳng làm src
                setQrSrc(`data:image/png;base64,${data.qrCode}`);
            })
            .catch((err) => {
                console.error("QR fetch error:", err);
                setQrError(true);
            })
            .finally(() => setLoading(false));
    }, [booking.id, booking.status]);

    return (
        <div className="bg-surface-container-low p-6 rounded-xl border-2 border-dashed border-outline-variant/50 mb-6 w-full flex flex-col items-center gap-3">
            <div className="w-48 h-48 rounded-xl overflow-hidden flex items-center justify-center bg-surface-container-highest">
                {booking.status !== "CONFIRMED" ? (
                    <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                        <MaterialIcon name="lock" className="text-4xl text-on-surface-variant/30" />
                        <span className="text-xs text-on-surface-variant/50 font-medium text-center">
                            QR hiển thị<br />sau khi xác nhận
                        </span>
                    </div>
                ) : loading ? (
                    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                ) : qrError ? (
                    <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                        <MaterialIcon name="qr_code_2" className="text-4xl text-on-surface-variant/30" />
                        <span className="text-xs text-error font-medium text-center">Không tải được QR</span>
                    </div>
                ) : qrSrc ? (
                    <img
                        src={qrSrc}
                        alt="QR Code vé vào cửa"
                        className="w-full h-full object-contain"
                        onError={() => setQrError(true)}
                    />
                ) : null}
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                #{booking.id.slice(0, 8).toUpperCase()}
            </p>
        </div>
    );
};

// ─── CancelButton ─────────────────────────────────────────────────────────────

const CancelButton: React.FC<{ bookingId: string; onSuccess: () => void }> = ({ bookingId, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleCancel = async () => {
        if (!confirm("Bạn có chắc muốn huỷ đơn hàng này không?")) return;
        setIsLoading(true);
        try {
            await bookingApi.cancel(bookingId);
            onSuccess();
        } catch {
            alert("Huỷ đơn thất bại, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <button onClick={handleCancel} disabled={isLoading}
            className="w-full border-2 border-error text-error font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-error/5 active:scale-[0.98] transition-all disabled:opacity-50">
            {isLoading
                ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Đang huỷ...</>
                : <><MaterialIcon name="cancel" />HUỶ ĐƠN HÀNG</>
            }
        </button>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const BookingDetailPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    const pollCount = useRef(0);
    const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Fetch booking + match song song ──────────────────────────────────────
    const loadBooking = async (silent = false): Promise<Booking | null> => {
        try {
            const data = await bookingApi.getById(bookingId!);
            setBooking(data);
            return data;
        } catch (err) {
            const apiErr = err as ApiError;
            if (apiErr.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('auth-storage');
                window.location.href = '/auth';
                return null;
            }
            if (!silent) setError(apiErr.message ?? "Không thể tải thông tin đơn hàng");
            return null;
        }
    };


    // ── Poll khi status PENDING ───────────────────────────────────────────────
    const startPolling = (currentBooking: Booking) => {
        if (currentBooking.status !== "PENDING") return;
        setIsPolling(true);
        pollCount.current = 0;

        const poll = async () => {
            if (pollCount.current >= POLL_MAX) {
                setIsPolling(false);
                return;
            }
            pollCount.current++;
            const updated = await loadBooking(true);
            if (updated && updated.status !== "PENDING") {
                setIsPolling(false); // Đã CONFIRMED hoặc CANCELLED → dừng poll
            } else {
                pollTimer.current = setTimeout(poll, POLL_INTERVAL);
            }
        };

        pollTimer.current = setTimeout(poll, POLL_INTERVAL);
    };

    useEffect(() => {
        if (!bookingId) { navigate("/", { replace: true }); return; }

        const init = async () => {
            setIsLoading(true); setError(null);
            const data = await loadBooking();
            setIsLoading(false);
            if (!data) return;
            startPolling(data);
        };

        init();

        return () => {
            if (pollTimer.current) clearTimeout(pollTimer.current);
        };
    }, [bookingId]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) return (
        <div className="bg-surface text-on-surface min-h-screen">
            <Navbar />
            <div className="pt-24 pb-8 px-4 md:px-8 max-w-5xl mx-auto"><PageSkeleton /></div>
        </div>
    );

    // ── Error ────────────────────────────────────────────────────────────────
    if (error || !booking) return (
        <div className="bg-surface text-on-surface min-h-screen">
            <Navbar />
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-8">
                <MaterialIcon name="error_outline" className="text-6xl text-error/50" />
                <p className="text-xl font-bold">{error ?? "Không tìm thấy đơn hàng"}</p>
                <button onClick={() => navigate("/")} className="flex items-center gap-2 text-primary font-bold hover:underline">
                    <MaterialIcon name="arrow_back" className="text-sm" />Về trang chủ
                </button>
            </div>
        </div>
    );

    const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
    const firstTicket = booking.tickets[0];
    const qty = booking.tickets.length;
    const { date: createdDate, time: createdTime } = formatDateTime(booking.createdAt);
    const { time: expiresTime } = formatDateTime(booking.expiresAt);

    return (
        <div className="bg-surface text-on-surface min-h-screen selection:bg-primary/20">
            <Navbar />

            <main className="pt-24 pb-32 px-4 md:px-8 max-w-5xl mx-auto">

                {/* Polling indicator */}
                {isPolling && (
                    <div className="mb-6 flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm font-medium">
                        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Đang chờ xác nhận thanh toán từ VNPay...
                    </div>
                )}

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-8 text-on-surface-variant hover:text-primary transition-colors group w-fit">
                    <MaterialIcon name="arrow_back" className="text-sm group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium uppercase tracking-widest">Quay lại</span>
                </button>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">

                    {/* ── Main ── */}
                    <div className="lg:col-span-8 w-full space-y-6">

                        {/* Hero */}
                        <div className="relative overflow-hidden rounded-xl h-56 flex items-center justify-center bg-primary">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90" />
                            <div className="relative z-10 flex flex-col items-center gap-5 px-6 w-full">

                                {/* Teams */}
                                <div className="flex items-center gap-8 md:gap-16">
                                    {/* Home */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center border-2 border-white overflow-hidden p-1">
                                            {booking.match?.homeCrest
                                                ? <img src={booking.match.homeCrest} alt={booking.match.homeTeam} className="w-full h-full object-contain" />
                                                : <MaterialIcon name="shield" className="text-4xl text-primary" />
                                            }
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-tighter text-white text-center max-w-[90px]">
                                            {booking.match?.homeTeam ?? "Đội nhà"}
                                        </span>
                                    </div>

                                    <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">VS</span>

                                    {/* Away */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center border-2 border-white overflow-hidden p-1">
                                            {booking.match?.awayCrest
                                                ? <img src={booking.match.awayCrest} alt={booking.match.awayTeam} className="w-full h-full object-contain" />
                                                : <MaterialIcon name="sports_soccer" className="text-4xl text-secondary" />
                                            }
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-tighter text-white text-center max-w-[90px]">
                                            {booking.match?.awayTeam ?? "Đội khách"}
                                        </span>
                                    </div>
                                </div>

                                {/* Match time + stadium */}
                                {booking.match && (
                                    <p className="text-white/80 text-xs font-medium text-center">
                                        {new Date(booking.match.matchTime).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long" })}
                                        {" · "}
                                        {new Date(booking.match.matchTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        {booking.match.stadiumName && ` · ${booking.match.stadiumName}`}
                                    </p>
                                )}

                                {/* Status */}
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 bg-white/90 ${status.textClass}`}>
                                    <MaterialIcon name={status.icon} className="text-sm" />
                                    {status.label}
                                </span>
                            </div>
                        </div>

                        {/* Bento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Order info */}
                            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm border-l-4 border-l-primary">
                                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Thông tin đơn hàng</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-on-surface-variant">
                                        <MaterialIcon name="calendar_month" className="text-primary shrink-0" />
                                        <span className="text-sm font-medium">{createdDate}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-on-surface-variant">
                                        <MaterialIcon name="schedule" className="text-primary shrink-0" />
                                        <span className="text-sm font-medium">Đặt lúc {createdTime}</span>
                                    </div>
                                    {booking.status === "PENDING" && (
                                        <div className="flex items-center gap-3 text-yellow-700">
                                            <MaterialIcon name="timer" className="text-yellow-600 shrink-0" />
                                            <span className="text-sm font-medium">Hết hạn lúc {expiresTime}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-on-surface-variant">
                                        <MaterialIcon name="tag" className="text-primary shrink-0" />
                                        <span className="text-sm font-mono text-xs">{booking.id.slice(0, 18).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seating */}
                            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm border-l-4 border-l-secondary">
                                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Thông tin ghế ngồi</p>
                                {firstTicket ? (
                                    <>
                                        <h2 className="text-base font-bold mb-4 text-primary leading-tight">{firstTicket.sectionName}</h2>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <span className="text-[10px] uppercase text-on-surface-variant font-bold">Số lượng vé</span>
                                                <p className="text-2xl font-black">{qty}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase text-on-surface-variant font-bold">Đơn giá</span>
                                                <p className="text-lg font-bold">{firstTicket.price.toLocaleString("vi-VN")}đ</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${firstTicket.status === "CONFIRMED" ? "bg-tertiary/10 text-tertiary"
                                                : firstTicket.status === "CANCELLED" ? "bg-error/10 text-error"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {firstTicket.status === "CONFIRMED" ? "Đã xác nhận"
                                                : firstTicket.status === "CANCELLED" ? "Đã huỷ" : "Đang xử lý"}
                                        </span>
                                    </>
                                ) : (
                                    <p className="text-sm text-on-surface-variant">Chưa có thông tin vé</p>
                                )}
                            </div>
                        </div>

                        {/* Payment summary */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-6">Tóm tắt thanh toán</p>
                            <div className="space-y-4">
                                {booking.tickets.map((ticket, i) => (
                                    <div key={ticket.id} className="flex justify-between items-center font-medium">
                                        <span className="text-sm text-on-surface">{ticket.sectionName} · Vé #{i + 1}</span>
                                        <span className="text-on-surface">{ticket.price.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] uppercase text-on-surface-variant block mb-1 font-bold">Tổng thanh toán</span>
                                        <span className="text-xs text-on-surface-variant">qua VNPay</span>
                                    </div>
                                    <span className="text-3xl font-black text-primary">
                                        {booking.totalAmount.toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {booking.status === "CONFIRMED" && (
                            <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-md">
                                <MaterialIcon name="download" />TẢI VÉ ĐIỆN TỬ (PDF)
                            </button>
                        )}
                        {booking.status === "PENDING" && (
                            <CancelButton bookingId={booking.id} onSuccess={() => navigate("/", { replace: true })} />
                        )}
                    </div>

                    {/* ── Side: QR ── */}
                    <aside className="lg:col-span-4 w-full lg:sticky lg:top-24">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 flex flex-col items-center shadow-xl">
                            <div className="w-full mb-6 text-center">
                                <h3 className="font-black tracking-tight text-xl mb-1">VÉ VÀO CỬA</h3>
                                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                                    Mã đơn #{booking.id.slice(0, 8).toUpperCase()}
                                </p>
                            </div>

                            <QRSection booking={booking} />

                            <div className="w-full space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                                    <MaterialIcon name="info" className="text-primary shrink-0 mt-0.5" />
                                    <p className="text-[11px] leading-relaxed font-semibold text-on-surface-variant">
                                        Tăng độ sáng màn hình lên tối đa khi quét mã. Ảnh chụp màn hình không hợp lệ để vào cổng.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 border border-outline-variant py-3 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors bg-white">
                                        <MaterialIcon name="add_to_home_screen" className="text-lg mb-1 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Apple Wallet</span>
                                    </button>
                                    <button className="flex-1 border border-outline-variant py-3 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors bg-white">
                                        <MaterialIcon name="account_balance_wallet" className="text-lg mb-1 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Google Pay</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant">
                                <MaterialIcon name="support_agent" className="text-sm" />
                                <button className="text-xs font-bold hover:text-primary transition-colors">
                                    Cần hỗ trợ với đơn hàng này?
                                </button>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingDetailPage;