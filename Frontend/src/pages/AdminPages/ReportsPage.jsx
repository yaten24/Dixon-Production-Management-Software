import React, { useMemo, useState } from "react";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaBuilding,
  FaDownload,
} from "react-icons/fa";
import Header from "../../compenents/dashboard/Header";
import ThemedDropdown from "../../compenents/common/ThemedDropdown";
import useProductionReports, { useReportFilters } from "../../hooks/useProductionReports";
import { exportReportToExcel } from "../../utils/exportReportToExcel";

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

const ReportsPage = () => {
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

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="mx-auto mt-11 max-w-[1800px] space-y-2 px-2 py-2 sm:px-2 lg:px-4">
        {/* Page header */}
        <div className="rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded border border-[#0F1D24]/15 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded bg-[#FDC94D]" />
              <h1 className="text-sm font-bold text-[#0F1D24]">Production Reports</h1>
            </div>

            <button
              onClick={handleExport}
              disabled={!data}
              className="flex h-8 items-center gap-1.5 rounded bg-[#0F1D24] px-3 text-xs font-semibold text-[#FDC94D] transition-all hover:bg-[#0F1D24]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaDownload className="text-[10px]" />
              Export
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#0F1D24] text-[#FDC94D] shadow-sm"
                      : "border border-[#C6C6C6]/60 bg-white text-[#0F1D24] hover:border-[#0F1D24]"
                  }`}
                >
                  <TabIcon className="text-[10px]" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {isDailyTab ? (
              <div className="relative min-w-[140px] flex-1 basis-[140px] md:w-[160px] md:flex-none md:basis-auto">
                <div className="flex h-8 items-center gap-1.5 rounded border border-[#C6C6C6] bg-white px-2 transition-all hover:border-[#0F1D24]">
                  <FaCalendarAlt className="shrink-0 text-[10px] text-[#0F1D24]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-w-0 border-none bg-transparent text-xs font-medium text-[#0F1D24] outline-none"
                  />
                </div>
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
              className="ml-auto flex h-8 items-center gap-1.5 rounded border border-[#C6C6C6] bg-white px-3 text-xs font-semibold text-[#0F1D24] transition-all hover:border-[#0F1D24] disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
        )}

        {/* REPORT BODY */}
        {loading && !data ? (
          <div className="flex h-40 items-center justify-center rounded border border-[#C6C6C6]/50 bg-white text-xs text-[#9B9B9B]">
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
    </div>
  );
};

// ==========================================================
// Sub-views
// ==========================================================

const Th = ({ children, align = "left" }) => (
  <th className={`whitespace-nowrap px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9B9B9B] text-${align}`}>
    {children}
  </th>
);
const Td = ({ children, align = "left", className = "" }) => (
  <td className={`whitespace-nowrap px-2 py-1.5 text-xs text-[#0F1D24] text-${align} ${className}`}>{children}</td>
);

const TableShell = ({ children }) => (
  <div className="overflow-x-auto rounded border border-[#C6C6C6]/50 bg-white shadow-sm">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

const DailyReportTable = ({ entries = [] }) => {
  if (!entries.length) {
    return <div className="flex h-32 items-center justify-center rounded border border-[#C6C6C6]/50 bg-white text-xs text-[#9B9B9B]">No entries for this date.</div>;
  }
  return (
    <TableShell>
      <thead className="bg-[#F5F5F5]">
        <tr>
          <Th>Hall</Th><Th>Shift</Th><Th>Slot</Th><Th>Machine</Th><Th>Operator</Th><Th>Part</Th>
          <Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Good</Th>
          <Th align="right">Reject</Th><Th align="right">Loss (min)</Th><Th align="right">Eff. %</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#C6C6C6]/30">
        {entries.map((e) => (
          <tr key={e.production_id} className="hover:bg-[#F5F5F5]">
            <Td>{e.hall}</Td><Td>{e.shift}</Td><Td>{e.time_slot}</Td>
            <Td>{e.machine_code}</Td><Td>{e.operator_name}</Td><Td>{e.part_name}</Td>
            <Td align="right">{e.target_qty}</Td><Td align="right">{e.actual_qty}</Td>
            <Td align="right" className="text-emerald-600 font-semibold">{e.good_qty}</Td>
            <Td align="right" className="text-red-600 font-semibold">{e.reject_qty}</Td>
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
    <div className="rounded border border-[#C6C6C6]/50 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${toneClass}`}>{value}</p>
    </div>
  );
};

const DailySummaryView = ({ data }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <StatChip label="Target" value={data.totals.target?.toLocaleString()} />
      <StatChip label="Actual" value={data.totals.actual?.toLocaleString()} tone="green" />
      <StatChip label="Reject" value={data.totals.reject?.toLocaleString()} tone="red" />
      <StatChip label="Achievement" value={`${data.totals.achievement}%`} />
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Hall-wise</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Hall</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.hallWise.map((h) => (
              <tr key={h.hall}><Td>{h.hall}</Td><Td align="right">{h.target}</Td><Td align="right">{h.actual}</Td><Td align="right" className="text-red-600">{h.reject}</Td><Td align="right">{h.achievement}%</Td></tr>
            ))}
          </tbody>
        </TableShell>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Shift-wise</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Shift</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.shiftWise.map((s) => (
              <tr key={s.shift}><Td>{s.shift}</Td><Td align="right">{s.target}</Td><Td align="right">{s.actual}</Td><Td align="right" className="text-red-600">{s.reject}</Td><Td align="right">{s.achievement}%</Td></tr>
            ))}
          </tbody>
        </TableShell>
      </div>
    </div>

    <div>
      <p className="mb-1 text-xs font-bold text-[#0F1D24]">Machine-wise</p>
      <TableShell>
        <thead className="bg-[#F5F5F5]"><tr><Th>Machine</Th><Th>Hall</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Eff. %</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]/30">
          {data.machineWise.map((m) => (
            <tr key={m.machine_code}><Td>{m.machine_code} — {m.machine_name}</Td><Td>{m.hall}</Td><Td align="right">{m.target}</Td><Td align="right">{m.actual}</Td><Td align="right" className="text-red-600">{m.reject}</Td><Td align="right">{m.efficiency}%</Td></tr>
          ))}
        </tbody>
      </TableShell>
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Top Reject Reasons</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Reason</Th><Th align="right">Qty</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.topRejects.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="text-red-600 font-semibold">{r.qty}</Td></tr>))}
          </tbody>
        </TableShell>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Top Loss Reasons</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Reason</Th><Th align="right">Minutes</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.topLossReasons.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="text-amber-600 font-semibold">{r.minutes}</Td></tr>))}
          </tbody>
        </TableShell>
      </div>
    </div>
  </div>
);

