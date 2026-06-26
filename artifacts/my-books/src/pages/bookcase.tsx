import React from "react";
import { Link } from "wouter";
import { useGetLetterTypes } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

const badgeColors = [
  { bg: "#22c55e", pill: "rgba(34,197,94,0.15)", pillText: "#22c55e" },
  { bg: "#a855f7", pill: "rgba(168,85,247,0.15)", pillText: "#a855f7" },
  { bg: "#f97316", pill: "rgba(249,115,22,0.15)", pillText: "#f97316" },
  { bg: "#6366f1", pill: "rgba(99,102,241,0.15)", pillText: "#6366f1" },
  { bg: "#14b8a6", pill: "rgba(20,184,166,0.15)", pillText: "#14b8a6" },
  { bg: "#3b82f6", pill: "rgba(59,130,246,0.15)", pillText: "#3b82f6" },
  { bg: "#ec4899", pill: "rgba(236,72,153,0.15)", pillText: "#ec4899" },
  { bg: "#eab308", pill: "rgba(234,179,8,0.15)", pillText: "#eab308" },
  { bg: "#ef4444", pill: "rgba(239,68,68,0.15)", pillText: "#ef4444" },
  { bg: "#06b6d4", pill: "rgba(6,182,212,0.15)", pillText: "#06b6d4" },
];

export function Bookcase() {
  const { data: types, isLoading } = useGetLetterTypes();
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const isRtl = lang === "ar";

  const labels = {
    pageTitle: lang === "ar" ? "الملفات" : "Files",
    pageSubtitle: lang === "ar" ? "تصفح الخطابات حسب النوع" : "Browse letters by type",
    sectionTitle: lang === "ar" ? "معلومات الملفات" : "Files Information",
    addLetter: lang === "ar" ? "+ إضافة خطاب" : "+ Add Letter",
    letterCount: (n: number) => lang === "ar" ? `${n} خطاب` : `${n} Letter`,
    manageTypes: lang === "ar" ? "إدارة الأنواع" : "Manage Types",
  };

  return (
    <div
      className="flex flex-col bg-background transition-colors duration-300"
      style={{ height: "calc(100vh - 64px)" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl w-full mx-auto px-6 py-6 flex flex-col h-full">
        {/* Page header — fixed */}
        <h1 className="text-2xl font-bold text-foreground mb-0.5">{labels.pageTitle}</h1>
        <p className="text-sm text-muted-foreground mb-4">{labels.pageSubtitle}</p>

        {/* Card — fills remaining height */}
        <div
          className="flex flex-col flex-1 rounded-2xl shadow-lg overflow-hidden"
          style={
            isDark
              ? { background: "#112240", border: "1px solid #1e3a5a" }
              : { background: "#ffffff", border: "1px solid #e2e8f0" }
          }
        >
          {/* Card header — fixed inside card */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <Folder size={18} className={isDark ? "text-blue-400" : "text-blue-500"} />
              <span className="font-semibold text-foreground">{labels.sectionTitle}</span>
            </div>
            <Link
              href="/new-book"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#2563eb" }}
            >
              {labels.addLetter}
            </Link>
          </div>

          {/* Scrollable grid area */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {types?.map((type, i) => {
                  const c = badgeColors[i % badgeColors.length];
                  const count = type.letterCount ?? 0;
                  return (
                    <Link key={type.id} href={`/bookcase/${type.code}`} className="group block">
                      <div
                        className="rounded-2xl p-4 flex flex-col gap-3 h-full transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                        style={
                          isDark
                            ? { background: "#0d1f38", border: "1px solid #1e3a5a" }
                            : { background: "#f8fafc", border: "1px solid #e2e8f0" }
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm"
                            style={{ background: c.bg }}
                          >
                            {type.code}
                          </div>
                          <ChevronRight size={15} className="text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
                        </div>

                        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {type.nameEn}
                        </p>

                        <div className="mt-auto">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: c.pill, color: c.pillText }}
                          >
                            <FileText size={10} />
                            {labels.letterCount(count)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Manage types link */}
        <div className="mt-2 text-right shrink-0">
          <Link href="/bookcase/manage" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            {labels.manageTypes}
          </Link>
        </div>
      </div>
    </div>
  );
}
