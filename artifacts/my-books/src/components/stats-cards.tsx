import React from "react";
import { Users, LayoutList, Building2, FileText } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  lang?: "en" | "ar";
}

export function StatsCards({ lang = "en" }: StatsCardsProps) {
  const { data: stats, isLoading } = useGetStats();

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${card.color}18` }}
          >
            <card.icon size={22} style={{ color: card.color }} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {card.title}
            </span>
            <span className="text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
