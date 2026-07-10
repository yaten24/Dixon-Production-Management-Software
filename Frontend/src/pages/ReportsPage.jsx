import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  FaCalendarAlt,
  FaIndustry,
  FaChartLine,
  FaExclamationTriangle,
  FaClock,
  FaBoxes,
  FaTools,
  FaFilter,
  FaRedo,
  FaFileExcel,
} from "react-icons/fa";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import {
  getProductionReport,
  getRejectionReasonsList,
  getLossReasonsList,
} from "../api/reportApi";

// NOTE: this file uses the "xlsx" (SheetJS) package for the Excel export.
// If it isn't installed yet, run:  npm install xlsx

const HALLS = ["Hall-1", "Hall-2", "Hall-3", "Hall-4", "C8"];
const SHIFTS = ["A", "B"];
const MOULD_CHANGE_OPTIONS = [
  { value: "All", label: "All Entries" },
  { value: "yes", label: "Mould Change Only" },
  { value: "no", label: "No Mould Change" },
];

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ==========================================================
// Loading state
// ==========================================================
const ReportsLoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 gap-3"
  >
    <div className="relative h-10 w-10 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2563EB] border-r-[#2563EB]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <FaChartLine className="text-[#2563EB] text-sm" />
    </div>
    <p className="text-xs font-medium text-slate-500">Loading report data...</p>
  </motion.div>
);

