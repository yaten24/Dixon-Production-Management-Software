import React, { useMemo } from "react";
import { FaTimes, FaThLarge } from "react-icons/fa";

const heatColor = (value, max) => {
  if (!value || max === 0) return "#f1f5f9";
  const t = value / max;
  const start = [254, 226, 226];
  const end = [153, 27, 27];
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r},${g},${b})`;
};

const RejectionHeatmapModal = ({ data = [], onClose }) => {
  const { machines, reasons, matrix, max } = useMemo(() => {
    const machineSet = [...new Set(data.map((d) => d.machine))];
    const reasonSet = [...new Set(data.map((d) => d.reason))];
    const map = {};
    let maxVal = 0;

    data.forEach((row) => {
      const key = `${row.machine}__${row.reason}`;
      map[key] = (map[key] || 0) + Number(row.rejectQty || 0);
      if (map[key] > maxVal) maxVal = map[key];
    });

    return { machines: machineSet, reasons: reasonSet, matrix: map, max: maxVal };
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <FaThLarge className="text-red-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              Machine × Reason Rejection Heatmap
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">
          {machines.length === 0 || reasons.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">
              No data available for heatmap
            </div>
          ) : (
            <table className="min-w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white p-2 text-left font-semibold text-slate-600">
                    Machine \ Reason
                  </th>
                  {reasons.map((r) => (
                    <th
                      key={r}
                      className="whitespace-nowrap p-2 text-center font-semibold text-slate-600"
                    >
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m}>
                    <td className="sticky left-0 whitespace-nowrap bg-white p-2 font-medium text-slate-700">
                      {m}
                    </td>
                    {reasons.map((r) => {
                      const val = matrix[`${m}__${r}`] || 0;
                      return (
                        <td
                          key={r}
                          className="p-2 text-center font-semibold"
                          style={{
                            backgroundColor: heatColor(val, max),
                            color: val / (max || 1) > 0.55 ? "#fff" : "#334155",
                          }}
                        >
                          {val || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RejectionHeatmapModal;