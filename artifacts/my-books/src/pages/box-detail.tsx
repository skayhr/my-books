import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetLetters, useGetLetterTypes, useDeleteLetter } from "@workspace/api-client-react";
import { Search, ChevronLeft, Calendar, FileText, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export function BoxDetail() {
  const [match, params] = useRoute("/bookcase/:code");
  const code = params?.code || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: types } = useGetLetterTypes();
  const type = types?.find(t => t.code === code);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: letters, isLoading } = useGetLetters({
    letterTypeId: type?.id,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  }, {
    query: {
      enabled: !!type?.id
    }
  });

  const deleteLetter = useDeleteLetter({
    mutation: {
      onSuccess: () => {
        toast({ title: "Letter deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/letters"] });
      }
    }
  });

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
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
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
                Array.from({ length: 5 }).map((_, i) => (
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
                letters.map((letter) => (
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
                      <div className="flex gap-2">
                        {letter.pdfUrl && (
                          <a href={letter.pdfUrl} target="_blank" rel="noreferrer" className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Eye size={16} />
                          </a>
                        )}
                        <button 
                          onClick={() => {
                            if(confirm("Are you sure?")) deleteLetter.mutate({ id: letter.id });
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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

    </div>
  );
}
