import React, { useMemo, useState } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
  HiOutlineEye,
} from "react-icons/hi2";
import Sidebar from "./Sidebar";
import reportsApi from "../../api/reportPageApi";
import { useReportCatalogue, useReportData } from "../../hooks/useReportsPage";

// ==========================================================
// THEME TOKENS — matches MoldChangeDashboard.jsx
// ==========================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "border border-[#C6C6C6]";
const SURFACE = `bg-white ${BORDER}`;

const getTodayISO = () => new Date().toISOString().split("T")[0];
const getThisMonthISO = () => new Date().toISOString().slice(0, 7);

// ---------------------------------------------------------------
// CSV helpers for the Download action
// ---------------------------------------------------------------

// Reports either return a plain array of rows, or (OEE report) an
// object of { byMachine, byShift, byDay } arrays — flatten either
// shape into one row-array for the table / CSV export.
function flattenReportData(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    return Object.entries(data).flatMap(([scope, rows]) =>
      (rows || []).map((r) => ({ scope, ...r }))
    );
  }
  return [];
}

function toCsv(rows, headers) {
  if (!rows.length) return "";
  const cols = headers && headers.length ? headers : Object.keys(rows[0]);
  const escape = (val) => {
    const s = String(val ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((h) => escape(r[h])).join(","))].join("\n");
}

