import React, { useState, useEffect } from "react";
import { useGetLetters, useGetLetterTypes } from "@workspace/api-client-react";
import { useAppContext } from "@/lib/app-context";
import { Search, FileText, Calendar, ChevronDown, Check, Eraser, Eye, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Document, Page, pdfjs } from "react-pdf";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-GB").replace(/\//g, "-"); }
  catch { return d; }
}

interface Letter {
  id: number;
  employeeId: string;
  employeeFullName: string;
  department: string;
  letterTypeNameEn: string;
  bookDate: string;
  pdfUrl?: string | null;
}

interface LetterType {
  id: number;
  nameEn: string;
}

export function PhoneSearch() {
  const { lang } = useAppContext();
  const { data: types } = useGetLetterTypes();

  const [search, setSearch] = useState("");
  const [letterTypeId, setLetterTypeId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const [committed, setCommitted] = useState<{
    search: string; letterTypeId: number | ""; dateFrom: string; dateTo: string;
  } | null>(null);

  // PDF Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const isPreviewOpen = !!previewUrl;

  const { data: letters, isLoading } = useGetLetters(
    committed ? {
      search: committed.search || undefined,
      letterTypeId: committed.letterTypeId === "" ? undefined : committed.letterTypeId,
      dateFrom: committed.dateFrom || undefined,
      dateTo: committed.dateTo || undefined,
    } : undefined,
    { query: {
      queryKey: ["phone-search-letters", committed],
      enabled: committed !== null,
    } }
  );

  const handleSearch = () => setCommitted({ search, letterTypeId, dateFrom, dateTo });
  const handleClear = () => {
    setSearch(""); setLetterTypeId(""); setDateFrom(""); setDateTo("");
    setCommitted(null);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setNumPages(0);
    setPageNumber(1);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClosePreview();
    };
    if (isPreviewOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);

  const t = {
    title: lang === "ar" ? "بحث عن الخطابات" : "Search Letters",
    subtitle: lang === "ar" ? "ابحث في الأرشيف باستخدام الفلاتر" : "Find letters in the archive using filters",
    searchPh: lang === "ar" ? "ابحث بالاسم أو الرقم..." : "Search by name or ID...",
    allTypes: lang === "ar" ? "جميع الأنواع" : "All Types",
    searchBtn: lang === "ar" ? "بحث" : "Search",
    noResults: lang === "ar" ? "لا توجد نتائج" : "No results found",
    initialMsg: lang === "ar" ? "استخدم الفلاتر أعلاه لبدء البحث" : "Use the filters above to start searching",
    loading: lang === "ar" ? "جاري البحث..." : "Searching...",
    dateFrom: lang === "ar" ? "من تاريخ" : "Date From",
    dateTo: lang === "ar" ? "إلى تاريخ" : "Date To",
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border mb-4 shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t.searchPh} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50" aria-label={t.searchPh} />
        </div>
        <div className="relative" onBlur={() => setTimeout(() => setIsTypeDropdownOpen(false), 150)}>
          <button type="button" onClick={() => setIsTypeDropdownOpen(v => !v)} className="w-full flex items-center justify-between text-left bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50">
            <span className={letterTypeId ? "text-foreground" : "text-muted-foreground"}>
              {types?.find((t: LetterType) => t.id === letterTypeId)?.nameEn || t.allTypes}
            </span>
            <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {isTypeDropdownOpen && (
            <div className="absolute top-full mt-1 z-20 w-full max-h-48 overflow-y-auto rounded-lg border bg-popover p-1 shadow-xl">
              <div onClick={() => { setLetterTypeId(""); setIsTypeDropdownOpen(false); }} className="flex items-center justify-between cursor-pointer rounded-md px-2.5 py-2 text-sm hover:bg-accent">
                <span className="font-medium text-muted-foreground">{t.allTypes}</span>
                {letterTypeId === "" && <Check size={14} className="text-primary" />}
              </div>
              {types?.map((type: LetterType) => (
                <div key={type.id} onClick={() => { setLetterTypeId(type.id); setIsTypeDropdownOpen(false); }} className="flex items-center justify-between cursor-pointer rounded-md px-2.5 py-2 text-sm hover:bg-accent">
                  <span className="font-medium text-foreground">{type.nameEn}</span>
                  {letterTypeId === type.id && <Check size={14} className="text-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50" aria-label={t.dateFrom} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50" aria-label={t.dateTo} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button onClick={handleClear} className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80">
            <Eraser size={14} /> {lang === "ar" ? "مسح" : "Clear"}
          </button>
          <button onClick={handleSearch} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]">
            {t.searchBtn}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-20 hide-scrollbar">
        {!committed ? (
          <div className="text-center py-16 text-muted-foreground">{t.initialMsg}</div>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : letters && letters.length > 0 ? (
          letters.map((letter: Letter) => (
            <div key={letter.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{letter.employeeFullName}</p>
                <p className="text-xs text-muted-foreground">{letter.employeeId} · {letter.department}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{letter.letterTypeNameEn}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-muted-foreground">{fmtDate(letter.bookDate)}</div>
                {letter.pdfUrl && (
                  <button type="button" onClick={() => setPreviewUrl(letter.pdfUrl ?? null)} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600" aria-label={lang === "ar" ? `معاينة الخطاب ${letter.id}` : `Preview letter ${letter.id}`}>
                    <Eye size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">{t.noResults}</div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={handleClosePreview}
        >
          <div
            className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClosePreview}
              className="absolute right-2 top-2 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>

            <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
              <TransformWrapper>
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                  <Document
                    file={previewUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<p className="text-white">Loading PDF...</p>}
                    error={<p className="text-red-400">Failed to load PDF.</p>}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <Page pageNumber={pageNumber} height={window.innerHeight * 0.8} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}