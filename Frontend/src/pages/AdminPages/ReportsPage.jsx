import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaBuilding,
  FaDownload,
} from "react-icons/fa";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import Sidebar from "./Sidebar";
import ThemedDropdown from "../../compenents/common/ThemedDropdown";
import useProductionReports, { useReportFilters } from "../../hooks/useProductionReports";
import { exportReportToExcel } from "../../utils/exportReportToExcel";

// ============================================================
// THEME TOKENS — kept consistent with Sidebar.jsx / MonthlyPlanPage
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";

const TABS = [
  { id: "daily", label: "Daily Report", icon: FaFileAlt },
  { id: "daily-summary", label: "Daily Summary", icon: FaChartBar },
  { id: "monthly", label: "Monthly Report", icon: FaCalendarAlt },
  { id: "monthly-summary", label: "Monthly Summary", icon: FaChartLine },
];

const getBusinessDateDefault = () => {
  const now = new Date();
  if (now.getHours() < 8) now.setDate(now.getDate() - 1);
  return now.toISOString().slice(0, 10);
};

/* ---------------------------------------------------------
   QUICK STAT — same compact bordered tile as MonthlyPlanPage's
   QuickStat, so both pages read as one design system.
--------------------------------------------------------- */
const QuickStat = ({ label, value, icon: Icon, accent = NAVY, tone }) => (
  <div className="flex flex-1 items-center gap-2.5 border border-[#C6C6C6] bg-white px-3 py-2" style={{ borderLeft: `3px solid ${accent}` }}>
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#C6C6C6]" style={{ color: accent }}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
      <p className={`font-mono text-[18px] font-extrabold leading-none ${tone || "text-[#0F1D24]"}`}>{value}</p>
    </div>
  </div>
);

