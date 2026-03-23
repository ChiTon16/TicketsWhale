import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
    { label: "Home", path: "/" },
    { label: "Matches", path: "/matches" },
    { label: "Stadiums", path: "/stadiums" },
    { label: "News", path: "/news" },
] as const;

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const isLoggedIn = user !== null;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate("/auth");
        setMenuOpen(false);
    };

    return (
        <header className="bg-surface/60 backdrop-blur-xl text-on-surface sticky top-0 bg-surface-container-low transition-colors duration-300 shadow-sm opacity-95 z-50">
            <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">

                {/* Brand */}
                <div
                    onClick={() => navigate("/")}
                    className="text-2xl font-black text-primary italic uppercase tracking-tight cursor-pointer"
                >
                    KINETIC TICKETS
                </div>

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(({ label, path }) => {
                        const isActive = location.pathname === path;
                        return (
                            <a
                                key={label}
                                onClick={(e) => { e.preventDefault(); navigate(path); }}
                                href={path}
                                className={
                                    isActive
                                        ? "text-primary border-b-2 border-primary pb-1 font-bold cursor-pointer"
                                        : "text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                                }
                            >
                                {label}
                            </a>
                        );
                    })}
                </nav>

                {/* Auth area */}
                <div className="flex items-center gap-3">
                    {isLoggedIn && user ? (
                        // ── Đã đăng nhập: avatar + dropdown menu ──────────
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((p) => !p)}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-black text-sm uppercase">
                                    {user.fullName.charAt(0)}
                                </div>
                                <span className="font-bold text-on-surface hidden sm:block">
                                    {user.fullName}
                                </span>
                                <MaterialIcon
                                    name={menuOpen ? "expand_less" : "expand_more"}
                                    className="text-on-surface-variant text-base hidden sm:block"
                                />
                            </button>

                            {/* Dropdown */}
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-50 animate-[slideIn_0.15s_ease-out]">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-outline-variant/20">
                                        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                                            Signed in as
                                        </p>
                                        <p className="font-bold text-on-surface truncate">{user.fullName}</p>
                                        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => navigate("/my-bookings")}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors text-left"
                                        >
                                            <MaterialIcon name="confirmation_number" className="text-primary text-base" />
                                            My Bookings
                                        </button>

                                        <button
                                            onClick={() => navigate("/profile")}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors text-left"
                                        >
                                            <MaterialIcon name="person" className="text-primary text-base" />
                                            Profile
                                        </button>
                                    </div>

                                    <div className="py-1 border-t border-outline-variant/20">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error/5 transition-colors text-left"
                                        >
                                            <MaterialIcon name="logout" className="text-base" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // ── Chưa đăng nhập: icon ──────────────────────────
                        <button
                            onClick={() => navigate("/auth")}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            title="Sign in"
                        >
                            <MaterialIcon name="account_circle" className="text-2xl" />
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Navbar;