// Different reports return different column shapes — walk every row in
// order and build the union of all keys seen, so the combined export
// has one consistent header row instead of columns getting scrambled.
function unionHeaders(rows) {
  const seen = new Set();
  const ordered = [];
  rows.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (!seen.has(k)) {
        seen.add(k);
        ordered.push(k);
      }
    });
  });
  return ordered;
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ==========================================================
// PERIOD FILTER — Daily / Monthly toggle with matching picker
// ==========================================================
function PeriodFilter({ mode, setMode, dateValue, setDateValue, monthValue, setMonthValue }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-stretch overflow-hidden rounded-[2px] border border-white/15">
        <button
          type="button"
          onClick={() => setMode("daily")}
          className={`px-2.5 h-7 text-[10.5px] font-bold transition-colors duration-100 ${
            mode === "daily" ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => setMode("monthly")}
          className={`px-2.5 h-7 border-l border-white/15 text-[10.5px] font-bold transition-colors duration-100 ${
            mode === "monthly" ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          Monthly
        </button>
      </div>

      <label className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/5 px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30">
        <HiOutlineCalendarDays className="h-3.5 w-3.5 text-white/60" />
        {mode === "daily" ? (
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="h-full rounded-[2px] bg-transparent text-[10.5px] font-semibold text-white outline-none [color-scheme:dark]"
          />
        ) : (
          <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="h-full rounded-[2px] bg-transparent text-[10.5px] font-semibold text-white outline-none [color-scheme:dark]"
          />
        )}
      </label>
    </div>
  );
}

// ==========================================================
// HEADER
// ==========================================================
function ReportsHeader({ mode, setMode, dateValue, setDateValue, monthValue, setMonthValue, onRefresh, refreshing, onExportAll, exporting }) {
  return (
    <header className="flex-shrink-0 bg-[#0F1D24] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <h1 className="text-[18px] font-extrabold uppercase tracking-wide text-white whitespace-nowrap">
          Reports
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter
            mode={mode} setMode={setMode}
            dateValue={dateValue} setDateValue={setDateValue}
            monthValue={monthValue} setMonthValue={setMonthValue}
          />

          <button
            onClick={onRefresh}
            className="flex h-7 items-center gap-1.5 rounded-[2px] bg-[#FDC94D] px-3 text-[10.5px] font-extrabold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FDC94D]/90"
          >
            <HiOutlineCheck className="h-3.5 w-3.5" /> Apply
          </button>

          <button
            onClick={onRefresh}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
          >
            <HiOutlineArrowPath className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>

          <button
            onClick={() => {
              setMode("daily");
              setDateValue(getTodayISO());
              setMonthValue(getThisMonthISO());
            }}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-red-400/40 bg-red-500/10 px-2.5 text-[10.5px] font-semibold text-red-300 transition-colors duration-100 hover:bg-red-500/20"
          >
            <HiOutlineXMark className="h-3.5 w-3.5" /> Reset
          </button>

          <button
            onClick={onExportAll}
            disabled={exporting}
            className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlineArrowDownTray className={`h-3.5 w-3.5 ${exporting ? "animate-bounce" : ""}`} />
            {exporting ? "Exporting…" : "Export"}
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================================
// ALL REPORTS PANEL — every report fits on screen, no scrollbar
// ==========================================================
function AllReportsPanel({ query, setQuery, rows, catalogueLoading, catalogueError, onView, onDownload }) {
  return (
    <div className={`flex min-h-0 h-full flex-1 flex-col rounded-[2px] overflow-hidden ${SURFACE}`}>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-1.5">
        <div className="flex items-center gap-2">
          {/* <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[2px] bg-[#0F1D24] text-[#FDC94D]">
            <HiOutlineClipboardDocumentList className="h-3.5 w-3.5" />
          </div> */}
          <div>
            <h2 className="text-[16px] font-extrabold text-[#0F1D24]">All Reports</h2>
            <p className="text-[11.5px] font-medium text-[#9B9B9B]">Production, quality &amp; operational reports</p>
          </div>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports..."
          className="h-6.5 w-44 rounded-[2px] border border-[#C6C6C6] bg-white pl-2.5 pr-2.5 text-[10px] font-medium text-[#0F1D24] placeholder:text-[#9B9B9B] outline-none focus:border-[#0F1D24]"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {catalogueError ? (
          <p className="p-4 text-[11px] font-semibold text-red-600">
            Couldn&apos;t load the report catalogue: {catalogueError.message}
          </p>
        ) : (
          <table className="h-full w-full border-collapse text-[12.5px]" style={{ height: "100%" }}>
            <thead>
              <tr className="bg-[#FAFAFB]">
                <th className="border border-[#C6C6C6] px-2.5 py-1 text-left text-[14px] font-bold uppercase tracking-wide text-[#9B9B9B]">Report Name</th>
                <th className="border border-[#C6C6C6] px-2 py-1 text-left text-[14px] font-bold uppercase tracking-wide text-[#9B9B9B]">Category</th>
                <th className="hidden border border-[#C6C6C6] px-2 py-1 text-left text-[14px] font-bold uppercase tracking-wide text-[#9B9B9B] lg:table-cell">Description</th>
                <th className="border border-[#C6C6C6] px-2 py-1 text-left text-[14px] font-bold uppercase tracking-wide text-[#9B9B9B]">Format</th>
                <th className="border border-[#C6C6C6] px-2 py-1 text-left text-[14px] font-bold uppercase tracking-wide text-[#9B9B9B]">Frequency</th>
                <th className="border border-[#C6C6C6] px-2.5 py-1 text-right text-[14px] font-bold uppercase tracking-wide text-[#9B9B9B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalogueLoading ? (
                <tr>
                  <td colSpan={6} className="border border-[#C6C6C6] px-3 py-6 text-center text-[#9B9B9B]">
                    Loading report catalogue…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-[#C6C6C6] px-3 py-6 text-center text-[#9B9B9B]">
                    No reports match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.key} className="hover:bg-[#FAFAFB]">
                    <td className="whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1 font-bold text-[#0F1D24]">{r.name}</td>
                    <td className="border border-[#C6C6C6] px-2 py-1">
                      <span className="inline-block rounded-[2px] border border-[#C6C6C6] px-1.5 py-0.5 text-[11.5px] font-bold text-[#0F1D24]">
                        {r.category}
                      </span>
                    </td>
                    <td className="hidden max-w-[220px] truncate border border-[#C6C6C6] px-2 py-1 text-[#6B6B6B] lg:table-cell">{r.description}</td>
                    <td className="border border-[#C6C6C6] px-2 py-1">
                      <span className="inline-flex items-center gap-1 rounded-[2px] border border-emerald-600/30 bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-700">
                        <HiOutlineDocumentText className="h-2.5 w-2.5" />
                        {r.format}
                      </span>
                    </td>
                    <td className="border border-[#C6C6C6] px-2 py-1 text-[#6B6B6B]">{r.frequency}</td>
                    <td className="border border-[#C6C6C6] px-2.5 py-1">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView(r)}
                          className="flex items-center gap-1 rounded-[2px] border border-[#C6C6C6] px-1.5 py-0.5 text-[12.5px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#FAFAFB]"
                        >
                          <HiOutlineEye className="h-3 w-3" />
                          View
                        </button>
                        <button
                          onClick={() => onDownload(r)}
                          className="flex items-center gap-1 rounded-[2px] bg-[#0F1D24] px-1.5 py-0.5 text-[12.5px] font-bold text-white transition-colors duration-100 hover:bg-[#0F1D24]/90"
                        >
                          <HiOutlineArrowDownTray className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!catalogueLoading && rows.length > 0 && (
                <tr style={{ height: "100%" }} aria-hidden="true">
                  <td className="border border-[#C6C6C6]" colSpan={6} />
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1 text-[8.5px] font-semibold text-[#9B9B9B]">
        {rows.length} report{rows.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

// ==========================================================
// VIEW MODAL — renders whatever the API returned for one report
// (kept internally scrollable — a single report's underlying data can
// run to hundreds of rows, unlike the fixed-size report catalogue)
// ==========================================================
function ReportViewModal({ reportKey, result, loading, error, onClose }) {
  if (!reportKey) return null;
  const rows = result ? flattenReportData(result.data) : [];
  const columns = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col rounded-[2px] border border-[#C6C6C6] bg-white">
        <div className="flex flex-shrink-0 items-center justify-between rounded-t-[2px] border-b border-[#C6C6C6] bg-[#0F1D24] px-4 py-2.5">
          <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-white">
            {result?.name || "Report"}
          </h3>
          <button onClick={onClose} className="rounded-[2px] text-white/70 hover:text-white">
            <HiOutlineXMark className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3">
          {loading && <p className="p-6 text-center text-[11px] text-[#9B9B9B]">Generating report…</p>}
          {error && <p className="p-6 text-center text-[11px] font-semibold text-red-600">{error.message}</p>}
          {!loading && !error && rows.length === 0 && (
            <p className="p-6 text-center text-[11px] text-[#9B9B9B]">No data for this selection.</p>
          )}
          {!loading && !error && rows.length > 0 && (
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FAFAFB]">
                  {columns.map((c) => (
                    <th key={c} className="border border-[#C6C6C6] px-2.5 py-2 text-left text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      {c.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAFAFB]">
                    {columns.map((c) => (
                      <td key={c} className="whitespace-nowrap border border-[#C6C6C6] px-2.5 py-1.5 text-[#0F1D24]">
                        {String(row[c] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {result && (
          <div className="flex-shrink-0 rounded-b-[2px] border-t border-[#C6C6C6] bg-[#FAFAFB] px-3 py-1.5 text-[9.5px] font-semibold text-[#9B9B9B]">
            {rows.length} rows · generated {new Date(result.generatedAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// PAGE
// ==========================================================
export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("daily");
  const [dateValue, setDateValue] = useState(getTodayISO());
  const [monthValue, setMonthValue] = useState(getThisMonthISO());
  const [exporting, setExporting] = useState(false);

  const { reports, loading: catalogueLoading, error: catalogueError } = useReportCatalogue();
  const reportData = useReportData();

  // Only show reports relevant to the active Daily / Monthly toggle —
  // this is what surfaces "Daily Production Plan Report" only in Daily
  // mode and "Monthly Production Plan Report" only in Monthly mode.
  const filtered = useMemo(() => {
    return reports
      .filter((r) => r.mode === "both" || r.mode === mode)
      .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  }, [reports, mode, query]);

  // Combined export — pulls every report relevant to the active
  // Daily/Monthly mode, tags each row with which report it came from,
  // and merges everything into a single CSV file.
  const handleExportAll = async () => {
    const targets = reports.filter((r) => r.mode === "both" || r.mode === mode);
    if (targets.length === 0) return;

    setExporting(true);
    try {
      const params = mode === "monthly" ? { month: monthValue } : { date: dateValue };

      const results = await Promise.allSettled(
        targets.map((r) => reportsApi.getReport(r.key, params))
      );

      const combinedRows = [];
      results.forEach((res, i) => {
        if (res.status !== "fulfilled") {
          console.warn(`Skipping "${targets[i].name}" in combined export:`, res.reason);
          return;
        }
        const rows = flattenReportData(res.value.data);
        rows.forEach((row) => {
          combinedRows.push({
            report_name: targets[i].name,
            report_category: targets[i].category,
            ...row,
          });
        });
      });

      if (combinedRows.length === 0) {
        window.alert("No data available to export for this selection.");
        return;
      }

      const headers = unionHeaders(combinedRows);
      const period = mode === "monthly" ? monthValue : dateValue;
      downloadCsv(`combined_reports_${period}.csv`, toCsv(combinedRows, headers));
    } catch (err) {
      console.error("Combined export failed:", err);
      window.alert("Combined export failed — check the console for details.");
    } finally {
      setExporting(false);
    }
  };

  const handleView = (row) => {
    reportData.run(row.key, { mode, date: dateValue, month: monthValue });
  };

  const handleDownload = async (row) => {
    try {
      const params = mode === "monthly" ? { month: monthValue } : { date: dateValue };
      const res = await reportsApi.getReport(row.key, params);
      const rows = flattenReportData(res.data);
      downloadCsv(`${row.key}_${mode === "monthly" ? monthValue : dateValue}.csv`, toCsv(rows));
    } catch (err) {
      console.error("Report download failed:", err);
    }
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
          <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-[2px] border border-[#C6C6C6]">
            <ReportsHeader
              mode={mode} setMode={setMode}
              dateValue={dateValue} setDateValue={setDateValue}
              monthValue={monthValue} setMonthValue={setMonthValue}
              onRefresh={() => window.location.reload()}
              refreshing={catalogueLoading}
              onExportAll={handleExportAll}
              exporting={exporting}
            />

            <div className="min-h-0 flex-1 overflow-hidden p-1">
              <AllReportsPanel
                query={query} setQuery={setQuery}
                rows={filtered}
                catalogueLoading={catalogueLoading}
                catalogueError={catalogueError}
                onView={handleView}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </main>
      </div>

      <ReportViewModal
        reportKey={reportData.reportKey}
        result={reportData.result}
        loading={reportData.loading}
        error={reportData.error}
        onClose={reportData.clear}
      />
    </div>
  );
}