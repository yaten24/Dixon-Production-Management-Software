import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaIndustry,
  FaChartLine,
  FaExclamationTriangle,
  FaClock,
  FaBoxes,
} from "react-icons/fa";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import { getAllProductionEntries } from "../api/productionEntryApi";

const HALLS = ["Hall-1", "Hall-2", "Hall-3", "Hall-4", "C8"];
const SHIFTS = ["A", "B"];

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ==========================================================
// Loading state — compact, animated, consistent with the rest of the app
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
      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className={`mt-1 text-base font-bold font-mono ${color}`}>{value}</p>
      </div>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-sm text-sm ${color} bg-current/10`}
      >
        <span className={color}>{icon}</span>
      </div>
    </div>
  </div>
);

const ReportsPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState(todayStr());
  const [hall, setHall] = useState("All");
  const [shift, setShift] = useState("All");

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllProductionEntries();

      if (res.success) {
        setEntries(res.data || []);
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
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // FIX: entry_date can come back as a full ISO timestamp
  // ("2026-07-06T00:00:00.000Z") — comparing it directly against the
  // plain "YYYY-MM-DD" from the date input would never match. Normalize
  // both sides to the same "YYYY-MM-DD" slice before comparing.
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = String(entry.entry_date).slice(0, 10);

      const matchesDate = !date || entryDate === date;
      const matchesHall = hall === "All" || entry.hall === hall;
      const matchesShift = shift === "All" || entry.shift === shift;

      return matchesDate && matchesHall && matchesShift;
    });
  }, [entries, date, hall, shift]);

  const summary = useMemo(() => {
    const totalTarget = filteredEntries.reduce(
      (sum, e) => sum + (Number(e.target_qty) || 0),
      0,
    );
    const totalActual = filteredEntries.reduce(
      (sum, e) => sum + (Number(e.actual_qty) || 0),
      0,
    );
    const totalReject = filteredEntries.reduce(
      (sum, e) => sum + (Number(e.reject_qty) || 0),
      0,
    );
    const totalLossMinutes = filteredEntries.reduce(
      (sum, e) => sum + (Number(e.loss_minutes) || 0),
      0,
    );
    const avgEfficiency = filteredEntries.length
      ? Number(
          (
            filteredEntries.reduce(
              (sum, e) => sum + (Number(e.efficiency) || 0),
              0,
            ) / filteredEntries.length
          ).toFixed(1),
        )
      : 0;

    return {
      totalMachines: filteredEntries.length,
      totalTarget,
      totalActual,
      totalReject,
      totalLossMinutes,
      avgEfficiency,
    };
  }, [filteredEntries]);

  // Hall-wise actual production breakdown, for the mini bar visualization
  const hallBreakdown = useMemo(() => {
    const map = {};

    filteredEntries.forEach((entry) => {
      const key = entry.hall || "Unknown";
      map[key] = (map[key] || 0) + (Number(entry.actual_qty) || 0);
    });

    const maxValue = Math.max(...Object.values(map), 1);

    return Object.entries(map)
      .map(([hallName, actual]) => ({ hallName, actual, maxValue }))
      .sort((a, b) => b.actual - a.actual);
  }, [filteredEntries]);

  const resetFilters = () => {
    setDate(todayStr());
    setHall("All");
    setShift("All");
  };

  return (
      <div className="flex flex-1 flex-col overflow-hidden mt-12">
        <Header title="Reports" subtitle="Daily Production Reports" />

        <main className="flex-1 overflow-y-auto p-2">
          {/* ================= FILTERS ================= */}

          <div className="border border-[#E2E4E9] bg-white rounded-sm p-2 mb-2">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative w-full lg:max-w-[180px]">
                <FaCalendarAlt className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-8 w-full rounded-sm border border-[#E2E4E9] pl-7 pr-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <select
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 lg:w-32"
              >
                <option value="All">All Halls</option>
                {HALLS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 lg:w-28"
              >
                <option value="All">All Shifts</option>
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    Shift {s}
                  </option>
                ))}
              </select>

              <button
                onClick={resetFilters}
                className="h-8 rounded-sm border border-[#E2E4E9] px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors lg:ml-auto"
              >
                Reset to Today
              </button>
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

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
                <SummaryCard
                  label="Machines Reported"
                  value={summary.totalMachines}
                  icon={<FaIndustry />}
                  color="text-slate-700"
                />
                <SummaryCard
                  label="Target"
                  value={summary.totalTarget}
                  icon={<FaBoxes />}
                  color="text-blue-600"
                />
                <SummaryCard
                  label="Actual"
                  value={summary.totalActual}
                  icon={<FaBoxes />}
                  color="text-emerald-600"
                />
                <SummaryCard
                  label="Reject"
                  value={summary.totalReject}
                  icon={<FaExclamationTriangle />}
                  color="text-red-600"
                />
                <SummaryCard
                  label="Loss (min)"
                  value={summary.totalLossMinutes}
                  icon={<FaClock />}
                  color="text-orange-600"
                />
                <SummaryCard
                  label="Avg Efficiency"
                  value={`${summary.avgEfficiency}%`}
                  icon={<FaChartLine />}
                  color="text-indigo-600"
                />
              </div>

              {/* ================= HALL-WISE BREAKDOWN ================= */}

              {hallBreakdown.length > 0 && (
                <div className="border border-[#E2E4E9] bg-white rounded-sm p-3">
                  <h3 className="text-xs font-bold text-slate-700 mb-2.5">
                    Hall-wise Actual Production
                  </h3>

                  <div className="space-y-2">
                    {hallBreakdown.map((row) => (
                      <div key={row.hallName}>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                          <span className="font-medium text-slate-600">
                            {row.hallName}
                          </span>
                          <span className="font-mono font-semibold text-slate-700">
                            {row.actual}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(row.actual / row.maxValue) * 100}%`,
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full bg-[#2563EB] rounded-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= ENTRIES TABLE ================= */}

              <div className="border border-[#E2E4E9] bg-white rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E4E9] text-[10px] uppercase tracking-wide text-slate-400">
                        <th className="px-3 py-2 text-left">Machine</th>
                        <th className="px-3 py-2 text-left">Operator</th>
                        <th className="px-3 py-2 text-left">Part</th>
                        <th className="px-3 py-2 text-left">Shift</th>
                        <th className="px-3 py-2 text-right">Target</th>
                        <th className="px-3 py-2 text-right">Actual</th>
                        <th className="px-3 py-2 text-right">Reject</th>
                        <th className="px-3 py-2 text-right">Loss (min)</th>
                        <th className="px-3 py-2 text-right">Efficiency</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-3 py-8 text-center text-slate-400"
                          >
                            No production entries found for the selected
                            filters.
                          </td>
                        </tr>
                      ) : (
                        filteredEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            className="border-b border-[#E2E4E9] last:border-none hover:bg-slate-50/60 transition-colors"
                          >
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
