import React, { useMemo } from "react";
import { FaTimes, FaHistory } from "react-icons/fa";

const RecentRejectionsModal = ({ data = [], onClose, limit = 20 }) => {
  const recent = useMemo(
    () =>
      [...data]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit),
    [data, limit],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <FaHistory className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800">Recent Rejections</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">
          {recent.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-400">
              No recent rejections found
            </div>
          ) : (
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="p-2">Date</th>
                  <th className="p-2">Hall</th>
                  <th className="p-2">Machine</th>
                  <th className="p-2">Reason</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="whitespace-nowrap p-2">{row.date}</td>
                    <td className="p-2">{row.hall}</td>
                    <td className="p-2">{row.machine}</td>
                    <td className="p-2">{row.reason}</td>
                    <td className="p-2 text-right font-semibold text-red-600">
                      {row.rejectQty}
                    </td>
                    <td className="p-2 text-slate-500">{row.remarks || "-"}</td>
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

export default RecentRejectionsModal;