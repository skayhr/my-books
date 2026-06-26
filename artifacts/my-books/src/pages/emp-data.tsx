import React, { useState, useRef } from "react";
import { useGetEmployees, useImportEmployees, useClearEmployees } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, UploadCloud, Trash2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export function EmpData() {
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useGetEmployees({
    search: search || undefined
  });

  const importEmployees = useImportEmployees({
    mutation: {
      onSuccess: (data) => {
        toast({ title: `Successfully imported ${data.imported} employees` });
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      },
      onError: () => {
        toast({ title: "Failed to import employees", variant: "destructive" });
      }
    }
  });

  const clearEmployees = useClearEmployees({
    mutation: {
      onSuccess: () => {
        toast({ title: "Table cleared successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      }
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map to expected format
        const mappedEmployees = jsonData.map((row: any) => ({
          employeeId: String(row.employeeId || row["Employee ID"] || row.ID || ""),
          fullName: String(row.fullName || row["Full Name"] || row.Name || ""),
          jobTitle: String(row.jobTitle || row["Job Title"] || row.Title || ""),
          department: String(row.department || row.Department || "")
        })).filter(emp => emp.employeeId && emp.fullName); // Filter valid rows

        if (mappedEmployees.length === 0) {
          toast({ title: "No valid employee data found in Excel", variant: "destructive" });
          return;
        }

        importEmployees.mutate({ data: { employees: mappedEmployees } });
      } catch (error) {
        console.error(error);
        toast({ title: "Error parsing Excel file", variant: "destructive" });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees Management</h1>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importEmployees.isPending}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {importEmployees.isPending ? "Importing..." : <><UploadCloud size={16} /> Import Excel</>}
          </button>
          <button 
            onClick={() => {
              if(confirm("Are you sure you want to clear all employee records? This action cannot be undone.")) {
                clearEmployees.mutate();
              }
            }}
            disabled={clearEmployees.isPending}
            className="px-4 py-2 bg-card border border-card-border text-destructive hover:bg-destructive/10 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} /> Clear Table
          </button>
        </div>
      </div>

      <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search employee name or ID..."
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-border w-16">No.</th>
                <th className="px-6 py-4 font-medium border-b border-border">EMPLOYEE ID</th>
                <th className="px-6 py-4 font-medium border-b border-border">FULL NAME</th>
                <th className="px-6 py-4 font-medium border-b border-border">JOB TITLE</th>
                <th className="px-6 py-4 font-medium border-b border-border">DEPARTMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : employees && employees.length > 0 ? (
                employees.map((emp, i) => (
                  <tr key={emp.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{i + 1}</td>
                    <td className="px-6 py-4 font-semibold text-primary">{emp.employeeId}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{emp.fullName}</td>
                    <td className="px-6 py-4">{emp.jobTitle}</td>
                    <td className="px-6 py-4">{emp.department}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                    <FileSpreadsheet size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No employees found. Import an Excel file to get started.</p>
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
