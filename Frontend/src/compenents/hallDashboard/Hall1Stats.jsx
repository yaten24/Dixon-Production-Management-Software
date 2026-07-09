import React, { useRef } from "react";
import {
  FaBullseye,
  FaIndustry,
  FaTimesCircle,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaCog,
} from "react-icons/fa";

const Hall1Stats = ({
  hallCode,
  stats,
  loading,
  machines,
  draftFilters,
  setDraftFilters,
  onApply,
}) => {
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  // FIX: previously only machine_code was shown in the dropdown
  // (e.g. "MC-01"), so the operator had no way to tell which physical
  // machine that code referred to. Now each option displays
  // "CODE — Machine Name" while the underlying <option value> stays
  // machine_code, since that's what the backend filter
  // (hallDashboardModel.getMachineWise / getStats) matches against.
  const machineOptions = [
    { code: "All Machines", label: "All Machines" },
    ...machines.map((m) => ({
      code: m.machine_code,
      label: m.machine_name
        ? `${m.machine_code} — ${m.machine_name}`
        : m.machine_code,
    })),
  ];

  const openFromCalendar = () => {
    fromDateRef.current?.showPicker?.();
    fromDateRef.current?.focus();
  };

  const openToCalendar = () => {
    toDateRef.current?.showPicker?.();
    toDateRef.current?.focus();
  };

  const kpiCards = [
    {
      title: "Target",
      value: stats ? stats.target.toLocaleString() : "-",
      icon: FaBullseye,
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-500",
    },
    {
      title: "Actual",
      value: stats ? stats.actual.toLocaleString() : "-",
      icon: FaIndustry,
      bg: "bg-green-100",
      text: "text-green-600",
      border: "border-green-500",
    },
    {
      title: "Reject",
      value: stats ? stats.reject.toLocaleString() : "-",
      icon: FaTimesCircle,
      bg: "bg-red-100",
      text: "text-red-600",
      border: "border-red-500",
    },
    {
      title: "Achievement",
      value: stats ? stats.achievement : "-",
      icon: FaChartLine,
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-500",
    },
  ];

  return (
    <div className="space-y-2">
      {/* ================= Header ================= */}
      <div className="rounded border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="rounded border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-slate-50 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <h2 className="text-md font-bold text-slate-800">
                    {hallCode} Production Dashboard
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {/* From Date */}
            <div
              onClick={openFromCalendar}
              className="relative cursor-pointer rounded border border-slate-300 bg-white px-2.5 py-1.5 transition-all hover:border-blue-500 hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-100">
                  <FaCalendarAlt className="text-[11px] text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500">From</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {draftFilters.from || "Select"}
                  </p>
                </div>
              </div>
              <input
                ref={fromDateRef}
                type="date"
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
              className="relative cursor-pointer rounded border border-slate-300 bg-white px-2.5 py-1.5 transition-all hover:border-blue-500 hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-100">
                  <FaCalendarAlt className="text-[11px] text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500">To</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {draftFilters.to || "Select"}
                  </p>
                </div>
              </div>
              <input
                ref={toDateRef}
                type="date"
                value={draftFilters.to}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, to: e.target.value }))
                }
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>

            {/* Machine */}
            <div className="relative">
              <FaCog className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-blue-600" />
              <select
                value={draftFilters.machine}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    machine: e.target.value,
                  }))
                }
                className="h-[42px] w-full rounded border border-slate-300 bg-white pl-9 pr-2 text-xs font-medium text-slate-700 outline-none transition-all hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {machineOptions.map((machine) => (
                  <option key={machine.code} value={machine.code}>
                    {machine.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Filter */}
            <button
              onClick={onApply}
              disabled={loading}
              className="flex h-[42px] w-full items-center justify-center gap-2 rounded bg-blue-600 px-3 text-xs font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-md disabled:opacity-60"
            >
              <FaFilter className="text-[11px]" />
              {loading ? "Loading..." : "Apply"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {kpiCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="rounded border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[20px] font-medium text-slate-500">
                    {item.title}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-800 sm:text-xl">
                    {item.value}
                  </h2>
                </div>
                <div
                  className={`${item.bg} flex h-9 w-9 items-center justify-center rounded shrink-0`}
                >
                  <Icon className={`${item.text} text-base`} />
                </div>
              </div>
              <div className={`mt-2 h-1 rounded ${item.border} border`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hall1Stats;
