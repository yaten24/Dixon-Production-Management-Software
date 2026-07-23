import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineSignal,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useHourlyProductionHeatmap } from "../hooks/useHourlyProductionHeatmap";
import { HALL_ID_TO_CODE } from "../config/hallMapping";
// NOTE: adjust this import to wherever PageTitleStrip actually lives relative to this file.
import PageTitleStrip from "./PlanningPage/PageTitleStrip";

const SHIFT_COLORS = {
  A: { row: "bg-[#FDC94D]/10", label: "bg-[#FDC94D] text-[#0F1D24]" },
  B: { row: "bg-[#0F1D24]/[0.04]", label: "bg-[#0F1D24] text-[#FDC94D]" },
};

const formatHourSlot = (hour) => {
  const next = (hour + 1) % 24;
  const to12h = (h) => ({ display: h % 12 === 0 ? 12 : h % 12, period: h < 12 ? "AM" : "PM" });
  const start = to12h(hour);
  const end = to12h(next);
  return `${String(start.display).padStart(2, "0")}-${String(end.display).padStart(2, "0")} ${end.period}`;
};

const cellTone = (target, achieved) => {
  if (achieved === null || achieved === undefined) return "bg-white text-[#0F1D24]/30";
  if (target === 0 && achieved === 0) return "bg-white text-[#9B9B9B]";
  return achieved >= target ? "bg-green-200/70 text-green-900" : "bg-red-200/70 text-red-900";
};