// ==========================================================
// Summary card
// ==========================================================
const SummaryCard = ({ label, value, icon, color }) => (
  <div className="border border-[#E2E4E9] bg-white rounded-sm px-3 py-2.5">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 truncate">
          {label}
        </p>
        <p className={`mt-1 text-base font-bold font-mono ${color}`}>{value}</p>
      </div>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm ${color} bg-current/10`}
      >
        <span className={color}>{icon}</span>
      </div>
    </div>
  </div>
);

// ==========================================================
// Generic ranked-bar breakdown panel (reused for hall / reject / loss)
// ==========================================================
const BreakdownPanel = ({
  title,
  rows,
  labelKey,
  valueKey,
  valueSuffix = "",
  accent = "bg-[#2563EB]",
}) => {
  const maxValue = Math.max(...rows.map((r) => Number(r[valueKey]) || 0), 1);

  return (
    <div className="border border-[#E2E4E9] bg-white rounded-sm p-3">
      <h3 className="text-xs font-bold text-slate-700 mb-2.5">{title}</h3>

      {rows.length === 0 ? (
        <p className="text-[11px] text-slate-400 py-4 text-center">
          No data available.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row[labelKey]}>
              <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                <span className="font-medium text-slate-600">
                  {row[labelKey]}
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  {row[valueKey]}
                  {valueSuffix}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(Number(row[valueKey]) / maxValue) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full ${accent} rounded-sm`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DEFAULT_FILTERS = {
  fromDate: todayStr(),
  toDate: todayStr(),
  hall: "All",
  shift: "All",
  rejectReasonId: "",
  lossReasonId: "",
  mouldChange: "All",
};

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [hallBreakdown, setHallBreakdown] = useState([]);
  const [rejectionBreakdown, setRejectionBreakdown] = useState([]);
  const [lossBreakdown, setLossBreakdown] = useState([]);
  const [mouldChangeStats, setMouldChangeStats] = useState(null);

  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [lossReasons, setLossReasons] = useState([]);

  // "draft" filters = what's in the form controls (only applied on submit)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  // "appliedFilters" = what was last actually sent to the API
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  // ---- Load dropdown option lists once ----
  useEffect(() => {
    (async () => {
      const [rejRes, lossRes] = await Promise.all([
        getRejectionReasonsList(),
        getLossReasonsList(),
      ]);
      if (rejRes.success) setRejectionReasons(rejRes.data || []);
      if (lossRes.success) setLossReasons(lossRes.data || []);
    })();
  }, []);

  // ---- Fetch report whenever appliedFilters changes ----
  const fetchReport = useCallback(async (filters) => {
    try {
      setLoading(true);
      setError("");

      const res = await getProductionReport(filters);

      if (res.success) {
        const d = res.data;
        setEntries(d.entries || []);
        setSummary(d.summary || null);
        setHallBreakdown(d.hallBreakdown || []);
        setRejectionBreakdown(d.rejectionBreakdown || []);
        setLossBreakdown(d.lossBreakdown || []);
        setMouldChangeStats(d.mouldChangeStats || null);
      } else {
        setError(res.message || "Failed to load report data.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load report data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(appliedFilters);
  }, [appliedFilters, fetchReport]);

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => setAppliedFilters(draftFilters);

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  // Normalized hall breakdown rows for the shared BreakdownPanel component
  const hallRows = useMemo(
    () =>
      hallBreakdown.map((r) => ({ hallName: r.hallName, actual: r.actual })),
    [hallBreakdown],
  );
  const rejectionRows = useMemo(
    () =>
      rejectionBreakdown.map((r) => ({
        reasonName: r.reasonName,
        totalQty: r.totalQty,
      })),
    [rejectionBreakdown],
  );
  const lossRows = useMemo(
    () =>
      lossBreakdown.map((r) => ({
        reasonName: r.reasonName,
        totalMinutes: r.totalMinutes,
      })),
    [lossBreakdown],
  );

  // ==========================================================
  // Excel export — builds a multi-sheet workbook from whatever is
  // currently on screen (respects the applied filters).
  // ==========================================================
  const exportToExcel = () => {
    if (!entries.length && !hallBreakdown.length) return;

    const wb = XLSX.utils.book_new();

    // ---- Sheet 1: Production Entries (the detailed table) ----
    const entriesSheetData = entries.map((e) => ({
      Date: String(e.entry_date).slice(0, 10),
      Hall: e.hall,
      Shift: e.shift,
      "Time Slot": e.time_slot,
      Machine: e.machine_name || e.machine_code,
      Operator: e.operator_name,
      Part: e.part_name,
      "Standard Cycle Time": e.standard_cycle_time,
      "Actual Cycle Time": e.actual_cycle_time,
      Target: e.target_qty,
      Actual: e.actual_qty,
      Good: e.good_qty,
      Reject: e.reject_qty,
      "Loss (min)": e.loss_minutes,
      "Efficiency (%)": e.efficiency,
      Remarks: e.remarks || "",
    }));
    const wsEntries = XLSX.utils.json_to_sheet(entriesSheetData);
    wsEntries["!cols"] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 8 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 24 },
    ];
    XLSX.utils.book_append_sheet(wb, wsEntries, "Entries");

    // ---- Sheet 2: Summary ----
    if (summary) {
      const summarySheetData = [
        { Metric: "Machines Reported", Value: summary.totalMachines },
        { Metric: "Distinct Machines", Value: summary.distinctMachines },
        { Metric: "Total Target Qty", Value: summary.totalTarget },
        { Metric: "Total Actual Qty", Value: summary.totalActual },
        { Metric: "Total Good Qty", Value: summary.totalGood },
        { Metric: "Total Reject Qty", Value: summary.totalReject },
        { Metric: "Total Loss (min)", Value: summary.totalLossMinutes },
        { Metric: "Avg Efficiency (%)", Value: summary.avgEfficiency },
        {
          Metric: "Total Mould Changes",
          Value: mouldChangeStats?.totalChanges ?? 0,
        },
        {
          Metric: "Total Mould Change Time (min)",
          Value: mouldChangeStats?.totalDurationMinutes ?? 0,
        },
        {
          Metric: "Avg Mould Change Time (min)",
          Value: mouldChangeStats?.avgDurationMinutes ?? 0,
        },
        { Metric: "", Value: "" },
        { Metric: "From Date", Value: appliedFilters.fromDate },
        { Metric: "To Date", Value: appliedFilters.toDate },
        { Metric: "Hall", Value: appliedFilters.hall },
        { Metric: "Shift", Value: appliedFilters.shift },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summarySheetData);
      wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    }

    // ---- Sheet 3: Hall-wise breakdown ----
    if (hallBreakdown.length) {
      const wsHall = XLSX.utils.json_to_sheet(
        hallBreakdown.map((r) => ({
          Hall: r.hallName,
          "Target Qty": r.target,
          "Actual Qty": r.actual,
          "Reject Qty": r.reject,
        })),
      );
      wsHall["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsHall, "Hall-wise");
    }

    // ---- Sheet 4: Rejection reason-wise breakdown ----
    if (rejectionBreakdown.length) {
      const wsReject = XLSX.utils.json_to_sheet(
        rejectionBreakdown.map((r) => ({
          "Reason Code": r.reasonCode,
          "Reason Name": r.reasonName,
          "Total Reject Qty": r.totalQty,
          "Entries Count": r.entriesCount,
        })),
      );
      wsReject["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsReject, "Rejection Reasons");
    }

    // ---- Sheet 5: Loss reason-wise breakdown ----
    if (lossBreakdown.length) {
      const wsLoss = XLSX.utils.json_to_sheet(
        lossBreakdown.map((r) => ({
          "Reason Code": r.reasonCode,
          "Reason Name": r.reasonName,
          "Total Loss (min)": r.totalMinutes,
          "Entries Count": r.entriesCount,
        })),
      );
      wsLoss["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsLoss, "Loss Reasons");
    }

    const fileName = `Production_Report_${appliedFilters.fromDate}_to_${appliedFilters.toDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden mt-12">
      <Header title="Reports" subtitle="Daily Production Reports" />

      <main className="flex-1 overflow-y-auto p-2 md:p-3">
        {/* ================= FILTERS ================= */}

        <div className="border border-[#E2E4E9] bg-white rounded-sm p-2 md:p-3 mb-2">
          <div className="flex flex-wrap gap-2 items-end">
            {/* From date */}
            <div className="relative w-[calc(50%-4px)] sm:w-auto md:w-36">
              <label className="block text-[10px] text-slate-400 mb-0.5">
                From
              </label>
              <FaCalendarAlt className="absolute left-2.5 top-[26px] -translate-y-1/2 text-slate-400 text-[11px]" />
              <input
                type="date"
                value={draftFilters.fromDate}
                onChange={(e) => updateDraft("fromDate", e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] pl-7 pr-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* To date */}
            <div className="relative w-[calc(50%-4px)] sm:w-auto md:w-36">
              <label className="block text-[10px] text-slate-400 mb-0.5">
                To
              </label>
              <FaCalendarAlt className="absolute left-2.5 top-[26px] -translate-y-1/2 text-slate-400 text-[11px]" />
              <input
                type="date"
                value={draftFilters.toDate}
                onChange={(e) => updateDraft("toDate", e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] pl-7 pr-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Hall */}
            <div className="w-[calc(50%-4px)] sm:w-auto md:w-32">
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Hall
              </label>
              <select
                value={draftFilters.hall}
                onChange={(e) => updateDraft("hall", e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Halls</option>
                {HALLS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift */}
            <div className="w-[calc(50%-4px)] sm:w-auto md:w-28">
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Shift
              </label>
              <select
                value={draftFilters.shift}
                onChange={(e) => updateDraft("shift", e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Shifts</option>
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    Shift {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Rejection reason */}
            <div className="w-[calc(50%-4px)] sm:w-auto md:w-40">
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Rejection Reason
              </label>
              <select
                value={draftFilters.rejectReasonId}
                onChange={(e) => updateDraft("rejectReasonId", e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Reject Reasons</option>
                {rejectionReasons.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reason_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Loss time reason */}
            <div className="w-[calc(50%-4px)] sm:w-auto md:w-40">
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Loss Time Reason
              </label>
              <select
                value={draftFilters.lossReasonId}
                onChange={(e) => updateDraft("lossReasonId", e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Loss Reasons</option>
                {lossReasons.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reason_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mould change */}
            <div className="w-[calc(50%-4px)] sm:w-auto md:w-40">
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Mould Change
              </label>
              <select
                value={draftFilters.mouldChange}
                onChange={(e) => updateDraft("mouldChange", e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {MOULD_CHANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 w-full md:w-auto md:ml-auto">
              <button
                onClick={applyFilters}
                className="h-8 flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-sm bg-[#2563EB] px-3 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <FaFilter className="text-[10px]" /> Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="h-8 flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-sm border border-[#E2E4E9] px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FaRedo className="text-[10px]" /> Reset
              </button>
              <button
                onClick={exportToExcel}
                disabled={loading || (!entries.length && !hallBreakdown.length)}
                title="Export to Excel"
                className="h-8 flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-sm border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaFileExcel className="text-[11px]" /> Export Excel
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <ReportsLoadingState />
        ) : (
          <div className="space-y-2">
            {/* ================= SUMMARY CARDS ================= */}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2">
              <SummaryCard
                label="Machines Reported"
                value={summary?.totalMachines ?? 0}
                icon={<FaIndustry />}
                color="text-slate-700"
              />
              <SummaryCard
                label="Target"
                value={summary?.totalTarget ?? 0}
                icon={<FaBoxes />}
                color="text-blue-600"
              />
              <SummaryCard
                label="Actual"
                value={summary?.totalActual ?? 0}
                icon={<FaBoxes />}
                color="text-emerald-600"
              />
              <SummaryCard
                label="Good Qty"
                value={summary?.totalGood ?? 0}
                icon={<FaBoxes />}
                color="text-teal-600"
              />
              <SummaryCard
                label="Reject"
                value={summary?.totalReject ?? 0}
                icon={<FaExclamationTriangle />}
                color="text-red-600"
              />
              <SummaryCard
                label="Loss (min)"
                value={summary?.totalLossMinutes ?? 0}
                icon={<FaClock />}
                color="text-orange-600"
              />
              <SummaryCard
                label="Avg Efficiency"
                value={`${summary?.avgEfficiency ?? 0}%`}
                icon={<FaChartLine />}
                color="text-indigo-600"
              />
            </div>

            {/* ================= MOULD CHANGE STATS ================= */}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SummaryCard
                label="Mould Changes"
                value={mouldChangeStats?.totalChanges ?? 0}
                icon={<FaTools />}
                color="text-purple-600"
              />
              <SummaryCard
                label="Mould Change Time (min)"
                value={mouldChangeStats?.totalDurationMinutes ?? 0}
                icon={<FaClock />}
                color="text-purple-600"
              />
              <SummaryCard
                label="Avg Change Time (min)"
                value={mouldChangeStats?.avgDurationMinutes ?? 0}
                icon={<FaClock />}
                color="text-purple-600"
              />
            </div>

            {/* ================= BREAKDOWN PANELS ================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              <BreakdownPanel
                title="Hall-wise Actual Production"
                rows={hallRows}
                labelKey="hallName"
                valueKey="actual"
                accent="bg-[#2563EB]"
              />
              <BreakdownPanel
                title="Rejection Reason-wise Qty"
                rows={rejectionRows}
                labelKey="reasonName"
                valueKey="totalQty"
                accent="bg-red-500"
              />
              <BreakdownPanel
                title="Loss Time Reason-wise (min)"
                rows={lossRows}
                labelKey="reasonName"
                valueKey="totalMinutes"
                accent="bg-orange-500"
              />
            </div>

            {/* ================= ENTRIES TABLE ================= */}

            <div className="border border-[#E2E4E9] bg-white rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[900px] md:min-w-0">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#E2E4E9] text-[10px] uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Hall</th>
                      <th className="px-3 py-2 text-left">Machine</th>
                      <th className="px-3 py-2 text-left">Operator</th>
                      <th className="px-3 py-2 text-left">Part</th>
                      <th className="px-3 py-2 text-left">Shift</th>
                      <th className="px-3 py-2 text-right">Target</th>
                      <th className="px-3 py-2 text-right">Actual</th>
                      <th className="px-3 py-2 text-right">Good</th>
                      <th className="px-3 py-2 text-right">Reject</th>
                      <th className="px-3 py-2 text-right">Loss (min)</th>
                      <th className="px-3 py-2 text-right">Efficiency</th>
                    </tr>
                  </thead>

                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={12}
                          className="px-3 py-8 text-center text-slate-400"
                        >
                          No production entries found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-[#E2E4E9] last:border-none hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-3 py-2 text-slate-600 font-mono">
                            {String(entry.entry_date).slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {entry.hall}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-700">
                            {entry.machine_name || entry.machine_code}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {entry.operator_name}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {entry.part_name}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {entry.shift} &middot; {entry.time_slot}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-blue-600">
                            {entry.target_qty}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-600">
                            {entry.actual_qty}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-teal-600">
                            {entry.good_qty}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-red-600">
                            {entry.reject_qty}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-orange-600">
                            {entry.loss_minutes}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-slate-700">
                            {entry.efficiency}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportsPage;
