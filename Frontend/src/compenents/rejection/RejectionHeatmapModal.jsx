import React, { useMemo, useState } from "react";
import { FaTimes, FaThLarge, FaSearch } from "react-icons/fa";

// Navy → red heat scale, matches the app's #0F1D24 / red-600 rejection
// color language instead of a generic slate/red gradient.
const heatColor = (value, max) => {
  if (!value || max === 0) return "#FFFFFF";
  const t = value / max;
  const start = [254, 226, 226]; // light red
  const end = [153, 27, 27]; // deep red
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const RejectionHeatmapModal = ({ data = [], onClose }) => {
  const [search, setSearch] = useState("");

  const { machines, reasons, matrix, max, rowTotals, colTotals, grandTotal } = useMemo(() => {
    const machineSet = [...new Set(data.map((d) => d.machine))].sort();
    const reasonSet = [...new Set(data.map((d) => d.reason))].sort();
    const map = {};
    const rTotals = {};
    const cTotals = {};
    let maxVal = 0;
    let total = 0;

    data.forEach((row) => {
      const key = `${row.machine}__${row.reason}`;
      const qty = Number(row.rejectQty || 0);
      map[key] = (map[key] || 0) + qty;
      rTotals[row.machine] = (rTotals[row.machine] || 0) + qty;
      cTotals[row.reason] = (cTotals[row.reason] || 0) + qty;
      total += qty;
      if (map[key] > maxVal) maxVal = map[key];
    });

    return {
      machines: machineSet,
      reasons: reasonSet,
      matrix: map,
      max: maxVal,
      rowTotals: rTotals,
      colTotals: cTotals,
      grandTotal: total,
    };
  }, [data]);

  const filteredMachines = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return machines;
    return machines.filter((m) => m.toLowerCase().includes(q));
  }, [machines, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1D24]/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden border border-[#C6C6C6] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between bg-[#0F1D24] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center border border-white/15 bg-white/5 text-[#FDC94D]">
              <FaThLarge className="text-[13px]" />
            </div>
            <div>
              <h2 className="text-[12.5px] font-bold text-white">Machine × Reason Rejection Heatmap</h2>
              <p className="text-[9.5px] text-white/50">
                {machines.length} machines · {reasons.length} reasons · {grandTotal} total qty
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <FaTimes size={12} />
          </button>
        </div>

        {/* Search */}
        {machines.length > 0 && (
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#C6C6C6]/60 bg-[#F5F5F5] px-3 py-1.5">
            <FaSearch className="text-[10px] text-[#9B9B9B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search machine…"
              className="h-6 flex-1 bg-transparent text-[11px] text-[#0F1D24] outline-none placeholder:text-[#9B9B9B]"
            />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          {machines.length === 0 || reasons.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-[11px] text-[#9B9B9B]">
              No data available for heatmap
            </div>
          ) : (
            <table className="min-w-full border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-20 min-w-[140px] border border-[#C6C6C6] bg-[#0F1D24] px-2 py-1.5 text-left font-bold text-white">
                    Machine \ Reason
                  </th>
                  {reasons.map((r) => (
                    <th
                      key={r}
                      className="sticky top-0 z-10 min-w-[80px] whitespace-nowrap border border-[#C6C6C6] bg-[#0F1D24] px-2 py-1.5 text-center font-bold text-[#FDC94D]"
                    >
                      {r}
                    </th>
                  ))}
                  <th className="sticky top-0 right-0 z-10 min-w-[70px] border border-[#C6C6C6] bg-[#0F1D24]/90 px-2 py-1.5 text-center font-bold text-white">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((m) => (
                  <tr key={m}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border border-[#C6C6C6] bg-white px-2 py-1 font-semibold text-[#0F1D24]">
                      {m}
                    </td>
                    {reasons.map((r) => {
                      const val = matrix[`${m}__${r}`] || 0;
                      return (
                        <td
                          key={r}
                          className="border border-[#C6C6C6] px-2 py-1 text-center font-mono font-semibold"
                          style={{
                            backgroundColor: heatColor(val, max),
                            color: val / (max || 1) > 0.55 ? "#fff" : "#0F1D24",
                          }}
                        >
                          {val || "-"}
                        </td>
                      );
                    })}
                    <td className="border border-[#C6C6C6] bg-[#F5F5F5] px-2 py-1 text-center font-mono font-bold text-[#0F1D24]">
                      {rowTotals[m] || 0}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="sticky left-0 z-10 border border-[#C6C6C6] bg-[#F5F5F5] px-2 py-1 font-bold text-[#0F1D24]">
                    Total
                  </td>
                  {reasons.map((r) => (
                    <td
                      key={r}
                      className="border border-[#C6C6C6] bg-[#F5F5F5] px-2 py-1 text-center font-mono font-bold text-[#0F1D24]"
                    >
                      {colTotals[r] || 0}
                    </td>
                  ))}
                  <td className="border border-[#C6C6C6] bg-[#0F1D24] px-2 py-1 text-center font-mono font-bold text-[#FDC94D]">
                    {grandTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/60 bg-[#F5F5F5]/70 px-3 py-1.5">
          <span className="text-[9px] text-[#9B9B9B]">Darker cell = higher rejection quantity</span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[#9B9B9B]">Low</span>
            <div
              className="h-2.5 w-20 rounded-sm"
              style={{ background: "linear-gradient(to right, rgb(254,226,226), rgb(153,27,27))" }}
            />
            <span className="text-[9px] text-[#9B9B9B]">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectionHeatmapModal;