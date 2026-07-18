import React, { useEffect, useState, useCallback } from "react";
import { Grid3x3, X } from "lucide-react";
import { getMouldChangeHeatmap } from "../../api/mouldChangeDashboardApi";

const cellColor = (count, max) => {
  if (count === 0) return "#F3F4F6";
  const ratio = max > 0 ? count / max : 0;
  // interpolate from light gold to dark ink
  const stops = [
    { r: 253, g: 234, b: 186 }, // light gold
    { r: 253, g: 201, b: 77 }, // #FDC94D
    { r: 15, g: 29, b: 36 }, // #0F1D24
  ];
  const t = Math.min(Math.max(ratio, 0), 1) * (stops.length - 1);
  const i = Math.floor(t);
  const frac = t - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const r = Math.round(a.r + (b.r - a.r) * frac);
  const g = Math.round(a.g + (b.g - a.g) * frac);
  const bl = Math.round(a.b + (b.b - a.b) * frac);
  return `rgb(${r}, ${g}, ${bl})`;
};

const textColor = (count, max) => {
  const ratio = max > 0 ? count / max : 0;
  return ratio > 0.55 ? "#FFFFFF" : "#0F1D24";
};

const MouldChangeHeatmap = ({ isOpen, onClose, date, hall, reason }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);

  const fetchHeatmap = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMouldChangeHeatmap({
        date,
        hall: hall && hall !== "All" ? hall : undefined,
        reason: reason && reason !== "All" ? reason : undefined,
      });
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load heatmap");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [date, hall, reason]);

  useEffect(() => {
    if (isOpen) fetchHeatmap();
  }, [isOpen, fetchHeatmap]);

  if (!isOpen) return null;

  const grid = data?.grid || [];
  const hours = data?.hours || [];
  const max = data?.max || 0;
  const hasData = max > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6]/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded shadow-sm bg-[#0F1D24]">
            <Grid3x3 className="h-3.5 w-3.5 text-[#FDC94D]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F1D24]">Mould Change Heatmap</h2>
            <p className="text-[10px] text-[#9B9B9B]">
              Hall × Hour activity {date ? `for ${date}` : ""}
              {hall && hall !== "All" ? ` · ${hall}` : ""}
              {reason && reason !== "All" ? ` · ${reason}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded text-[#9B9B9B] transition hover:bg-[#0F1D24]/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading && (
        <div className="flex-shrink-0 px-5 py-1.5 text-[11px] text-[#9B9B9B]">Loading heatmap…</div>
      )}
      {error && (
        <div className="flex-shrink-0 border-b border-red-100 bg-red-50 px-5 py-1.5 text-[11px] text-red-600">
          {error}
        </div>
      )}
      {!loading && !error && !hasData && (
        <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-5 py-1.5 text-[11px] font-medium text-amber-700">
          No mould changes recorded for this date — showing 0 for every hall and hour.
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
        {grid.length > 0 && (
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-2 py-1 text-left text-[10px] font-semibold text-[#9B9B9B]">
                  Hall
                </th>
                {hours.map((h) => (
                  <th key={h} className="px-1 py-1 text-center text-[9px] font-semibold text-[#9B9B9B]">
                    {String(h).padStart(2, "0")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => (
                <tr key={row.hall}>
                  <td className="sticky left-0 z-10 bg-white px-2 py-1 text-xs font-medium text-[#0F1D24]">
                    {row.hall}
                  </td>
                  {row.cells.map((cell) => (
                    <td key={`${row.hall}-${cell.hour}`} className="p-0.5">
                      <div
                        onMouseEnter={() => setHoverCell({ hall: row.hall, ...cell })}
                        onMouseLeave={() => setHoverCell(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-sm text-[10px] font-semibold transition"
                        style={{
                          background: cellColor(cell.count, max),
                          color: textColor(cell.count, max),
                        }}
                        title={`${row.hall} · ${cell.label}:00 · ${cell.count} change${cell.count === 1 ? "" : "s"}`}
                      >
                        {cell.count > 0 ? cell.count : ""}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/40 bg-[#0F1D24]/[0.02] px-5 py-2 text-[10px] text-[#9B9B9B]">
        <span>{hoverCell ? `${hoverCell.hall} · ${hoverCell.label}:00 — ${hoverCell.count} change${hoverCell.count === 1 ? "" : "s"}` : "Hover a cell for details"}</span>
        <span className="flex items-center gap-1.5">
          <span>Low</span>
          <span className="h-2.5 w-6 rounded-sm" style={{ background: cellColor(1, 4) }} />
          <span className="h-2.5 w-6 rounded-sm" style={{ background: cellColor(3, 4) }} />
          <span className="h-2.5 w-6 rounded-sm" style={{ background: cellColor(4, 4) }} />
          <span>High</span>
        </span>
      </div>
    </div>
  );
};

export default MouldChangeHeatmap;