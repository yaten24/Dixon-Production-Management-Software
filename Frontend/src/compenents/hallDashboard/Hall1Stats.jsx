import React, { useRef } from "react";
import {
  FaBullseye,
  FaIndustry,
  FaTimesCircle,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaCog,
  FaTachometerAlt,
  FaClock,
} from "react-icons/fa";
import { RefreshCw, FileSpreadsheet, SlidersHorizontal } from "lucide-react";

const Hall1Stats = ({
  hallCode,
  stats,
  loading,
  machines,
  draftFilters,
  setDraftFilters,
  onApply,
  onRefresh,
  onExport,
}) => {
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  const machineOptions = [
    { code: "All Machines", label: "All Machines" },
    ...machines.map((m) => ({
      code: m.machine_code,
      label: m.machine_name
        ? `${m.machine_code} — ${m.machine_name}`
        : m.machine_code,
    })),
  ];

  const shiftOptions = [
    { code: "All", label: "All Shifts" },
    { code: "A", label: "Shift A (8AM–8PM)" },
    { code: "B", label: "Shift B (8PM–8AM)" },
  ];

  const openFromCalendar = () => {
    fromDateRef.current?.showPicker?.();
    fromDateRef.current?.focus();
  };
  const openToCalendar = () => {
    toDateRef.current?.showPicker?.();
    toDateRef.current?.focus();
  };

  const hasOee = stats?.oee != null;
  const oeeValue = hasOee ? stats.oee.oee : null;

  // BUG FIX: null-safe tiering — pehle "no data" case bhi red border le leta tha
  const oeeTier = !hasOee
    ? "none"
    : oeeValue >= 85
      ? "good"
      : oeeValue >= 60
        ? "warn"
        : "bad";
  const oeeStyles = {
    none: { text: "text-slate-400", bg: "bg-slate-100", bar: "bg-slate-300" },
    good: {
      text: "text-emerald-600",
      bg: "bg-emerald-100",
      bar: "bg-emerald-500",
    },
    warn: { text: "text-amber-600", bg: "bg-amber-100", bar: "bg-amber-500" },
    bad: { text: "text-red-600", bg: "bg-red-100", bar: "bg-red-500" },
  }[oeeTier];

  const kpiCards = [
    {
      title: "Target",
      value: stats ? stats.target.toLocaleString() : "-",
      icon: FaBullseye,
      bg: "bg-blue-100",
      text: "text-blue-600",
      bar: "bg-blue-500",
    },
    {
      title: "Actual",
      value: stats ? stats.actual.toLocaleString() : "-",
      icon: FaIndustry,
      bg: "bg-green-100",
      text: "text-green-600",
      bar: "bg-green-500",
    },
    {
      title: "Reject",
      value: stats ? stats.reject.toLocaleString() : "-",
      icon: FaTimesCircle,
      bg: "bg-red-100",
      text: "text-red-600",
      bar: "bg-red-500",
    },
    {
      title: "Achievement",
      value: stats ? stats.achievement : "-",
      icon: FaChartLine,
      bg: "bg-orange-100",
      text: "text-orange-600",
      bar: "bg-orange-500",
    },
    {
      title: "Hall OEE",
      value: oeeValue !== null ? `${oeeValue}%` : "-",
      icon: FaTachometerAlt,
      bg: oeeStyles.bg,
      text: oeeStyles.text,
      bar: oeeStyles.bar,
      subtitle: hasOee
        ? `A ${stats.oee.availability}% · P ${stats.oee.performance}% · Q ${stats.oee.quality}%`
        : "Availability · Performance · Quality",
    },
  ];

  return (
    <div className="space-y-2">
      {/* ============ Filter / Action bar ============ */}
      <div className="rounded border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          {/* Title */}
          <div className="flex shrink-0 items-center gap-2 rounded border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-slate-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded bg-blue-600" />
            <h2 className="whitespace-nowrap text-sm font-bold text-slate-800">
              {hallCode} Dashboard
            </h2>
          </div>

          {/* Filter group */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:flex-nowrap">
            {/* From Date */}
            <div
              onClick={openFromCalendar}
              className="relative min-w-[105px] flex-1 basis-[105px] cursor-pointer rounded border border-slate-300 bg-white px-2 py-1.5 transition-all hover:border-blue-500 hover:shadow-sm md:w-[118px] md:flex-none md:basis-auto"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-100">
                  <FaCalendarAlt className="text-[10px] text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] leading-tight text-slate-500">
                    From
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {draftFilters.from || "Select"}
                  </p>
                </div>
              </div>
              <input
                ref={fromDateRef}
                type="date"
                aria-label="From date"
                value={draftFilters.from}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, from: e.target.value }))
                }
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>

            {/* To Date */}
            <div
              onClick={openToCalendar}
              className="relative min-w-[105px] flex-1 basis-[105px] cursor-pointer rounded border border-slate-300 bg-white px-2 py-1.5 transition-all hover:border-blue-500 hover:shadow-sm md:w-[118px] md:flex-none md:basis-auto"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-100">
                  <FaCalendarAlt className="text-[10px] text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] leading-tight text-slate-500">To</p>
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {draftFilters.to || "Select"}
                  </p>
                </div>
              </div>
              <input
                ref={toDateRef}
                type="date"
                aria-label="To date"
                value={draftFilters.to}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, to: e.target.value }))
                }
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>

            {/* Machine */}
            <div className="relative min-w-[120px] flex-1 basis-[120px] md:w-[150px] md:flex-none md:basis-auto">
              <FaCog className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-600" />
              <select
                aria-label="Filter by machine"
                value={draftFilters.machine}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    machine: e.target.value,
                  }))
                }
                className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white pl-7 pr-6 text-xs font-medium text-slate-700 outline-none transition-all hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {machineOptions.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Shift — FIX: ab consistent icon hai jaise Machine mein */}
            <div className="relative min-w-[110px] flex-1 basis-[110px] md:w-[135px] md:flex-none md:basis-auto">
              <FaClock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-600" />
              <select
                aria-label="Filter by shift"
                value={draftFilters.shift}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    shift: e.target.value,
                  }))
                }
                className="h-9 w-full appearance-none rounded border border-slate-300 bg-white pl-7 pr-6 text-xs font-medium text-slate-700 outline-none transition-all hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {shiftOptions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Apply */}
            <button
              onClick={onApply}
              disabled={loading}
              className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaFilter className="text-[10px]" />
              <span className="hidden md:inline">
                {loading ? "Loading..." : "Apply"}
              </span>
            </button>
          </div>

          {/* Divider — sirf lg+ pe, sirf tab jab row single-line ho */}
          <div className="hidden h-8 w-px shrink-0 bg-slate-200 lg:block" />

          {/* Actions group */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh data"
              aria-label="Refresh data"
              className="flex h-9 items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-blue-500 hover:text-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              onClick={onExport}
              disabled={loading || !stats}
              title="Export to Excel"
              aria-label="Export to Excel"
              className="flex h-9 items-center justify-center gap-1.5 rounded bg-emerald-600 px-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============ KPI Cards ============ */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {kpiCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              title={item.subtitle || undefined}
              className="group relative overflow-hidden rounded border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {item.title}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-bold leading-tight text-slate-800">
                    {item.value}
                  </h2>
                  {item.subtitle && (
                    <p className="mt-0.5 truncate text-[9px] text-slate-400">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`${item.bg} flex h-8 w-8 shrink-0 items-center justify-center rounded`}
                >
                  <Icon className={`${item.text} text-sm`} />
                </div>
              </div>
              {/* BUG FIX: bottom bar ab bg-{color} hai, pehle "border" tha jo hollow/thin
                  dikhta tha kyunki 4px height ke div par 4-side border laga diya tha */}
              <div
                className={`absolute inset-x-0 bottom-0 h-[3px] ${item.bar}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hall1Stats;