// ============================================================
// ReportsPage — desktop-app layout matching MonthlyPlanPage:
// persistent sidebar, flat control-box header, flat tabs/filters,
// flat grid-line tables instead of rounded/shadowed cards.
// ============================================================
const AdminReportsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState("daily");
  const [date, setDate] = useState(getBusinessDateDefault());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [hall, setHall] = useState("");
  const [shift, setShift] = useState("");
  const [machine, setMachine] = useState("");

  const { halls, machines } = useReportFilters();

  const hallOptions = useMemo(
    () => [{ code: "", label: "All Halls" }, ...halls.map((h) => ({ code: h, label: h }))],
    [halls],
  );
  const shiftOptions = [
    { code: "", label: "All Shifts" },
    { code: "A", label: "Shift A" },
    { code: "B", label: "Shift B" },
  ];
  const machineOptions = useMemo(
    () => [{ code: "", label: "All Machines" }, ...machines.map((m) => ({ code: m.machine_code, label: `${m.machine_code} — ${m.machine_name}` }))],
    [machines],
  );
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    code: String(i + 1),
    label: new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }),
  }));
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { code: String(y), label: String(y) };
  });

  const isDailyTab = activeTab === "daily" || activeTab === "daily-summary";
  const params = isDailyTab
    ? { date, hall: hall || undefined, shift: shift || undefined, machine: machine || undefined }
    : { month, year, hall: hall || undefined };

  const { data, loading, error, refresh } = useProductionReports(activeTab, params);

  const handleExport = () => {
    if (!data) return;
    const filenameBase = `${activeTab}-${isDailyTab ? date : `${year}-${month}`}`;
    if (activeTab === "daily") exportReportToExcel(data.entries, filenameBase);
    else if (activeTab === "monthly") exportReportToExcel(data.dayWise, filenameBase);
    else if (activeTab === "daily-summary") exportReportToExcel(data.machineWise, filenameBase);
    else if (activeTab === "monthly-summary") exportReportToExcel(data.dailyTrend, filenameBase);
  };

  // quick summary stats shown under the header — mirrors totals already
  // present in each report payload, when available.
  const headerStats = data?.totals
    ? [
        { label: "Target", value: data.totals.target?.toLocaleString(), icon: FaCalendarAlt, accent: GOLD },
        { label: "Actual", value: data.totals.actual?.toLocaleString(), icon: FaChartBar, accent: "#2563EB", tone: "text-emerald-600" },
        { label: "Reject", value: data.totals.reject?.toLocaleString(), icon: FaChartLine, accent: DANGER, tone: "text-red-600" },
        { label: "Achievement", value: `${data.totals.achievement}%`, icon: FaFileAlt, accent: SUCCESS },
      ]
    : null;

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-3">
          {/* control box header — same shape as MonthlyPlanPage's header */}
          <div className="mx-3 mt-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
            <div className="min-w-0 leading-tight">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#9B9B9B]">Reports &amp; Analytics</p>
              <h1 className="truncate text-[15px] font-extrabold tracking-tight text-[#0F1D24]">Production Reports</h1>
            </div>

            <div className="flex flex-shrink-0 items-stretch gap-1.5">
              <button
                onClick={() => navigate("/employee/home")}
                className="flex items-center gap-1.5 border border-[#C6C6C6] bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
              >
                <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
                Dashboard
              </button>
              <button
                onClick={handleExport}
                disabled={!data}
                className="flex items-center gap-1.5 border border-[#0F1D24] bg-[#0F1D24] px-2.5 text-[11px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaDownload className="h-3 w-3" />
                Export
              </button>
            </div>
          </div>

          {/* tabs — flat, same active treatment as MonthlyPlanPage range tabs */}
          <div className="mx-3 flex flex-shrink-0 items-stretch gap-px bg-[#C6C6C6]">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-colors duration-100 ${
                    isActive ? "bg-[#0F1D24] text-[#FDC94D]" : "bg-white text-[#0F1D24] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <TabIcon className="h-3 w-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* error banner — flat, bordered, matches MonthlyPlanPage warnings */}
          {error && (
            <div className="mx-3 flex flex-shrink-0 items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* quick stats */}
          {headerStats && (
            <div className="mx-3 flex flex-shrink-0 flex-wrap gap-1.5">
              {headerStats.map((s) => (
                <QuickStat key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} tone={s.tone} />
              ))}
            </div>
          )}

          {/* filters — same bordered control-row shape as MonthlyPlanPage search+filter bar */}
          <div className="mx-3 flex flex-shrink-0 flex-wrap items-center gap-2 border border-[#C6C6C6] bg-white px-2.5 py-1.5">
            {isDailyTab ? (
              <div className="flex h-8 min-w-[150px] items-center gap-1.5 border border-[#C6C6C6] px-2">
                <FaCalendarAlt className="h-3 w-3 flex-shrink-0 text-[#0F1D24]/70" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-w-0 border-none bg-transparent text-[11px] font-semibold text-[#0F1D24] outline-none"
                />
              </div>
            ) : (
              <>
                <ThemedDropdown icon={FaCalendarAlt} ariaLabel="Month" value={String(month)} options={monthOptions} onChange={(v) => setMonth(Number(v))} />
                <ThemedDropdown icon={FaCalendarAlt} ariaLabel="Year" value={String(year)} options={yearOptions} onChange={(v) => setYear(Number(v))} />
              </>
            )}

            <ThemedDropdown icon={FaBuilding} ariaLabel="Hall" value={hall} options={hallOptions} onChange={setHall} />

            {activeTab === "daily" && (
              <>
                <ThemedDropdown ariaLabel="Shift" value={shift} options={shiftOptions} onChange={setShift} />
                <ThemedDropdown ariaLabel="Machine" value={machine} options={machineOptions} onChange={setMachine} />
              </>
            )}

            <button
              onClick={refresh}
              disabled={loading}
              className="ml-auto flex h-8 items-center gap-1.5 border border-[#C6C6C6] bg-white px-3 text-[11px] font-bold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* report body */}
          <div className="mx-3">
            {loading && !data ? (
              <div className="flex h-40 items-center justify-center border border-[#C6C6C6] bg-white text-[11.5px] text-[#9B9B9B]">
                Loading report...
              </div>
            ) : !data ? null : activeTab === "daily" ? (
              <DailyReportTable entries={data.entries} />
            ) : activeTab === "daily-summary" ? (
              <DailySummaryView data={data} />
            ) : activeTab === "monthly" ? (
              <MonthlyReportTable dayWise={data.dayWise} />
            ) : (
              <MonthlySummaryView data={data} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// ==========================================================
// Sub-views — flat, bordered, no rounded corners or shadows
// ==========================================================

const Th = ({ children, align = "left" }) => (
  <th className={`whitespace-nowrap border-b border-[#C6C6C6] bg-[#FAFAFA] px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B] text-${align}`}>
    {children}
  </th>
);
const Td = ({ children, align = "left", className = "" }) => (
  <td className={`whitespace-nowrap px-2.5 py-1.5 text-[11.5px] text-[#0F1D24] text-${align} ${className}`}>{children}</td>
);

const TableShell = ({ children }) => (
  <div className="overflow-x-auto border border-[#C6C6C6] bg-white">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

const DailyReportTable = ({ entries = [] }) => {
  if (!entries.length) {
    return <div className="flex h-32 items-center justify-center border border-[#C6C6C6] bg-white text-[11.5px] text-[#9B9B9B]">No entries for this date.</div>;
  }
  return (
    <TableShell>
      <thead>
        <tr>
          <Th>Hall</Th><Th>Shift</Th><Th>Slot</Th><Th>Machine</Th><Th>Operator</Th><Th>Part</Th>
          <Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Good</Th>
          <Th align="right">Reject</Th><Th align="right">Loss (min)</Th><Th align="right">Eff. %</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#C6C6C6]">
        {entries.map((e) => (
          <tr key={e.production_id} className="hover:bg-[#FAFAFA]">
            <Td>{e.hall}</Td><Td>{e.shift}</Td><Td>{e.time_slot}</Td>
            <Td>{e.machine_code}</Td><Td>{e.operator_name}</Td><Td>{e.part_name}</Td>
            <Td align="right">{e.target_qty}</Td><Td align="right">{e.actual_qty}</Td>
            <Td align="right" className="font-semibold text-emerald-600">{e.good_qty}</Td>
            <Td align="right" className="font-semibold text-red-600">{e.reject_qty}</Td>
            <Td align="right">{e.loss_minutes}</Td><Td align="right">{e.efficiency}%</Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
};

const StatChip = ({ label, value, tone = "navy" }) => {
  const toneClass = tone === "navy" ? "text-[#0F1D24]" : tone === "red" ? "text-red-600" : "text-emerald-600";
  return (
    <div className="border border-[#C6C6C6] bg-white px-3 py-2">
      <p className="text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
      <p className={`mt-0.5 font-mono text-[17px] font-extrabold ${toneClass}`}>{value}</p>
    </div>
  );
};

const SubTable = ({ title, children }) => (
  <div>
    <p className="mb-1 text-[11px] font-bold text-[#0F1D24]">{title}</p>
    <TableShell>{children}</TableShell>
  </div>
);

const DailySummaryView = ({ data }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
      <StatChip label="Target" value={data.totals.target?.toLocaleString()} />
      <StatChip label="Actual" value={data.totals.actual?.toLocaleString()} tone="green" />
      <StatChip label="Reject" value={data.totals.reject?.toLocaleString()} tone="red" />
      <StatChip label="Achievement" value={`${data.totals.achievement}%`} />
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <SubTable title="Hall-wise">
        <thead><tr><Th>Hall</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.hallWise.map((h) => (
            <tr key={h.hall}><Td>{h.hall}</Td><Td align="right">{h.target}</Td><Td align="right">{h.actual}</Td><Td align="right" className="text-red-600">{h.reject}</Td><Td align="right">{h.achievement}%</Td></tr>
          ))}
        </tbody>
      </SubTable>
      <SubTable title="Shift-wise">
        <thead><tr><Th>Shift</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.shiftWise.map((s) => (
            <tr key={s.shift}><Td>{s.shift}</Td><Td align="right">{s.target}</Td><Td align="right">{s.actual}</Td><Td align="right" className="text-red-600">{s.reject}</Td><Td align="right">{s.achievement}%</Td></tr>
          ))}
        </tbody>
      </SubTable>
    </div>

    <SubTable title="Machine-wise">
      <thead><tr><Th>Machine</Th><Th>Hall</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Eff. %</Th></tr></thead>
      <tbody className="divide-y divide-[#C6C6C6]">
        {data.machineWise.map((m) => (
          <tr key={m.machine_code}><Td>{m.machine_code} — {m.machine_name}</Td><Td>{m.hall}</Td><Td align="right">{m.target}</Td><Td align="right">{m.actual}</Td><Td align="right" className="text-red-600">{m.reject}</Td><Td align="right">{m.efficiency}%</Td></tr>
        ))}
      </tbody>
    </SubTable>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <SubTable title="Top Reject Reasons">
        <thead><tr><Th>Reason</Th><Th align="right">Qty</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.topRejects.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="font-semibold text-red-600">{r.qty}</Td></tr>))}
        </tbody>
      </SubTable>
      <SubTable title="Top Loss Reasons">
        <thead><tr><Th>Reason</Th><Th align="right">Minutes</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.topLossReasons.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="font-semibold text-amber-600">{r.minutes}</Td></tr>))}
        </tbody>
      </SubTable>
    </div>
  </div>
);

const MonthlyReportTable = ({ dayWise = [] }) => {
  if (!dayWise.length) {
    return <div className="flex h-32 items-center justify-center border border-[#C6C6C6] bg-white text-[11.5px] text-[#9B9B9B]">No entries for this month.</div>;
  }
  return (
    <TableShell>
      <thead>
        <tr><Th>Date</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Good</Th><Th align="right">Reject</Th><Th align="right">Loss (min)</Th><Th align="right">Eff. %</Th><Th align="right">Ach. %</Th></tr>
      </thead>
      <tbody className="divide-y divide-[#C6C6C6]">
        {dayWise.map((d) => (
          <tr key={d.entry_date} className="hover:bg-[#FAFAFA]">
            <Td>{new Date(d.entry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Td>
            <Td align="right">{d.target}</Td><Td align="right">{d.actual}</Td>
            <Td align="right" className="font-semibold text-emerald-600">{d.goodQty}</Td>
            <Td align="right" className="font-semibold text-red-600">{d.reject}</Td>
            <Td align="right">{d.lossMinutes}</Td><Td align="right">{d.avgEfficiency}%</Td><Td align="right">{d.achievement}%</Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
};

const MonthlySummaryView = ({ data }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
      <StatChip label="Target" value={data.totals.target?.toLocaleString()} />
      <StatChip label="Actual" value={data.totals.actual?.toLocaleString()} tone="green" />
      <StatChip label="Reject" value={data.totals.reject?.toLocaleString()} tone="red" />
      <StatChip label="Achievement" value={`${data.totals.achievement}%`} />
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <SubTable title="Hall-wise">
        <thead><tr><Th>Hall</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.hallWise.map((h) => (<tr key={h.hall}><Td>{h.hall}</Td><Td align="right">{h.target}</Td><Td align="right">{h.actual}</Td><Td align="right" className="text-red-600">{h.reject}</Td><Td align="right">{h.achievement}%</Td></tr>))}
        </tbody>
      </SubTable>
      <SubTable title="Shift-wise">
        <thead><tr><Th>Shift</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.shiftWise.map((s) => (<tr key={s.shift}><Td>{s.shift}</Td><Td align="right">{s.target}</Td><Td align="right">{s.actual}</Td><Td align="right" className="text-red-600">{s.reject}</Td><Td align="right">{s.achievement}%</Td></tr>))}
        </tbody>
      </SubTable>
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <SubTable title="Top Reject Reasons">
        <thead><tr><Th>Reason</Th><Th align="right">Qty</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.topRejects.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="font-semibold text-red-600">{r.qty}</Td></tr>))}
        </tbody>
      </SubTable>
      <SubTable title="Top Loss Reasons">
        <thead><tr><Th>Reason</Th><Th align="right">Minutes</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]">
          {data.topLossReasons.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="font-semibold text-amber-600">{r.minutes}</Td></tr>))}
        </tbody>
      </SubTable>
    </div>

    <SubTable title="Daily Trend">
      <thead><tr><Th>Date</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Ach. %</Th></tr></thead>
      <tbody className="divide-y divide-[#C6C6C6]">
        {data.dailyTrend.map((d) => (
          <tr key={d.entry_date}><Td>{new Date(d.entry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Td><Td align="right">{d.target}</Td><Td align="right">{d.actual}</Td><Td align="right">{d.achievement}%</Td></tr>
        ))}
      </tbody>
    </SubTable>
  </div>
);

export default AdminReportsPage;