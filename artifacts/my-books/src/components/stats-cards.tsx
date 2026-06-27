import React from "react";
import { Users, LayoutList, Building2, FileText } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/lib/app-context";

const floatKeyframes = `
@keyframes floatCard0 {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.03); }
}
@keyframes floatCard1 {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-10px) scale(1.04); }
}
@keyframes floatCard2 {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-7px) scale(1.03); }
}
@keyframes floatCard3 {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-9px) scale(1.035); }
}
`;

const floatAnimations = [
  "floatCard0 3.6s ease-in-out infinite",
  "floatCard1 4.1s ease-in-out infinite 0.4s",
  "floatCard2 3.8s ease-in-out infinite 0.8s",
  "floatCard3 4.3s ease-in-out infinite 0.2s",
];

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
    <>
      <style>{floatKeyframes}</style>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 flex flex-col gap-2 cursor-default"
            style={{
              animation: floatAnimations[i],
              ...(isDark
                ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }
                : { background: "rgba(255,255,255,0.88)", border: "1px solid rgba(0,0,0,0.07)", boxShadow: `0 4px 18px ${card.color}22` }),
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${card.color}22` }}
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
    </>
  );
}