function useTicker(ms = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function relativeTime(date) {
  if (!date) return "—";
  const secs = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (secs < 2) return "just now";
  if (secs < 60) return `${secs}s ago`;
  return `${Math.round(secs / 60)}m ago`;
}

// ============================================================
// Sidebar summary tile — matches the navy context panel pattern
// used across the daily/monthly plan pages.
// ============================================================
const SummaryTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-[#FDC94D]">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">{label}</p>
      <p className="truncate text-[12.5px] font-semibold text-white">{value}</p>
    </div>
  </div>
);

// ============================================================
// Stat card — matches the metrics row pattern.
// ============================================================
const StatCard = ({ value, label, tone }) => {
  const toneClass = tone === "warn" ? "text-red-600" : tone === "ok" ? "text-green-600" : "text-[#0F1D24]";
  return (
    <div className="flex-1 border border-[#C6C6C6] bg-white px-4 py-3">
      <p className={`text-xl font-bold leading-none ${toneClass}`}>{value}</p>
      <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
    </div>
  );
};

export default function HourlyMachineTracking() {
  const { hallId } = useParams();
  const hallName = HALL_ID_TO_CODE[hallId] || `Hall ${hallId}`;

  const { data, error, loading, lastUpdated, refresh } = useHourlyProductionHeatmap(hallId);
  useTicker(1000); // re-render every second so "Xs ago" stays fresh

  const [machineSearch, setMachineSearch] = useState("");

  const allMachines = data?.machines ?? [];
  const machines = useMemo(() => {
    const q = machineSearch.trim().toLowerCase();
    if (!q) return allMachines;
    return allMachines.filter((m) =>
      [m.machineCode, m.machineName].filter(Boolean).some((f) => String(f).toLowerCase().includes(q))
    );
  }, [allMachines, machineSearch]);

  const rows = useMemo(() => {
    const first = machines[0]?.hourly ?? [];
    return first.map((slot, idx) => ({
      hour: slot.hour,
      shift: slot.shift,
      isShiftStart: idx === 0 || slot.shift !== (first[idx - 1]?.shift ?? slot.shift),
    }));
  }, [machines]);

  const kpis = useMemo(() => {
    if (allMachines.length === 0) return null;
    const running = allMachines.filter((m) => m.status === "Running").length;
    const withTarget = allMachines.filter((m) => m.summary.target > 0);
    const avgEff =
      withTarget.length > 0
        ? Math.round((withTarget.reduce((s, m) => s + (m.summary.efficiency ?? 0), 0) / withTarget.length) * 10) / 10
        : null;
    const behindTarget = withTarget.filter((m) => (m.summary.efficiency ?? 0) < 100).length;
    return { total: allMachines.length, running, avgEff, behindTarget };
  }, [allMachines]);

  const isInitialLoading = loading && !data;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      <PageTitleStrip
        eyebrow="Hourly Production"
        title={`Heatmap — ${hallName}`}
        subtitle={`${allMachines.length} machines · Shift A (08:00–20:00) · Shift B (20:00–08:00)${
          data?.date ? ` · ${data.date}` : ""
        }`}
        actions={
          <>
            <span
              className={`flex items-center gap-1.5 border px-2.5 text-[11px] font-bold ${
                error
                  ? "border-red-200 bg-red-100 text-red-700"
                  : "border-green-200 bg-green-100 text-green-700"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full ${
                    error ? "bg-red-500" : "animate-ping bg-green-500"
                  } opacity-60`}
                />
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${error ? "bg-red-500" : "bg-green-500"}`} />
              </span>
              {error ? "Reconnecting" : "Live"} · {relativeTime(lastUpdated)}
            </span>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
            >
              <HiOutlineArrowPath className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Error banner — stays visible but doesn't block stale data from showing */}
        {error && (
          <div className="mt-2 flex flex-shrink-0 items-center gap-1.5 border border-red-300 bg-red-50 px-3 py-1.5 text-[11px] text-red-800">
            <HiOutlineExclamationTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Couldn't refresh the heatmap ({error}). Showing last known data
              {lastUpdated ? ` from ${relativeTime(lastUpdated)}` : ""}. Retrying every 5s.
            </span>
          </div>
        )}
        {/* Table */}
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden border border-[#C6C6C6] bg-white">
          {isInitialLoading ? (
            <LoadingSkeleton />
          ) : allMachines.length === 0 ? (
            <EmptyState hallName={hallName} />
          ) : machines.length === 0 ? (
            <EmptyState hallName={hallName} message="No machines match your search." />
          ) : (
            <table className="h-full w-full border-collapse text-[9px]">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-20 min-w-[74px] border border-[#C6C6C6] bg-[#0F1D24] px-1.5 py-1 text-left align-middle font-bold text-white"
                  >
                    Hour
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky left-[74px] z-20 min-w-[34px] border border-[#C6C6C6] bg-[#0F1D24] px-1 py-1 text-center align-middle font-bold text-white"
                  >
                    Sft
                  </th>
                  {machines.map((m) => (
                    <th
                      key={m.machineId}
                      colSpan={2}
                      className="border border-[#C6C6C6] bg-[#0F1D24] px-1 py-1 text-center font-bold leading-none text-[#FDC94D]"
                    >
                      {m.machineName}
                      <div className="flex items-center justify-center gap-1 text-[7px] font-normal leading-none text-white/70">
                        <span
                          className={`h-1 w-1 rounded-full ${
                            m.status === "Running"
                              ? "bg-green-400"
                              : m.status === "Maintenance"
                              ? "bg-[#FDC94D]"
                              : "bg-red-400"
                          }`}
                        />
                        {m.machineCode}
                        {m.summary.efficiency !== null && (
                          <span className={m.summary.efficiency >= 100 ? "text-green-300" : "text-red-300"}>
                            · {m.summary.efficiency}%
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr>
                  {machines.map((m) => (
                    <React.Fragment key={`${m.machineId}-sub`}>
                      <th className="border border-[#C6C6C6] bg-[#0F1D24]/90 px-1 py-0.5 text-center font-semibold text-white">
                        Tgt
                      </th>
                      <th className="border border-[#C6C6C6] bg-[#0F1D24]/90 px-1 py-0.5 text-center font-semibold text-white">
                        Ach.
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <React.Fragment key={row.hour}>
                    {row.isShiftStart && (
                      <tr>
                        <td
                          colSpan={2 + machines.length * 2}
                          className={`sticky left-0 z-10 border border-[#C6C6C6] px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide ${
                            row.shift === "A" ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-[#0F1D24] text-[#FDC94D]"
                          }`}
                        >
                          Shift {row.shift} {row.shift === "A" ? "— 08:00 to 20:00" : "— 20:00 to 08:00"}
                        </td>
                      </tr>
                    )}
                    <tr className={SHIFT_COLORS[row.shift].row}>
                      <td className="sticky left-0 z-10 border border-[#C6C6C6] bg-white px-1.5 py-0.5 font-semibold leading-none text-[#0F1D24]">
                        {formatHourSlot(row.hour)}
                      </td>
                      <td className="sticky left-[74px] z-10 border border-[#C6C6C6] bg-white px-1 py-0.5 text-center">
                        <span className={`px-1 py-0.5 text-[7.5px] font-bold ${SHIFT_COLORS[row.shift].label}`}>
                          {row.shift}
                        </span>
                      </td>
                      {machines.map((m) => {
                        const cell = m.hourly[rowIdx];
                        return (
                          <React.Fragment key={`${m.machineId}-${row.hour}`}>
                            <td className="border border-[#C6C6C6] px-1 py-0.5 text-center font-mono leading-none text-[#0F1D24]">
                              {cell.target ?? ""}
                            </td>
                            <td
                              className={`border border-[#C6C6C6] px-1 py-0.5 text-center font-mono font-semibold leading-none ${cellTone(
                                cell.target,
                                cell.achieved
                              )}`}
                            >
                              {cell.achieved ?? ""}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full flex-col gap-1 p-2">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="h-4 w-full animate-pulse bg-[#0F1D24]/5" />
      ))}
    </div>
  );
}

function EmptyState({ hallName, message }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <p className="text-[11px] font-semibold text-[#0F1D24]">
        {message || `No machines found for ${hallName}`}
      </p>
      {!message && (
        <p className="text-[9px] text-[#9B9B9B]">Check that machines.hall matches the hall code for this route.</p>
      )}
    </div>
  );
}