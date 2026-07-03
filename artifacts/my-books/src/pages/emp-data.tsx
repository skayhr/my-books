import React, { useState, useRef } from "react";
import { useGetEmployees, useImportEmployees, useClearEmployees } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { useAppContext } from "@/lib/app-context";

interface ImportResult {
  imported: number;
}

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
      onSuccess: (data: ImportResult) => {
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
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Record<string, unknown>[];

        if (!jsonData.length) {
          toast({ title: lang === "ar" ? "الملف فارغ" : "File is empty", variant: "destructive" });
          return;
        }

        // Find the actual header key in the row based on a list of possible names
        const findHeaderKey = (row: Record<string, unknown>, ...candidates: string[]): string | null => {
          const rowKeys = Object.keys(row);
          for (const c of candidates) {
            const foundKey = rowKeys.find((k) => k.trim().toLowerCase() === c.toLowerCase());
            if (foundKey) return foundKey;
          }
          // Last resort: try substring match
          for (const c of candidates) {
            const foundKey = rowKeys.find((k) =>
              k.trim().toLowerCase().includes(c.toLowerCase()) ||
              c.toLowerCase().includes(k.trim().toLowerCase())
            );
            if (foundKey) return foundKey;
          }
          return null;
        };

        const firstRow = jsonData[0];
        const idKey = findHeaderKey(firstRow, "employeeid", "employee id", "employee_id", "id", "emp id", "empid", "رقم الموظف", "الرقم");
        const nameKey = findHeaderKey(firstRow, "fullname", "full name", "full_name", "name", "employee name", "employeename", "الاسم", "الاسم الكامل");
        const titleKey = findHeaderKey(firstRow, "jobtitle", "job title", "job_title", "title", "position", "المسمى", "المسمى الوظيفي");
        const deptKey = findHeaderKey(firstRow, "department", "dept", "القسم", "الدائرة");

        if (!idKey || !nameKey) {
          toast({ title: lang === "ar" ? "لم يتم العثور على أعمدة ID و Name" : "Could not find ID and Name columns", variant: "destructive" });
          return;
        }

        const mapped = jsonData.map((row) => ({
          employeeId: String(row[idKey] ?? "").trim(),
          fullName: String(row[nameKey] ?? "").trim(),
          jobTitle: titleKey ? String(row[titleKey] ?? "").trim() : "",
          department: deptKey ? String(row[deptKey] ?? "").trim() : "",
        })).filter((emp) => emp.employeeId !== "" && emp.fullName !== "");

        if (!mapped.length) {
          toast({
            title: lang === "ar"
              ? "لم يتم العثور على بيانات صالحة. تأكد من وجود أعمدة: رقم الموظف، الاسم"
              : "No valid rows found. Ensure columns: Employee ID, Full Name",
            variant: "destructive",
          });
          return;
        }

        importEmployees.mutate({ data: { employees: mapped } });
      } catch (err) {
        console.error("Excel parse error:", err);
        toast({ title: lang === "ar" ? "خطأ في قراءة الملف" : "Error reading file", variant: "destructive" });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const thCls = "py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";
  const tdCls = "py-3 px-4 text-sm text-foreground";

  return (
    <div
      className="flex h-[calc(100vh-64px)] flex-col bg-background transition-colors duration-300"
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
          className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              aria-label={lang === "ar" ? "استيراد ملف Excel" : "Import Excel file"}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importEmployees.isPending}
              className="rounded-lg bg-linear-to-r from-[#1a56db] to-[#2563eb] px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {importEmployees.isPending
                ? (lang === "ar" ? "جاري الاستيراد..." : "Importing...")
                : (lang === "ar" ? "استيراد Excel" : "Import Excel")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(lang === "ar" ? "هل أنت متأكد من رغبتك في مسح جميع الموظفين؟" : "Are you sure you want to clear all employees?")) {
                  clearEmployees.mutate();
                }
              }}
              disabled={clearEmployees.isPending}
              className="rounded-lg bg-linear-to-r from-[#3730a3] to-[#7c3aed] px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {lang === "ar" ? "مسح الجدول" : "Clear Table"}
            </button>

            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={15} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث بالرقم أو الاسم أو القسم" : "Search by ID or name or Department"}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {/* Table — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-950">
                <tr>
                  <th className={thCls + " w-15"}>{lang === "ar" ? "رقم" : "No."}</th>
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
                  employees.map((emp: any, i: number) => (
                    <tr
                      key={emp.id}
                      className="border-t border-gray-100 transition-colors dark:border-slate-800"
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
