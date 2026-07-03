import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, Switch, Route } from "wouter";
import { Menu, Globe, Sun, Moon, LogOut, Check, User, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppContext } from "@/lib/app-context";
import logoUrl from "@assets/image_1782568301631.png";
import { PhoneBottomNav } from "@/pages/phone-bottom-nav";
import { PhoneHome } from "@/pages/phone-home";
import { PhoneReport } from "./phone-report";
import { PhoneSearch } from "./phone-search";
import { Profile } from "@/pages/profile";

export function PhoneLayout() {
  const { user, logout } = useAuth() as { user: { mode?: 'pc' | 'phone', username?: string, avatarUrl?: string } | null; logout: () => void };
  const [, setLocation] = useLocation();
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

  return (
    <div className="h-screen overflow-hidden flex flex-col w-full bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <div className="px-4 pt-4">
        <header className="relative flex h-16 shrink-0 items-center justify-between rounded-2xl bg-linear-to-r from-[#182D5C] from-55% to-[#7A3234] px-4 sm:px-6 shadow-lg">
          {/* Logo */}
          <div className="z-10 flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
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

          {/* Hamburger Menu */}
          <div className="relative z-10 flex items-center gap-3">
            <Link href="/phone-profile" className="block h-10 w-10 rounded-full border-2 border-white/20 transition-all hover:border-white/50 active:scale-95">
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
                alt="User Avatar"
                className="h-full w-full rounded-full object-cover"
              />
            </Link>
          </div>
        </header>
      </div>

      {/* Page Content */}
      <main className="flex-1 w-full flex flex-col overflow-hidden">
        <Switch>
          <Route path="/phone-home" component={PhoneHome} />
          <Route path="/phone-report" component={PhoneReport} />
          <Route path="/phone-search" component={PhoneSearch} />
          <Route path="/profile" component={Profile} />
          <Route component={PhoneHome} /> {/* Default route */}
        </Switch>
      </main>

      {/* Bottom Navigation */}
      <div className="relative" ref={menuRef}>
        <PhoneBottomNav onMenuClick={() => setMenuOpen(o => !o)} />
        {menuOpen && (
          <div className="absolute bottom-full right-2 mb-2 z-50 min-w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2">
            {/* Profile Link */}
            <Link href="/phone-profile" onClick={() => setMenuOpen(false)} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-popover-foreground transition-colors hover:bg-accent">
              <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`} alt="User Avatar" className="h-7 w-7 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="font-semibold">{user?.username}</span>
                <span className="text-xs text-muted-foreground">{lang === "ar" ? "عرض الملف الشخصي" : "View Profile"}</span>
              </div>
            </Link>
            {/* Account Settings Link */}
            <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-popover-foreground transition-colors hover:bg-accent">
              <Settings size={16} />
              <span>{lang === "ar" ? "إعدادات الحساب" : "Account Settings"}</span>
            </Link>
            {/* Language */}
            <div className="border-y border-border px-4 py-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><Globe size={12} />{lang === "ar" ? "اللغة" : "Language"}</div>
            </div>
            <button type="button" onClick={() => { switchLang("en"); setMenuOpen(false); }} className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-accent"><span>English</span>{lang === "en" && <Check size={13} className="text-primary" />}</button>
            <button type="button" onClick={() => { switchLang("ar"); setMenuOpen(false); }} className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-accent"><span>عربي</span>{lang === "ar" && <Check size={13} className="text-primary" />}</button>
            {/* Theme */}
            <div className="border-t border-border">
              <button type="button" onClick={() => { toggleTheme(); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-popover-foreground transition-colors hover:bg-accent">
                {theme === "dark" ? (<><Sun size={14} className="text-yellow-400" /><span>{lang === "ar" ? "الوضع الصباحي" : "Light Mode"}</span></>) : (<><Moon size={14} className="text-blue-400" /><span>{lang === "ar" ? "الوضع الليلي" : "Dark Mode"}</span></>)}
              </button>
            </div>
            {/* Logout */}
            <div className="border-t border-border">
              <button type="button" onClick={() => { setMenuOpen(false); logout(); setLocation("/login"); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-accent">
                <LogOut size={14} /><span>{lang === "ar" ? "تسجيل الخروج" : "Logout"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}