import React, { useState } from "react";
import { useGetLetterTypes, useCreateLetterType, useDeleteLetterType } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ChevronLeft, Trash2, Folder, ChevronDown, DatabaseZap } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

const badgeColors = [
  "#22c55e","#a855f7","#f97316","#6366f1",
  "#14b8a6","#3b82f6","#ec4899","#eab308","#ef4444","#06b6d4",
];
const badgeColorClasses = [
  "bg-[#22c55e]","bg-[#a855f7]","bg-[#f97316]","bg-[#6366f1]",
  "bg-[#14b8a6]","bg-[#3b82f6]","bg-[#ec4899]","bg-[#eab308]","bg-[#ef4444]","bg-[#06b6d4]",
];

interface LetterType {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  color?: string;
  letterCount?: number;
}

const defaultLetterTypes = [
  { code: "A", nameEn: "Assistant Leave", nameAr: "إجازة مساعدة", color: badgeColors[0] },
  { code: "B", nameEn: "Temporary Leave", nameAr: "إجازة وقتية", color: badgeColors[1] },
  { code: "C", nameEn: "Unpaid Leave", nameAr: "إجازة بدون راتب", color: badgeColors[2] },
  { code: "D", nameEn: "Sick Leave", nameAr: "إجازة مرضية", color: badgeColors[3] },
  { code: "E", nameEn: "Paternity Leave", nameAr: "إجازة أبوة", color: badgeColors[4] },
  { code: "F", nameEn: "Maternity Leave", nameAr: "إجازة أمومة", color: badgeColors[5] },
  { code: "G", nameEn: "Bereavement Leave / Compassionate", nameAr: "إجازة وفاة", color: badgeColors[6] },
  { code: "H", nameEn: "Travel Leave", nameAr: "إجازة سفر", color: badgeColors[7] },
  { code: "I", nameEn: "Hajj & Umrah Leave", nameAr: "إجازة حج وعمرة", color: badgeColors[8] },
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

  const sortedTypes = React.useMemo(() => {
    if (!types) return [];
    return [...types].sort((a, b) => a.code.localeCompare(b.code));
  }, [types]);

  const lastCreated = React.useMemo(() => {
    if (!types || types.length === 0) return null;
    return types.reduce((latest, current) => (current.id > latest.id ? current : latest));
  }, [types]);

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
      const newTypeData = {
        ...formData,
        color: badgeColors[(types?.length || 0) % badgeColors.length],
      };
      createType.mutate({ data: newTypeData });
    } else {
      toast({ title: lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields", variant: "destructive" });
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm(lang === "ar" ? "هل تريد إضافة الأنواع الافتراضية؟" : "Seed default letter types?")) return;

    try {
      // Use Promise.all to wait for all mutations to complete
      await Promise.all(
        defaultLetterTypes.map(type => createType.mutateAsync({ data: type }))
      );
      toast({ title: lang === "ar" ? "تمت إضافة الأنواع الافتراضية بنجاح" : "Default types seeded successfully" });
    } catch (error) {
      toast({ title: lang === "ar" ? "حدث خطأ أثناء إضافة الأنواع" : "Error seeding types", variant: "destructive" });
    } finally {
      // Invalidate queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["/api/letter-types"] });
    }
  };

  const handleClear = () => {
    if (confirm(lang === "ar" ? "هل تريد مسح جميع الأنواع؟" : "Clear all types?")) {
      types?.forEach((t: LetterType) => deleteType.mutate({ id: t.id }));
    }
  };

  const inputCls = `w-full rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
    isDark
      ? "bg-[#0d1f38] border border-[#1e3a5a] text-white placeholder:text-gray-600"
      : "bg-white border border-gray-200 text-gray-800"
  }`;

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-background transition-colors duration-300"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl w-full mx-auto px-6 py-5 flex flex-col h-full">
        {/* Back */}
        <Link href="/bookcase" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
          <ChevronLeft size={16} />
          <span>{lang === "ar" ? "رجوع" : "Back"}</span>
        </Link>

        {/* Main card */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              {lang === "ar" ? "+ إضافة خطاب" : "+ Add Letter"}
            </Link>
          </div>

          {/* Two-column body */}
          <div className="flex flex-1 overflow-hidden gap-0">
            {/* Left: Add new type form */}
            <div className="w-80 shrink-0 flex flex-col overflow-y-auto border-r border-slate-200 px-5 pb-5 dark:border-slate-800"
            >
              {/* ADD NEW TYPE header row */}
              <div className="flex items-center justify-between mb-4 pt-1">
                <span className="text-sm font-bold text-blue-400 tracking-wide uppercase">
                  {lang === "ar" ? "إضافة نوع جديد" : "ADD NEW TYPE"}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    {lang === "ar" ? "الرمز:" : "Code:"}
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    className={`${inputCls} max-w-32`}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder={lastCreated ? lastCreated.code : "A"}
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
                    placeholder={lastCreated ? lastCreated.nameAr : "إجازة مساعدة"}
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
                    placeholder={lastCreated ? lastCreated.nameEn : "Assistant Leave"}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={createType.isPending}
                  className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {createType.isPending ? "..." : lang === "ar" ? "حفظ" : "Save"}
                </button>
              </div>
            </div>

            {/* Right: existing types list */}
            <div className="flex-1 flex flex-col px-5 pb-5 overflow-hidden">
              <div className="flex flex-col gap-2 pt-1 mb-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground font-medium">
                    {lang === "ar" ? "الأنواع المضافة:" : "Added Types:"}
                  </label>
                </div>
                {/* Dropdown toggle — click to expand/collapse the list */}
                <div className="flex cursor-pointer select-none items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-950"
                  onClick={() => setListOpen((v) => !v)}
                >
                  <span className="text-muted-foreground text-sm">
                    {listOpen
                      ? (lang === "ar" ? `${types?.length ?? 0} نوع مضاف` : `${types?.length ?? 0} type(s) added`)
                      : (lang === "ar" ? "انقر لعرض الأنواع المضافة" : "Click to view added types")}
                  </span>
                  <ChevronDown
                    size={14} className={`text-muted-foreground transition-transform duration-200 ${listOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
              </div>

              {/* Types list — scrollable, toggled by dropdown */}
              <div
                className={`flex-1 overflow-y-auto flex-col gap-1.5 transition-all hide-scrollbar ${listOpen ? "flex" : "hidden"}`}
              >
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
                ) : types?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {lang === "ar" ? "لا توجد أنواع" : "No types yet"}
                  </p>
                ) : (
                  sortedTypes.map((type: LetterType, i: number) => (
                    <div
                      key={type.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-colors dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                          style={{ backgroundColor: type.color || badgeColors[i % badgeColors.length] }}
                        >
                          {type.code}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-foreground">{type.nameEn}</span>
                          <span className="text-xs text-muted-foreground" dir="rtl">{type.nameAr}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(lang === "ar" ? `هل تريد حذف النوع ${type.nameAr} نهائياً؟` : `Delete type ${type.nameEn} permanently?`)) {
                            deleteType.mutate({ id: type.id });
                          }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/10" aria-label={lang === "ar" ? `حذف ${type.nameAr}` : `Delete ${type.nameEn}`}
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
                  {!isLoading && types?.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-sm text-muted-foreground mb-4">{lang === 'ar' ? 'لا توجد أنواع. يمكنك إضافتها يدوياً أو استخدام الأنواع الافتراضية.' : 'No types found. You can add them manually or seed the defaults.'}</p>
                      <button onClick={handleSeedDefaults} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700" disabled={createType.isPending}>
                        <DatabaseZap size={16} />
                        {createType.isPending ? (lang === 'ar' ? 'جاري الإضافة...' : 'Seeding...') : (lang === 'ar' ? 'إضافة الأنواع الافتراضية' : 'Seed Default Types')}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center">
                      {lang === "ar"
                        ? "أضف نوعاً جديداً من الجانب الأيسر، ثم انقر على القائمة أعلاه للتحقق"
                        : "Add a new type on the left, then click the dropdown above to verify"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
