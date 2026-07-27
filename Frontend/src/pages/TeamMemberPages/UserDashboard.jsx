// UserDashboard.jsx — Production Dashboard, single file, advanced desktop UI.
// Header/TopBar is no longer a separate bar — its content (title, date
// picker, refresh, export) now lives inside one bordered "control box"
// row, styled consistently with the summary cards next to it. Overall
// Production chart always renders its full hour-axis/shift-shading even
// when there's no data yet — bars just sit at 0 instead of the chart
// going blank.
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineChevronRight,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import { HiOutlineOfficeBuilding, HiOutlineTrendingUp } from "react-icons/hi";

import { halls, HALL_ACCENT } from "../../data/productionData";
import { HALL_CODE_TO_ID } from "../../data/dashboardData";
import useProductionDashboard from "../../hooks/useProductionDashboard";
import Sidebar from "./Sidebar";

// ============================================================
// THEME TOKENS
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const SHIFT_A_BG = "#FFF9EA";
const SHIFT_B_BG = "#F4F4F5";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";
const DEFAULT_ACCENT = "#2563EB";

const SHIFT_A_START = 8; // 08:00
const HOURS_24 = Array.from({ length: 24 }, (_, i) => (SHIFT_A_START + i) % 24);

const getToday = () => new Date().toISOString().split("T")[0];

const fmt = (n) => (n ?? 0).toLocaleString("en-IN");

const formatDisplayDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const hourLabel = (h) => `${String(h).padStart(2, "0")}:00`;

// hour -> is it inside Shift A (08:00–19:59) or Shift B
const isShiftA = (h) => h >= 8 && h < 20;

// Always returns a full 24-slot series (08:00 -> 07:00 next day), filling
// in { target: 0, actual: 0 } for any hour missing from the backend data —
// so the chart's axis/shift-bands/labels are always fully drawn.
const buildFullDaySeries = (data = []) => {
  const byHour = {};
  data.forEach((p) => {
    const h = parseInt(String(p.hour).split(":")[0], 10);
    byHour[h] = p;
  });
  return HOURS_24.map((h) => ({
    hour: hourLabel(h),
    target: byHour[h]?.target ?? 0,
    actual: byHour[h]?.actual ?? 0,
  }));
};

