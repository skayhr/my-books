import React from "react";
import { Users, LayoutList, Building2, FileText } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/lib/app-context";

const hoverKeyframes = `
@keyframes cardPop {
  0%   { transform: translateY(0px) scale(1); }
  40%  { transform: translateY(-10px) scale(1.05); }
  70%  { transform: translateY(-6px) scale(1.03); }
  100% { transform: translateY(-8px) scale(1.04); }
}
.stat-card {
  transform: translateY(0px) scale(1);
  transition: box-shadow 0.25s ease;
}
.stat-card:hover {
  animation: cardPop 0.35s ease forwards;
}
`;

interface StatsCardsProps {
  variant?: "classic" | "modern";
}

export function StatsCards({ variant = "classic" }: StatsCardsProps) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {[1, 2, 3, 4].map((i: number) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const css = `${hoverKeyframes}\n${cards
    .map(
      (card, i) => `
.card-${i} { --card-color: ${card.color}; }
.card-${i} .icon-bg { background: ${card.color}22; }
.card-${i} .icon-svg { color: ${card.color}; }
.card-${i} .value { color: ${card.color}; }
.card-container.light.card-${i} { box-shadow: 0 4px 18px ${card.color}22; }
`
    )
    .join("\n")}`;

  const cardBackground = isDark ? "bg-white/[.07]" : "bg-white/88";

  return (
    <>
      <style>{css}</style>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {cards.map((card, i: number) => (
          <div
            key={i}
            className={`stat-card card-container ${isDark ? "dark" : "light"} card-${i} flex h-28 cursor-default flex-col gap-2 rounded-2xl p-4 ${cardBackground} border ${isDark ? "border-slate-800" : "border-slate-200"}`}
          >
            {variant === "modern" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl icon-bg">
                    <card.icon size={18} className="icon-svg" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </span>
                </div>
                <span className="text-center text-3xl font-bold leading-none value">{card.value}</span>
              </>
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-bg">
                  <card.icon size={18} className="icon-svg" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">{card.title}</span>
                  <span className="text-2xl font-bold leading-none value">{card.value}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default StatsCards;
