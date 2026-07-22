import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineArrowPath } from "react-icons/hi2";

// ==========================================================
// Demo data generator — 85 machines × 24 hours (Shift A: 08:00–20:00,
// Shift B: 20:00–08:00 next day). No API calls; everything computed
// once with useMemo so re-renders don't reshuffle the numbers.
// ==========================================================
const SHIFT_A_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SHIFT_B_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
const ORDERED_HOURS = [...SHIFT_A_HOURS, ...SHIFT_B_HOURS];

const TONNAGE_OPTIONS = [1700, 1800, 2200, 2300, 2500, 3000, 3500, 4000];

const formatHourSlot = (hour) => {
  const next = (hour + 1) % 24;
  const to12h = (h) => {
    const period = h < 12 ? "AM" : "PM";
    const display = h % 12 === 0 ? 12 : h % 12;
    return { display, period };
  };
  const start = to12h(hour);
  const end = to12h(next);
  return `${String(start.display).padStart(2, "0")}-${String(end.display).padStart(2, "0")} ${end.period}`;
};

const seededRandom = (seed) => {
  // Simple deterministic PRNG (mulberry32) so the demo data is stable
  // across re-renders instead of regenerating random noise every render.
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const generateDemoMachines = (count = 85, currentHourCutoffIndex = 14) => {
  const rand = seededRandom(42);
  return Array.from({ length: count }, (_, i) => {
    const tonnage = TONNAGE_OPTIONS[Math.floor(rand() * TONNAGE_OPTIONS.length)];
    const machineCode = `M-${String(i + 1).padStart(3, "0")}`;
    const baseTarget = 28 + Math.floor(rand() * 12); // 28-39 per hour

    const hourly = ORDERED_HOURS.map((hour, idx) => {
      const target = baseTarget;
      // Only hours "already elapsed" (idx < cutoff) get an achieved value;
      // future hours stay blank, mirroring a real shift-in-progress sheet.
      if (idx >= currentHourCutoffIndex) {
        return { hour, target, achieved: null };
      }
      // ~70% chance of hitting/exceeding target, rest under-achieve —
      // occasionally a full miss (breakdown-style zero) for realism.
      const roll = rand();
      let achieved;
      if (roll < 0.08) achieved = 0;
      else if (roll < 0.7) achieved = target + Math.floor(rand() * 4) - 1;
      else achieved = Math.max(0, target - Math.floor(rand() * 12) - 1);
      return { hour, target, achieved };
    });

    return {
      machineId: i + 1,
      machineCode,
      label: `${tonnage} T`,
      hourly,
    };
  });
};

const cellTone = (target, achieved) => {
  if (achieved === null || achieved === undefined) return "bg-white text-[#0F1D24]";
  return achieved >= target ? "bg-green-200/70 text-green-900" : "bg-red-200/70 text-red-900";
};

const SHIFT_COLORS = {
  A: { row: "bg-[#FDC94D]/10", label: "bg-[#FDC94D] text-[#0F1D24]" },
  B: { row: "bg-[#0F1D24]/[0.04]", label: "bg-[#0F1D24] text-[#FDC94D]" },
};

export default function HourlyMachineTrackingDemo() {
  const navigate = useNavigate();
  const [seedTick, setSeedTick] = useState(0);

  // currentHourCutoffIndex simulates "how far into the day we are" —
  // regenerating bumps it slightly so Refresh visibly changes something.
  const machines = useMemo(
    () => generateDemoMachines(85, 14 + (seedTick % 3)),
    [seedTick],
  );

  const rows = useMemo(
    () => ORDERED_HOURS.map((hour, idx) => ({
      hour,
      shift: SHIFT_A_HOURS.includes(hour) ? "A" : "B",
      isShiftStart: idx === 0 || (idx === SHIFT_A_HOURS.length),
    })),
    [],
  );

  const handleRefresh = () => setSeedTick((t) => t + 1);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#C6C6C6]/70 bg-white px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
          >
            <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-[13px] font-bold leading-tight text-[#0F1D24]">
              Hourly Target vs Achievement — All Machines (Demo)
            </h1>
            <p className="text-[10px] text-[#9B9B9B]">
              85 machines · 24 hours · Shift A (08:00–20:00) · Shift B (20:00–08:00)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-[#FDC94D]/60 bg-[#FDC94D]/10 px-2 py-0.5">
            <span className="h-2 w-2 rounded-sm bg-[#FDC94D]" />
            <span className="text-[10px] font-semibold text-[#0F1D24]">Shift A</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#0F1D24]/20 bg-[#0F1D24]/5 px-2 py-0.5">
            <span className="h-2 w-2 rounded-sm bg-[#0F1D24]" />
            <span className="text-[10px] font-semibold text-[#0F1D24]">Shift B</span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-sm border border-[#C6C6C6]/70 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
          >
            <HiOutlineArrowPath className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table — horizontally scrollable, sticky Hour + Shift columns */}
      <div className="max-h-[90vh] overflow-auto rounded-sm border border-[#C6C6C6] bg-white">
        <table className="w-full border-collapse text-[10.5px]">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="sticky left-0 top-0 z-30 min-w-[90px] border border-[#C6C6C6] bg-[#0F1D24] px-2 py-2 text-left align-middle font-bold text-white"
              >
                Hour
              </th>
              <th
                rowSpan={2}
                className="sticky left-[90px] top-0 z-30 min-w-[46px] border border-[#C6C6C6] bg-[#0F1D24] px-1 py-2 text-center align-middle font-bold text-white"
              >
                Sft
              </th>
              {machines.map((m) => (
                <th
                  key={m.machineId}
                  colSpan={2}
                  className="sticky top-0 z-20 border border-[#C6C6C6] bg-[#0F1D24] px-1.5 py-1.5 text-center font-bold text-[#FDC94D]"
                >
                  {m.label}
                  <div className="text-[8.5px] font-normal text-white/70">{m.machineCode}</div>
                </th>
              ))}
            </tr>
            <tr>
              {machines.map((m) => (
                <React.Fragment key={`${m.machineId}-sub`}>
                  <th className="sticky top-[42px] z-20 border border-[#C6C6C6] bg-[#0F1D24]/90 px-1.5 py-1 text-center font-semibold text-white">
                    Tgt
                  </th>
                  <th className="sticky top-[42px] z-20 border border-[#C6C6C6] bg-[#0F1D24]/90 px-1.5 py-1 text-center font-semibold text-white">
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
                      className={`sticky left-0 z-10 border border-[#C6C6C6] px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        row.shift === "A" ? "bg-[#FDC94D] text-[#0F1D24]" : "bg-[#0F1D24] text-[#FDC94D]"
                      }`}
                    >
                      Shift {row.shift} {row.shift === "A" ? "— 08:00 to 20:00" : "— 20:00 to 08:00"}
                    </td>
                  </tr>
                )}
                <tr className={SHIFT_COLORS[row.shift].row}>
                  <td className="sticky left-0 z-10 border border-[#C6C6C6] bg-white px-2 py-1.5 font-semibold text-[#0F1D24]">
                    {formatHourSlot(row.hour)}
                  </td>
                  <td className="sticky left-[90px] z-10 border border-[#C6C6C6] px-1 py-1.5 text-center">
                    <span className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-bold ${SHIFT_COLORS[row.shift].label}`}>
                      {row.shift}
                    </span>
                  </td>
                  {machines.map((m) => {
                    const cell = m.hourly[rowIdx];
                    return (
                      <React.Fragment key={`${m.machineId}-${row.hour}`}>
                        <td className="border border-[#C6C6C6] px-1.5 py-1.5 text-center font-mono text-[#0F1D24]">
                          {cell.target}
                        </td>
                        <td className={`border border-[#C6C6C6] px-1.5 py-1.5 text-center font-mono font-semibold ${cellTone(cell.target, cell.achieved)}`}>
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
      </div>
    </div>
  );
}