const MonthlyReportTable = ({ dayWise = [] }) => {
  if (!dayWise.length) {
    return <div className="flex h-32 items-center justify-center rounded border border-[#C6C6C6]/50 bg-white text-xs text-[#9B9B9B]">No entries for this month.</div>;
  }
  return (
    <TableShell>
      <thead className="bg-[#F5F5F5]">
        <tr><Th>Date</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Good</Th><Th align="right">Reject</Th><Th align="right">Loss (min)</Th><Th align="right">Eff. %</Th><Th align="right">Ach. %</Th></tr>
      </thead>
      <tbody className="divide-y divide-[#C6C6C6]/30">
        {dayWise.map((d) => (
          <tr key={d.entry_date} className="hover:bg-[#F5F5F5]">
            <Td>{new Date(d.entry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Td>
            <Td align="right">{d.target}</Td><Td align="right">{d.actual}</Td>
            <Td align="right" className="text-emerald-600 font-semibold">{d.goodQty}</Td>
            <Td align="right" className="text-red-600 font-semibold">{d.reject}</Td>
            <Td align="right">{d.lossMinutes}</Td><Td align="right">{d.avgEfficiency}%</Td><Td align="right">{d.achievement}%</Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
};

const MonthlySummaryView = ({ data }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <StatChip label="Target" value={data.totals.target?.toLocaleString()} />
      <StatChip label="Actual" value={data.totals.actual?.toLocaleString()} tone="green" />
      <StatChip label="Reject" value={data.totals.reject?.toLocaleString()} tone="red" />
      <StatChip label="Achievement" value={`${data.totals.achievement}%`} />
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Hall-wise</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Hall</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.hallWise.map((h) => (<tr key={h.hall}><Td>{h.hall}</Td><Td align="right">{h.target}</Td><Td align="right">{h.actual}</Td><Td align="right" className="text-red-600">{h.reject}</Td><Td align="right">{h.achievement}%</Td></tr>))}
          </tbody>
        </TableShell>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Shift-wise</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Shift</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Reject</Th><Th align="right">Ach. %</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.shiftWise.map((s) => (<tr key={s.shift}><Td>{s.shift}</Td><Td align="right">{s.target}</Td><Td align="right">{s.actual}</Td><Td align="right" className="text-red-600">{s.reject}</Td><Td align="right">{s.achievement}%</Td></tr>))}
          </tbody>
        </TableShell>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Top Reject Reasons</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Reason</Th><Th align="right">Qty</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.topRejects.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="text-red-600 font-semibold">{r.qty}</Td></tr>))}
          </tbody>
        </TableShell>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-[#0F1D24]">Top Loss Reasons</p>
        <TableShell>
          <thead className="bg-[#F5F5F5]"><tr><Th>Reason</Th><Th align="right">Minutes</Th></tr></thead>
          <tbody className="divide-y divide-[#C6C6C6]/30">
            {data.topLossReasons.map((r) => (<tr key={r.reason}><Td>{r.reason}</Td><Td align="right" className="text-amber-600 font-semibold">{r.minutes}</Td></tr>))}
          </tbody>
        </TableShell>
      </div>
    </div>

    <div>
      <p className="mb-1 text-xs font-bold text-[#0F1D24]">Daily Trend</p>
      <TableShell>
        <thead className="bg-[#F5F5F5]"><tr><Th>Date</Th><Th align="right">Target</Th><Th align="right">Actual</Th><Th align="right">Ach. %</Th></tr></thead>
        <tbody className="divide-y divide-[#C6C6C6]/30">
          {data.dailyTrend.map((d) => (
            <tr key={d.entry_date}><Td>{new Date(d.entry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Td><Td align="right">{d.target}</Td><Td align="right">{d.actual}</Td><Td align="right">{d.achievement}%</Td></tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  </div>
);

export default ReportsPage;