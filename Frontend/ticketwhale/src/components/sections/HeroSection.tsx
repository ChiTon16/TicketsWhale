import React from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";

const HeroSection: React.FC = () => (
    <section className="relative h-[870px] flex items-center overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 z-0">
            <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKySHBnCE5H-oXPFocltR0HSlOYaI_lV96y0JRS-TjH6-w6IKErOZliNmUfgHZj3lGwQjigc14Q_RvblZvqKWDxpGKryycqZkhivSI-G8wROFTomH-iw-4HsTIMjEuqYucgHGf7YXYsiSHKJaLNelxxljo2S9wu0lm1KopcpD4UBFUBm4cxh4GqSd1xjbstzNmw2Jis19ZwuB51Yc-yuYYXR7Fgu2ZYuksK0GM3YkLEVUhFbN3dxz1N6kGvQ1CyPcGWY7ZDwicDQ"
                alt="Wide angle view of a modern football stadium at night"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-2xl">

                <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-widest uppercase backdrop-blur-md border border-primary/20">
                    Match Day Excellence
                </span>

                <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter italic uppercase mb-8">
                    Trải nghiệm
                    <br />
                    <span className="text-primary-container">bóng đá</span>
                    <br />
                    đỉnh cao
                </h1>

                {/* Search Bar */}
                <div className="bg-surface-container-lowest p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-xl">
                    <div className="flex-1 flex items-center px-4 gap-3 bg-surface-container-low rounded-lg">
                        <MaterialIcon name="search" className="text-outline" />
                        <input
                            type="text"
                            placeholder="Tìm trận đấu, đội bóng hoặc sân vận động..."
                            className="bg-transparent border-none focus:ring-0 w-full py-4 text-on-surface"
                        />
                    </div>
                    <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-lg font-bold hover:scale-105 transition-transform active:scale-95">
                        Tìm Kiếm
                    </button>
                </div>

            </div>
        </div>
    </section>
);

export default HeroSection;