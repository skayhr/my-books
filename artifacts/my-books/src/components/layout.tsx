import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Globe, Sun, Moon, LogOut, Check, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppContext } from "@/lib/app-context";
import logoUrl from "@assets/image_1782568301631.png";
import { PhoneLayout } from "@/pages/phone-layout";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // For testing purposes, we are temporarily rendering the PhoneHome component directly.
  // This allows us to verify the phone UI before connecting it to the login logic.
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

  if (user?.mode === "phone") {
    return <PhoneLayout />;
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
        <div className="px-4 pt-4">
          <header className="relative flex h-16 shrink-0 items-center justify-between rounded-2xl bg-linear-to-r from-[#182D5C] from-55% to-[#7A3234] px-6 shadow-lg">
            {/* Logo */}
            <div className="z-10 flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                {/* white circle — smaller than logo, hidden behind it to tint K white */}
                <div className="absolute z-0 h-7 w-7 rounded-full bg-white" />
                <img src={logoUrl} alt="Logo" className="relative z-10 h-10 w-10 rounded-full object-cover" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Erbil Refinery / KAR-3
                </span>
                <span className="text-sm font-bold tracking-wider text-white">MY BOOKS</span>
              </div>
            </div>

            {/* Nav — absolutely centered */}
            <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  location === link.href ||
                  (link.href !== "/" && location.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-b-2 border-[#e74c3c] text-[#e74c3c]"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Hamburger */}
            <div className="relative z-10 flex items-center gap-3" ref={menuRef}>
              <Link href="/profile">
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
                  alt="User Avatar"
                  className="h-9 w-9 cursor-pointer rounded-full object-cover ring-2 ring-white/20 transition-all hover:ring-white/40"
                />
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 transition-all ${menuOpen ? "bg-white/15" : "bg-white/5"}`}
                aria-label="Settings"
              >
                <Menu size={20} className="text-gray-200" />
              </button>

              {menuOpen && (
                <div className="absolute top-12 right-0 z-50 min-w-50 overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-[#0f2236] to-[#1a0d18] shadow-2xl">
                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/10"
                  >
                    <img
                      src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
                      alt="User Avatar"
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{user?.username}</span>
                      <span className="text-xs text-gray-400">View Profile</span>
                    </div>
                  </Link>

                  {/* Language */}
                  <div className="border-b border-white/10 px-4 py-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      <Globe size={12} />
                      {lang === "ar" ? "اللغة" : "Language"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { switchLang("en"); setMenuOpen(false); }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
                  >
                    <span>English</span>
                    {lang === "en" && <Check size={13} className="text-[#e74c3c]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { switchLang("ar"); setMenuOpen(false); }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
                  >
                    <span>عربي</span>
                    {lang === "ar" && <Check size={13} className="text-[#e74c3c]" />}
                  </button>

                  {/* Theme */}
                  <div className="border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => { toggleTheme(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/10"
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
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-white/10"
                    >
                      <LogOut size={14} />
                      <span>{lang === "ar" ? "تسجيل الخروج" : "Logout"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>
        </div>
      )}

      <main className="flex-1 w-full h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
