import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/app-context";
import { Search, User, Building2, FileText, Eye, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetLetters, useGetLetterTypes } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Document, Page, pdfjs } from "react-pdf";

interface Letter {
  employeeId: string;
  id: number;
  employeeFullName: string;
  department: string;
  pdfUrl?: string | null;
}

export function PhoneHome() {
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const isRtl = lang === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [displayMode, setDisplayMode] = useState<'aggregate' | 'table'>('aggregate');
  const [tableTitle, setTableTitle] = useState('');
  const [tableResults, setTableResults] = useState<Letter[]>([]);

  // PDF Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const isPreviewOpen = !!previewUrl;

  const { data: searchResults, isLoading: isSearchLoading } = useGetLetters(
    { search: debouncedSearchTerm },
    {
      query: {
        queryKey: ["letters-search", { search: debouncedSearchTerm }],
        enabled: debouncedSearchTerm.length > 2,
      },
    },
  );

  const { data: letterTypes } = useGetLetterTypes();

  const aggregatedResults = React.useMemo(() => {
    if (!searchResults || !debouncedSearchTerm) {
      setDisplayMode('aggregate');
      return null;
    }

    const matchedType = letterTypes?.find(
      (type: { nameEn: string, nameAr: string }) =>
        type.nameEn.toLowerCase() === debouncedSearchTerm.toLowerCase() ||
        type.nameAr.toLowerCase() === debouncedSearchTerm.toLowerCase()
    );

    if (matchedType) {
      setDisplayMode('table');
      setTableTitle(lang === 'ar' ? matchedType.nameAr : matchedType.nameEn);
      setTableResults(searchResults.filter((letter: any) => letter.letterTypeId === matchedType.id));
      return null;
    }

    setDisplayMode('aggregate');
    const employees: Record<string, { name: string; count: number }> = {};
    const departments: Record<string, { name: string; count: number }> = {};

    searchResults.forEach((letter: Letter) => {
      if (letter.employeeId) {
        if (!employees[letter.employeeId]) {
          employees[letter.employeeId] = { name: letter.employeeFullName, count: 0 };
        }
        employees[letter.employeeId].count++;
      }
      if (letter.department) {
        if (!departments[letter.department]) {
          departments[letter.department] = { name: letter.department, count: 0 };
        }
        departments[letter.department].count++;
      }
    });

    return { employees: Object.values(employees), departments: Object.values(departments) };
  }, [searchResults, debouncedSearchTerm, letterTypes, lang]);

  const t = {
    welcome: lang === "ar" ? "أهلاً بك..." : "Hello HR...",
    prompt: lang === "ar" ? "أخبرني ماذا تبحث عنه؟" : "Tell me what you're looking for?",
    searchPlaceholder: lang === "ar" ? "بحث..." : "Search...",
    employees: lang === "ar" ? "الموظفون" : "Employees",
    department: lang === "ar" ? "الأقسام" : "Departments",
    noResults: lang === "ar" ? "لا توجد نتائج" : "No results found",
  };

  const hasAggregatedResults = aggregatedResults && (aggregatedResults.employees.length > 0 || aggregatedResults.departments.length > 0);
  const hasTableResults = displayMode === 'table' && tableResults.length > 0;
  const hasResults = hasAggregatedResults || hasTableResults;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setNumPages(0);
    setPageNumber(1);
  };

  // Add keyboard listener to close preview with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClosePreview();
    };
    if (isPreviewOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);


  return (
    <div
      className={`flex-1 flex flex-col items-center p-6 text-center transition-all duration-300 ${
        debouncedSearchTerm.length > 2 ? "justify-start pt-12" : "justify-center"
      }`}
      dir={isRtl ? "rtl" : "ltr"}>
      <div className="relative max-w-md w-full">
        {/* Glow effect */}
        <div className={`absolute -top-12 -bottom-8 -left-6 -right-6 rounded-full opacity-50 blur-3xl transition-opacity duration-300 ${
          isDark ? 'bg-[#083A5E]' : 'bg-blue-200'
        }`} />

        <h1 className="relative z-10 text-3xl sm:text-4xl font-light text-foreground/80">
          {t.welcome}
        </h1>
        <p className="relative z-10 text-base sm:text-lg text-muted-foreground mt-2 mb-8">
          {t.prompt}
        </p>
        <div className="relative group z-10">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className={`w-full h-14 pl-14 pr-6 rounded-full border text-lg focus:outline-none focus:ring-0 ${isDark ? 'bg-transparent border-white/10 text-white placeholder:text-gray-400' : 'bg-white/80 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
        </div>

        {debouncedSearchTerm.length > 2 && (
          <div className="relative z-10 mt-4 text-left rounded-2xl border border-border bg-card shadow-lg animate-in fade-in-50">
            {isSearchLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">{lang === "ar" ? "جاري البحث..." : "Searching..."}</div>
            ) : hasResults ? (
              displayMode === 'aggregate' && hasAggregatedResults ? (
                <>
                  {aggregatedResults.employees.length > 0 && (
                    <div className="border-b border-border last:border-b-0">
                      <h3 className="bg-secondary/30 p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.employees}</h3>
                      {aggregatedResults.employees.map((emp, i) => <div key={i} className="flex justify-between items-center p-3 text-sm"><span className="font-medium">{emp.name}</span><span className="font-bold text-primary">{emp.count}</span></div>)}
                    </div>
                  )}
                  {aggregatedResults.departments.length > 0 && (
                    <div>
                      <h3 className="bg-secondary/30 p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.department}</h3>
                      {aggregatedResults.departments.map((dept, i) => <div key={i} className="flex justify-between items-center p-3 text-sm"><span className="font-medium">{dept.name}</span><span className="font-bold text-primary">{dept.count}</span></div>)}
                    </div>
                  )}
                </>
              ) : displayMode === 'table' && hasTableResults ? (
                <div>
                  <h3 className="bg-secondary/30 p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FileText size={14} /> {tableTitle}</h3>
                  {tableResults.map(letter => (
                    <div key={letter.id} className="flex items-center justify-between p-3 border-t border-border text-sm">
                      <div>
                        <span>{letter.employeeFullName}</span> <span className="text-muted-foreground">({letter.department})</span>
                      </div>
                      {letter.pdfUrl && (
                        <button type="button" onClick={() => setPreviewUrl(letter.pdfUrl ?? null)} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600">
                          <Eye size={14} /> {lang === 'ar' ? 'معاينة' : 'Preview'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : null
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">{t.noResults}</div>
            )}
          </div>
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
              <Document 
                file={previewUrl} 
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<p className="text-white">Loading PDF...</p>}
                error={<p className="text-red-400">Failed to load PDF.</p>}
                className="flex h-full w-full justify-center"
              >
                <Page 
                  pageNumber={pageNumber} 
                  height={window.innerHeight * 0.8}
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}