// ============================================================
// SUMMARY CARD — animated efficiency bar, hover elevate
// ============================================================
function SummaryCard({ title, icon: Icon, accent = DEFAULT_ACCENT, actual, target, rejection, onClick, isOverall }) {
  const efficiency = target > 0 ? Math.round((actual / target) * 1000) / 10 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-[168px] flex-1 flex-col border border-[#C6C6C6] bg-white p-2 text-left transition-all duration-150 hover:-translate-y-[2px] hover:shadow-[0_8px_18px_rgba(15,29,36,0.10)]"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-extrabold leading-tight text-[#0F1D24]">{title}</h3>
          <p className="truncate text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
            {isOverall ? "All Halls Combined" : "Production Summary"}
          </p>
        </div>
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#C6C6C6] transition-colors duration-150 group-hover:border-transparent"
          style={{ color: accent }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mb-1.5 flex items-end justify-between gap-2">
        <div className="leading-none">
          <p className="text-[8px] font-bold uppercase tracking-wide text-[#9B9B9B]">Actual Production</p>
          <p className="mt-0.5 font-mono text-[24px] font-extrabold leading-none text-[#0F1D24]">{fmt(actual)}</p>
        </div>
      </div>

      <div className="mb-1.5 flex items-center gap-3 border-t border-[#F0F0F0] pt-1.5">
        <div className="leading-none">
          <p className="text-[7.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Target</p>
          <p className="mt-0.5 font-mono text-[12px] font-bold text-[#0F1D24]">{fmt(target)}</p>
        </div>
        <div className="leading-none">
          <p className="text-[7.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Rejection</p>
          <p className="mt-0.5 font-mono text-[12px] font-bold text-red-600">{fmt(rejection)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#0F1D24]/80">Efficiency</span>
        <span className="font-mono text-[13px] font-extrabold" style={{ color: efficiency >= 90 ? SUCCESS : efficiency >= 60 ? "#D97706" : DANGER }}>
          {efficiency}%
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden border border-[#C6C6C6] bg-[#F0F0F0]">
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{
            width: `${Math.min(Math.max(efficiency, 0), 100)}%`,
            background: efficiency >= 90 ? SUCCESS : efficiency >= 60 ? "#F59E0B" : DANGER,
          }}
        />
      </div>
    </button>
  );
}

// ============================================================
// CONTROL BOX — title + date picker + refresh + export, all
// merged into ONE bordered row that sits above the summary cards
// (replaces the standalone TopBar header).
// ============================================================
function ControlBox({
  draftDate,
  setDraftDate,
  viewingDate,
  onApply,
  onReset,
  onRefresh,
  onExport,
  loading,
  dirty,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="mx-3 mt-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0 leading-tight">
          <p className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#9B9B9B]">
            Production Dashboard
            <HiOutlineChevronRight className="h-2.5 w-2.5" />
          </p>
          <h1 className="truncate text-[15px] font-extrabold tracking-tight text-[#0F1D24]">
            Daily Production Overview
          </h1>
        </div>

        <div className="hidden h-8 w-px flex-shrink-0 bg-[#C6C6C6] sm:block" />

        {/* date picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className={`flex h-8 items-center gap-1.5 border px-2.5 text-[11px] font-bold transition-colors duration-100 ${
              dirty
                ? "border-[#FDC94D] bg-[#FDC94D]/15 text-[#0F1D24]"
                : "border-[#C6C6C6] bg-white text-[#0F1D24] hover:border-[#0F1D24]"
            }`}
          >
            <HiOutlineCalendarDays className="h-3.5 w-3.5 text-[#0F1D24]/70" />
            {formatDisplayDate(draftDate)}
          </button>
          {pickerOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 flex flex-col gap-1.5 border border-[#C6C6C6] bg-white p-2 shadow-[0_8px_20px_rgba(15,29,36,0.14)]">
              <input
                type="date"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
                className="border border-[#C6C6C6] px-2 py-1 text-[11px] font-semibold text-[#0F1D24] outline-none focus:border-[#0F1D24]"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => { onApply(); setPickerOpen(false); }}
                  className="flex flex-1 items-center justify-center gap-1 bg-[#0F1D24] px-2 py-1 text-[10.5px] font-bold text-[#FDC94D] hover:bg-[#0F1D24]/90"
                >
                  <HiOutlineCheck className="h-3 w-3" /> Apply
                </button>
                <button
                  type="button"
                  onClick={() => { onReset(); setPickerOpen(false); }}
                  className="flex items-center justify-center gap-1 border border-[#C6C6C6] px-2 py-1 text-[10.5px] font-bold text-[#0F1D24] hover:border-[#0F1D24]"
                >
                  <HiOutlineXMark className="h-3 w-3" /> Today
                </button>
              </div>
            </div>
          )}
        </div>

        {dirty && (
          <button
            onClick={onApply}
            className="flex h-8 flex-shrink-0 items-center gap-1 border border-[#0F1D24] bg-[#0F1D24] px-2.5 text-[10.5px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
          >
            <HiOutlineCheck className="h-3 w-3" />
            Apply
          </button>
        )}

        <span className="hidden text-[10.5px] font-semibold text-[#9B9B9B] md:inline">
          Viewing <span className="font-bold text-[#0F1D24]">{formatDisplayDate(viewingDate)}</span>
        </span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
          className="flex h-8 w-8 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-50"
        >
          <HiOutlineArrowPath className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>

        <button
          type="button"
          onClick={onExport}
          className="flex h-8 items-center gap-1.5 border border-[#0F1D24] bg-[#0F1D24] px-3 text-[11px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-[#0F1D24]/90"
        >
          <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
          Export Excel
        </button>
      </div>
    </div>
  );
}

function SummaryCardsRow({ overall, hallSummary, halls, hallAccent, onSelectHall }) {
  return (
    <div className="flex flex-shrink-0 gap-1.5 overflow-x-auto px-3 pb-1 pt-2">
      <SummaryCard
        title="Overall Production"
        icon={HiOutlineTrendingUp}
        accent={GOLD}
        actual={overall?.actual}
        target={overall?.target}
        rejection={overall?.rejection}
        isOverall
        onClick={() => onSelectHall("All")}
      />
      {halls.map((hall) => {
        const s = hallSummary?.[hall] || {};
        return (
          <SummaryCard
            key={hall}
            title={hall}
            icon={HiOutlineOfficeBuilding}
            accent={hallAccent?.[hall] || DEFAULT_ACCENT}
            actual={s.actual}
            target={s.target}
            rejection={s.rejection}
            onClick={() => onSelectHall(hall)}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// OVERALL PRODUCTION CHART — target/actual bars, shift shading,
// hover detail readout, togglable series. Always draws the full
// 24h axis + shift bands + shift legend/labels, even at zero data,
// so the desktop-style scaffolding never disappears.
// ============================================================
function OverallProductionChart({ data = [], onViewHall, loading }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [showTarget, setShowTarget] = useState(true);
  const [showActual, setShowActual] = useState(true);

  const series = useMemo(() => buildFullDaySeries(data), [data]);
  const hasAnyValue = series.some((p) => p.target > 0 || p.actual > 0);

  const width = 1200, height = 380, pad = { top: 16, right: 16, bottom: 30, left: 46 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const maxVal = Math.max(...series.map((p) => Math.max(p.target || 0, p.actual || 0)), 1);
  const niceMax = Math.ceil(maxVal / 400) * 400 || 400;
  const yFor = (v) => pad.top + chartH - (v / niceMax) * chartH;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMax * f);

  const n = series.length;
  const slot = chartW / n;
  const barGroupW = slot * 0.62;
  const barW = barGroupW / 2 - 1.5;

  const hovered = hoverIdx !== null ? series[hoverIdx] : null;
  const hoveredEff = hovered && hovered.target > 0 ? Math.round((hovered.actual / hovered.target) * 1000) / 10 : 0;

  // shift A/B segment spans, for the header bands under the legend
  const shiftSegments = [];
  HOURS_24.forEach((h, i) => {
    const shift = isShiftA(h) ? "A" : "B";
    const last = shiftSegments[shiftSegments.length - 1];
    if (last && last.shift === shift) last.count += 1;
    else shiftSegments.push({ shift, startIdx: i, count: 1 });
  });

  return (
    <div className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#C6C6C6] px-3 py-2">
        <div>
          <h2 className="text-[13px] font-extrabold text-[#0F1D24]">Overall Production — All Halls</h2>
          <p className="text-[10px] font-medium text-[#9B9B9B]">Combined hourly target vs actual · Day starts 08:00 (Shift A)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 border border-[#E7C765] bg-[#FFF3CC]" />
            <span className="text-[9.5px] font-bold text-[#9B9B9B]">Shift A · 08:00–20:00</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 border border-[#0F1D24] bg-[#0F1D24]" />
            <span className="text-[9.5px] font-bold text-[#9B9B9B]">Shift B · 20:00–08:00</span>
          </div>
          <button
            onClick={() => setShowTarget((v) => !v)}
            className={`flex items-center gap-1 border px-1.5 py-0.5 text-[9.5px] font-bold transition-colors duration-100 ${
              showTarget ? "border-[#C6C6C6] text-[#0F1D24]" : "border-[#E5E5E5] text-[#C6C6C6]"
            }`}
          >
            <span className="h-1.5 w-1.5 bg-[#9CA3AF]" /> Target
          </button>
          <button
            onClick={() => setShowActual((v) => !v)}
            className={`flex items-center gap-1 border px-1.5 py-0.5 text-[9.5px] font-bold transition-colors duration-100 ${
              showActual ? "border-[#C6C6C6] text-[#0F1D24]" : "border-[#E5E5E5] text-[#C6C6C6]"
            }`}
          >
            <span className="h-1.5 w-1.5 bg-[#0F1D24]" /> Actual
          </button>
        </div>
      </div>

      {/* hover readout strip */}
      <div className="flex h-6 flex-shrink-0 items-center gap-4 border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 text-[10.5px] font-semibold">
        {hovered ? (
          <>
            <span className="font-mono font-extrabold text-[#0F1D24]">{hovered.hour}</span>
            <span className="text-[#9B9B9B]">Target <b className="font-mono text-[#0F1D24]">{fmt(hovered.target)}</b></span>
            <span className="text-[#9B9B9B]">Actual <b className="font-mono text-[#0F1D24]">{fmt(hovered.actual)}</b></span>
            <span className="text-[#9B9B9B]">
              Efficiency{" "}
              <b className="font-mono" style={{ color: hoveredEff >= 90 ? SUCCESS : hoveredEff >= 60 ? "#D97706" : DANGER }}>
                {hoveredEff}%
              </b>
            </span>
          </>
        ) : !hasAnyValue ? (
          <span className="font-semibold text-amber-700">No production entries logged yet for this date — showing 0 across all 24 hours.</span>
        ) : (
          <span className="text-[#B0B0B0]">Hover a bar to inspect the hour</span>
        )}
      </div>

      <div className="min-h-0 flex-1 p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[11px] text-[#9B9B9B]">Loading chart...</div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
            {/* shift background bands — always drawn, data or not */}
            {series.map((p, i) => (
              <rect
                key={`bg-${i}`}
                x={pad.left + i * slot}
                y={pad.top}
                width={slot}
                height={chartH}
                fill={isShiftA(HOURS_24[i]) ? SHIFT_A_BG : SHIFT_B_BG}
              />
            ))}

            {/* gridlines + y-axis labels — always drawn */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line x1={pad.left} x2={width - pad.right} y1={yFor(tick)} y2={yFor(tick)} stroke="#E5E5E5" strokeWidth={1} />
                <text x={pad.left - 8} y={yFor(tick) + 3} textAnchor="end" fontSize="9.5" fill="#9B9B9B" fontFamily="ui-monospace, monospace">
                  {Math.round(tick).toLocaleString()}
                </text>
              </g>
            ))}

            {/* shift segment header pills, above the chart area */}
            {shiftSegments.map((seg, i) => {
              const segX = pad.left + seg.startIdx * slot;
              const segW = seg.count * slot;
              const cx = segX + segW / 2;
              const pillW = Math.min(segW * 0.7, 64);
              return (
                <g key={`seg-${i}`}>
                  <rect
                    x={cx - pillW / 2}
                    y={pad.top + 4}
                    width={pillW}
                    height={14}
                    fill={seg.shift === "A" ? GOLD : NAVY}
                  />
                  <text
                    x={cx}
                    y={pad.top + 14}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="800"
                    fill={seg.shift === "A" ? NAVY : GOLD}
                  >
                    Shift {seg.shift}
                  </text>
                </g>
              );
            })}

            {/* bars — sit at 0-height when there's no data, axis stays visible */}
            {series.map((p, i) => {
              const gx = pad.left + i * slot + (slot - barGroupW) / 2;
              const isHover = hoverIdx === i;
              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect x={pad.left + i * slot} y={pad.top} width={slot} height={chartH} fill="transparent" />
                  {showTarget && (
                    <rect
                      x={gx}
                      y={yFor(p.target || 0)}
                      width={barW}
                      height={Math.max(chartH - (yFor(p.target || 0) - pad.top), 0)}
                      fill={isHover ? "#94A3B8" : "#C7CDD6"}
                    />
                  )}
                  {showActual && (
                    <rect
                      x={gx + barW + 3}
                      y={yFor(p.actual || 0)}
                      width={barW}
                      height={Math.max(chartH - (yFor(p.actual || 0) - pad.top), 0)}
                      fill={isHover ? GOLD : NAVY}
                    />
                  )}
                  {isHover && (
                    <line x1={pad.left + i * slot + slot / 2} x2={pad.left + i * slot + slot / 2} y1={pad.top} y2={pad.top + chartH} stroke="#0F1D24" strokeOpacity="0.15" strokeWidth={1} />
                  )}
                </g>
              );
            })}

            {/* shift divider (Shift A -> Shift B boundary, always at slot 12) */}
            <line x1={pad.left + 12 * slot} x2={pad.left + 12 * slot} y1={pad.top} y2={pad.top + chartH} stroke="#0F1D24" strokeWidth={1.5} />

            {/* x labels — always drawn */}
            {series.map((p, i) => (
              <text
                key={`lbl-${i}`}
                x={pad.left + i * slot + slot / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                fontWeight={hoverIdx === i ? 800 : 500}
                fill={hoverIdx === i ? NAVY : "#9B9B9B"}
              >
                {p.hour}
              </text>
            ))}
          </svg>
        )}
      </div>

      <div className="flex flex-shrink-0 justify-end border-t border-[#C6C6C6] px-3 py-1.5">
        <button
          onClick={() => onViewHall("All")}
          className="flex items-center gap-1 text-[10.5px] font-bold text-blue-700 hover:underline"
        >
          Open full dashboard <HiOutlineChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// HALL CHARTS GRID — small multiples, one mini chart per hall
