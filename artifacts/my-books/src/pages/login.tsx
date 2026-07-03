import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useAppContext } from "@/lib/app-context";
import { Link, useLocation } from "wouter";
import { User, Lock, Eye, EyeOff, Menu, Globe, Check } from "lucide-react";
import logoUrl from "@assets/image_1782568301631.png";

const t = {
  en: {
    welcome: "Welcome",
    toMyBooks: "To MY BOOKS",
    phone: "PHONE",
    pc: "PC",
    deviceHint: "Select your device type for the best layout display",
    username: "USERNAME",
    password: "PASSWORD",
    login: "Login",
    forgot: "Forgot  password?",
    signUp: "Sign UP",
    errorEmpty: "Please enter username and password",
    errorInvalid: "Invalid username or password",
    language: "Language",
    english: "English",
    arabic: "Arabic",
  },
  ar: {
    welcome: "مرحباً",
    toMyBooks: "في MY BOOKS",
    phone: "جوال",
    pc: "حاسوب",
    deviceHint: "اختر نوع الجهاز لأفضل عرض",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    login: "دخول",
    forgot: "نسيت كلمة المرور؟",
    signUp: "إنشاء حساب",
    errorEmpty: "يرجى إدخال اسم المستخدم وكلمة المرور",
    errorInvalid: "اسم المستخدم أو كلمة المرور غير صحيح",
    language: "اللغة",
    english: "إنجليزي",
    arabic: "عربي",
  },
};

export function Login() {
  const { login } = useAuth();
  const { lang, switchLang } = useAppContext();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"phone" | "pc">("phone");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const txt = t[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError(txt.errorEmpty);
      return;
    }
    const result = await login(username, password, mode);
    if (result.ok) {
      setLocation("/");
    } else {
      setError(result.error ?? txt.errorInvalid);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#1a2a4a_0%,#0d1b2e_40%,#4a1020_75%,#2d0c18_100%)] p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_75%_60%,rgba(140,20,40,0.35)_0%,transparent_70%)]" />

      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[rgba(15,34,54,0.92)] to-[rgba(60,16,28,0.88)] shadow-2xl backdrop-blur-xl"
      >
        {/* Card top bar: logo + title + hamburger */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo" className="h-12 w-12 shrink-0 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold tracking-widest text-gray-300 uppercase">
                Erbil Refinery / KAR-3
              </span>
              <span className="text-sm font-bold text-white tracking-wider">MY BOOKS</span>
            </div>
          </div>

          {/* Hamburger with language dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-white/30 hover:text-white"
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>

            {menuOpen && (
              <div
                className="absolute top-11 right-0 z-50 min-w-40 overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-[#0f2236] to-[#1a0d18] shadow-xl"
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <Globe size={13} />
                    {txt.language}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { switchLang("en"); setMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                >
                  <span>{txt.english}</span>
                  {lang === "en" && <Check size={14} className="text-primary" />}
                </button>
                <button
                  type="button"
                  onClick={() => { switchLang("ar"); setMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                >
                  <span>{txt.arabic}</span>
                  {lang === "ar" && <Check size={14} className="text-primary" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="px-8 pb-8 pt-6 flex flex-col items-center">
          <h1 className="text-4xl font-light tracking-wide text-gray-300 mb-1">{txt.welcome}</h1>
          <h2 className="text-xl font-bold tracking-widest text-white mb-7">{txt.toMyBooks}</h2>

          {/* PHONE / PC toggle */}
          <div className="mb-2 flex w-auto gap-0 rounded-full border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`px-7 py-2 rounded-full text-sm font-semibold tracking-wider transition-all ${
                mode === "phone"
                  ? "bg-[#c0392b] text-white shadow-[0_2px_8px_rgba(192,57,43,0.4)]"
                  : "bg-transparent text-gray-300/70"
              }`}
            >
              {txt.phone}
            </button>
            <button
              type="button"
              onClick={() => setMode("pc")}
              className={`px-7 py-2 rounded-full text-sm font-semibold tracking-wider transition-all ${
                mode === "pc"
                  ? "bg-[#c0392b] text-white shadow-[0_2px_8px_rgba(192,57,43,0.4)]"
                  : "bg-transparent text-gray-300/70"
              }`}
            >
              {txt.pc}
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-7 text-center">{txt.deviceHint}</p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
            {/* USERNAME — underline style */}
            <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-white/50 transition-colors">
              <User size={17} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={txt.username}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none tracking-widest uppercase"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>

            {/* PASSWORD — underline style */}
            <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-white/50 transition-colors">
              <Lock size={17} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={txt.password}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none tracking-widest uppercase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-white">
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center -mt-2">{error}</p>
            )}

            <button
              type="submit"
              data-testid="button-login"
              className="mt-1 w-full rounded-lg bg-linear-to-r from-[#c0392b] to-[#922b21] py-3 text-base font-bold tracking-wider text-white shadow-[0_4px_14px_rgba(192,57,43,0.4)] transition-all active:scale-[0.98]"
            >
              {txt.login}
            </button>
          </form>

          <div className="flex justify-between w-full mt-6 text-sm">
            <Link href="/forgot-password" className="text-gray-400 hover:text-white transition-colors text-xs">
              {txt.forgot}
            </Link>
            <Link
              href="/signup"
              className="text-xs font-semibold text-primary transition-colors hover:opacity-80"
              data-testid="link-signup"
            >
              {txt.signUp}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
