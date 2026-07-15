import React, { useEffect, useRef, useState } from "react";
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
  FaCheck,
  FaChevronDown,
} from "react-icons/fa";
import { RefreshCw, FileSpreadsheet } from "lucide-react";

// ==========================================================
// ThemedDropdown — replaces native <select> with a fully
// styled, brand-themed (navy/gold) dropdown. Closes on outside
// click and on selection. Keeps the same `icon` + label pattern
// used elsewhere in this bar.
// ==========================================================
const ThemedDropdown = ({ icon: Icon, value, options, onChange, ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selected = options.find((o) => o.code === value);

  return (
    <div ref={containerRef} className="relative min-w-[150px] flex-1 basis-[120px] md:w-[240px] md:flex-none md:basis-auto">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-full items-center gap-1.5 rounded border bg-white pl-2 pr-2 text-xs font-medium text-[#0F1D24] outline-none transition-all ${
          open
            ? "border-[#0F1D24] ring-2 ring-[#0F1D24]/10"
            : "border-[#C6C6C6] hover:border-[#0F1D24]"
        }`}
      >
        <Icon className="shrink-0 text-[10px] text-[#0F1D24]" />
        <span className="min-w-0 flex-1 truncate text-left">
          {selected ? selected.label : "Select"}
        </span>
        <FaChevronDown
          className={`shrink-0 text-[9px] text-[#9B9B9B] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-56 w-full min-w-[180px] overflow-y-auto rounded border border-[#C6C6C6]/70 bg-white py-1 shadow-lg">
          {options.map((o) => {
            const isSelected = o.code === value;
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-[#0F1D24]/8 font-semibold text-[#0F1D24]"
                    : "text-[#0F1D24]/80 hover:bg-[#F5F5F5]"
                }`}
              >
                <span className="min-w-0 truncate">{o.label}</span>
                {isSelected && <FaCheck className="shrink-0 text-[9px] text-[#FDC94D]" style={{ filter: "drop-shadow(0 0 0 #0F1D24)" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
    { code: "All Machines", label: "All Machines Selected" },
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

  const oeeTier = !hasOee
    ? "none"
    : oeeValue >= 85
      ? "good"
      : oeeValue >= 60
        ? "warn"
        : "bad";
  const oeeStyles = {
    none: { text: "text-[#9B9B9B]", bg: "bg-[#C6C6C6]/30", bar: "bg-[#C6C6C6]" },
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
      bg: "bg-[#0F1D24]",
      text: "text-[#FDC94D]",
      bar: "bg-[#0F1D24]",
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
      bg: "bg-[#FDC94D]/25",
      text: "text-[#0F1D24]",
      bar: "bg-[#FDC94D]",
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
      {/* Filter / Action bar */}
      <div className="rounded border border-[#C6C6C6]/50 bg-white p-1 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <div className="flex shrink-0 items-center gap-2 rounded border border-[#0F1D24]/15 bg-gradient-to-r from-[#0F1D24]/5 via-white to-[#F5F5F5] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded bg-[#FDC94D]" />
            <h2 className="whitespace-nowrap text-sm font-bold text-[#0F1D24]">
              {hallCode} Dashboard
            </h2>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:flex-nowrap">
            {/* From Date */}
            <div
              onClick={openFromCalendar}
              className="relative min-w-[105px] flex-1 basis-[105px] cursor-pointer rounded border border-[#C6C6C6] bg-white p-1 transition-all hover:border-[#0F1D24] hover:shadow-sm md:w-[118px] md:flex-none md:basis-auto"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0F1D24]/10">
                  <FaCalendarAlt className="text-[10px] text-[#0F1D24]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#0F1D24]">
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
              className="relative min-w-[105px] flex-1 basis-[105px] cursor-pointer rounded border border-[#C6C6C6] bg-white p-1 transition-all hover:border-[#0F1D24] hover:shadow-sm md:w-[118px] md:flex-none md:basis-auto"
            >
              <div className="flex items-center gap-1">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0F1D24]/10">
                  <FaCalendarAlt className="text-[10px] text-[#0F1D24]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#0F1D24]">
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

            {/* Machine — custom themed dropdown */}
            <ThemedDropdown
              icon={FaCog}
              ariaLabel="Filter by machine"
              value={draftFilters.machine}
              options={machineOptions}
              onChange={(code) =>
                setDraftFilters((prev) => ({ ...prev, machine: code }))
              }
            />

            {/* Shift — custom themed dropdown */}
            <ThemedDropdown
              icon={FaClock}
              ariaLabel="Filter by shift"
              value={draftFilters.shift}
              options={shiftOptions}
              onChange={(code) =>
                setDraftFilters((prev) => ({ ...prev, shift: code }))
              }
            />

            {/* Apply */}
            <button
              onClick={onApply}
              disabled={loading}
              className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded bg-[#0F1D24] px-3 text-xs font-semibold text-[#FDC94D] transition-all duration-200 hover:bg-[#0F1D24]/90 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaFilter className="text-[10px]" />
              <span className="hidden md:inline">
                {loading ? "Loading..." : "Apply"}
              </span>
            </button>
          </div>

          <div className="hidden h-8 w-px shrink-0 bg-[#C6C6C6]/60 lg:block" />

          {/* Actions group */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh data"
              aria-label="Refresh data"
              className="flex h-8 items-center justify-center gap-1.5 rounded border border-[#C6C6C6] bg-white p-1 text-xs font-semibold text-[#0F1D24] transition-all duration-200 hover:border-[#0F1D24] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-2 w-2 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              onClick={onExport}
              disabled={loading || !stats}
              title="Export to Excel"
              aria-label="Export to Excel"
              className="flex h-8 items-center justify-center gap-1.5 rounded bg-emerald-600 px-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-5">
        {kpiCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              title={item.subtitle || undefined}
              className="group relative overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
                    {item.title}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-bold leading-tight text-[#0F1D24]">
                    {item.value}
                  </h2>
                  {item.subtitle && (
                    <p className="mt-0.5 truncate text-[9px] text-[#9B9B9B]">
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
              <div
                className={`absolute inset-x-0 bottom-0 h-[4px] ${item.bar}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hall1Stats;