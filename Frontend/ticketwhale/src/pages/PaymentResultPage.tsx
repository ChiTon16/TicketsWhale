import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MaterialIcon from "@/components/ui/MaterialIcon";

type ResultState = "processing" | "success" | "failed";

const PaymentResultPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [state, setState] = useState<ResultState>("processing");

    useEffect(() => {
        // Backend redirect về với params: ?status=success&bookingId=xxx
        const status = searchParams.get("status");
        const bookingId = searchParams.get("bookingId");

        console.log("status:", status, "| bookingId:", bookingId);

        if (status === "success" && bookingId) {
            setState("success");
            const t = setTimeout(() => navigate(`/bookings/${bookingId}`), 2000);
            return () => clearTimeout(t);
        } else {
            setState("failed");
            const t = setTimeout(() => navigate("/", { state: { error: "Thanh toán thất bại!" } }), 3000);
            return () => clearTimeout(t);
        }
    }, []);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-6 text-center max-w-sm">

                {state === "processing" && (
                    <>
                        <svg className="animate-spin h-16 w-16 text-primary" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <p className="text-xl font-black text-on-surface">Đang xử lý kết quả...</p>
                        <p className="text-sm text-on-surface-variant font-medium">Vui lòng không đóng trang này</p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <div className="w-24 h-24 rounded-full bg-tertiary/10 flex items-center justify-center">
                            <MaterialIcon name="check_circle" className="text-6xl text-tertiary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-on-surface">Thanh toán thành công!</p>
                            <p className="text-sm text-on-surface-variant font-medium mt-2">
                                Đang chuyển đến chi tiết đơn hàng...
                            </p>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-tertiary rounded-full animate-[progress_2s_linear_forwards]" />
                        </div>
                    </>
                )}

                {state === "failed" && (
                    <>
                        <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center">
                            <MaterialIcon name="cancel" className="text-6xl text-error" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-on-surface">Thanh toán thất bại</p>
                            <p className="text-sm text-on-surface-variant font-medium mt-2">
                                Đang chuyển về trang chủ...
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 text-primary font-bold hover:underline"
                        >
                            <MaterialIcon name="arrow_back" className="text-sm" />
                            Về trang chủ ngay
                        </button>
                    </>
                )}

            </div>
        </div>
    );
};

export default PaymentResultPage;