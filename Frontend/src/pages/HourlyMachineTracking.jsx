import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineArrowPath, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useHourlyProductionHeatmap } from "../hooks/useHourlyProductionHeatmap";
import { HALL_ID_TO_CODE } from "../config/hallMapping";

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

export default function HourlyMachineTracking() {
  const navigate = useNavigate();
  const { hallId } = useParams();
  const hallName = HALL_ID_TO_CODE[hallId] || `Hall ${hallId}`;

  const { data, error, loading, lastUpdated, refresh } = useHourlyProductionHeatmap(hallId);
  useTicker(1000); // re-render every second so "Xs ago" stays fresh

  const machines = data?.machines ?? [];
  const rows = useMemo(() => {
    const first = machines[0]?.hourly ?? [];
    return first.map((slot, idx) => ({
      hour: slot.hour,
      shift: slot.shift,
      isShiftStart: idx === 0 || slot.shift !== (first[idx - 1]?.shift ?? slot.shift),
    }));
  }, [machines]);

  const kpis = useMemo(() => {
    if (machines.length === 0) return null;
    const running = machines.filter((m) => m.status === "Running").length;
    const withTarget = machines.filter((m) => m.summary.target > 0);
    const avgEff =
      withTarget.length > 0
        ? Math.round((withTarget.reduce((s, m) => s + (m.summary.efficiency ?? 0), 0) / withTarget.length) * 10) / 10
        : null;
    const behindTarget = withTarget.filter((m) => (m.summary.efficiency ?? 0) < 100).length;
    return { total: machines.length, running, avgEff, behindTarget };
  }, [machines]);

  const isInitialLoading = loading && !data;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F7F7F5]">
      {/* Header */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 rounded-sm border border-[#C6C6C6]/70 bg-white px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
          >
            <HiOutlineArrowLeft className="h-3 w-3" />
          </button>
          <div>
            <h1 className="text-[12px] font-bold leading-tight text-[#0F1D24]">
              Hourly Target vs Achievement — {hallName}
            </h1>
            <p className="text-[9px] text-[#9B9B9B]">
              {machines.length} machines · 24 hours · Shift A (08:00–20:00) · Shift B (20:00–08:00)
              {data?.date ? ` · ${data.date}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {kpis && (
            <div className="hidden items-center gap-1.5 lg:flex">
              <KpiChip label="Running" value={`${kpis.running}/${kpis.total}`} />
              <KpiChip
                label="Avg Efficiency"
                value={kpis.avgEff === null ? "—" : `${kpis.avgEff}%`}
                tone={kpis.avgEff !== null && kpis.avgEff < 100 ? "warn" : "ok"}
              />
              <KpiChip
                label="Below Target"
                value={kpis.behindTarget}
                tone={kpis.behindTarget > 0 ? "warn" : "ok"}
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded border border-[#FDC94D]/60 bg-[#FDC94D]/10 px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-sm bg-[#FDC94D]" />
            <span className="text-[9px] font-semibold text-[#0F1D24]">Shift A</span>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-sm bg-[#0F1D24]" />
            <span className="text-[9px] font-semibold text-[#0F1D24]">Shift B</span>
          </div>

          <div className="flex items-center gap-1.5 rounded border border-[#C6C6C6]/70 bg-white px-1.5 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  error ? "bg-red-500" : "animate-ping bg-green-500"
                } opacity-60`}
              />
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${error ? "bg-red-500" : "bg-green-500"}`} />
            </span>
            <span className="text-[9px] font-semibold text-[#0F1D24]">
              {error ? "Reconnecting" : "Live"} · {relativeTime(lastUpdated)}
            </span>
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-1 rounded border border-[#C6C6C6]/70 bg-white px-2 py-1 text-[10px] font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
          >
            <HiOutlineArrowPath className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner — stays visible but doesn't block stale data from showing */}
      {error && (
        <div className="mt-1.5 flex flex-shrink-0 items-center gap-1.5 rounded-sm border border-red-300 bg-red-50 px-2 py-1 text-[10px] text-red-800">
          <HiOutlineExclamationTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Couldn't refresh the heatmap ({error}). Showing last known data
            {lastUpdated ? ` from ${relativeTime(lastUpdated)}` : ""}. Retrying every 5s.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="mt-1.5 min-h-0 flex-1 overflow-x-auto overflow-y-hidden rounded-sm border border-[#C6C6C6] bg-white">
        {isInitialLoading ? (
          <LoadingSkeleton />
        ) : machines.length === 0 ? (
          <EmptyState hallName={hallName} />
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
                      <span className={`rounded-full px-1 py-0.5 text-[7.5px] font-bold ${SHIFT_COLORS[row.shift].label}`}>
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
  );
}

function KpiChip({ label, value, tone }) {
  const toneClass =
    tone === "warn"
      ? "border-red-300 bg-red-50 text-red-800"
      : tone === "ok"
      ? "border-green-300 bg-green-50 text-green-800"
      : "border-[#C6C6C6]/70 bg-white text-[#0F1D24]";
  return (
    <div className={`flex items-center gap-1 rounded border px-1.5 py-0.5 ${toneClass}`}>
      <span className="text-[8px] font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-[10px] font-bold">{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full flex-col gap-1 p-2">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="h-4 w-full animate-pulse rounded bg-[#0F1D24]/5" />
      ))}
    </div>
  );
}

function EmptyState({ hallName }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <p className="text-[11px] font-semibold text-[#0F1D24]">No machines found for {hallName}</p>
      <p className="text-[9px] text-[#9B9B9B]">Check that machines.hall matches the hall code for this route.</p>
    </div>
  );
}