import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { HiOutlineArrowLeft, HiOutlineDocumentArrowDown, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import { searchParts } from "../../api/partApi";
import useMonthlyPlanView from "../../hooks/useMonthlyPlanView";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_COLORS = {
  Draft: "bg-[#9B9B9B]/15 text-[#0F1D24]",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Published: "bg-[#FDC94D]/25 text-[#0F1D24]",
  Closed: "bg-red-100 text-red-700",
};

export default function MonthlyPlanView() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <div className="p-8 text-center text-[12px] text-[#9B9B9B]">Loading plan...</div>;
  if (error) return <div className="p-8 text-center text-[12px] font-semibold text-red-600">{error}</div>;
  if (!header) return null;

  return (
    <div className="min-h-screen bg-[#F7F7F5] p-3">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#C6C6C6] pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-[#C6C6C6]/70 bg-white text-[#0F1D24] hover:border-[#0F1D24]"
          >
            <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#0F1D24]">{header.plan_number}</h1>
            <p className="text-[11px] text-[#9B9B9B]">
              {MONTH_NAMES[header.plan_month - 1]} {header.plan_year} · {header.hall || "All Hall"} · {header.working_days} working days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-bold ${STATUS_COLORS[header.status] || STATUS_COLORS.Draft}`}>
            {header.status}
          </span>
          <button
            onClick={exportToExcel}
            disabled={details.length === 0}
            className="flex items-center gap-1.5 rounded-sm bg-[#0F1D24] px-3 py-1.5 text-[11px] font-semibold text-[#FDC94D] disabled:opacity-40"
          >
            <HiOutlineDocumentArrowDown className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3 flex flex-wrap gap-4 rounded-sm border border-[#C6C6C6] bg-white px-3 py-2 text-[11.5px] font-mono text-[#0F1D24]">
        <span>Total Parts: <b>{header.total_parts ?? details.length}</b></span>
        <span>Total Target Qty: <b>{header.total_target_qty ?? 0}</b></span>
      </div>

      {/* Add part */}
      <form onSubmit={handleAddPart} className="mb-3 rounded-sm border border-[#C6C6C6] bg-white p-3">
        <h2 className="mb-2 text-[13px] font-bold text-[#0F1D24]">Add Part</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4" ref={searchBoxRef}>
          <div className="relative md:col-span-2">
            <input
              value={partQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setDropdownOpen(true)}
              placeholder="Search part number / name"
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[12.5px] outline-none focus:border-[#0F1D24]"
            />
            {searching && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#9B9B9B]">...</span>}
            <AnimatePresence>
              {dropdownOpen && results.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-sm border border-[#C6C6C6] bg-white shadow-lg"
                >
                  {results.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => selectPart(p)}
                      className="cursor-pointer border-b border-[#C6C6C6]/40 px-2.5 py-1.5 text-[11.5px] last:border-b-0 hover:bg-[#FDC94D]/20"
                    >
                      <div className="font-mono font-semibold text-[#0F1D24]">{p.part_number}</div>
                      <div className="text-[#0F1D24]">{p.part_name}</div>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <input
            type="number" min="1" value={targetQty}
            onChange={(e) => setTargetQty(e.target.value)}
            placeholder="Monthly Target Qty"
            className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[12.5px] font-mono outline-none focus:border-[#0F1D24]"
          />
          <div className="flex gap-1.5">
            <input
              type="number" step="0.01" min="0" value={plannedCycleTime}
              onChange={(e) => setPlannedCycleTime(e.target.value)}
              placeholder="Planned CT (opt.)"
              className="h-8 w-full rounded-sm border border-[#C6C6C6] px-2.5 text-[12.5px] font-mono outline-none focus:border-[#0F1D24]"
            />
            <button
              type="submit"
              disabled={adding}
              className="h-8 whitespace-nowrap rounded-sm bg-[#FDC94D] px-3 text-[11px] font-bold text-[#0F1D24] disabled:opacity-50"
            >
              {adding ? "..." : "Add"}
            </button>
          </div>
        </div>
        {addError && <p className="mt-1.5 text-[11px] font-semibold text-red-600">{addError}</p>}
      </form>

      {/* Details table */}
      <div className="overflow-x-auto rounded-sm border border-[#C6C6C6] bg-white">
        <table className="w-full min-w-[820px] text-[12px]">
          <thead className="bg-[#0F1D24] text-white">
            <tr>
              <th className="px-2.5 py-2 text-left font-semibold">Part</th>
              <th className="px-2.5 py-2 text-left font-semibold">Category</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Target</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Planned CT</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Completed</th>
              <th className="px-2.5 py-2 text-right font-semibold font-mono">Balance</th>
              <th className="px-2.5 py-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {details.map((row) => {
                const isEditing = editingId === row.monthly_detail_id;
                return (
                  <motion.tr
                    key={row.monthly_detail_id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="border-t border-[#C6C6C6]/60"
                  >
                    <td className="px-2.5 py-2">
                      <div className="font-mono font-semibold text-[#0F1D24]">{row.part_number}</div>
                      <div className="text-[#9B9B9B]">{row.part_name}</div>
                    </td>
                    <td className="px-2.5 py-2 text-[#9B9B9B]">{row.product_category}</td>
                    <td className="px-2.5 py-2 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number" min="1" value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="h-7 w-20 rounded-sm border border-[#C6C6C6] px-1.5 text-right text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                        />
                      ) : row.monthly_target_qty}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number" step="0.01" min="0" value={editCycleTime}
                          onChange={(e) => setEditCycleTime(e.target.value)}
                          className="h-7 w-20 rounded-sm border border-[#C6C6C6] px-1.5 text-right text-[12px] font-mono outline-none focus:border-[#0F1D24]"
                        />
                      ) : (row.planned_cycle_time ?? "-")}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono">{row.completed_qty}</td>
                    <td className="px-2.5 py-2 text-right font-mono">{row.balance_qty}</td>
                    <td className="px-2.5 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(row.monthly_detail_id)} className="flex h-6 w-6 items-center justify-center rounded-sm text-green-600 hover:bg-green-50">
                              <HiOutlineCheck className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={cancelEdit} className="flex h-6 w-6 items-center justify-center rounded-sm text-[#9B9B9B] hover:bg-[#F5F5F5]">
                              <HiOutlineXMark className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(row)} className="flex h-6 w-6 items-center justify-center rounded-sm text-[#0F1D24] hover:bg-[#FDC94D]/20">
                              <HiOutlinePencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDelete(row.monthly_detail_id)} className="flex h-6 w-6 items-center justify-center rounded-sm text-red-500 hover:bg-red-50">
                              <HiOutlineTrash className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {details.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]">No parts added to this plan yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}