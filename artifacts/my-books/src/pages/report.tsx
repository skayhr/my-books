import React, { useState, useRef } from "react";
import { useGetLetters, useGetLetterTypes, useGetStats } from "@workspace/api-client-react";
import { Search, Printer, ChevronDown, Eraser, FileText, Users, Building2, BookOpen, DownloadCloud } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logoUrl from "@assets/image_1782568301631.png";
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
  label, value, icon, iconBgClass, valueCls,
}: { label: string; value: number | string; icon: React.ReactNode; iconBgClass: string; valueCls: string; }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl flex-1 min-w-40 bg-card border border-card-border transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
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
    { query: { 
        queryKey: ["report-letters", committed],
        enabled: committed !== null 
    } }
  );

  const handleSearch = () => setCommitted({ search: search, letterTypeId, dateFrom, dateTo });
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
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          html, body {
            margin: 0;
            background: #f3f4f6;
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          .print-body {
            width: auto !important;
            min-height: auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            background: #ffffff !important;
          }
          .print-body * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @media print {
            body {
              margin: 0;
            }
            .print-body {
              box-shadow: none !important;
              border-radius: 0 !important;
            }
          }
        </style>
      </head><body class="bg-gray-100">${content.innerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  const exportPdf = async () => {
    if (!letters || letters.length === 0) {
      console.warn("Export PDF called with no letters.");
      return;
    }

    const exportNode = document.createElement("div");
    exportNode.style.position = "absolute";
    exportNode.style.left = "-9999px";
    exportNode.style.top = "0";
    exportNode.style.width = "900px";
    exportNode.style.padding = "32px";
    exportNode.style.backgroundColor = "#ffffff";
    exportNode.style.color = "#111827";
    exportNode.style.fontFamily = "Inter, ui-sans-serif, system-ui, sans-serif";
    exportNode.style.fontSize = "13px";
    exportNode.style.lineHeight = "1.5";
    exportNode.style.direction = isRtl ? "rtl" : "ltr";
    exportNode.style.boxSizing = "border-box";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.gap = "16px";
    header.style.marginBottom = "24px";

    const logoImg = document.createElement("img");
    logoImg.src = logoUrl;
    logoImg.style.width = "56px"; // 14 * 4
    logoImg.style.height = "56px";
    logoImg.style.objectFit = "contain";
    if (isRtl) header.appendChild(logoImg);

    const headerTitle = document.createElement("div");
    headerTitle.style.display = "flex";
    headerTitle.style.flexDirection = "column";
    headerTitle.style.flexGrow = "1";
    headerTitle.style.textAlign = isRtl ? "right" : "left";

    const titleText = document.createElement("div");
    titleText.textContent = "ERBIL REFINERY / KAR-3";
    titleText.style.fontSize = "18px";
    titleText.style.fontWeight = "800";
    titleText.style.color = "#b91c1c";
    titleText.style.letterSpacing = "0.5px";
    titleText.style.marginBottom = "4px";

    const subtitleText = document.createElement("div");
    subtitleText.textContent = lang === "ar" ? "نظرة شاملة على جميع الخطابات والإحصائيات" : "Report on the number of official letters";
    subtitleText.style.fontSize = "12px";
    subtitleText.style.color = "#475569";

    headerTitle.appendChild(titleText);
    headerTitle.appendChild(subtitleText);
    header.appendChild(headerTitle);

    const dateText = document.createElement("div");
    dateText.textContent = today();
    dateText.style.fontSize = "11px";
    dateText.style.color = "#475569";
    header.appendChild(dateText);

    if (!isRtl) header.insertBefore(logoImg, header.firstChild);

    exportNode.appendChild(header);

    if (letters.length > 0) {
      const firstName = document.createElement("div");
      firstName.textContent = letters[0].employeeFullName;
      firstName.style.fontSize = "15px";
      firstName.style.fontWeight = "700";
      firstName.style.textAlign = "center";
      firstName.style.marginBottom = "16px";
      exportNode.appendChild(firstName);
    }

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "12px";
    table.style.marginBottom = "24px";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const headers = [
      t.id,
      t.employee,
      t.jobTitle,
      t.dept,
      t.type,
      t.req,
      t.date,
    ];

    headers.forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      th.style.border = "1px solid #d1d5db";
      th.style.padding = "10px 8px";
      th.style.backgroundColor = "#f8fafc";
      th.style.fontWeight = "700";
      th.style.color = "#475569";
      th.style.textAlign = isRtl ? "right" : "left";
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    (letters as any[]).forEach((letter: any, index: number) => {
      const row = document.createElement("tr");
      row.style.backgroundColor = index % 2 === 1 ? "#f8fafc" : "#ffffff";

      const cells = [
        String(letter.employeeId),
        letter.employeeFullName,
        letter.jobTitle,
        letter.department,
        letter.letterTypeNameEn,
        "1",
        fmtDate(letter.bookDate),
      ];

      cells.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        td.style.border = "1px solid #e2e8f0";
        td.style.padding = "10px 8px";
        td.style.color = "#1f2937";
        td.style.textAlign = isRtl ? "right" : "left";
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    exportNode.appendChild(table);

    const signature = document.createElement("div");
    signature.style.marginTop = "24px";
    signature.style.paddingTop = "24px";
    signature.style.borderTop = "1px solid #475569";
    signature.style.maxWidth = "180px";
    signature.style.color = "#1f2937";
    signature.style.fontWeight = "700";
    signature.textContent = lang === "ar" ? "الموارد البشرية" : "Human Resources";
    exportNode.appendChild(signature);

    document.body.appendChild(exportNode);

    try {
      const canvas = await html2canvas(exportNode, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        width: exportNode.offsetWidth,
        height: exportNode.offsetHeight,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const pageHeightPx = Math.floor(pdfHeight / ratio);
      let page = 0;
      let sourceY = 0;

      while (sourceY < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageHeightPx, canvas.height - sourceY);
        const pageCtx = pageCanvas.getContext("2d");
        if (pageCtx) {
          pageCtx.fillStyle = "#ffffff";
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(canvas, 0, -sourceY);

          const pageData = pageCanvas.toDataURL("image/png");
          if (page > 0) pdf.addPage();
          pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, pageCanvas.height * ratio);
        }

        sourceY += pageHeightPx;
        page += 1;
      }

      pdf.save("letter-report.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      document.body.removeChild(exportNode);
    }
  };

  return (
    <div
      className="flex flex-col bg-background transition-colors duration-300 h-[calc(100vh-64px)]"
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
          <StatCard label={t.totalEmp}     value={stats?.totalEmployees ?? 0}
            icon={<Users size={20} color="#fff" />} iconBgClass="bg-[#1d4ed8]" valueCls="text-blue-400" />
          <StatCard label={t.totalTypes}   value={stats?.totalTypes ?? 0}
            icon={<FileText size={20} color="#fff" />} iconBgClass="bg-[#16a34a]" valueCls="text-green-400" />
          <StatCard label={t.departments}  value={stats?.totalDepartments ?? 0}
            icon={<Building2 size={20} color="#fff" />} iconBgClass="bg-[#7c3aed]" valueCls="text-purple-400" />
          <StatCard label={t.totalLetters} value={stats?.totalLetters ?? 0}
            icon={<BookOpen size={20} color="#fff" />} iconBgClass="bg-[#be185d]" valueCls="text-pink-400" />
        </div>

        {/* Search + Filter card */}
        <div
          className="rounded-2xl shadow-sm shrink-0 px-5 pt-3 pb-4 bg-card border border-card-border"
        >
          {/* top-right action icons */}
          <div className="flex justify-end gap-2 mb-3">
            <button
              onClick={handleClear}
              title={lang === "ar" ? "مسح الفلاتر" : "Clear filters"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors bg-background border border-border"
            >
              <Eraser size={14} />
            </button>
            <button
              onClick={() => { if (committed && letters?.length) setShowPrint(true); }}
              title={lang === "ar" ? "طباعة التقرير" : "Print Report"}
              disabled={!committed || !letters?.length}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 bg-background border border-border"
            >
              <Printer size={14} />
            </button>
          </div>

          {/* Filter row */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* Search bar */}
            <div className="relative flex-1 min-w-50">
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
            <div className="relative min-w-45">
              <select
                className={inputCls + " w-full appearance-none pr-8 cursor-pointer"}
                value={letterTypeId}
                onChange={(e) => setLetterTypeId(e.target.value ? Number(e.target.value) : "")}
                aria-label={t.type}
              >
                <option value="">{t.allTypes}</option>
                {types?.map((t: any) => (
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
              className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] bg-linear-to-r from-[#1a3a8f] to-[#c0392b]"
            >
              {t.search}
            </button>
          </div>
        </div>

        {/* Results table */}
        <div
          className="flex-1 rounded-2xl shadow-sm overflow-hidden flex flex-col bg-card border border-card-border"
        >
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead
                className="sticky top-0 z-10 bg-secondary/30"
              >
                <tr>
                  <th className={`${thCls} w-12.5`}>{t.id}</th>
                  <th className={thCls}>{t.employee}</th>
                  <th className={thCls}>{t.jobTitle}</th>
                  <th className={thCls}>{t.dept}</th>
                  <th className={thCls}>{t.type}</th>
                  <th className={`${thCls} w-17.5`}>{t.req}</th>
                  <th className={`${thCls} w-25`}>{t.date}</th>
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
                  (letters as any[]).map((letter) => (
                    <tr
                      key={letter.id}
                      className="border-t border-border"
                    >
                      <td className={tdCls + " text-muted-foreground"}>{letter.employeeId}</td>
                      <td className={tdCls}>
                        <div className="font-semibold">{letter.employeeFullName}</div>
                      </td>
                      <td className={tdCls + " text-muted-foreground"}>{letter.jobTitle}</td>
                      <td className={tdCls + " text-muted-foreground"}>{letter.department}</td>
                      <td className={tdCls}>
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-blue-200 text-blue-700 dark:bg-[#1e3a5a] dark:text-blue-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-0">
          <div className="bg-white text-black w-full max-w-4xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
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
              <div ref={printRef} className="print-body bg-white rounded-xl shadow-lg p-10 mx-auto max-w-195 min-h-264 flex flex-col">
                {/* report header */}
                <div className="header flex items-center gap-4 mb-1">
                  <img src={logoUrl} alt="KAR" className="w-14 h-14 object-contain" />
                  <div className="flex-1 text-center">
                    <div className="text-[17px] font-extrabold text-[#c0392b] tracking-[1px]">ERBIL REFINERY / KAR-3</div>
                    <div className="text-xs text-[#555]">Report on the number of official letters</div>
                  </div>
                  <div className="text-[11px] text-gray-600">{today()}</div>
                </div>

                <hr className="border-t border-gray-300 my-2.5" />

                {/* employee name (most frequent in results or all) */}
                {letters && letters.length > 0 && (
                  <div className="text-center font-bold text-[15px] mb-3.5">
                    {(letters as any[])[0].employeeFullName}
                  </div>
                )}

                {/* table */}
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      {["ID", "EMPLOYEE", "JOB TITLE", "DEPARTMENT", "LETTERS TYPE", "REQUEST", "DATE"].map((h) => (
                        <th key={h} className="border border-gray-300 p-2 text-left font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {letters?.map((letter: any, i: number) => (
                      <tr key={letter.id} className={i % 2 === 1 ? "bg-gray-50" : "bg-white"}>
                        <td className="border border-gray-200 p-1.5">{letter.employeeId}</td>
                        <td className="border border-gray-200 p-1.5">{letter.employeeFullName}</td>
                        <td className="border border-gray-200 p-1.5">{letter.jobTitle}</td>
                        <td className="border border-gray-200 p-1.5">{letter.department}</td>
                        <td className="border border-gray-200 p-1.5">{letter.letterTypeNameEn}</td>
                        <td className="border border-gray-200 p-1.5 text-center">1</td>
                        <td className="border border-gray-200 p-1.5">{fmtDate(letter.bookDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* signature */}
                <div className="mt-auto pt-10 pl-10 flex flex-col items-start text-left">
                  <div className="border-t border-gray-700 w-44 mb-3" />
                  <div className="font-bold text-sm">Human Resources</div>
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
                onClick={exportPdf}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 bg-linear-to-r from-[#2563eb] to-[#3b82f6]"
              >
                <DownloadCloud size={16} />
                {lang === "ar" ? "PDF" : "Export PDF"}
              </button>
              <button
                onClick={doPrint}
                className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 bg-linear-to-r from-[#3730a3] to-[#7c3aed]"
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