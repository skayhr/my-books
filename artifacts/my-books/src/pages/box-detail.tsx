import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useGetLetters, useGetLetterTypes, useDeleteLetter } from "@workspace/api-client-react";
import { Search, ChevronLeft, Calendar, FileText, Trash2, Eye, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Document, Page } from "react-pdf";
import { useAppContext } from "@/lib/app-context";

interface LetterType {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
}

interface Letter {
  id: number;
  employeeFullName: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  bookDate: string;
  pdfUrl?: string | null;
}

export function BoxDetail() {
  const [match, params] = useRoute("/bookcase/:code");
  const code = params?.code || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang } = useAppContext();

  const { data: types } = useGetLetterTypes();
  const type = types?.find((t: LetterType) => t.code === code);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // PDF Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const isPreviewOpen = !!previewUrl;

  const queryParams = {
    letterTypeId: type?.id,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    fields: "pdfUrl" as const,
  };
  const { data: letters, isLoading } = useGetLetters(
    queryParams,
    {
    query: {
      queryKey: ["/api/letters", queryParams],
      enabled: !!type?.id,
    },
  });

  const deleteLetter = useDeleteLetter({
    mutation: {
      onSuccess: () => {
        toast({ title: "Letter deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/letters"] });
      }
    }
  });

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
    <div className="w-full max-w-6xl mx-auto py-8 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/bookcase" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">{code}</span>
            {type?.nameEn || "Loading..."}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all letters in this box</p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search by Employee or ID..."
            className="w-full bg-background border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm transition-colors duration-200 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/25"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-muted-foreground" />
            </div>
            <input
              type="date"
              className="bg-background border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm transition-colors duration-200 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/25"
              aria-label="Date from"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-muted-foreground" />
            </div>
            <input
              type="date"
              className="bg-background border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm transition-colors duration-200 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/25"
              aria-label="Date to"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="min-h-0 flex-1 overflow-auto scrollbar-thumb-blue max-h-[60vh]">
          <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium border-b border-border w-16">ID</th>
                  <th className="px-6 py-4 font-medium border-b border-border">EMPLOYEE</th>
                  <th className="px-6 py-4 font-medium border-b border-border">JOB TITLE</th>
                  <th className="px-6 py-4 font-medium border-b border-border">DEPARTMENT</th>
                  <th className="px-6 py-4 font-medium border-b border-border w-32">DATE</th>
                  <th className="px-6 py-4 font-medium border-b border-border w-24">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i: number) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32 mb-1" /><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))
                ) : letters && letters.length > 0 ? (
                  letters.map((letter: Letter) => (
                    <tr key={letter.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">{letter.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{letter.employeeFullName}</div>
                        <div className="text-xs text-muted-foreground">{letter.employeeId}</div>
                      </td>
                      <td className="px-6 py-4">{letter.jobTitle}</td>
                      <td className="px-6 py-4">{letter.department}</td>
                      <td className="px-6 py-4 font-medium">{format(new Date(letter.bookDate), "dd/MM/yyyy")}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => { if (letter.pdfUrl) setPreviewUrl(letter.pdfUrl); }}
                            disabled={!letter.pdfUrl}
                            className="p-2 text-blue-500 rounded-lg transition-colors hover:bg-blue-500/10 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed"
                            aria-label={`Preview letter ${letter.id}`}
                            title={letter.pdfUrl ? "Preview PDF" : "No PDF attached"}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Are you sure?")) deleteLetter.mutate({ id: letter.id });
                            }}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            aria-label={`Delete letter ${letter.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <FileText size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No letters found in this box.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* PDF Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={handleClosePreview}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClosePreview}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close preview"
            >
              <X size={20} />
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
                  className="shadow-2xl"
                />
              </Document>
            </div>

            {numPages > 1 && (
              <div className="flex items-center justify-center gap-6 bg-black/40 py-3 text-white backdrop-blur-md">
                <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => Math.max(p - 1, 1))} className="rounded bg-white/10 px-4 py-1 disabled:opacity-30">{lang === 'ar' ? 'السابق' : 'Previous'}</button>
                <span className="font-mono text-sm">{pageNumber} / {numPages}</span>
                <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} className="rounded bg-white/10 px-4 py-1 disabled:opacity-30">{lang === 'ar' ? 'التالي' : 'Next'}</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
