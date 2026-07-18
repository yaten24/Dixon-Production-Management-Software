import React from "react";
import { Calendar, Filter, RefreshCw, RotateCcw, History, Download, Grid3x3 } from "lucide-react";

const DashboardHeader = ({
  date, setDate, reason, setReason, reasonOptions = ["All"],
  onApply, onRefresh, onReset, onRecent, onExport, onHeatmap,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#C6C6C6] bg-white px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-2 h-8 text-sm">
          <Calendar size={14} className="text-[#9B9B9B]" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-full bg-transparent text-sm outline-none" />
        </div>

        <div className="flex items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-2 h-8 text-sm">
          <Filter size={14} className="text-[#9B9B9B]" />
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-full bg-transparent text-sm outline-none">
            {(reasonOptions || []).map((r) => (
              <option key={r} value={r}>{r === "All" ? "All Reasons" : r}</option>
            ))}
          </select>
        </div>

        <button onClick={onApply} className="flex items-center gap-1.5 rounded-sm bg-[#0F1D24] px-3 h-8 text-sm font-medium text-white">
          <Filter size={14} /> Apply
        </button>
        <button onClick={onRefresh} className="flex items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-3 h-8 text-sm font-medium text-[#0F1D24]">
          <RefreshCw size={14} /> Refresh
        </button>
        <button onClick={onReset} className="flex items-center gap-1.5 rounded-sm border border-red-200 px-3 h-8 text-sm font-medium text-red-500">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onRecent} className="flex items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-3 h-8 text-sm font-medium text-[#0F1D24]">
          <History size={14} /> Recent
        </button>
        <button onClick={onExport} className="flex items-center gap-1.5 rounded-sm border border-[#C6C6C6] px-3 h-8 text-sm font-medium text-[#0F1D24]">
          <Download size={14} /> Export
        </button>
        <button onClick={onHeatmap} className="flex items-center gap-1.5 rounded-sm bg-[#FDC94D] px-3 h-8 text-sm font-medium text-[#0F1D24]">
          <Grid3x3 size={14} /> Heatmap
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;