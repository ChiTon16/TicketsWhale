import React, { useState } from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import type { Match, Section, Block, CreateBookingPayload } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { bookingApi, paymentApi } from "@/api/booking.api";
import { useNavigate } from "react-router-dom";

interface BlockSelectionModalProps {
    match: Match;
    section: Section;
    block: Block;
    onClose: () => void;
}

// ─── Step type ────────────────────────────────────────────────────────────────

type Step = "idle" | "loading" | "error";

function formatMatchDate(iso: string) {
    const d = new Date(iso);
    return {
        dayName: d.toLocaleDateString("vi-VN", { weekday: "short" }).toUpperCase(),
        day: d.getDate().toString().padStart(2, "0"),
        month: d.toLocaleDateString("vi-VN", { month: "short" }).toUpperCase(),
        year: d.getFullYear(),
        time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
}

const BlockSelectionModal: React.FC<BlockSelectionModalProps> = ({
    match, section, block, onClose,
}) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [quantity, setQty] = useState(1);
    const [step, setStep] = useState<Step>("idle");
    const [errorMsg, setErr] = useState<string | null>(null);

    const maxQty = Math.min(block.availableTickets, 10);
    const total = (block.price * quantity).toLocaleString("vi-VN");
    const { dayName, day, month, year, time } = formatMatchDate(match.matchTime);

    // ── Checkout flow ─────────────────────────────────────────────────────────
    const handleCheckout = async () => {
        if (!user) {
            navigate("/auth", { state: { from: `/matches/${match.id}` } });
            return;
        }

        setStep("loading");
        setErr(null);

        try {
            const payload: CreateBookingPayload = {
                matchId: match.id,
                sectionId: section.id,
                quantity,
                userEmail: user.email,
                userFullName: user.fullName,
            };

            // 1. Tạo booking → trả về Booking thẳng (không phải AxiosResponse)
            const booking = await bookingApi.create(payload);

            // 2. Tạo URL VNPay
            const payment = await paymentApi.createVNPay(booking.id);

            // 3. Redirect sang VNPay
            window.location.href = payment.paymentUrl;

        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Đặt vé thất bại, vui lòng thử lại";
            setErr(msg);
            setStep("error");
        }
    };

    const isLoading = step === "loading";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
        >
            <div
                className="relative w-full max-w-2xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{ animation: "slideIn 0.2s ease-out" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors disabled:opacity-40"
                >
                    <MaterialIcon name="close" className="text-on-surface-variant text-base" />
                </button>

                {/* ── Header: match info ─────────────────────────────────────────── */}
                <div className="p-6 border-b border-outline-variant/20 shrink-0">
                    <div className="flex items-start gap-5">
                        {/* Date block */}
                        <div className="flex flex-col items-center bg-primary text-on-primary rounded-xl px-5 py-4 shrink-0 min-w-[80px] text-center">
                            <span className="text-[10px] font-black tracking-widest">{dayName}</span>
                            <span className="text-4xl font-black leading-none">{day}</span>
                            <span className="text-xs font-bold">{month}</span>
                            <span className="text-xs font-bold opacity-80">{year}</span>
                        </div>

                        {/* Match title */}
                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-center gap-2 mb-2">
                                {match.homeCrest && (
                                    <img src={match.homeCrest} alt={match.homeTeam} className="w-7 h-7 object-contain" />
                                )}
                                <span className="font-headline font-black text-on-surface text-xl leading-tight">
                                    {match.homeTeam}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {match.awayCrest && (
                                    <img src={match.awayCrest} alt={match.awayTeam} className="w-7 h-7 object-contain" />
                                )}
                                <span className="font-headline font-black text-on-surface text-xl leading-tight">
                                    {match.awayTeam}
                                </span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-2">
                                {time}{match.stadiumName && ` · ${match.stadiumName}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Body: scrollable ───────────────────────────────────────────── */}
                <div
                    className="flex-1 overflow-y-auto min-h-0"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e2e5 transparent" }}
                >
                    {/* Selected seats */}
                    <div className="p-6 border-b border-outline-variant/20 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                            Vị trí đã chọn
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                                    Khu vực
                                </p>
                                <p className="font-headline text-lg font-black text-on-surface">{section.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                                    Block
                                </p>
                                <p className="font-headline text-lg font-black text-on-surface">{block.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                                    Còn lại
                                </p>
                                <p className="font-bold text-tertiary">{block.availableTickets} vé</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                                    Đơn giá
                                </p>
                                <p className="font-bold text-primary">{block.price.toLocaleString("vi-VN")}đ / vé</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 pt-1">
                            {[
                                { icon: "verified", label: "Vé chính hãng 100% được đảm bảo" },
                                { icon: "smartphone", label: "Mobile ticket · Vào cổng bằng điện thoại" },
                                { icon: "bolt", label: "Xác nhận ngay lập tức" },
                            ].map(({ icon, label }) => (
                                <div key={icon} className="flex items-center gap-3 text-sm">
                                    <MaterialIcon name={icon} className="text-tertiary text-base" />
                                    <span className="text-on-surface-variant font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quantity selector */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                                Số lượng vé
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: maxQty }, (_, i) => i + 1).map((q) => (
                                <button
                                    key={q}
                                    onClick={() => setQty(q)}
                                    disabled={isLoading}
                                    className={`w-12 h-12 rounded-xl font-black text-sm transition-all border-2 disabled:opacity-50 ${quantity === q
                                            ? "bg-primary border-primary text-on-primary shadow-md"
                                            : "bg-surface-container-low border-outline-variant/30 text-on-surface hover:border-primary"
                                        }`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Footer: error + checkout ───────────────────────────────────── */}
                <div className="p-6 bg-surface-container-low border-t border-outline-variant/20 space-y-3 shrink-0">
                    {/* Error */}
                    {errorMsg && (
                        <div className="flex items-start gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm font-medium">
                            <MaterialIcon name="error" className="text-base shrink-0 mt-0.5" />
                            <span className="flex-1">{errorMsg}</span>
                            <button onClick={() => setErr(null)} className="shrink-0 hover:opacity-70">
                                <MaterialIcon name="close" className="text-base" />
                            </button>
                        </div>
                    )}

                    {/* Auth warning */}
                    {!user && (
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container rounded-lg px-4 py-3">
                            <MaterialIcon name="info" className="text-base text-primary" />
                            <span>Bạn cần <strong className="text-primary">đăng nhập</strong> để đặt vé</span>
                        </div>
                    )}

                    {/* Price + button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-on-surface-variant">{quantity} vé</p>
                            <p className="text-2xl font-black text-on-surface">{total}đ</p>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    {user ? "Thanh toán" : "Đăng nhập"}
                                    <MaterialIcon name="arrow_forward" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BlockSelectionModal;