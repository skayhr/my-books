import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { UploadCloud, CheckCircle2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetLetterTypes, useLookupEmployee, useCreateLetter } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/lib/app-context";

const labels = {
  en: {
    pageTitle: "Add Letter",
    pageSubtitle: "Enter official letter details",
    sectionTitle: "Letter Information",
    letterType: "Letter Type:",
    employeeId: "Employee ID",
    empFullName: "Employee Full Name:",
    jobTitle: "Job Title:",
    department: "Department",
    bookDate: "Book Date:",
    copyOfBook: "A copy of the book",
    uploadPdf: "Click to upload PDF",
    pdfOnly: "PDF files only",
    pdfAttached: "PDF Attached",
    clickReplace: "Click to replace",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving...",
    lookingUp: "Looking up...",
    selectType: "Select type...",
    fillRequired: "Please fill all required fields",
    created: "Letter created successfully",
    error: "Error creating letter",
  },
  ar: {
    pageTitle: "إضافة خطاب",
    pageSubtitle: "أدخل تفاصيل الخطاب الرسمي",
    sectionTitle: "معلومات الخطاب",
    letterType: "نوع الخطاب:",
    employeeId: "رقم الموظف",
    empFullName: "الاسم الكامل للموظف:",
    jobTitle: "المسمى الوظيفي:",
    department: "القسم",
    bookDate: "تاريخ الخطاب:",
    copyOfBook: "نسخة من الخطاب",
    uploadPdf: "انقر لرفع ملف PDF",
    pdfOnly: "ملفات PDF فقط",
    pdfAttached: "تم رفع الملف",
    clickReplace: "انقر للاستبدال",
    save: "حفظ",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
    lookingUp: "جاري البحث...",
    selectType: "اختر النوع...",
    fillRequired: "يرجى ملء جميع الحقول المطلوبة",
    created: "تم إنشاء الخطاب بنجاح",
    error: "خطأ في إنشاء الخطاب",
  },
};

const fieldCls = (isDark: boolean) =>
  `w-full rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
    isDark
      ? "bg-[#0f2236] border border-[#1e3a5a] text-white placeholder:text-gray-500"
      : "bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400"
  }`;

export function NewBook() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const t = labels[lang];
  const isRtl = lang === "ar";

  const { data: letterTypes } = useGetLetterTypes();

  const [employeeId, setEmployeeId] = useState("");
  const [debouncedEmpId, setDebouncedEmpId] = useState("");
  const [formData, setFormData] = useState({
    letterTypeId: "",
    employeeFullName: "",
    jobTitle: "",
    department: "",
    bookDate: new Date().toISOString().split("T")[0],
    pdfUrl: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmpId(employeeId), 500);
    return () => clearTimeout(timer);
  }, [employeeId]);

  const { data: employeeData, isLoading: lookingUp } = useLookupEmployee(debouncedEmpId, {
    query: { enabled: debouncedEmpId.length > 0, retry: false },
  });

  useEffect(() => {
    if (employeeData) {
      setFormData((prev) => ({
        ...prev,
        employeeFullName: employeeData.fullName,
        jobTitle: employeeData.jobTitle,
        department: employeeData.department,
      }));
    }
  }, [employeeData]);

  const createLetter = useCreateLetter({
    mutation: {
      onSuccess: () => {
        toast({ title: t.created });
        queryClient.invalidateQueries({ queryKey: ["/api/letters"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        setLocation("/bookcase");
      },
      onError: () => {
        toast({ title: t.error, variant: "destructive" });
      },
    },
  });

  const handleSubmit = () => {
    if (!formData.letterTypeId || !employeeId || !formData.employeeFullName) {
      toast({ title: t.fillRequired, variant: "destructive" });
      return;
    }
    createLetter.mutate({
      data: {
        letterTypeId: parseInt(formData.letterTypeId),
        employeeId,
        employeeFullName: formData.employeeFullName,
        jobTitle: formData.jobTitle,
        department: formData.department,
        bookDate: formData.bookDate,
        pdfUrl: formData.pdfUrl || null,
      },
    });
  };

  return (
    <div
      className="flex-1 min-h-full bg-background transition-colors duration-300"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Page header */}
        <h1 className="text-2xl font-bold text-foreground mb-0.5">{t.pageTitle}</h1>
        <p className={`text-sm mb-6 ${isDark ? "text-[#4a9eda]" : "text-blue-500"}`}>{t.pageSubtitle}</p>

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
          <div className="flex items-center gap-2 px-6 pt-5 pb-4">
            <FileText size={18} className={isDark ? "text-blue-400" : "text-blue-500"} />
            <span className="font-semibold text-foreground">{t.sectionTitle}</span>
          </div>

          {/* Card body: 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-0">
            {/* Left: form */}
            <div className="px-6 pb-6 flex flex-col gap-4 border-r border-[#1e3a5a]/40">
              {/* Row 1: Letter Type + Employee ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">{t.letterType}</label>
                  <div className="relative">
                    <select
                      className={fieldCls(isDark) + " appearance-none pr-8 cursor-pointer"}
                      value={formData.letterTypeId}
                      onChange={(e) => setFormData({ ...formData, letterTypeId: e.target.value })}
                    >
                      <option value=""></option>
                      {letterTypes?.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.code} — {lang === "ar" ? type.nameAr : type.nameEn}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronRight size={14} className="text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">{t.employeeId}</label>
                  <div className="relative">
                    <input
                      type="text"
                      className={fieldCls(isDark)}
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="EMP001"
                    />
                    {lookingUp && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 animate-pulse">
                        {t.lookingUp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Employee Full Name + Job Title */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">{t.empFullName}</label>
                  <input
                    type="text"
                    className={fieldCls(isDark)}
                    value={formData.employeeFullName}
                    onChange={(e) => setFormData({ ...formData, employeeFullName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">{t.jobTitle}</label>
                  <input
                    type="text"
                    className={fieldCls(isDark)}
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Department + Book Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">{t.department}</label>
                  <input
                    type="text"
                    className={fieldCls(isDark)}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">{t.bookDate}</label>
                  <input
                    type="date"
                    className={fieldCls(isDark)}
                    value={formData.bookDate}
                    onChange={(e) => setFormData({ ...formData, bookDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-auto pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createLetter.isPending}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-base tracking-wide transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(to right, #1a56db, #c0392b)",
                    boxShadow: "0 4px 14px rgba(26,86,219,0.25)",
                  }}
                >
                  {createLetter.isPending ? t.saving : t.save}
                </button>
                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="px-8 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={
                    isDark
                      ? { background: "#1e3a5a", color: "#94a3b8" }
                      : { background: "#e2e8f0", color: "#64748b" }
                  }
                >
                  {t.cancel}
                </button>
              </div>
            </div>

            {/* Right: PDF upload */}
            <div className="px-5 pt-0 pb-6 flex flex-col">
              <label className="text-xs text-muted-foreground font-medium mb-3 block pt-1">{t.copyOfBook}</label>
              <div
                className="flex-1 rounded-2xl flex flex-col items-center justify-center p-6 relative cursor-pointer group"
                style={{
                  border: `1.5px dashed ${isDark ? "#2a4a6a" : "#cbd5e1"}`,
                  background: isDark ? "rgba(15,34,62,0.4)" : "rgba(248,250,252,0.8)",
                  minHeight: "220px",
                }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setFormData({ ...formData, pdfUrl: URL.createObjectURL(e.target.files[0]) });
                      toast({ title: t.pdfAttached });
                    }
                  }}
                />
                {formData.pdfUrl ? (
                  <div className="flex flex-col items-center gap-2 text-green-400">
                    <CheckCircle2 size={44} />
                    <span className="font-semibold text-sm">{t.pdfAttached}</span>
                    <span className="text-xs text-muted-foreground">{t.clickReplace}</span>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                      style={{ background: isDark ? "#1e3a5a" : "#dbeafe" }}
                    >
                      <UploadCloud size={30} className={isDark ? "text-blue-300" : "text-blue-500"} />
                    </div>
                    <p className="text-sm font-semibold text-foreground text-center">{t.uploadPdf}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.pdfOnly}</p>
                  </>
                )}
              </div>

              {/* Navigation arrows */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={isDark ? { background: "#1e3a5a", color: "#94a3b8" } : { background: "#e2e8f0", color: "#64748b" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={isDark ? { background: "#1e3a5a", color: "#94a3b8" } : { background: "#e2e8f0", color: "#64748b" }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
