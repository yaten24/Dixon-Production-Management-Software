import React from "react";
import { FaDownload, FaChartLine } from "react-icons/fa";

const DashboardFilters = ({ date, setDate, onExport }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 bg-white p-1 shadow-sm">
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

      <div className="flex flex-wrap items-end gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-7 rounded border border-gray-300 px-2 text-[11px] outline-none focus:border-blue-500"
        />

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