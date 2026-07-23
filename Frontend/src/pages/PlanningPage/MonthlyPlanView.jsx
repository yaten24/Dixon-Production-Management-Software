import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  HiOutlineDocumentArrowDown,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { searchParts } from "../../api/partApi";
import useMonthlyPlanView from "../../hooks/useMonthlyPlanView";
// NOTE: adjust this import to wherever PageTitleStrip actually lives relative to this file.
import PageTitleStrip from "./PageTitleStrip";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_COLORS = {
  Draft: "bg-[#9B9B9B]/15 text-[#0F1D24]",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Published: "bg-[#FDC94D]/25 text-[#0F1D24]",
  Closed: "bg-red-100 text-red-700",
};

// ============================================================
// Sidebar summary tile — matches the navy context panel pattern
// used across the daily/monthly plan pages.
// ============================================================
const SummaryTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-[#FDC94D]">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">{label}</p>
      <p className="truncate text-[12.5px] font-semibold text-white">{value}</p>
    </div>
  </div>
);

// ============================================================
// Stat card — matches the metrics row pattern.
// ============================================================
const StatCard = ({ value, label }) => (
  <div className="flex-1 border border-[#C6C6C6] bg-white px-4 py-3">
    <p className="text-xl font-bold leading-none text-[#0F1D24]">{value}</p>
    <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
  </div>
);

export default function MonthlyPlanView() {
  const { id } = useParams();
  const { header, details, loading, error, addPart, updatePart, removePart } = useMonthlyPlanView(id);

  // ---- Add-part form state ----
  const [partQuery, setPartQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [targetQty, setTargetQty] = useState("");
  const [plannedCycleTime, setPlannedCycleTime] = useState("");
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  // ---- Inline edit state ----
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [editCycleTime, setEditCycleTime] = useState("");

  // ---- Table search/filter state ----
  const [tableSearch, setTableSearch] = useState("");

  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback((keyword) => {
    setPartQuery(keyword);
    setSelectedPart(null);
    setDropdownOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!keyword.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchParts(keyword);
        setResults(res.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const selectPart = (part) => {
    setSelectedPart(part);
    setPartQuery(`${part.part_number} - ${part.part_name}`);
    setPlannedCycleTime(part.actual_cycle_time || "");
    setResults([]);
    setDropdownOpen(false);
  };

  const resetAddForm = () => {
    setPartQuery(""); setSelectedPart(null); setResults([]);
    setTargetQty(""); setPlannedCycleTime(""); setAddError("");
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!selectedPart) return setAddError("Select a part from the dropdown");
    if (!targetQty || Number(targetQty) <= 0) return setAddError("Enter a valid target quantity");

    setAdding(true);
    try {
      await addPart({
        partId: selectedPart.id,
        monthlyTargetQty: Number(targetQty),
        plannedCycleTime: plannedCycleTime ? Number(plannedCycleTime) : null,
      });
      resetAddForm();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add part");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.monthly_detail_id);
    setEditQty(row.monthly_target_qty);
    setEditCycleTime(row.planned_cycle_time ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (detailId) => {
    if (!editQty || Number(editQty) <= 0) return;
    await updatePart(detailId, {
      monthlyTargetQty: Number(editQty),
      plannedCycleTime: editCycleTime ? Number(editCycleTime) : null,
    });
    setEditingId(null);
  };

  const handleDelete = async (detailId) => {
    if (!confirm("Remove this part from the plan?")) return;
    await removePart(detailId);
  };

  const exportToExcel = () => {
    const rows = details.map((d) => ({
      "Part Number": d.part_number,
      "Part Name": d.part_name,
      "Category": d.product_category,
      "Standard CT (sec)": d.standard_cycle_time,
      "Actual CT (sec)": d.actual_cycle_time,
      "Planned CT (sec)": d.planned_cycle_time ?? "",
      "Monthly Target": d.monthly_target_qty,
      "Completed": d.completed_qty,
      "Balance": d.balance_qty,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan Details");
    XLSX.writeFile(wb, `${header?.plan_number || "monthly-plan"}.xlsx`);
  };

  // --- Derived: filtered rows + totals (mirrors the daily-plan view pattern) ---
  const filteredDetails = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return details;
    return details.filter((d) =>
      [d.part_number, d.part_name, d.product_category]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [details, tableSearch]);

  const totals = useMemo(() => {
    return filteredDetails.reduce(
      (acc, d) => ({
        targetQty: acc.targetQty + (Number(d.monthly_target_qty) || 0),
        completedQty: acc.completedQty + (Number(d.completed_qty) || 0),
        balanceQty: acc.balanceQty + (Number(d.balance_qty) || 0),
      }),
      { targetQty: 0, completedQty: 0, balanceQty: 0 }
    );
  }, [filteredDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
        <p className="text-sm font-medium text-[#9B9B9B]">Loading plan…</p>
      </div>
    );
  }

  if (error || !header) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
        <p className="text-sm font-medium text-red-500">{error || "Plan not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <PageTitleStrip
        eyebrow="Monthly Plan"
        title={header.plan_number}
        subtitle={`${MONTH_NAMES[header.plan_month - 1]} ${header.plan_year} · ${header.hall || "All Hall"} · ${header.working_days} working days`}
        actions={
          <>
            <span
              className={`flex items-center border border-[#C6C6C6] px-2.5 text-[11px] font-bold ${
                STATUS_COLORS[header.status] || STATUS_COLORS.Draft
              }`}
            >
              {header.status}
            </span>
            <button
              onClick={exportToExcel}
              disabled={details.length === 0}
              className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24] disabled:opacity-40"
            >
              <HiOutlineDocumentArrowDown className="h-3.5 w-3.5" />
              Export Excel
            </button>
          </>
        }
      />

      <main className="w-full space-y-3 px-3 pb-6 pt-3">
        {/* Context sidebar + stat cards */}
        <div className="grid grid-cols-1 gap-px border border-[#C6C6C6] bg-[#C6C6C6] md:grid-cols-[260px_1fr]">
          <div className="space-y-4 bg-[#0F1D24] p-5">
            <SummaryTile
              icon={HiOutlineCalendarDays}
              label="Period"
              value={`${MONTH_NAMES[header.plan_month - 1]} ${header.plan_year}`}
            />
            <SummaryTile icon={HiOutlineBuildingOffice2} label="Hall" value={header.hall || "All Hall"} />
            <SummaryTile icon={HiOutlineClock} label="Working Days" value={header.working_days} />
          </div>

          <div className="flex flex-col gap-px bg-[#C6C6C6] sm:flex-row">
            <StatCard value={header.total_parts ?? details.length} label="Total Parts" />
            <StatCard value={header.total_target_qty ?? totals.targetQty} label="Total Target Qty" />
            <StatCard value={totals.completedQty.toLocaleString()} label="Completed Qty" />
            <StatCard value={totals.balanceQty.toLocaleString()} label="Balance Qty" />
          </div>
        </div>

        {/* Add part */}
        <form onSubmit={handleAddPart} className="border border-[#C6C6C6] bg-white">
          <div className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-1.5">
            <h2 className="text-[12.5px] font-bold text-[#0F1D24]">Add Part</h2>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4" ref={searchBoxRef}>
              <div className="relative md:col-span-2">
                <input
                  value={partQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => results.length > 0 && setDropdownOpen(true)}
                  placeholder="Search part number / name"
                  className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[12.5px] outline-none focus:border-[#0F1D24]"
                />
                {searching && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#9B9B9B]">...</span>}
                {dropdownOpen && results.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto border border-[#C6C6C6] bg-white shadow-[0_4px_10px_rgba(15,29,36,0.12)]">
                    {results.map((p) => (
                      <li
                        key={p.id}
                        onClick={() => selectPart(p)}
                        className="cursor-pointer border-b border-[#C6C6C6] px-2.5 py-1.5 text-[11.5px] last:border-b-0 hover:bg-[#FDC94D]/20"
                      >
                        <div className="font-mono font-semibold text-[#0F1D24]">{p.part_number}</div>
                        <div className="text-[#0F1D24]">{p.part_name}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                type="number" min="1" value={targetQty}
                onChange={(e) => setTargetQty(e.target.value)}
                placeholder="Monthly Target Qty"
                className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[12.5px] font-mono outline-none focus:border-[#0F1D24]"
              />
              <div className="flex gap-px bg-[#C6C6C6]">
                <input
                  type="number" step="0.01" min="0" value={plannedCycleTime}
                  onChange={(e) => setPlannedCycleTime(e.target.value)}
                  placeholder="Planned CT (opt.)"
                  className="h-8 w-full border-0 bg-white px-2.5 text-[12.5px] font-mono outline-none"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="h-8 whitespace-nowrap bg-[#FDC94D] px-3 text-[11px] font-bold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D] disabled:opacity-50"
                >
                  {adding ? "..." : "Add"}
                </button>
              </div>
            </div>
            {addError && <p className="mt-1.5 text-[11px] font-semibold text-red-600">{addError}</p>}
          </div>
        </form>

        {/* Toolbar: search + result count */}
        <div className="flex flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <HiOutlineClipboardDocumentList className="h-4 w-4 text-[#0F1D24]" />
            <h2 className="text-[12.5px] font-bold text-[#0F1D24]">Plan Details</h2>
            <span className="border border-[#C6C6C6] bg-[#FAFAFA] px-1.5 py-[1px] text-[10px] font-bold text-[#9B9B9B]">
              {filteredDetails.length}
              {tableSearch ? ` / ${details.length}` : ""}
            </span>
          </div>

          <div className="relative">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search part, category..."
              className="h-8 w-64 border border-[#C6C6C6] bg-white pl-8 pr-7 text-[11.5px] outline-none focus:border-[#0F1D24]"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch("")}
                className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#9B9B9B] hover:text-[#0F1D24]"
              >
                <HiOutlineXMark className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Details table */}
        <div className="border border-[#C6C6C6] bg-white">
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[820px] text-left text-[12px]">
              <thead className="sticky top-0 z-10 bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Part</th>
                  <th className="px-2.5 py-2 font-semibold">Category</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Target</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Planned CT</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Completed</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Balance</th>
                  <th className="px-2.5 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]">
                      {tableSearch ? "No parts match your search." : "No parts added to this plan yet."}
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((row, idx) => {
                    const isEditing = editingId === row.monthly_detail_id;
                    return (
                      <tr
                        key={row.monthly_detail_id}
                        className={`border-t border-[#C6C6C6] transition-colors duration-100 hover:bg-[#FDC94D]/10 ${
                          idx % 2 === 1 ? "bg-[#FAFAFA]/60" : "bg-white"
                        }`}
                      >
                        <td className="px-2.5 py-1.5">
                          <div className="font-mono font-semibold text-[#0F1D24]">{row.part_number}</div>
                          <div className="text-[#9B9B9B]">{row.part_name}</div>
                        </td>
                        <td className="px-2.5 py-1.5 text-[#9B9B9B]">{row.product_category}</td>
                        <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-[#0F1D24]">
                          {isEditing ? (
                            <input
                              type="number" min="1" value={editQty}
                              onChange={(e) => setEditQty(e.target.value)}
                              className="h-7 w-20 border border-[#C6C6C6] px-1.5 text-right text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                            />
                          ) : row.monthly_target_qty}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">
                          {isEditing ? (
                            <input
                              type="number" step="0.01" min="0" value={editCycleTime}
                              onChange={(e) => setEditCycleTime(e.target.value)}
                              className="h-7 w-20 border border-[#C6C6C6] px-1.5 text-right text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                            />
                          ) : (row.planned_cycle_time ?? "—")}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">{row.completed_qty}</td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">{row.balance_qty}</td>
                        <td className="px-2.5 py-1.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {isEditing ? (
                              <>
                                <button onClick={() => saveEdit(row.monthly_detail_id)} className="flex h-6 w-6 items-center justify-center border border-transparent text-green-600 hover:border-green-200 hover:bg-green-50">
                                  <HiOutlineCheck className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="flex h-6 w-6 items-center justify-center border border-transparent text-[#9B9B9B] hover:border-[#C6C6C6] hover:bg-[#F5F5F5]">
                                  <HiOutlineXMark className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(row)} className="flex h-6 w-6 items-center justify-center border border-transparent text-[#0F1D24] hover:border-[#FDC94D] hover:bg-[#FDC94D]/20">
                                  <HiOutlinePencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDelete(row.monthly_detail_id)} className="flex h-6 w-6 items-center justify-center border border-transparent text-red-500 hover:border-red-200 hover:bg-red-50">
                                  <HiOutlineTrash className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredDetails.length > 0 && (
                <tfoot className="sticky bottom-0 border-t-2 border-[#0F1D24] bg-[#FAFAFA]">
                  <tr>
                    <td colSpan={2} className="px-2.5 py-2 text-right text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      Totals
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.targetQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2" />
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.completedQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.balanceQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}