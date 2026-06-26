import React from "react";
import { Users, LayoutList, Building2, FileText } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/lib/app-context";

export function StatsCards() {
  const { data: stats, isLoading } = useGetStats();
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";

  const cards = [
    {
      title: lang === "ar" ? "إجمالي الموظفين" : "TOTAL EMPLOYEE",
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      color: "#3dc8b0",
    },
    {
      title: lang === "ar" ? "إجمالي الأنواع" : "TOTAL TYPES",
      value: stats?.totalTypes ?? 0,
      icon: LayoutList,
      color: "#2ecc71",
    },
    {
      title: lang === "ar" ? "الأقسام" : "DEPARTMENTS",
      value: stats?.totalDepartments ?? 0,
      icon: Building2,
      color: "#6c5ce7",
    },
    {
      title: lang === "ar" ? "إجمالي الخطابات" : "TOTAL LETTERS",
      value: stats?.totalLetters ?? 0,
      icon: FileText,
      color: "#e84393",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:scale-[1.02]"
          style={
            isDark
              ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
              : { background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
          }
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${card.color}20` }}
          >
            <card.icon size={18} style={{ color: card.color }} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
              {card.title}
            </span>
            <span className="text-2xl font-bold leading-none" style={{ color: card.color }}>
              {card.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
