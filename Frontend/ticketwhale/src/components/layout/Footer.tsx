import React from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";

const PLATFORM_LINKS = ["Privacy Policy", "Terms of Service", "Stadium Rules"];
const SUPPORT_LINKS = ["Contact Support", "FAQ"];
const SOCIAL_ICONS = ["public", "share"];

const Footer: React.FC = () => (
    <footer className="bg-surface-container-low py-12 px-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">

            {/* Brand */}
            <div>
                <div className="text-xl font-black text-primary mb-6">KINETIC TICKETS</div>
                <p className="text-sm font-medium text-on-surface-variant max-w-xs leading-relaxed">
                    Nền tảng cung cấp vé bóng đá uy tín hàng đầu, kết nối hàng triệu cổ động
                    viên với những trận cầu rực lửa.
                </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-on-surface uppercase text-xs tracking-widest mb-2">
                        Platform
                    </h4>
                    {PLATFORM_LINKS.map((link) => (
                        <a
                            key={link}
                            href="#"
                            className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
                        >
                            {link}
                        </a>
                    ))}
                </div>
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-on-surface uppercase text-xs tracking-widest mb-2">
                        Support
                    </h4>
                    {SUPPORT_LINKS.map((link) => (
                        <a
                            key={link}
                            href="#"
                            className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
                        >
                            {link}
                        </a>
                    ))}
                </div>
            </div>

            {/* Social */}
            <div>
                <h4 className="font-bold text-on-surface uppercase text-xs tracking-widest mb-6">
                    Theo dõi chúng tôi
                </h4>
                <div className="flex gap-4">
                    {SOCIAL_ICONS.map((icon) => (
                        <button
                            key={icon}
                            className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                        >
                            <MaterialIcon name={icon} />
                        </button>
                    ))}
                </div>
            </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
                © 2024 Kinetic Precision Ticketing. All Rights Reserved.
            </p>
        </div>
    </footer>
);

export default Footer;