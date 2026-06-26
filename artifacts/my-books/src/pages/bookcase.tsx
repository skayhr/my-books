import React from "react";
import { Link } from "wouter";
import { useGetLetterTypes } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Plus, Folder, FileText } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

const badgeColors = [
  { bg: "#22c55e", pill: "rgba(34,197,94,0.15)", pillText: "#22c55e" },   // A green
  { bg: "#a855f7", pill: "rgba(168,85,247,0.15)", pillText: "#a855f7" },   // B purple
  { bg: "#f97316", pill: "rgba(249,115,22,0.15)", pillText: "#f97316" },   // C orange
  { bg: "#6366f1", pill: "rgba(99,102,241,0.15)", pillText: "#6366f1" },   // D indigo
  { bg: "#14b8a6", pill: "rgba(20,184,166,0.15)", pillText: "#14b8a6" },   // E teal
  { bg: "#3b82f6", pill: "rgba(59,130,246,0.15)", pillText: "#3b82f6" },   // F blue
  { bg: "#ec4899", pill: "rgba(236,72,153,0.15)", pillText: "#ec4899" },   // G pink
  { bg: "#eab308", pill: "rgba(234,179,8,0.15)",  pillText: "#eab308" },   // H amber
  { bg: "#ef4444", pill: "rgba(239,68,68,0.15)",  pillText: "#ef4444" },   // I red
  { bg: "#06b6d4", pill: "rgba(6,182,212,0.15)",  pillText: "#06b6d4" },   // J cyan
];

const labels = {
  en: {
    pageTitle: "Files",
    pageSubtitle: "Browse letters by type",
    sectionTitle: "Files Information",
    addLetter: "+ Add Letter",
    letterCount: (n: number) => `${n} Letter`,
  },
  ar: {
    pageTitle: "الملفات",
    pageSubtitle: "تصفح الخطابات حسب النوع",
    sectionTitle: "معلومات الملفات",
    addLetter: "+ إضافة خطاب",
    letterCount: (n: number) => `${n} خطاب`,
  },
};

export function Bookcase() {
  const { data: types, isLoading } = useGetLetterTypes();
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const t = labels[lang];
  const isRtl = lang === "ar";

  return (
    <div
      className="flex-1 min-h-full bg-background transition-colors duration-300"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Page header */}
        <h1 className="text-2xl font-bold text-foreground mb-0.5">{t.pageTitle}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t.pageSubtitle}</p>

        {/* Main card */}
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={
            isDark
              ? { background: "#112240", border: "1px solid #1e3a5a" }
              : { background: "#ffffff", border: "1px solid #e2e8f0" }
          }
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div className="flex items-center gap-2">
              <Folder size={18} className={isDark ? "text-blue-400" : "text-blue-500"} />
              <span className="font-semibold text-foreground">{t.sectionTitle}</span>
            </div>
            <Link
              href="/new-book"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#2563eb" }}
            >
              {t.addLetter}
            </Link>
          </div>

          {/* Grid */}
          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        {/* Top row: badge + arrow */}
                        <div className="flex items-start justify-between">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm"
                            style={{ background: c.bg }}
                          >
                            {type.code}
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-muted-foreground group-hover:text-foreground transition-colors mt-1"
                          />
                        </div>

                        {/* Type name */}
                        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {type.nameEn}
                        </p>

                        {/* Letter count pill */}
                        <div className="mt-auto">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: c.pill, color: c.pillText }}
                          >
                            <FileText size={11} />
                            {t.letterCount(count)}
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
        <div className="mt-4 text-right">
          <Link
            href="/bookcase/manage"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            {lang === "ar" ? "إدارة الأنواع" : "Manage Types"}
          </Link>
        </div>
      </div>
    </div>
  );
}
