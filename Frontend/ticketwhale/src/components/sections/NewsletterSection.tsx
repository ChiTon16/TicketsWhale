import React from "react";

const NewsletterSection: React.FC = () => (
    <section className="py-20 max-w-7xl mx-auto px-8">
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">

            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            {/* Copy */}
            <div className="relative z-10 md:max-w-xl">
                <h2 className="text-4xl font-black text-white tracking-tight leading-tight italic uppercase mb-4">
                    Nhận thông báo về vé trận đấu sớm nhất
                </h2>
                <p className="text-on-primary-container text-lg font-medium">
                    Đăng ký để không bỏ lỡ cơ hội sở hữu vé cho những trận cầu tâm điểm.
                </p>
            </div>

            {/* Form */}
            <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-4">
                <input
                    type="email"
                    placeholder="Email của bạn"
                    className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/40 focus:outline-none w-full sm:w-80"
                />
                <button className="bg-white text-primary px-8 py-4 rounded-xl font-black uppercase tracking-wide hover:scale-105 transition-transform">
                    Tham gia ngay
                </button>
            </div>

        </div>
    </section>
);

export default NewsletterSection;