import React from "react";
import {
  FaIndustry,
  FaDownload,
  FaChevronRight,
  FaChartLine,
} from "react-icons/fa";

const DashboardFilters = ({
  fromDate,
  toDate,
  selectedHall,
  setFromDate,
  setToDate,
  setSelectedHall,
  halls,
  onViewHall,
  onExport,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 bg-white p-1 shadow-sm">
      {/* Left: Page Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 shadow-sm">
          <FaChartLine className="text-[11px] text-white" />
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-wide text-gray-800">
            Production Dashboard
          </h1>
          <p className="text-[9px] text-gray-500">
            Real-time production monitoring and analytics
          </p>
        </div>
      </div>

      {/* Right: Filters + Buttons */}
      <div className="flex flex-wrap items-end gap-2">
        {/* From Date */}
        <div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-7 rounded border border-gray-300 px-2 text-[11px] outline-none focus:border-blue-500"
          />
        </div>

        {/* To Date */}
        <div>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-7 rounded border border-gray-300 px-2 text-[11px] outline-none focus:border-blue-500"
          />
        </div>

        {/* Hall */}
        {/* <div>
          <label className="mb-0.5 block text-[9px] font-medium text-gray-500">
            Hall
          </label>
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="h-7 rounded border border-gray-300 px-2 text-[11px] outline-none focus:border-blue-500"
          >
            {halls.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
        </div> */}

        {/* Buttons */}
        {/* <button
          onClick={onViewHall}
          className="flex h-7 items-center gap-1.5 rounded bg-blue-600 px-2 text-[11px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.97]"
        >
          <FaIndustry className="text-[11px]" />
          View Hall Data
          <FaChevronRight className="text-[9px] opacity-70" />
        </button> */}

        <button
          onClick={onExport}
          className="flex h-7 items-center gap-1.5 rounded bg-green-600 px-2 text-[11px] font-semibold text-white transition hover:bg-green-700 active:scale-[0.97]"
        >
          <FaDownload className="text-[11px]" />
          Export Excel
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;