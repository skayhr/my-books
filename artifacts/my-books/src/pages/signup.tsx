import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useAppContext } from "@/lib/app-context";
import { useLocation } from "wouter";
import { User, Lock, Mail, Menu, Globe, Check, ArrowLeft } from "lucide-react";
import logoUrl from "@assets/image_1782568301631.png";

const t = {
  en: {
    createAccount: "Create Account",
    joinMyBooks: "Join MY BOOKS",
    username: "USERNAME",
    email: "EMAIL",
    password: "PASSWORD",
    confirmPassword: "CONFIRM PASSWORD",
    signUp: "Sign UP",
    haveAccount: "Already have an account?",
    login: "Login",
    errorFields: "Please fill all fields",
    errorMatch: "Passwords do not match",
    errorUserExists: "Username already taken",
    errorPasswordLen: "Password must be at least 4 characters",
    success: "Account created! Please login.",
    language: "Language",
    english: "English",
    arabic: "Arabic",
    back: "Back to Login",
  },
  ar: {
    createAccount: "إنشاء حساب",
    joinMyBooks: "انضم إلى MY BOOKS",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    signUp: "إنشاء حساب",
    haveAccount: "لديك حساب بالفعل؟",
    login: "دخول",
    errorFields: "يرجى ملء جميع الحقول",
    errorMatch: "كلمتا المرور غير متطابقتين",
    errorUserExists: "اسم المستخدم مستخدم بالفعل",
    errorPasswordLen: "كلمة المرور يجب أن تكون 4 أحرف على الأقل",
    success: "تم إنشاء الحساب! يرجى تسجيل الدخول.",
    language: "اللغة",
    english: "إنجليزي",
    arabic: "عربي",
    back: "العودة لتسجيل الدخول",
  },
};

export function Signup() {
  const { signup } = useAuth();
  const { lang, switchLang } = useAppContext();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password || !confirm) {
      setError(txt.errorFields);
      return;
    }
    if (password.length < 4) {
      setError(txt.errorPasswordLen);
      return;
    }
    if (password !== confirm) {
      setError(txt.errorMatch);
      return;
    }
    const ok = signup(username, email, password);
    if (!ok) {
      setError(txt.errorUserExists);
      return;
    }
    setSuccess(true);
    setTimeout(() => setLocation("/login"), 1800);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top left, #1a2a4a 0%, #0d1b2e 40%, #4a1020 75%, #2d0c18 100%)",
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
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
        {/* Card top bar */}
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

        {/* Body */}
        <div className="px-8 pb-8 pt-5 flex flex-col items-center">
          <h1 className="text-3xl font-light tracking-wide text-gray-300 mb-1">{txt.createAccount}</h1>
          <h2 className="text-base font-bold tracking-widest text-white mb-7">{txt.joinMyBooks}</h2>

          {success ? (
            <div className="w-full text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-green-400" />
              </div>
              <p className="text-green-300 text-sm font-medium">{txt.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-white/50 transition-colors">
                <User size={17} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={txt.username}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none tracking-widest uppercase"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-signup-username"
                />
              </div>

              <div className="flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-white/50 transition-colors">
                <Mail size={17} className="text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  placeholder={txt.email}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none tracking-wider"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-signup-email"
                />
              </div>

              <div className="flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-white/50 transition-colors">
                <Lock size={17} className="text-gray-400 flex-shrink-0" />
                <input
                  type="password"
                  placeholder={txt.password}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none tracking-widest uppercase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-signup-password"
                />
              </div>

              <div className="flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-white/50 transition-colors">
                <Lock size={17} className="text-gray-400 flex-shrink-0" />
                <input
                  type="password"
                  placeholder={txt.confirmPassword}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none tracking-widest uppercase"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  data-testid="input-signup-confirm"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 text-center -mt-1">{error}</p>
              )}

              <button
                type="submit"
                data-testid="button-signup"
                className="w-full py-3 rounded-lg font-bold text-white text-base tracking-wider mt-1 transition-all active:scale-[0.98]"
                style={{
                  background: "linear-gradient(90deg, #c0392b 0%, #922b21 100%)",
                  boxShadow: "0 4px 14px rgba(192,57,43,0.4)",
                }}
              >
                {txt.signUp}
              </button>
            </form>
          )}

          <div className="flex items-center gap-2 mt-5 text-xs text-gray-400">
            <span>{txt.haveAccount}</span>
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="font-semibold hover:opacity-80 transition-colors"
              style={{ color: "#e74c3c" }}
            >
              {txt.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
