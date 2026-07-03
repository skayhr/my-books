import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, BarChart3, Menu } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

const navItems = [
  { href: "/phone-home", label: { en: "Home", ar: "الرئيسية" }, icon: Home },
  { href: "/phone-report", label: { en: "Report", ar: "التقرير" }, icon: BarChart3 },
  { href: "/phone-search", label: { en: "Search", ar: "بحث" }, icon: Search },
];

interface PhoneBottomNavProps {
  onMenuClick: () => void;
}

export function PhoneBottomNav({ onMenuClick }: PhoneBottomNavProps) {
  const [location] = useLocation();
  const { lang } = useAppContext();

  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 bg-background border-t border-border shadow-top">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs font-semibold ${isActive ? "font-bold" : ""}`}>
                {item.label[lang]}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu size={22} strokeWidth={2} />
          <span className="text-xs font-semibold">
            {lang === "ar" ? "القائمة" : "Menu"}
          </span>
        </button>
      </div>
    </div>
  );
}