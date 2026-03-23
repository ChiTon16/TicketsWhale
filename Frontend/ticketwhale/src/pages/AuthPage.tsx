import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useAuthStore } from "@/store/authStore";
import { storage } from "@/api/axios";
import { authApi } from "@/api/auth.api";
import type { LoginPayload, RegisterPayload, ApiError } from "@/types";

type AuthTab = "login" | "register";

// ─── Shared UI ────────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  iconRight?: string;
  onIconClick?: () => void;
  rightLabel?: React.ReactNode;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label, type = "text", placeholder, value, onChange,
  iconRight, onIconClick, rightLabel, error,
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center ml-1">
      <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      {rightLabel}
    </div>
    <div className="relative group">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full bg-surface-container-low border-0 rounded-lg py-4 px-5 pr-12
          text-on-surface placeholder:text-on-surface-variant/40 transition-all
          focus:outline-none
          ${error ? "ring-2 ring-error" : "focus:ring-2 focus:ring-primary"}
        `}
      />
      {iconRight && (
        <MaterialIcon
          name={iconRight}
          onClick={onIconClick}
          className={`
            absolute right-4 top-1/2 -translate-y-1/2 transition-colors
            ${onIconClick ? "cursor-pointer" : ""}
            ${error ? "text-error" : "text-on-surface-variant/40 group-focus-within:text-primary"}
          `}
        />
      )}
    </div>
    {error && (
      <p className="text-xs text-error font-medium ml-1 flex items-center gap-1">
        <MaterialIcon name="error" className="text-sm" />
        {error}
      </p>
    )}
  </div>
);

const SubmitButton: React.FC<{ isLoading: boolean; label: string }> = ({ isLoading, label }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full hero-gradient text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
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
      <>{label}<MaterialIcon name="arrow_forward" className="text-sm" /></>
    )}
  </button>
);

const ErrorBanner: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="flex items-start gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg mb-6 text-sm font-medium">
    <MaterialIcon name="error" className="text-base shrink-0 mt-0.5" />
    <span className="flex-1">{message}</span>
    <button onClick={onDismiss} className="shrink-0 hover:opacity-70 transition-opacity">
      <MaterialIcon name="close" className="text-base" />
    </button>
  </div>
);

// ─── Branding side ────────────────────────────────────────────────────────────

const BrandingSide: React.FC = () => (
  <div className="hero-gradient p-12 text-on-primary flex-col justify-between relative overflow-hidden hidden lg:flex">
    <div className="relative z-10">
      <h1 className="font-headline text-5xl font-extrabold tracking-tighter mb-6 uppercase italic leading-tight">
        Feel the<br />Precision.
      </h1>
      <p className="text-lg opacity-90 max-w-sm leading-relaxed font-medium">
        Secure your front-row seat to greatness. Experience match day with Kinetic Precision.
      </p>
    </div>
    <div className="relative z-10 space-y-8">
      {[
        { icon: "confirmation_number", title: "Verified Authenticity", sub: "100% Guaranteed Official Tickets" },
        { icon: "speed", title: "Instant Delivery", sub: "Mobile entry in seconds" },
      ].map((item) => (
        <div key={item.icon} className="flex items-center gap-4">
          <span className="material-symbols-outlined bg-white/10 p-3 rounded-lg">{item.icon}</span>
          <div>
            <p className="font-bold text-sm">{item.title}</p>
            <p className="text-xs opacity-75">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="absolute -bottom-20 -right-20 opacity-20 pointer-events-none">
      <span className="material-symbols-outlined text-[300px]"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        sports_soccer
      </span>
    </div>
  </div>
);

// ─── Login form ───────────────────────────────────────────────────────────────

const LoginForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrs, setFieldErrs] = useState<Partial<LoginPayload>>({});

  useEffect(() => { setApiError(null); }, [form.email, form.password]);

  const validate = (): boolean => {
    const e: Partial<LoginPayload> = {};
    if (!form.email) e.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    setFieldErrs(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.login(form);
      storage.save(data.accessToken, data.refreshToken, data.user);
      setAuth(data.user, data.accessToken);
      onSuccess();
    } catch (err) {
      setApiError((err as ApiError).message ?? "Sai email hoặc mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError(null)} />}

      <FormField label="Email Address" type="email" placeholder="name@stadium.com"
        value={form.email} onChange={(v) => setForm({ ...form, email: v })}
        iconRight="mail" error={fieldErrs.email} />

      <FormField label="Password" type={showPwd ? "text" : "password"} placeholder="••••••••"
        value={form.password} onChange={(v) => setForm({ ...form, password: v })}
        iconRight={showPwd ? "visibility_off" : "visibility"}
        onIconClick={() => setShowPwd((p) => !p)}
        error={fieldErrs.password}
        rightLabel={
          <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
            Forgot?
          </a>
        }
      />

      <div className="flex items-center gap-3">
        <input id="remember" type="checkbox"
          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
        <label htmlFor="remember"
          className="text-sm font-medium text-on-surface-variant select-none cursor-pointer">
          Stay signed in for 30 days
        </label>
      </div>

      <SubmitButton isLoading={isLoading} label="Sign In to Account" />
    </form>
  );
};

// ─── Register form ────────────────────────────────────────────────────────────

const RegisterForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form, setForm] = useState<RegisterPayload>({ fullName: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrs, setFieldErrs] = useState<Partial<RegisterPayload>>({});

  useEffect(() => { setApiError(null); }, [form.fullName, form.email, form.password]);

  const validate = (): boolean => {
    const e: Partial<RegisterPayload> = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!form.email) e.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 8) e.password = "Mật khẩu tối thiểu 8 ký tự";
    setFieldErrs(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await authApi.register(form);
      onSuccess();
    } catch (err) {
      setApiError((err as ApiError).message ?? "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError(null)} />}

      <FormField label="Full Name" placeholder="Nguyễn Văn A"
        value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })}
        iconRight="person" error={fieldErrs.fullName} />

      <FormField label="Email Address" type="email" placeholder="name@stadium.com"
        value={form.email} onChange={(v) => setForm({ ...form, email: v })}
        iconRight="mail" error={fieldErrs.email} />

      <FormField label="Password" type={showPwd ? "text" : "password"} placeholder="••••••••"
        value={form.password} onChange={(v) => setForm({ ...form, password: v })}
        iconRight={showPwd ? "visibility_off" : "visibility"}
        onIconClick={() => setShowPwd((p) => !p)}
        error={fieldErrs.password} />

      <SubmitButton isLoading={isLoading} label="Create Account" />
    </form>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<AuthTab>("login");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Xoá user stale (có user trong store nhưng không có token)
  useEffect(() => {
    const hasToken = !!storage.getAccess();
    if (user !== null && !hasToken) logout();
  }, []);

  // Redirect về home nếu đã có cả user + token
  useEffect(() => {
    const hasToken = !!storage.getAccess();
    if (user !== null && hasToken) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleRegisterSuccess = () => {
    setRegisterSuccess(true);
    setTab("login");
  };

  const handleLoginSuccess = () => navigate("/", { replace: true });

  return (
    // min-h-screen trừ navbar (~80px) và footer (~auto) → dùng flex để fill hết
    <div className="bg-background font-body text-on-background flex flex-col min-h-screen">
      <Navbar />

      {/* flex-1 để main chiếm hết chiều cao còn lại, không khoảng trắng */}
      <main className="flex items-center justify-center px-4 py-10 bg-surface-container-low relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 hero-gradient opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-tertiary opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border border-outline-variant/10 relative z-10">
          <BrandingSide />

          <div className="p-8 md:p-12">
            {/* Header + Tab switcher */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-3xl font-black text-on-surface tracking-tight">
                {tab === "login" ? "WELCOME BACK" : "JOIN US"}
              </h2>

              {/* Tab: 2 button rộng bằng nhau dùng grid */}
              <div className="grid grid-cols-2 bg-surface-container-low p-1 rounded-lg w-48">
                {(["login", "register"] as AuthTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setRegisterSuccess(false); }}
                    className={`py-2 text-sm font-bold rounded-md transition-all text-center ${tab === t
                        ? "bg-surface-container-lowest text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-primary"
                      }`}
                  >
                    {t === "login" ? "Login" : "Register"}
                  </button>
                ))}
              </div>
            </div>

            {/* Success banner sau đăng ký */}
            {registerSuccess && tab === "login" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-6 text-sm font-semibold"
                style={{ background: "rgba(29,211,176,0.12)", border: "1px solid rgba(29,211,176,0.3)", color: "#0fa889" }}>
                <MaterialIcon name="check_circle" className="text-base shrink-0" />
                Đăng ký thành công! Vui lòng đăng nhập.
              </div>
            )}

            {tab === "login"
              ? <LoginForm onSuccess={handleLoginSuccess} />
              : <RegisterForm onSuccess={handleRegisterSuccess} />
            }

            <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
              {tab === "login" ? (
                <>New to Kinetic?{" "}
                  <button onClick={() => { setTab("register"); setRegisterSuccess(false); }}
                    className="text-primary font-bold hover:underline">
                    Create a free account
                  </button>
                </>
              ) : (
                <>Already have an account?{" "}
                  <button onClick={() => setTab("login")}
                    className="text-primary font-bold hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;