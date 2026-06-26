import React, { useState, useRef } from "react";
import { useGetEmployees, useImportEmployees, useClearEmployees } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { useAppContext } from "@/lib/app-context";

export function EmpData() {
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const isRtl = lang === "ar";

  const { data: employees, isLoading } = useGetEmployees({ search: search || undefined });

  const importEmployees = useImportEmployees({
    mutation: {
      onSuccess: (data) => {
        toast({ title: lang === "ar" ? `تم استيراد ${data.imported} موظف` : `Imported ${data.imported} employees` });
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      },
      onError: () => toast({ title: lang === "ar" ? "فشل الاستيراد" : "Import failed", variant: "destructive" }),
    },
  });

  const clearEmployees = useClearEmployees({
    mutation: {
      onSuccess: () => {
        toast({ title: lang === "ar" ? "تم مسح الجدول" : "Table cleared" });
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      },
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const mapped = (jsonData as any[]).map((row) => ({
          employeeId: String(row.employeeId || row["Employee ID"] || row.ID || ""),
          fullName: String(row.fullName || row["Full Name"] || row.Name || ""),
          jobTitle: String(row.jobTitle || row["Job Title"] || row.Title || ""),
          department: String(row.department || row.Department || ""),
        })).filter((e) => e.employeeId && e.fullName);

        if (!mapped.length) {
          toast({ title: lang === "ar" ? "لا توجد بيانات صالحة" : "No valid data found", variant: "destructive" });
          return;
        }
        importEmployees.mutate({ data: { employees: mapped } });
      } catch {
        toast({ title: lang === "ar" ? "خطأ في قراءة الملف" : "Error reading file", variant: "destructive" });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const thCls = "py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";
  const tdCls = "py-3 px-4 text-sm text-foreground";

  return (
    <div
      className="flex flex-col bg-background transition-colors duration-300"
      style={{ height: "calc(100vh - 64px)" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl w-full mx-auto px-6 py-5 flex flex-col h-full">
        {/* Page header */}
        <h1 className="text-xl font-bold text-foreground mb-0.5">
          {lang === "ar" ? "إدارة الموظفين" : "Employees Management"}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "ar" ? "نظرة شاملة على بيانات الموظفين" : "Comprehensive overview of employee data"}
        </p>

        {/* Main card */}
        <div
          className="flex flex-col flex-1 rounded-2xl shadow-lg overflow-hidden"
          style={
            isDark
              ? { background: "#112240", border: "1px solid #1e3a5a" }
              : { background: "#ffffff", border: "1px solid #e2e8f0" }
          }
        >
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importEmployees.isPending}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #1a56db, #2563eb)" }}
            >
              {importEmployees.isPending
                ? (lang === "ar" ? "جاري الاستيراد..." : "Importing...")
                : (lang === "ar" ? "استيراد Excel" : "Import Excel")}
            </button>
            <button
              onClick={() => {
                if (confirm(lang === "ar" ? "مسح جميع الموظفين؟" : "Clear all employees?")) {
                  clearEmployees.mutate();
                }
              }}
              disabled={clearEmployees.isPending}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #3730a3, #7c3aed)" }}
            >
              {lang === "ar" ? "مسح الجدول" : "Cler Table"}
            </button>

            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={15} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث بالرقم أو الاسم أو القسم" : "Search by ID or name or Department"}
                className="w-full rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                style={
                  isDark
                    ? { background: "#0d1f38", border: "1px solid #1e3a5a", color: "#fff" }
                    : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b" }
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {/* Table — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead
                className="sticky top-0 z-10"
                style={isDark ? { background: "#0d1f38" } : { background: "#f8fafc" }}
              >
                <tr>
                  <th className={thCls} style={{ width: "60px" }}>{lang === "ar" ? "رقم" : "No."}</th>
                  <th className={thCls}>{lang === "ar" ? "رقم الموظف" : "Employee ID"}</th>
                  <th className={thCls}>{lang === "ar" ? "الاسم الكامل" : "Employee Full Name"}</th>
                  <th className={thCls}>{lang === "ar" ? "المسمى الوظيفي" : "Job Title"}</th>
                  <th className={thCls}>{lang === "ar" ? "القسم" : "Department"}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                      {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                    </td>
                  </tr>
                ) : employees && employees.length > 0 ? (
                  employees.map((emp, i) => (
                    <tr
                      key={emp.id}
                      className="transition-colors"
                      style={
                        isDark
                          ? { borderTop: "1px solid #1a3050" }
                          : { borderTop: "1px solid #f1f5f9" }
                      }
                    >
                      <td className={tdCls + " text-muted-foreground"}>{i + 1}</td>
                      <td className={tdCls + " font-semibold text-blue-400"}>{emp.employeeId}</td>
                      <td className={tdCls + " font-medium"}>{emp.fullName}</td>
                      <td className={tdCls + " text-muted-foreground"}>{emp.jobTitle}</td>
                      <td className={tdCls + " text-muted-foreground"}>{emp.department}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <FileSpreadsheet size={40} className="mx-auto mb-3 text-muted-foreground opacity-20" />
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar" ? "لا يوجد موظفون. استورد ملف Excel للبدء." : "No employees. Import an Excel file to get started."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
