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

  const handleSubmit = async (e: React.FormEvent) => {
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
    const ok = await signup(username, email, password);
    if (!ok) {
      setError(txt.errorUserExists);
      return;
    }
    setSuccess(true);
    setTimeout(() => setLocation("/login"), 1800);
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#1a2a4a_0%,#0d1b2e_40%,#4a1020_75%,#2d0c18_100%)] p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_75%_60%,rgba(140,20,40,0.35)_0%,transparent_70%)]"
      />

      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[rgba(15,34,54,0.92)] to-[rgba(60,16,28,0.88)] shadow-2xl backdrop-blur-xl"
      >
        {/* Card top bar */}
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
                <User size={17} className="text-gray-400 shrink-0" />
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
                <Mail size={17} className="text-gray-400 shrink-0" />
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
                <Lock size={17} className="text-gray-400 shrink-0" />
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
                <Lock size={17} className="text-gray-400 shrink-0" />
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
                className="mt-1 w-full rounded-lg bg-linear-to-r from-[#c0392b] to-[#922b21] py-3 text-base font-bold tracking-wider text-white shadow-[0_4px_14px_rgba(192,57,43,0.4)] transition-all active:scale-[0.98]"
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
              className="font-semibold text-[#e74c3c] hover:opacity-80 transition-colors"
            >
              {txt.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
