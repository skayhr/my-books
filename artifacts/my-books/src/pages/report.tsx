import React, { useState, useRef } from "react";
import { useGetLetters, useGetLetterTypes, useGetStats } from "@workspace/api-client-react";
import { Search, Printer, ChevronDown, Eraser, FileText, Users, Building2, BookOpen } from "lucide-react";
import logoUrl from "@assets/logo_1782493103781.png";
import { useAppContext } from "@/lib/app-context";

// ─── helpers ────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-GB").replace(/\//g, "-"); }
  catch { return d; }
}
function today() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─── stat card ───────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, iconBg, valueCls, isDark,
}: { label: string; value: number | string; icon: React.ReactNode; iconBg: string; valueCls: string; isDark: boolean }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl flex-1 min-w-[160px]"
      style={isDark ? { background: "#112240", border: "1px solid #1e3a5a" }
                    : { background: "#fff", border: "1px solid #e2e8f0" }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${valueCls}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export function Report() {
  const { lang, theme } = useAppContext();
  const isDark = theme === "dark";
  const isRtl = lang === "ar";

  const { data: types } = useGetLetterTypes();
  const { data: stats } = useGetStats();

  // filter state
  const [search, setSearch] = useState("");
  const [letterTypeId, setLetterTypeId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // committed filter (only applied on Search click)
  const [committed, setCommitted] = useState<{
    search: string; letterTypeId: number | ""; dateFrom: string; dateTo: string;
  } | null>(null);

  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: letters, isLoading } = useGetLetters(
    committed
      ? {
          search: committed.search || undefined,
          letterTypeId: committed.letterTypeId === "" ? undefined : committed.letterTypeId,
          dateFrom: committed.dateFrom || undefined,
          dateTo: committed.dateTo || undefined,
        }
      : undefined,
    { query: { enabled: committed !== null } }
  );

  const handleSearch = () => setCommitted({ search, letterTypeId, dateFrom, dateTo });
  const handleClear = () => {
    setSearch(""); setLetterTypeId(""); setDateFrom(""); setDateTo("");
    setCommitted(null);
  };

  const inputCls = `rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
    isDark ? "bg-[#0d1f38] border border-[#1e3a5a] text-white placeholder:text-gray-600"
           : "bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400"
  }`;

  const thCls = "py-3 px-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider";
  const tdCls = "py-3 px-3 text-sm text-foreground";

  const t = {
    title: lang === "ar" ? "تقرير الخطابات" : "Letter Report",
    subtitle: lang === "ar" ? "نظرة شاملة على جميع الخطابات والإحصائيات" : "A full overview of all letters and statistics",
    totalEmp: lang === "ar" ? "إجمالي الموظفين" : "TOTAL EMPLOYEE",
    totalTypes: lang === "ar" ? "إجمالي الأنواع" : "TOTAL TYPES",
    departments: lang === "ar" ? "الأقسام" : "DEPARTMENTS",
    totalLetters: lang === "ar" ? "إجمالي الخطابات" : "TOTAL LETTERS",
    searchPh: lang === "ar" ? "ابحث بالرقم أو الاسم أو القسم" : "Search by ID or name or Department",
    allTypes: lang === "ar" ? "جميع الأنواع" : "All Types",
    search: lang === "ar" ? "بحث" : "Search",
    noResults: lang === "ar" ? "لا توجد نتائج. استخدم البحث أعلاه." : "No results. Use the search above.",
    id: lang === "ar" ? "ID" : "ID",
    employee: lang === "ar" ? "الموظف" : "EMPLOYEE",
    jobTitle: lang === "ar" ? "المسمى" : "JOB TITLE",
    dept: lang === "ar" ? "القسم" : "DEPARTMENT",
    type: lang === "ar" ? "النوع" : "LETTERS TYPE",
    req: lang === "ar" ? "طلب" : "REQUEST",
    date: lang === "ar" ? "التاريخ" : "DATE",
  };

  // ── print handler ──
  const doPrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Letter Report — ERBIL REFINERY / KAR-3</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; color: #1a1a1a; background: #fff; }
        .print-body { padding: 40px; max-width: 900px; margin: 0 auto; }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
        .header img { width: 64px; height: 64px; object-fit: contain; }
        .header-text { flex: 1; text-align: center; }
        .header-text h1 { font-size: 18px; font-weight: 800; color: #c0392b; letter-spacing: 1px; }
        .header-text p { font-size: 12px; color: #555; }
        .header-date { font-size: 11px; color: #777; }
        hr { border: none; border-top: 1px solid #ccc; margin: 12px 0; }
        .emp-name { text-align: center; font-size: 15px; font-weight: 700; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f0f0f0; border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-weight: 700; }
        td { border: 1px solid #ddd; padding: 7px 10px; }
        tr:nth-child(even) td { background: #fafafa; }
        .sig-area { margin-top: 60px; display: flex; justify-content: flex-start; }
        .sig-block { text-align: center; }
        .sig-line { border-top: 1px solid #333; width: 160px; margin-bottom: 6px; }
        .sig-label { font-weight: 700; font-size: 13px; }
        .sig-sub { font-size: 11px; color: #777; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style>
      </head><body>${content.innerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div
      className="flex flex-col bg-background transition-colors duration-300"
      style={{ height: "calc(100vh - 64px)" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl w-full mx-auto px-6 py-5 flex flex-col h-full gap-4">

        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-4 flex-wrap shrink-0">
          <StatCard label={t.totalEmp}     value={stats?.totalEmployees ?? 0} isDark={isDark}
            icon={<Users size={20} color="#fff" />} iconBg="#1d4ed8" valueCls="text-blue-400" />
          <StatCard label={t.totalTypes}   value={stats?.totalTypes ?? 0} isDark={isDark}
            icon={<FileText size={20} color="#fff" />} iconBg="#16a34a" valueCls="text-green-400" />
          <StatCard label={t.departments}  value={stats?.totalDepartments ?? 0} isDark={isDark}
            icon={<Building2 size={20} color="#fff" />} iconBg="#7c3aed" valueCls="text-purple-400" />
          <StatCard label={t.totalLetters} value={stats?.totalLetters ?? 0} isDark={isDark}
            icon={<BookOpen size={20} color="#fff" />} iconBg="#be185d" valueCls="text-pink-400" />
        </div>

        {/* Search + Filter card */}
        <div
          className="rounded-2xl shadow-sm shrink-0 px-5 pt-3 pb-4"
          style={isDark ? { background: "#112240", border: "1px solid #1e3a5a" }
                        : { background: "#fff", border: "1px solid #e2e8f0" }}
        >
          {/* top-right action icons */}
          <div className="flex justify-end gap-2 mb-3">
            <button
              onClick={handleClear}
              title={lang === "ar" ? "مسح الفلاتر" : "Clear filters"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              style={isDark ? { background: "#0d1f38", border: "1px solid #1e3a5a" }
                           : { background: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <Eraser size={14} />
            </button>
            <button
              onClick={() => { if (committed && letters?.length) setShowPrint(true); }}
              title={lang === "ar" ? "طباعة التقرير" : "Print Report"}
              disabled={!committed || !letters?.length}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              style={isDark ? { background: "#0d1f38", border: "1px solid #1e3a5a" }
                           : { background: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <Printer size={14} />
            </button>
          </div>

          {/* Filter row */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* Search bar */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={t.searchPh}
                className={inputCls + " w-full pl-9"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Letter Type dropdown */}
            <div className="relative min-w-[180px]">
              <select
                className={inputCls + " w-full appearance-none pr-8 cursor-pointer"}
                value={letterTypeId}
                onChange={(e) => setLetterTypeId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">{t.allTypes}</option>
                {types?.map((t) => (
                  <option key={t.id} value={t.id}>{t.code} — {t.nameEn}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>

            {/* Date from */}
            <input
              type="date"
              className={inputCls}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="YYYY-MM-DD"
            />

            {/* Date to */}
            <input
              type="date"
              className={inputCls}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="YYYY-MM-DD"
            />

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(to right, #1a3a8f, #c0392b)" }}
            >
              {t.search}
            </button>
          </div>
        </div>

        {/* Results table */}
        <div
          className="flex-1 rounded-2xl shadow-sm overflow-hidden flex flex-col"
          style={isDark ? { background: "#112240", border: "1px solid #1e3a5a" }
                        : { background: "#fff", border: "1px solid #e2e8f0" }}
        >
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead
                className="sticky top-0 z-10"
                style={isDark ? { background: "#0d1f38" } : { background: "#f8fafc" }}
              >
                <tr>
                  <th className={thCls} style={{ width: 50 }}>{t.id}</th>
                  <th className={thCls}>{t.employee}</th>
                  <th className={thCls}>{t.jobTitle}</th>
                  <th className={thCls}>{t.dept}</th>
                  <th className={thCls}>{t.type}</th>
                  <th className={thCls} style={{ width: 70 }}>{t.req}</th>
                  <th className={thCls} style={{ width: 100 }}>{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {!committed ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                      {lang === "ar" ? "استخدم البحث أعلاه لعرض التقرير" : "Use the search above to load report data."}
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                      {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                    </td>
                  </tr>
                ) : letters && letters.length > 0 ? (
                  letters.map((letter) => (
                    <tr
                      key={letter.id}
                      style={isDark ? { borderTop: "1px solid #1a3050" } : { borderTop: "1px solid #f1f5f9" }}
                    >
                      <td className={tdCls + " text-muted-foreground"}>{letter.employeeId}</td>
                      <td className={tdCls}>
                        <div className="font-semibold">{letter.employeeFullName}</div>
                      </td>
                      <td className={tdCls + " text-muted-foreground"}>{letter.jobTitle}</td>
                      <td className={tdCls + " text-muted-foreground"}>{letter.department}</td>
                      <td className={tdCls}>
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold"
                          style={isDark ? { background: "#1e3a5a", color: "#93c5fd" }
                                        : { background: "#dbeafe", color: "#1d4ed8" }}
                        >
                          {letter.letterTypeCode} — {letter.letterTypeNameEn}
                        </span>
                      </td>
                      <td className={tdCls + " text-center font-semibold text-foreground"}>1</td>
                      <td className={tdCls + " text-muted-foreground"}>{fmtDate(letter.bookDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">{t.noResults}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Print Preview Modal ─────────────────────────────────────────── */}
      {showPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
              <span className="font-bold text-sm text-gray-700">
                {lang === "ar" ? "معاينة قبل الطباعة" : "Print Preview"}
              </span>
              <button
                onClick={() => setShowPrint(false)}
                className="text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* printable content */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
              <div ref={printRef} className="print-body bg-white rounded-xl shadow p-8 mx-auto max-w-[780px]">
                {/* report header */}
                <div className="header" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                  <img src={logoUrl} alt="KAR" style={{ width: 60, height: 60, objectFit: "contain" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#c0392b", letterSpacing: 1 }}>ERBIL REFINERY / KAR-3</div>
                    <div style={{ fontSize: 12, color: "#555" }}>Report on the number of official letters</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#777" }}>{today()}</div>
                </div>

                <hr style={{ borderTop: "1px solid #ccc", margin: "10px 0" }} />

                {/* employee name (most frequent in results or all) */}
                {letters && letters.length > 0 && (
                  <div style={{ textAlign: "center", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                    {letters[0].employeeFullName}
                  </div>
                )}

                {/* table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f0f0f0" }}>
                      {["ID", "EMPLOYEE", "JOB TITLE", "DEPARTMENT", "LETTERS TYPE", "REQUEST", "DATE"].map((h) => (
                        <th key={h} style={{ border: "1px solid #ccc", padding: "7px 10px", textAlign: "left", fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {letters?.map((letter, i) => (
                      <tr key={letter.id} style={{ background: i % 2 === 1 ? "#fafafa" : "#fff" }}>
                        <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{letter.employeeId}</td>
                        <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{letter.employeeFullName}</td>
                        <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{letter.jobTitle}</td>
                        <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{letter.department}</td>
                        <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{letter.letterTypeNameEn}</td>
                        <td style={{ border: "1px solid #ddd", padding: "6px 10px", textAlign: "center" }}>1</td>
                        <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{fmtDate(letter.bookDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* signature */}
                <div style={{ marginTop: 60 }}>
                  <div style={{ borderTop: "1px solid #333", width: 160, marginBottom: 6 }} />
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Human Resources</div>
                  <div style={{ fontSize: 11, color: "#777" }}>Signature</div>
                </div>
              </div>
            </div>

            {/* modal footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
              <button
                onClick={() => setShowPrint(false)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={doPrint}
                className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(to right, #3730a3, #7c3aed)" }}
              >
                <span className="flex items-center gap-2">
                  <Printer size={15} />
                  {lang === "ar" ? "طباعة" : "Print"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
