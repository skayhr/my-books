import React, { useState } from "react";
import { StatsCards } from "@/components/stats-cards";
import { useGetLetters, useGetLetterTypes } from "@workspace/api-client-react";
import { Search, Printer, Calendar, Filter, X } from "lucide-react";
import { format } from "date-fns";
import logoUrl from "@assets/logo_1782493103781.png";
import { toast } from "sonner";

export function Report() {
  const { data: types } = useGetLetterTypes();
  
  const [search, setSearch] = useState("");
  const [letterTypeId, setLetterTypeId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // We only fetch when user clicks search to match enterprise pattern, or auto fetch. 
  // Let's auto fetch based on debounced search/filters for better UX.
  const { data: letters, isLoading } = useGetLetters({
    search: search || undefined,
    letterTypeId: letterTypeId === "" ? undefined : letterTypeId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  });

  return (
    <div className="w-full max-w-6xl mx-auto py-8 flex flex-col h-full gap-6">
      <StatsCards />

      <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search employee..."
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative min-w-[150px]">
          <select 
            className="w-full bg-background border border-border rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
            value={letterTypeId}
            onChange={(e) => setLetterTypeId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">All Types</option>
            {types?.map(t => <option key={t.id} value={t.id}>{t.nameEn}</option>)}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-muted-foreground" />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="date"
            className="bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <button 
          onClick={() => setIsPrintModalOpen(true)}
          className="ml-auto bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Printer size={18} /> Print Report
        </button>
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
                <th className="px-6 py-4 font-medium border-b border-border">TYPE</th>
                <th className="px-6 py-4 font-medium border-b border-border w-32">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
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
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-secondary text-xs font-medium text-foreground">
                        {letter.letterTypeCode} - {letter.letterTypeNameEn}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{format(new Date(letter.bookDate), "dd/MM/yyyy")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                    <p>No results found for the current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8">
          <div className="bg-white text-black w-full max-w-4xl max-h-full rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Print Preview</h2>
              <button onClick={() => setIsPrintModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50 print-area">
              <div className="bg-white p-8 sm:p-12 shadow-sm mx-auto max-w-[800px] min-h-[1056px] border border-gray-200">
                <div className="flex items-center gap-4 border-b-2 border-red-700 pb-6 mb-8">
                  <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-red-800">ERBIL REFINERY / KAR-3</h1>
                    <h2 className="text-sm font-semibold tracking-widest text-gray-600">MY BOOKS - HR SYSTEM</h2>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-center mb-8 uppercase underline decoration-red-700 underline-offset-8">Letter Report</h3>
                
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 font-bold text-gray-800">ID</th>
                      <th className="border border-gray-300 px-3 py-2 font-bold text-gray-800">EMPLOYEE</th>
                      <th className="border border-gray-300 px-3 py-2 font-bold text-gray-800">JOB TITLE</th>
                      <th className="border border-gray-300 px-3 py-2 font-bold text-gray-800">DEPARTMENT</th>
                      <th className="border border-gray-300 px-3 py-2 font-bold text-gray-800">TYPE</th>
                      <th className="border border-gray-300 px-3 py-2 font-bold text-gray-800 w-24">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {letters?.map((letter) => (
                      <tr key={letter.id}>
                        <td className="border border-gray-300 px-3 py-2 text-gray-600">{letter.id}</td>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-900">{letter.employeeFullName}</td>
                        <td className="border border-gray-300 px-3 py-2">{letter.jobTitle}</td>
                        <td className="border border-gray-300 px-3 py-2">{letter.department}</td>
                        <td className="border border-gray-300 px-3 py-2">{letter.letterTypeNameEn}</td>
                        <td className="border border-gray-300 px-3 py-2">{format(new Date(letter.bookDate), "dd/MM/yyyy")}</td>
                      </tr>
                    ))}
                    {(!letters || letters.length === 0) && (
                      <tr>
                        <td colSpan={6} className="border border-gray-300 px-3 py-8 text-center text-gray-500">No data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                <div className="mt-24 pt-8 border-t border-gray-300 flex justify-between px-12">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-12">Prepared By</span>
                    <span className="font-bold border-t border-gray-800 pt-1 px-4">HR Department</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-12">Approved By</span>
                    <span className="font-bold border-t border-gray-800 pt-1 px-4">HR Manager</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
              <button onClick={() => setIsPrintModalOpen(false)} className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast({ title: "Printing not fully implemented in browser preview", description: "Use browser print dialog." });
                  window.print();
                }}
                className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg flex items-center gap-2 shadow-md transition-colors"
              >
                <Printer size={18} /> Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
