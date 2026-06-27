import React, { useState } from "react";
import { useGetLetterTypes, useCreateLetterType, useDeleteLetterType } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ChevronLeft, Trash2, Folder, ChevronDown } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

const badgeColors = [
  "#22c55e","#a855f7","#f97316","#6366f1",
  "#14b8a6","#3b82f6","#ec4899","#eab308","#ef4444","#06b6d4",
];

export function ManageTypes() {
  const { data: types, isLoading } = useGetLetterTypes();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const isRtl = lang === "ar";

  const [formData, setFormData] = useState({ code: "", nameAr: "", nameEn: "" });
  const [listOpen, setListOpen] = useState(false);

  const createType = useCreateLetterType({
    mutation: {
      onSuccess: () => {
        toast({ title: lang === "ar" ? "تم إضافة النوع" : "Letter type added" });
        setFormData({ code: "", nameAr: "", nameEn: "" });
        queryClient.invalidateQueries({ queryKey: ["/api/letter-types"] });
      },
    },
  });

  const deleteType = useDeleteLetterType({
    mutation: {
      onSuccess: () => {
        toast({ title: lang === "ar" ? "تم الحذف" : "Deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/letter-types"] });
      },
    },
  });

  const handleSave = () => {
    if (formData.code && formData.nameAr && formData.nameEn) {
      createType.mutate({ data: formData });
    } else {
      toast({ title: lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields", variant: "destructive" });
    }
  };

  const handleClear = () => {
    if (confirm(lang === "ar" ? "هل تريد مسح جميع الأنواع؟" : "Clear all types?")) {
      types?.forEach((t) => deleteType.mutate({ id: t.id }));
    }
  };

  const inputCls = `w-full rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
    isDark
      ? "bg-[#0d1f38] border border-[#1e3a5a] text-white placeholder:text-gray-600"
      : "bg-white border border-gray-200 text-gray-800"
  }`;

  return (
    <div
      className="flex flex-col bg-background transition-colors duration-300"
      style={{ height: "calc(100vh - 64px)" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl w-full mx-auto px-6 py-5 flex flex-col h-full">
        {/* Back */}
        <Link href="/bookcase" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
          <ChevronLeft size={16} />
          <span>{lang === "ar" ? "رجوع" : "Back"}</span>
        </Link>

        {/* Main card */}
        <div
          className="flex flex-col flex-1 rounded-2xl shadow-lg overflow-hidden"
          style={
            isDark
              ? { background: "#112240", border: "1px solid #1e3a5a" }
              : { background: "#ffffff", border: "1px solid #e2e8f0" }
          }
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            <div className="flex items-start gap-3">
              <Folder size={22} className={`mt-0.5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
              <div>
                <h2 className="font-bold text-base text-foreground">
                  {lang === "ar" ? "إدارة الأنواع" : "Manage Types"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "ar" ? "إضافة أو حذف أنواع الخطابات" : "Add or remove letter type categories"}
                </p>
              </div>
            </div>
            <Link
              href="/new-book"
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#2563eb" }}
            >
              {lang === "ar" ? "+ إضافة خطاب" : "+ Add Letter"}
            </Link>
          </div>

          {/* Two-column body */}
          <div className="flex flex-1 overflow-hidden gap-0">
            {/* Left: Add new type form */}
            <div
              className="w-[340px] shrink-0 flex flex-col px-5 pb-5 overflow-y-auto"
              style={
                isDark
                  ? { borderRight: "1px solid #1e3a5a" }
                  : { borderRight: "1px solid #e2e8f0" }
              }
            >
              {/* ADD NEW TYPE header row */}
              <div className="flex items-center justify-between mb-4 pt-1">
                <span className="text-sm font-bold text-blue-400 tracking-wide uppercase">
                  {lang === "ar" ? "إضافة نوع جديد" : "ADD NEW TYPE"}
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(to right, #1a56db, #c0392b)" }}
                >
                  {lang === "ar" ? "مسح الجدول" : "Cler Table"}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    {lang === "ar" ? "الرمز:" : "Code:"}
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    className={inputCls}
                    style={{ maxWidth: "120px" }}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="A"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    {lang === "ar" ? "الاسم (عربي):" : "Name (Arabic):"}
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    dir="rtl"
                    placeholder="إجازة مساعدة"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    {lang === "ar" ? "الاسم (إنجليزي):" : "Name (English):"}
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Assistant Leave"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={createType.isPending}
                  className="w-full py-2.5 rounded-lg font-bold text-white text-sm mt-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: "#2563eb" }}
                >
                  {createType.isPending ? "..." : lang === "ar" ? "حفظ" : "Save"}
                </button>
              </div>
            </div>

            {/* Right: existing types list */}
            <div className="flex-1 flex flex-col px-5 pb-5 overflow-hidden">
              <div className="flex flex-col gap-2 pt-1 mb-2">
                <label className="text-xs text-muted-foreground font-medium">
                  {lang === "ar" ? "نوع الخطاب:" : "Letter Type:"}
                </label>
                {/* Dropdown toggle — click to expand/collapse the list */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer select-none"
                  style={
                    isDark
                      ? { background: "#0d1f38", border: "1px solid #1e3a5a" }
                      : { background: "#f8fafc", border: "1px solid #e2e8f0" }
                  }
                  onClick={() => setListOpen((v) => !v)}
                >
                  <span className="text-muted-foreground text-sm">
                    {listOpen
                      ? (lang === "ar" ? `${types?.length ?? 0} نوع مضاف` : `${types?.length ?? 0} type(s) added`)
                      : (lang === "ar" ? "انقر لعرض الأنواع المضافة" : "Click to view added types")}
                  </span>
                  <ChevronDown
                    size={14}
                    className="text-muted-foreground transition-transform duration-200"
                    style={{ transform: listOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </div>
              </div>

              {/* Types list — scrollable, toggled by dropdown */}
              <div
                className="flex-1 overflow-y-auto flex flex-col gap-1 transition-all"
                style={{ display: listOpen ? "flex" : "none" }}
              >
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
                ) : types?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {lang === "ar" ? "لا توجد أنواع" : "No types yet"}
                  </p>
                ) : (
                  types?.map((type, i) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
                      style={
                        isDark
                          ? { background: "#0d1f38", border: "1px solid #1e3a5a" }
                          : { background: "#f8fafc", border: "1px solid #e2e8f0" }
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: badgeColors[i % badgeColors.length] }}
                        >
                          {type.code}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-semibold text-foreground" dir="rtl">{type.nameAr}</span>
                          <span className="text-xs text-muted-foreground">{type.nameEn}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteType.mutate({ id: type.id })}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* When list is closed, show a hint */}
              {!listOpen && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">
                    {lang === "ar"
                      ? "أضف نوعاً جديداً من الجانب الأيسر، ثم انقر على القائمة أعلاه للتحقق"
                      : "Add a new type on the left, then click the dropdown above to verify"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
