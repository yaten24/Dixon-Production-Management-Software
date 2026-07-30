import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Target,
  TrendingUp,
  XCircle,
  Gauge,
  Cog,
  ChevronDown,
  Download,
  Printer,
  RefreshCw,
} from "lucide-react";

import Sidebar from "./Sidebar";
import useMachineWiseProduction from "../../hooks/useMachineWiseProduction";

const AMBER = "#FDC94D";
const GREEN = "#10B981";
const RED = "#EF4444";
const PURPLE = "#A78BFA";
const BLUE = "#60A5FA";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = ["2024", "2025", "2026"];
const HALLS = ["All Halls", "Hall 1", "Hall 2", "Hall 3", "Hall 4", "C8"];
const SHIFTS = ["All Shifts", "A", "B"];

/* ==========================================================
   SHARED PRIMITIVES
========================================================== */
const CardShell = ({ className = "", children }) => (
  <div className={`rounded-[2px] border border-[#E2E8F0] bg-white p-2.5 shadow-sm ${className}`}>
    {children}
  </div>
);

// Custom themed dropdown — same as DateWiseProduction.jsx
const DarkSelect = ({ label, value, options = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white transition-colors duration-100 hover:border-white/30"
      >
        {label && <span className="text-white/50">{label} :</span>}
        <span className="whitespace-nowrap">{value}</span>
        <ChevronDown size={11} className={`text-white/50 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-56 min-w-[140px] overflow-y-auto rounded-[2px] border border-[#E2E8F0] bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-1.5 text-left text-[11px] font-semibold transition-colors ${
                opt === value ? "bg-[#FDC94D]/15 text-[#0F1D24]" : "text-[#475569] hover:bg-[#F8FAFC]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ icon: Icon, accent, label, value, sub, stat1, stat2 }) => (
  <div className="flex min-h-0 flex-col gap-1.5 rounded-[2px] border border-white/10 bg-[#0F1D24] p-2.5 shadow-sm [container-type:inline-size]">
    <div className="flex items-center gap-2">
      <span className="truncate text-[14.5px] font-bold uppercase tracking-wide text-white/70">{label}</span>
    </div>
    <div>
      <div className="text-[clamp(16px,6cqw,21px)] font-extrabold leading-none text-white">{value}</div>
      <div className="mt-1 text-[9.5px] font-semibold text-white/40">{sub}</div>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-1.5 text-[9.5px] font-bold">
      <div className="min-w-0">
        <div className="truncate font-semibold text-white/40">{stat1.label}</div>
        <div className={`truncate ${stat1.tone || "text-white"}`}>{stat1.value}</div>
      </div>
      {stat2 && (
        <div className="min-w-0 text-right">
          <div className="truncate font-semibold text-white/40">{stat2.label}</div>
          <div className={`truncate ${stat2.tone || "text-white"}`}>{stat2.value}</div>
        </div>
      )}
    </div>
  </div>
);

const fmt = (n) => (n == null ? "-" : Number(n).toLocaleString("en-IN"));

const Th = ({ children, span, align = "center", first = false, last = false }) => (
  <th
    colSpan={span}
    className={`px-2 py-1.5 text-${align}`}
    style={{
      boxShadow: [
        "inset 0 -2px 0 0 #94A3B8",
        !last && "inset -2px 0 0 0 #94A3B8",
        first && "inset 2px 0 0 0 #94A3B8",
      ]
        .filter(Boolean)
        .join(", "),
    }}
  >
    {children}
  </th>
);

const Td = ({ children, className = "", first = false, last = false }) => (
  <td
    className={`px-2 py-1 ${className}`}
    style={{
      boxShadow: [
        "inset 0 -2px 0 0 #CBD5E1",
        !last && "inset -2px 0 0 0 #CBD5E1",
        first && "inset 2px 0 0 0 #CBD5E1",
      ]
        .filter(Boolean)
        .join(", "),
    }}
  >
    {children}
  </td>
);

// Shared column widths so the scrollable header/body table and the
// pinned (always-visible) totals table stay perfectly aligned.
const COL_WIDTHS = [160, 90, 95, 95, 90, 90, 85, 85, 100, 110, 115, 95];

const ColGroup = () => (
  <colgroup>
    {COL_WIDTHS.map((w, i) => (
      <col key={i} style={{ width: `${w}px` }} />
    ))}
  </colgroup>
);

const Legend = ({ swatch, label }) => (
  <span className="flex items-center gap-1 text-[#475569]">
    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: swatch }} />
    {label}
  </span>
);

/* ==========================================================
   EXCEL EXPORT
========================================================== */
function exportToExcel({ rows, totals, month, year, hall, shift }) {
  const header = [
    "Machine", "Hall",
    "Target (Units)", "Actual (Units)", "Good (Units)", "Reject (Units)",
    "Achievement %", "Reject %", "Efficiency (%)",
    "Std Cycle Time (Sec)", "Actual Cycle Time (Sec)", "Loss (Min)",
  ];

  const dataRows = rows.map((r) => [
    r.machine, r.hall,
    r.target, r.actual, r.good, r.reject,
    r.achievement, r.rejectPct, r.efficiency,
    r.stdCycleTime, r.actualCycleTime, r.lossMinutes,
  ]);

  const totalsRow = [
    "TOTAL / AVG", `${totals.machineCount || 0} Machines`,
    totals.target, totals.actual, totals.good, totals.reject,
    totals.achievement || 0, totals.rejectPct || 0, totals.avgEfficiency || 0,
    "", "", "",
  ];

  const sheetData = [header, ...dataRows, totalsRow];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = Array(header.length).fill({ wch: 14 });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Machine Wise Production");

  const hallLabel = hall && hall !== "All Halls" ? hall.replace(/\s+/g, "") : "AllHalls";
  const shiftLabel = shift && shift !== "All Shifts" ? `_Shift${shift}` : "";
  XLSX.writeFile(wb, `MachineWiseProduction_${month}${year}_${hallLabel}${shiftLabel}.xlsx`);
}

/* ==========================================================
   PAGE
========================================================== */
const MachineWiseProduction = () => {
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [hall, setHall] = useState("All Halls");
  const [shift, setShift] = useState("All Shifts");

  const { rows, totals, loading, error, refetch } = useMachineWiseProduction({ year, month, hall, shift });

  const handleApply = () => refetch();
  const handleExportExcel = () => exportToExcel({ rows, totals, month, year, hall, shift });
  const handlePrint = () => window.print();

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F8FAFC]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area, .print-area * { overflow: visible !important; height: auto !important; }
          body, .print-bg { background: #fff !important; }
          table { font-size: 9px; }
        }
      `}</style>

      <div className="no-print">
        <Sidebar />
      </div>

      <div className="print-bg flex min-h-0 flex-1 flex-col overflow-hidden p-1">
        <div className="print-area flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[2px] border border-[#FDC94D]/40 bg-white">
          {/* HEADER — dark, matches DateWiseProduction.jsx / Dashboard.jsx */}
          <header className="flex-shrink-0 rounded-t-[2px] bg-[#0F1D24] px-4 py-2.5">
            <div className="flex flex-wrap items-end justify-between gap-y-2 gap-x-3">
              <div>
                <h1 className="whitespace-nowrap text-[14px] font-extrabold uppercase tracking-wide text-white">
                  Machine Wise Performance
                </h1>
                <p className="text-[9.5px] font-semibold text-white/40">
                  Monthly Production Summary — Machine Wise ({month} {year}
                  {hall !== "All Halls" ? `, ${hall}` : ""}
                  {shift !== "All Shifts" ? `, Shift ${shift}` : ""})
                </p>
              </div>

              <div className="no-print flex flex-wrap items-end gap-2">
                <DarkSelect label="Month" value={month} options={MONTHS} onChange={setMonth} />
                <DarkSelect label="Year" value={year} options={YEARS} onChange={setYear} />
                <DarkSelect label="Hall" value={hall} options={HALLS} onChange={setHall} />
                <DarkSelect label="Shift" value={shift} options={SHIFTS} onChange={setShift} />

                <button
                  onClick={handleApply}
                  disabled={loading}
                  className="flex h-7 items-center gap-1.5 rounded-[2px] px-2.5 text-[10.5px] font-extrabold text-[#0F1D24] disabled:opacity-60"
                  style={{ backgroundColor: AMBER }}
                >
                  <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                  Apply Filter
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={loading || !rows.length}
                  className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white hover:border-white/30 disabled:opacity-40"
                >
                  <Download size={11} /> Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  disabled={loading || !rows.length}
                  className="flex h-7 items-center gap-1.5 rounded-[2px] border border-white/15 bg-transparent px-2.5 text-[10.5px] font-semibold text-white hover:border-white/30 disabled:opacity-40"
                >
                  <Printer size={11} /> Print
                </button>
              </div>
            </div>
          </header>

          {error && (
            <div className="no-print mx-3 mt-2 flex-shrink-0 rounded-[2px] border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-500">
              {error}
            </div>
          )}

          {/* MAIN */}
          <main className="print-area flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-1">
            {loading ? (
              <div className="no-print flex flex-1 flex-col items-center justify-center gap-2 text-[13px] font-semibold text-[#94A3B8]">
                <RefreshCw size={18} className="animate-spin text-[#0F1D24]/40" />
                Loading machine data...
              </div>
            ) : (
              <>
                <div className="grid flex-shrink-0 grid-cols-2 gap-1.5 lg:grid-cols-4">
                  <KpiCard
                    icon={Target} accent={BLUE}
                    label="Target (Units)" value={fmt(totals.target)} sub="Total Monthly Target"
                    stat1={{ label: "Machines", value: totals.machineCount || 0 }}
                  />
                  <KpiCard
                    icon={TrendingUp} accent={GREEN}
                    label="Actual (Units)" value={fmt(totals.actual)} sub="Total Monthly Actual"
                    stat1={{ label: "Good (Units)", value: fmt(totals.good) }}
                    stat2={{ label: "Achievement", value: `${totals.achievement || 0}%`, tone: "text-emerald-400" }}
                  />
                  <KpiCard
                    icon={XCircle} accent={RED}
                    label="Reject (Units)" value={fmt(totals.reject)} sub="Total Monthly Reject"
                    stat1={{ label: "Reject %", value: `${totals.rejectPct || 0}%`, tone: "text-red-400" }}
                  />
                  <KpiCard
                    icon={Gauge} accent={PURPLE}
                    label="Efficiency (%)" value={`${totals.avgEfficiency || 0}%`} sub="Average Across Machines"
                    stat1={{ label: "Best Machine", value: totals.bestMachine ? `${totals.bestMachine.machine} (${totals.bestMachine.efficiency}%)` : "-", tone: "text-emerald-400" }}
                    stat2={{ label: "Lowest Machine", value: totals.worstMachine ? `${totals.worstMachine.machine} (${totals.worstMachine.efficiency}%)` : "-", tone: "text-red-400" }}
                  />
                </div>

                <div className="print-area flex min-h-0 flex-1 flex-col gap-2">
                  <CardShell className="print-area flex min-h-0 flex-1 basis-0 flex-col">
                    <div className="mb-1.5 flex flex-shrink-0 items-center justify-between">
                      <h2 className="text-[11.5px] font-extrabold text-[#0F1D24]">
                        Machine Wise Details — {month} {year}
                      </h2>
                      <div className="flex items-center gap-3 text-[9px] font-bold">
                        <Legend swatch={BLUE} label="Target" />
                        <Legend swatch={GREEN} label="Actual" />
                        <Legend swatch={RED} label="Reject" />
                        <Legend swatch={PURPLE} label="Efficiency" />
                      </div>
                    </div>

                    <div className="print-area flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-hidden rounded-[2px] border-2 border-[#0F1D24]/25">
                      {/* Scrollable header + body (vertical only — this is the part that scrolls) */}
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        <table className="w-full min-w-[1215px] table-fixed border-separate border-spacing-0 text-left">
                          <ColGroup />
                          <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                            <tr className="text-[9.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
                              <Th first><span className="block text-left">Machine</span></Th>
                              <Th>Hall</Th>
                              <Th><span className="text-blue-600">Target</span></Th>
                              <Th><span className="text-emerald-600">Actual</span></Th>
                              <Th><span className="text-emerald-600">Good</span></Th>
                              <Th><span className="text-red-500">Reject</span></Th>
                              <Th>Achv %</Th>
                              <Th><span className="text-red-500">Reject %</span></Th>
                              <Th><span className="text-purple-600">Efficiency %</span></Th>
                              <Th>Std Cycle (Sec)</Th>
                              <Th>Actual Cycle (Sec)</Th>
                              <Th last>Loss (Min)</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.length === 0 ? (
                              <tr>
                                <td colSpan={12} className="border-b-2 border-[#CBD5E1] px-2 py-4 text-center italic text-[#94A3B8]">
                                  No machine data for this period.
                                </td>
                              </tr>
                            ) : (
                              rows.map((r, idx) => (
                                <tr
                                  key={r.machineId}
                                  className={`text-[10px] font-semibold text-[#0F1D24] hover:bg-[#F8FAFC] ${
                                    idx % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white"
                                  }`}
                                >
                                  <Td first className="truncate font-bold">{r.machine}</Td>
                                  <Td className="truncate">{r.hall}</Td>
                                  <Td>{fmt(r.target)}</Td>
                                  <Td>{fmt(r.actual)}</Td>
                                  <Td>{fmt(r.good)}</Td>
                                  <Td>{fmt(r.reject)}</Td>
                                  <Td className={r.achievement >= 90 ? "text-emerald-600" : "text-amber-600"}>{r.achievement}%</Td>
                                  <Td className="text-red-500">{r.rejectPct}%</Td>
                                  <Td className={r.efficiency >= 90 ? "text-emerald-600" : "text-amber-600"}>{r.efficiency}%</Td>
                                  <Td>{r.stdCycleTime}</Td>
                                  <Td>{r.actualCycleTime}</Td>
                                  <Td last>{r.lossMinutes}</Td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pinned TOTAL / AVG row — always visible, never scrolls away */}
                      {rows.length > 0 && (
                        <table className="w-full min-w-[1215px] table-fixed border-separate border-spacing-0 text-left">
                          <ColGroup />
                          <tbody>
                            <tr className="bg-[#FEF3C7] text-[10px] font-extrabold text-[#0F1D24]">
                              <Td first className="truncate py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">TOTAL / AVG</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">{fmt(totals.machineCount)} Mc</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">{fmt(totals.target)}</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">{fmt(totals.actual)}</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">{fmt(totals.good)}</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">{fmt(totals.reject)}</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7] text-emerald-600">{fmt(totals.achievement)}%</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7] text-red-500">{fmt(totals.rejectPct)}%</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7] text-emerald-600">{fmt(totals.avgEfficiency)}%</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">—</Td>
                              <Td className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">—</Td>
                              <Td last className="py-1.5 border-t-4 border-t-[#0F1D24] bg-[#FEF3C7]">—</Td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </CardShell>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MachineWiseProduction;