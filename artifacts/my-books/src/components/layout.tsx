import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Globe, Sun, Moon, LogOut, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppContext } from "@/lib/app-context";
import logoUrl from "@assets/image_1782568301631.png";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme, lang, switchLang } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user && location !== "/login") {
    setLocation("/login");
    return null;
  }

  const navLinks = [
    { label: lang === "ar" ? "الرئيسية" : "Home", href: "/" },
    { label: lang === "ar" ? "خطاب جديد" : "New Book", href: "/new-book" },
    { label: lang === "ar" ? "الأرشيف" : "Bookcase", href: "/bookcase" },
    { label: lang === "ar" ? "التقرير" : "Report", href: "/report" },
    { label: lang === "ar" ? "الموظفون" : "Emp data", href: "/emp-data" },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground transition-colors duration-300">
      {user && (
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 shadow-md relative"
          style={{
            background: "linear-gradient(to right, #182D5C 0%, #182D5C 55%, #7A3234 100%)",
            borderBottom: "none",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0 z-10">
            <div className="relative flex items-center justify-center w-14 h-14">
              {/* white circle — smaller than logo, hidden behind it to tint K white */}
              <div
                className="absolute rounded-full"
                style={{ width: "36px", height: "36px", background: "#ffffff", zIndex: 0 }}
              />
              <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain relative" style={{ zIndex: 1 }} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                Erbil Refinery / KAR-3
              </span>
              <span className="text-sm font-bold text-white tracking-wider">MY BOOKS</span>
            </div>
          </div>

          {/* Nav — absolutely centered */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location === link.href ||
                (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-[#e74c3c] border-b-2 border-[#e74c3c]"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Hamburger */}
          <div className="relative flex-shrink-0 z-10" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: menuOpen ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
              aria-label="Settings"
            >
              <Menu size={20} className="text-gray-200" />
            </button>

            {menuOpen && (
              <div
                className="absolute top-12 right-0 z-50 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
                style={{
                  background: "linear-gradient(135deg, #0f2236 0%, #1a0d18 100%)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                {/* Language */}
                <div className="px-4 py-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                    <Globe size={12} />
                    {lang === "ar" ? "اللغة" : "Language"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { switchLang("en"); setMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                >
                  <span>English</span>
                  {lang === "en" && <Check size={13} className="text-[#e74c3c]" />}
                </button>
                <button
                  type="button"
                  onClick={() => { switchLang("ar"); setMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                >
                  <span>عربي</span>
                  {lang === "ar" && <Check size={13} className="text-[#e74c3c]" />}
                </button>

                {/* Theme */}
                <div className="border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { toggleTheme(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                  >
                    {theme === "dark" ? (
                      <><Sun size={14} className="text-yellow-400" /><span>{lang === "ar" ? "الوضع الصباحي" : "Light Mode"}</span></>
                    ) : (
                      <><Moon size={14} className="text-blue-400" /><span>{lang === "ar" ? "الوضع الليلي" : "Dark Mode"}</span></>
                    )}
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); logout(); setLocation("/login"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>{lang === "ar" ? "تسجيل الخروج" : "Logout"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="flex-1 w-full h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
