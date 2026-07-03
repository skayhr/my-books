import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useGetLetters, useGetLetterTypes } from "@workspace/api-client-react";
import { useAppContext } from "@/lib/app-context";
import { Search, Eye, FileText } from "lucide-react";
import { useDebounce } from "../hooks/use-debounce";
import StatsCards from "../components/stats-cards";
import "@/styles/glow.css";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Letter {
  employeeId: string;
  id: number;
  employeeFullName: string;
  department: string;
  bookDate: string;
  letterTypeId: number;
  letterTypeCode: string;
}

export function Home() {
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const isRtl = lang === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [, setLocation] = useLocation();

  const { data: letterTypes } = useGetLetterTypes();

  const matchedType = useMemo(() => {
    if (!letterTypes || !debouncedSearchTerm) return null;
    return letterTypes.find(
      (type: any) =>
        type.nameEn.toLowerCase() === debouncedSearchTerm.toLowerCase() ||
        type.nameAr.toLowerCase() === debouncedSearchTerm.toLowerCase()
    );
  }, [letterTypes, debouncedSearchTerm]);

  const queryParams = useMemo(() => {
    if (matchedType) {
      return { letterTypeId: matchedType.id };
    }
    return { search: debouncedSearchTerm };
  }, [matchedType, debouncedSearchTerm]);

  const { data: searchResults, isLoading: isSearchLoading } = useGetLetters(
    queryParams,
    {
      query: {
        queryKey: ["letters-search", queryParams],
        enabled: debouncedSearchTerm.length > 2,
      },
    },
  );

  const typeCodeMap = useMemo(() => {
    if (!letterTypes) return new Map<number, string>();
    return new Map(letterTypes.map((type: any) => [type.id, type.code]));
  }, [letterTypes]);

  const searchRows = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.map((letter: any) => ({
      ...letter,
      letterTypeCode: letter.letterTypeCode || typeCodeMap.get(letter.letterTypeId) || "",
    })) as Letter[];
  }, [searchResults, typeCodeMap]);

  const tableTitle = matchedType
    ? (lang === "ar" ? matchedType.nameAr : matchedType.nameEn)
    : (lang === "ar" ? "النتائج" : "Results");

  const openBook = (letter: Letter) => {
    const code = letter.letterTypeCode || typeCodeMap.get(letter.letterTypeId);
    if (code) {
      setLocation(`/bookcase/${code}`);
    }
  };

  const t = {
    welcome: lang === "ar" ? "مرحباً HR..." : "Hello HR...",
    prompt: lang === "ar" ? "أخبرني ما الذي تبحث عنه." : "Tell me what you're looking for.",
    searchPlaceholder: lang === "ar" ? "ابحث هنا..." : "Search...",
    noResults: lang === "ar" ? "لا توجد نتائج" : "No results found",
    open: lang === "ar" ? "افتح" : "Open",
    employee: lang === "ar" ? "الموظف" : "Employee",
    department: lang === "ar" ? "القسم" : "Department",
    date: lang === "ar" ? "التاريخ" : "Date",
    typeCode: lang === "ar" ? "الكود" : "Type Code",
    searching: lang === "ar" ? "جاري البحث..." : "Searching...",
  };

  const hasResults = debouncedSearchTerm.length > 2 && searchRows.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-background transition-colors duration-300" dir={isRtl ? "rtl" : "ltr"}>
      <div
        className={`flex-1 flex flex-col items-center px-6 pb-6 relative transition-all duration-500 ease-in-out ${
          debouncedSearchTerm.length > 2 ? "justify-start pt-20" : "justify-center"
        }`}
      >
        <div className={`radial-glow ${isDark ? "dark" : "light"}`} />

        <h1 className="text-4xl md:text-5xl font-light text-foreground mb-3 tracking-wide relative z-10">
          {t.welcome}
        </h1>
        <p className="text-base text-muted-foreground mb-8 relative z-10">{t.prompt}</p>

        <div className="group relative w-full max-w-xl z-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={17} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border-none bg-white/88 py-3.5 pl-12 pr-6 text-base text-foreground shadow-none placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-0 dark:bg-white/[.07] focus:placeholder:text-transparent"
          />

          {debouncedSearchTerm.length > 2 && (
            <div className="absolute top-full mt-3 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-xl animate-in fade-in-50 slide-in-from-top-2 dark:border-slate-800 dark:bg-slate-900">
              {isSearchLoading ? (
                <div className="p-4 text-center text-muted-foreground">{t.searching}</div>
              ) : hasResults ? (
                <div>
                  <div className="border-b border-gray-200 bg-gray-50 p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:border-slate-800 dark:bg-slate-950 flex items-center gap-2">
                    <FileText size={14} /> {tableTitle}
                  </div>
                  <div className="max-h-[40vh] overflow-auto scrollbar-thumb-blue">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50 dark:bg-slate-950">
                        <TableRow>
                          <TableHead className="w-36">{t.employee}</TableHead>
                          <TableHead>{t.department}</TableHead>
                          <TableHead>{t.date}</TableHead>
                          <TableHead>{t.typeCode}</TableHead>
                          <TableHead className="text-right">{t.open}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchRows.map((letter) => (
                          <TableRow
                            key={letter.id}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                            onClick={() => openBook(letter)}
                          >
                            <TableCell className="font-medium">{letter.employeeFullName}</TableCell>
                            <TableCell className="text-muted-foreground">{letter.department}</TableCell>
                            <TableCell className="text-muted-foreground">{format(new Date(letter.bookDate), "dd/MM/yyyy")}</TableCell>
                            <TableCell className="text-blue-500 font-semibold">{letter.letterTypeCode}</TableCell>
                            <TableCell className="text-right">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openBook(letter);
                                }}
                              >
                                <Eye size={14} /> {t.open}
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">{t.noResults}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center px-6 pb-12 shrink-0">
        <div className="w-full max-w-2xl">
          <StatsCards />
        </div>
      </div>
    </div>
  );
}