// ============================================================
function MiniHallChart({ hall, points = [], accent = DEFAULT_ACCENT, onViewHall }) {
  const series = useMemo(() => buildFullDaySeries(points), [points]);
  const width = 300, height = 120, pad = { top: 8, right: 6, bottom: 4, left: 6 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...series.map((p) => Math.max(p.target || 0, p.actual || 0)), 1);

  const xFor = (i) => pad.left + (series.length > 1 ? (chartW * i) / (series.length - 1) : 0);
  const yFor = (v) => pad.top + chartH - (v / maxVal) * chartH;

  const actualPath = series.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.actual || 0)}`).join(" ");
  const areaPath = `${actualPath} L ${xFor(series.length - 1)} ${pad.top + chartH} L ${xFor(0)} ${pad.top + chartH} Z`;

  const totalActual = series.reduce((s, p) => s + (p.actual || 0), 0);
  const totalTarget = series.reduce((s, p) => s + (p.target || 0), 0);
  const eff = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 1000) / 10 : 0;

  return (
    <button
      type="button"
      onClick={() => onViewHall(hall)}
      className="group flex flex-col overflow-hidden border border-[#C6C6C6] bg-white text-left transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(15,29,36,0.10)]"
    >
      <div className="flex items-center justify-between border-b border-[#C6C6C6] px-2 py-1" style={{ borderTop: `2px solid ${accent}` }}>
        <span className="text-[11px] font-extrabold text-[#0F1D24]">{hall}</span>
        <span className="font-mono text-[10.5px] font-bold" style={{ color: eff >= 90 ? SUCCESS : eff >= 60 ? "#D97706" : DANGER }}>
          {eff}%
        </span>
      </div>
      <div className="flex-1 px-1 pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[76px] w-full" preserveAspectRatio="none">
          <path d={areaPath} fill={accent} opacity="0.08" />
          <path d={actualPath} fill="none" stroke={accent} strokeWidth={1.75} />
        </svg>
      </div>
      <div className="flex items-center justify-between border-t border-[#F0F0F0] px-2 py-1 text-[9.5px] font-semibold text-[#9B9B9B]">
        <span>Actual <b className="font-mono text-[#0F1D24]">{fmt(totalActual)}</b></span>
        <span>Target <b className="font-mono text-[#0F1D24]">{fmt(totalTarget)}</b></span>
      </div>
    </button>
  );
}

function HallChartsGrid({ hallHourlyData = {}, hallAccent, onViewHall }) {
  const hallNames = Object.keys(hallHourlyData);
  return (
    <div className="flex h-full flex-col border border-[#C6C6C6] bg-white">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6] px-3 py-1.5">
        <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">Hall-wise Breakdown</h2>
        <span className="flex items-center gap-1 text-[9.5px] font-bold text-[#9B9B9B]">
          <HiOutlineSquares2X2 className="h-3 w-3" /> {hallNames.length} halls
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5 overflow-y-auto p-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {hallNames.map((hall) => (
          <MiniHallChart
            key={hall}
            hall={hall}
            points={hallHourlyData[hall]}
            accent={hallAccent?.[hall] || DEFAULT_ACCENT}
            onViewHall={onViewHall}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================
const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [date, setDate] = useState(getToday());
  const [draftDate, setDraftDate] = useState(getToday());
  const dirty = draftDate !== date;

  const {
    summary,
    hourlyData,
    hallHourlyData = {},
    loading,
    error,
    refetch,
  } = useProductionDashboard(date);

  const hasHallCharts = Object.keys(hallHourlyData).length > 0;

  const handleViewHallData = useCallback(
    (hall) => {
      if (hall === "All") {
        navigate("/production/dashboard");
        return;
      }
      const hallId = HALL_CODE_TO_ID[hall];
      if (!hallId) {
        console.warn(`No route id found for hall "${hall}" — check HALL_CODE_TO_ID / halls list match`);
        return;
      }
      navigate(`/production/halls/${hallId}`);
    },
    [navigate]
  );

  const handleExportExcel = () => console.log("Export Excel", { date });
  const handleApplyFilters = () => setDate(draftDate);
  const handleReset = () => {
    const today = getToday();
    setDraftDate(today);
    setDate(today);
  };
  const handleRefresh = () => {
    if (refetch) refetch();
    else setDate((d) => d);
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#EFEFEF]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activePath={location.pathname}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden pb-1.5">
          <ControlBox
            draftDate={draftDate}
            setDraftDate={setDraftDate}
            viewingDate={date}
            onApply={handleApplyFilters}
            onReset={handleReset}
            onRefresh={handleRefresh}
            onExport={handleExportExcel}
            loading={loading}
            dirty={dirty}
          />

          {error && (
            <div className="mx-3 flex-shrink-0 border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700">
              {error}
            </div>
          )}

          <SummaryCardsRow
            overall={summary?.overall}
            hallSummary={summary?.hallSummary}
            halls={halls}
            hallAccent={HALL_ACCENT}
            onSelectHall={handleViewHallData}
          />

          <div className="flex min-h-0 flex-1 flex-col gap-1.5 px-1.5">
            <div className={`min-h-0 ${hasHallCharts ? "flex-[3]" : "flex-1"}`}>
              <OverallProductionChart data={hourlyData} onViewHall={handleViewHallData} loading={loading} />
            </div>

            {hasHallCharts && (
              <div className="min-h-0 flex-[2] overflow-hidden">
                <HallChartsGrid hallHourlyData={hallHourlyData} hallAccent={HALL_ACCENT} onViewHall={handleViewHallData} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;