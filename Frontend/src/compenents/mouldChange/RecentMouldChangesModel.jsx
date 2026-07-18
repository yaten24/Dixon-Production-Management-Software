import React, { useEffect, useState, useCallback } from "react";
import { FaExchangeAlt, FaClock, FaIndustry, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { getRecentMouldChanges } from "../../api/mouldChangeDashboardApi";

const durationStyle = (mins) => {
  if (mins >= 35) return "bg-red-50 border-red-200 text-red-600";
  if (mins >= 20) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-emerald-50 border-emerald-200 text-emerald-600";
};

const RecentMouldChangesModal = ({ isOpen, onClose, date, hall, reason, limit = 20 }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecentMouldChanges({
        date,
        hall: hall && hall !== "All" ? hall : undefined,
        reason: reason && reason !== "All" ? reason : undefined,
        limit,
      });
      setRows(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load recent mould changes");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [date, hall, reason, limit]);

  useEffect(() => {
    if (isOpen) fetchRecent();
  }, [isOpen, fetchRecent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white border border-gray-200 flex items-center justify-center rounded-sm shadow-sm">
            <FaExchangeAlt className="text-[#2563EB] text-base" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
              Recent Mould Changes
            </h2>
            <p className="text-[11px] text-gray-500 tracking-wide">
              {date ? `Date: ${date}` : "All dates"}
              {hall && hall !== "All" ? ` · ${hall}` : ""}
              {reason && reason !== "All" ? ` · ${reason}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-sm shadow-sm">
            <p className="text-[9px] uppercase tracking-wider text-gray-500">Activities</p>
            <h3 className="text-sm font-semibold text-[#2563EB] font-mono">{rows.length}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-gray-500 transition hover:bg-gray-100"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex-shrink-0 px-5 py-1.5 text-[11px] text-gray-500">Loading…</div>
      )}
      {error && (
        <div className="flex-shrink-0 border-b border-red-100 bg-red-50 px-5 py-1.5 text-[11px] text-red-600">
          {error}
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-5 py-1.5 text-[11px] font-medium text-amber-700">
          No mould change activity found for the selected filters.
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto px-5 py-3">
        <div className="border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">#</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">Machine</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">Mould Change</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-left">Operator</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">Date</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">Time</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 text-center">Duration</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs text-gray-400">{index + 1}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-sm text-gray-800">{item.machine}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <FaIndustry className="text-gray-400 text-[10px]" />
                        {item.hall || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-sm font-mono">
                        <span className="text-gray-500">{item.oldMould || "—"}</span>
                        <span className="mx-1.5 text-gray-300">→</span>
                        <span className="font-semibold text-[#2563EB]">{item.newMould || "—"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm text-gray-700">{item.operator || "—"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-gray-500">
                        <FaCalendarAlt className="text-gray-400 text-[10px]" />
                        {item.changeDate || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-sm text-gray-700">
                        <FaClock className="text-[#2563EB] text-[11px]" />
                        {item.changeTime || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-mono font-semibold border rounded-sm ${durationStyle(
                          item.changeDuration || 0
                        )}`}
                      >
                        {item.changeDuration || 0} min
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentMouldChangesModal;