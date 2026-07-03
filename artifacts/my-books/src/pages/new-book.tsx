import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { UploadCloud, FileWarning, FileText, ChevronLeft, ChevronRight, Loader2, X, Eye, Check } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
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
    page: "Page",
    pdfLoadError: "Failed to load PDF",
    cancel: "Cancel",
    saving: "Saving...",
    preview: "Preview",
    previous: "Previous",
    next: "Next",
    clear: "Clear",
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
    page: "صفحة",
    pdfLoadError: "فشل تحميل PDF",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
    preview: "معاينة",
    previous: "السابق",
    next: "التالي",
    clear: "مسح",
    lookingUp: "جاري البحث...",
    selectType: "اختر النوع...",
    fillRequired: "يرجى ملء جميع الحقول المطلوبة",
    created: "تم إنشاء الخطاب بنجاح",
    error: "خطأ في إنشاء الخطاب",
  },
};

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const fieldCls = (isDark: boolean) =>
  `w-full rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#284B98] transition-colors ${
    isDark
      ? "bg-[#0f2236] border border-[#1e3a5a] text-white placeholder:text-gray-500"
      : "bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400"
  }`;

const initialFormData = {
  letterTypeId: "",
  pdfFile: null as File | null,
  employeeFullName: "",
  jobTitle: "",
  department: "",
  bookDate: new Date().toISOString().split("T")[0],
  pdfUrl: null as string | null,
};

interface LetterType {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
}

export function NewBook() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const t = labels[lang];
  const isRtl = lang === "ar";

  const { data: letterTypes } = useGetLetterTypes();
  
  const sortedTypes = React.useMemo(() => {
    if (!letterTypes) return [];
    return [...letterTypes].sort((a, b) => a.code.localeCompare(b.code));
  }, [letterTypes]);

  const [employeeId, setEmployeeId] = useState("");
  const [debouncedEmpId, setDebouncedEmpId] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const selectedType = React.useMemo(
    () => letterTypes?.find((type) => type.id.toString() === formData.letterTypeId),
    [letterTypes, formData.letterTypeId],
  );

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [formData.pdfFile]); // إعادة القياس عند تحميل ملف جديد
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmpId(employeeId), 500);
    return () => clearTimeout(timer);
  }, [employeeId]);

  const { data: employeeData, isLoading: lookingUp } = useLookupEmployee(
    debouncedEmpId,
    {
      query: {
        queryKey: ["employee", debouncedEmpId],
        enabled: debouncedEmpId.length > 0,
        retry: false,
      },
    },
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error while loading document!", error);
    toast({ title: t.pdfLoadError, variant: "destructive" });
  };

  const createLetter = useCreateLetter({
    mutation: {
      onSuccess: () => {
        toast({ description: (
          <div className="flex items-center gap-2 text-green-500">
            <Check size={18} />
            <span className="font-semibold text-foreground">{t.created}</span>
          </div>
        ) });
        queryClient.invalidateQueries({ queryKey: ["/api/letters"] });
        queryClient.invalidateQueries({ queryKey: ["/api/letter-types"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        // Clear the form for the next entry after a short delay
        // to allow the user to see the success message.
        setTimeout(() => {
          handleClear();
        }, 1000);
      },
      onError: () => {
        toast({ title: t.error, variant: "destructive" });
      },
    },
  });

  const uploadPdfFile = async (file: File): Promise<string> => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5000";
    const uploadUrl = new URL("/api/upload", apiBaseUrl).toString();

    const body = new FormData();
    body.append("file", file);

    console.debug("Uploading PDF to", uploadUrl, { fileName: file.name });

    const response = await fetch(uploadUrl, {
      method: "POST",
      body,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed", response.status, errorText);
      throw new Error("Upload failed");
    }
    const data = await response.json();
    return data.url;
  };

  useEffect(() => {
    if (employeeData) {
      setFormData(prev => ({
        ...prev,
        employeeFullName: employeeData.fullName,
        jobTitle: employeeData.jobTitle,
        department: employeeData.department,
      }));
    }
  }, [employeeData]);

  const handleSubmit = async () => {
    if (!formData.letterTypeId || !employeeId || !formData.employeeFullName) {
      toast({ title: t.fillRequired, variant: "destructive" });
      return;
    }

    let pdfUrl: string | null = formData.pdfUrl ?? null;
    if (formData.pdfFile && !formData.pdfUrl) {
      try {
        setIsUploading(true);
        pdfUrl = await uploadPdfFile(formData.pdfFile);
        setFormData((prev) => ({ ...prev, pdfUrl }));
      } catch (error) {
        console.error(error);
        toast({ title: t.error, variant: "destructive" });
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    createLetter.mutate({
      data: {
        letterTypeId: parseInt(formData.letterTypeId),
        employeeId,
        employeeFullName: formData.employeeFullName,
        jobTitle: formData.jobTitle,
        department: formData.department,
        bookDate: formData.bookDate,
        pdfUrl,
      },
    });
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setEmployeeId("");
    setNumPages(0);
  };

  return (
    <div
      className="flex-1 h-full bg-background transition-colors duration-300"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Page header */}
        <h1 className="text-2xl font-bold text-foreground mb-0.5">{t.pageTitle}</h1>
        <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t.pageSubtitle}</p>

        {/* Main card */}
        <div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Card header */}
          <div className="flex items-center gap-2 px-6 pt-5 pb-4">
            <FileText size={18} className={isDark ? "text-blue-400" : "text-blue-500"} />
            <span className="font-semibold text-foreground">{t.sectionTitle}</span>
          </div>

          {/* Card body: 2 columns */}
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[1.2fr_380px]">
            {/* Left: form */}
            <div className="flex flex-col gap-6">
              {/* Row 1: Letter Type + Employee ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="letterTypeId" className="text-xs font-medium text-muted-foreground">{t.letterType}</label>
                  <div className="relative" onBlur={() => setTimeout(() => setIsTypeDropdownOpen(false), 150)}>
                    <button
                      type="button"
                      id="letterTypeId"
                      onClick={() => setIsTypeDropdownOpen(v => !v)}
                      className={`${fieldCls(isDark)} flex w-full cursor-pointer items-center justify-between text-left ${isTypeDropdownOpen ? "rounded-b-none" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-xs font-bold text-white">
                          {selectedType?.code || "?"}
                        </span>
                        <span className={selectedType ? "font-semibold text-foreground" : "text-gray-400 dark:text-gray-500"}>
                          {selectedType ? (lang === "ar" ? selectedType.nameAr : selectedType.nameEn) : t.selectType}
                        </span>
                      </div>
                      <ChevronRight size={14} className={`text-gray-400 transition-transform ${isTypeDropdownOpen ? "-rotate-90" : "rotate-90"}`} />
                    </button>

                    {isTypeDropdownOpen && (
                      <div className="absolute top-full z-10 w-full max-h-60 overflow-y-auto hide-scrollbar rounded-b-lg border-x border-b border-slate-200 bg-white p-1 shadow-xl dark:border-x-slate-800 dark:border-b-slate-800 dark:bg-[#0f2236]">
                        {sortedTypes.map((type: LetterType) => (
                          <div
                            key={type.id}
                            onClick={() => {
                              setFormData({ ...formData, letterTypeId: type.id.toString() });
                              setIsTypeDropdownOpen(false);
                            }}
                            className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              >
                                {type.code}
                              </span>
                              <span className="font-medium text-foreground">
                                {lang === "ar" ? type.nameAr : type.nameEn}
                              </span>
                            </div>
                            {formData.letterTypeId === type.id.toString() && (
                              <Check size={14} className="text-blue-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 z-20">
                      <ChevronRight size={14} className={`text-gray-400 transition-transform ${isTypeDropdownOpen ? "-rotate-90" : "rotate-90"}`} />
                    </div>
                  </div>
                </div>
                <div className="relative z-30 flex flex-col gap-1.5">
                  <label htmlFor="employeeId" className="text-xs font-medium text-muted-foreground">{t.employeeId}</label>
                  <div className="relative">
                    <input
                      id="employeeId"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
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
                  <label htmlFor="employeeFullName" className="text-xs font-medium text-muted-foreground">{t.empFullName}</label>
                  <input
                    id="employeeFullName"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    className={fieldCls(isDark)}
                    value={formData.employeeFullName}
                    onChange={(e) => setFormData({ ...formData, employeeFullName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="jobTitle" className="text-xs font-medium text-muted-foreground">{t.jobTitle}</label>
                  <input
                    id="jobTitle"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    className={fieldCls(isDark)}
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Department + Book Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="department" className="text-xs font-medium text-muted-foreground">{t.department}</label>
                  <input
                    id="department"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    className={fieldCls(isDark)}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bookDate" className="text-xs font-medium text-muted-foreground">{t.bookDate}</label>
                  <input
                    id="bookDate"
                    type="date"
                    autoComplete="off"
                    spellCheck={false}
                    className={`${fieldCls(isDark)} date-input`}
                    value={formData.bookDate}
                    aria-label={t.bookDate}
                    onChange={(e) => setFormData({ ...formData, bookDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-auto flex gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isUploading || createLetter.isPending}
                  className="flex-2 rounded-lg bg-linear-to-r from-[#26468E] to-[#9D4042] py-2.5 text-base font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(38,70,142,0.25)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isUploading || createLetter.isPending ? t.saving : t.save}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 rounded-lg bg-[#31609B] py-2.5 text-base font-semibold text-white transition-all"
                >
                  {t.clear}
                </button>
              </div>
            </div>

            {/* Right: PDF upload */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-muted-foreground mb-1.5">{t.copyOfBook}</label>
              <div
                ref={containerRef} // ربط المرجع للحصول على العرض
                className="group relative flex h-112.5 cursor-pointer flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-slate-300 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-900/40 overflow-hidden"
              >
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label={t.uploadPdf}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNumPages(0); // Reset pages on new file
                      setFormData({ ...formData, pdfFile: file, pdfUrl: "" });
                    }
                  }}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-blue-400">
                    <Loader2 size={44} className="animate-spin" />
                  </div>
                ) : formData.pdfFile ? (
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                    <Document
                      file={formData.pdfFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                    >
                      <Page 
                        pageNumber={pageNumber} 
                        width={300}
                        renderTextLayer={false} 
                        renderAnnotationLayer={false}
                      />
                    </Document>
                    <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
                      <button
                        type="button"
                        onClick={(e) => {
                          // Stop the click from bubbling up to any parent handlers
                          e.stopPropagation();
                          setIsPreviewOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-black/80"
                      >
                        <Eye size={14} /> {t.preview}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={40} className="mx-auto text-blue-500 mb-2" />
                    <p className="text-sm font-semibold">{t.uploadPdf}</p>
                  </div>
                )}
              </div>

              {numPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                    disabled={pageNumber <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors disabled:opacity-40 dark:bg-slate-800 dark:text-slate-400"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-muted-foreground self-center">{t.page} {pageNumber} / {numPages}</span>
                  <button
                    type="button"
                    onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
                    disabled={pageNumber >= numPages}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors disabled:opacity-40 dark:bg-slate-800 dark:text-slate-400"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {isPreviewOpen && formData.pdfFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          {/* حاوية النافذة المنبثقة */}
          <div 
            className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* زر الإغلاق */}
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              ✕
            </button>
      
            {/* منطقة عرض الكتاب - التعديل الأساسي هنا */}
            <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
              <Document 
                file={formData.pdfFile} 
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex h-full w-full justify-center"
              >
                <Page 
                  pageNumber={pageNumber} 
                  height={window.innerHeight * 0.8} // ضبط الطول بناءً على حجم الشاشة
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  className="shadow-2xl"
                />
              </Document>
            </div>
      
            {/* شريط التنقل في الأسفل */}
            {numPages > 1 && (
              <div className="flex items-center justify-center gap-6 bg-black/40 py-3 text-white backdrop-blur-md">
                <button 
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                  className="rounded bg-white/10 px-4 py-1 disabled:opacity-30"
                >
                  {t.previous}
                </button>
                <span className="font-mono text-sm">{pageNumber} / {numPages}</span>
                <button 
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
                  className="rounded bg-white/10 px-4 py-1 disabled:opacity-30"
                >
                  {t.next}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
