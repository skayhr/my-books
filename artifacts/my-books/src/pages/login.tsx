import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useAppContext } from "@/lib/app-context";
import { useLocation } from "wouter";
import { User, Lock, Phone, Monitor, Menu, Globe, Check } from "lucide-react";
import logoUrl from "@assets/logo_1782493103781.png";

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError(txt.errorEmpty);
      return;
    }
    const ok = login(username, password, mode);
    if (ok) {
      setLocation("/");
    } else {
      setError(txt.errorInvalid);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top left, #1a2a4a 0%, #0d1b2e 40%, #4a1020 75%, #2d0c18 100%)",
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 75% 60%, rgba(140,20,40,0.35) 0%, transparent 70%)",
        }}
      />

      <div
        className="w-full max-w-sm relative z-10 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(160deg, rgba(15,34,54,0.92) 0%, rgba(60,16,28,0.88) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Card top bar: logo + title + hamburger */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain flex-shrink-0" />
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
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>

            {menuOpen && (
              <div
                className="absolute top-11 right-0 z-50 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                style={{
                  background: "linear-gradient(135deg, #0f2236 0%, #1a0d18 100%)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
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
          <div
            className="flex w-auto rounded-full mb-2 p-0.5 gap-0"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <button
              type="button"
              onClick={() => setMode("phone")}
              className="px-7 py-2 rounded-full text-sm font-semibold tracking-wider transition-all"
              style={
                mode === "phone"
                  ? { background: "#c0392b", color: "#fff", boxShadow: "0 2px 8px rgba(192,57,43,0.4)" }
                  : { background: "transparent", color: "rgba(200,200,200,0.7)" }
              }
            >
              {txt.phone}
            </button>
            <button
              type="button"
              onClick={() => setMode("pc")}
              className="px-7 py-2 rounded-full text-sm font-semibold tracking-wider transition-all"
              style={
                mode === "pc"
                  ? { background: "#c0392b", color: "#fff", boxShadow: "0 2px 8px rgba(192,57,43,0.4)" }
                  : { background: "transparent", color: "rgba(200,200,200,0.7)" }
              }
            >
              {txt.pc}
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-7 text-center">{txt.deviceHint}</p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
            {/* USERNAME — underline style */}
            <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-white/50 transition-colors">
              <User size={17} className="text-gray-400 flex-shrink-0" />
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
              <Lock size={17} className="text-gray-400 flex-shrink-0" />
              <input
                type="password"
                placeholder={txt.password}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none tracking-widest uppercase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center -mt-2">{error}</p>
            )}

            <button
              type="submit"
              data-testid="button-login"
              className="w-full py-3 rounded-lg font-bold text-white text-base tracking-wider mt-1 transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(90deg, #c0392b 0%, #922b21 100%)",
                boxShadow: "0 4px 14px rgba(192,57,43,0.4)",
              }}
            >
              {txt.login}
            </button>
          </form>

          <div className="flex justify-between w-full mt-6 text-sm">
            <button type="button" className="text-gray-400 hover:text-white transition-colors text-xs">
              {txt.forgot}
            </button>
            <button
              type="button"
              onClick={() => setLocation("/signup")}
              className="font-semibold text-xs transition-colors hover:opacity-80"
              style={{ color: "#e74c3c" }}
              data-testid="link-signup"
            >
              {txt.signUp}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
