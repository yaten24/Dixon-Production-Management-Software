import React, { useMemo, useState } from "react";
import { FaTimes, FaHistory, FaSearch } from "react-icons/fa";

const RecentRejectionsModal = ({ data = [], onClose, limit = 20 }) => {
  const [search, setSearch] = useState("");

  const recent = useMemo(
    () =>
      [...data]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit),
    [data, limit],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recent;
    return recent.filter((row) =>
      [row.hall, row.machine, row.reason, row.remarks]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [recent, search]);

  const totalQty = useMemo(
    () => filtered.reduce((s, r) => s + Number(r.rejectQty || 0), 0),
    [filtered]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1D24]/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden border border-[#C6C6C6] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between bg-[#0F1D24] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center border border-white/15 bg-white/5 text-[#FDC94D]">
              <FaHistory className="text-[13px]" />
            </div>
            <div>
              <h2 className="text-[12.5px] font-bold text-white">Recent Rejections</h2>
              <p className="text-[9.5px] text-white/50">Last {recent.length} entries</p>
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
        {recent.length > 0 && (
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#C6C6C6]/60 bg-[#F5F5F5] px-3 py-1.5">
            <FaSearch className="text-[10px] text-[#9B9B9B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hall, machine, reason, remarks…"
              className="h-6 flex-1 bg-transparent text-[11px] text-[#0F1D24] outline-none placeholder:text-[#9B9B9B]"
            />
            {search && (
              <span className="text-[9.5px] text-[#9B9B9B]">{filtered.length} matches</span>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-[11px] text-[#9B9B9B]">
              {recent.length === 0 ? "No recent rejections found" : "No entries match your search"}
            </div>
          ) : (
            <table className="min-w-full text-[10.5px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#0F1D24] text-left">
                  <th className="px-2.5 py-1.5 font-bold text-white">Date</th>
                  <th className="px-2.5 py-1.5 font-bold text-white">Hall</th>
                  <th className="px-2.5 py-1.5 font-bold text-white">Machine</th>
                  <th className="px-2.5 py-1.5 font-bold text-[#FDC94D]">Reason</th>
                  <th className="px-2.5 py-1.5 text-right font-bold text-white">Qty</th>
                  <th className="px-2.5 py-1.5 font-bold text-white">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-[#C6C6C6]/40 transition-colors hover:bg-[#FDC94D]/10 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]/50"
                    }`}
                  >
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-[#0F1D24]">{row.date}</td>
                    <td className="px-2.5 py-1.5 text-[#0F1D24]">{row.hall}</td>
                    <td className="px-2.5 py-1.5 text-[#0F1D24]">{row.machine}</td>
                    <td className="px-2.5 py-1.5">
                      <span className="inline-block border border-[#FDC94D]/50 bg-[#FDC94D]/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#0F1D24]">
                        {row.reason}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono font-bold text-red-600">
                      {row.rejectQty}
                    </td>
                    <td className="max-w-[180px] truncate px-2.5 py-1.5 text-[#9B9B9B]" title={row.remarks || ""}>
                      {row.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-[#C6C6C6]/60 bg-[#F5F5F5]/70 px-3 py-1.5">
          <span className="text-[9.5px] text-[#9B9B9B]">{filtered.length} entries shown</span>
          <span className="text-[10px] font-semibold text-[#9B9B9B]">
            Total Qty: <span className="font-bold text-red-600">{totalQty}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentRejectionsModal;