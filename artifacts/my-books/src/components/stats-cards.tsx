import React, { useMemo } from "react";
import { Users, LayoutList, Building2, FileText } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCards() {
  const { data: stats, isLoading } = useGetStats();

  const cards = [
    {
      title: "TOTAL EMPLOYEE",
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      color: "text-[#3dc8b0]",
      bg: "bg-[#3dc8b0]/10"
    },
    {
      title: "TOTAL TYPES",
      value: stats?.totalTypes ?? 0,
      icon: LayoutList,
      color: "text-[#2ecc71]",
      bg: "bg-[#2ecc71]/10"
    },
    {
      title: "DEPARTMENTS",
      value: stats?.totalDepartments ?? 0,
      icon: Building2,
      color: "text-[#6c5ce7]",
      bg: "bg-[#6c5ce7]/10"
    },
    {
      title: "TOTAL LETTERS",
      value: stats?.totalLetters ?? 0,
      icon: FileText,
      color: "text-[#e84393]",
      bg: "bg-[#e84393]/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl bg-card border-card-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {cards.map((card, i) => (
        <div key={i} className="bg-card border border-card-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</span>
            <span className={`text-3xl font-bold ${card.color}`}>{card.value}</span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
            <card.icon size={24} className={card.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
