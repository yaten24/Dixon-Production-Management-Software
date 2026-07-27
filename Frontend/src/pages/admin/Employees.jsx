import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiSave,
  FiX,
  FiEye,
  FiTrash2,
  FiPlus,
  FiRotateCcw,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiUser,
  FiAward,
} from "react-icons/fi";

import Sidebar from "./Sidebar";
import {
  getOperators,
  getOperatorMeta,
  getTopPerformers,
  addOperator,
  deleteOperator,
  exportOperators,
} from "../../services/operatorService";

// ============================================================
// THEME TOKENS — kept consistent with AdminDashboard / Sidebar / Users / Machines / Parts
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";
const MUTED = "#9B9B9B";

const LIMIT = 100;

/* ==========================================================
   TOP PERFORMER BANNER — flat gold-accent strip
========================================================== */
const TopPerformerBanner = ({ topPerformers = [] }) => {
  if (!topPerformers.length) return null;
  const best = topPerformers[0];

  return (
    <div
      className="flex flex-shrink-0 items-center justify-between gap-3 border border-[#C6C6C6] bg-white px-3 py-1.5"
      style={{ borderLeft: `3px solid ${GOLD}` }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[#C6C6C6] text-[#0F1D24]">
          <FiAward size={13} />
        </span>
        <p className="truncate text-[11px] font-medium text-[#0F1D24]">
          Top Performer: <span className="font-bold">{best.operator_name}</span> ({best.operator_code}) —{" "}
          <span className="font-bold">{best.performance}%</span> completion, {best.hall}, Shift {best.shift}
        </p>
      </div>
      {topPerformers.length > 1 && (
        <span className="flex-shrink-0 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
          +{topPerformers.length - 1} more
        </span>
      )}
    </div>
  );
};

/* ==========================================================
   EMPLOYEE FILTERS — flat control box
========================================================== */
const EmployeeFilters = ({
  search,
  setSearch,
  hall,
  setHall,
  shift,
  setShift,
  halls = [],
  shifts = [],
  onAddOperator,
  onResetFilters,
  onExport,
  exporting = false,
}) => {
  const hasActiveFilters = search.trim() !== "" || hall !== "All" || shift !== "All";

  return (
    <div className="flex-shrink-0 border border-[#C6C6C6] bg-white px-3 py-2.5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <FiUser size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by operator code or name..."
            className="h-8 w-full border border-[#C6C6C6] pl-8 pr-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24]"
          />
        </div>

        <select
          value={hall}
          onChange={(e) => setHall(e.target.value)}
          className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] lg:w-36"
        >
          <option value="All">All Halls</option>
          {halls.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] lg:w-32"
        >
          <option value="All">All Shifts</option>
          {shifts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex w-full gap-1.5 lg:ml-auto lg:w-auto">
          <button
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 border border-[#C6C6C6] px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none"
          >
            <FiRotateCcw size={12} />
            Reset
          </button>

          <button
            onClick={onExport}
            disabled={exporting}
            title={hasActiveFilters ? "Export filtered data" : "Export all data"}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 border border-green-600 px-3 text-[10.5px] font-bold uppercase tracking-wide text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
          >
            <FiDownload size={12} />
            {exporting ? "..." : "Export"}
          </button>

          <button
            onClick={onAddOperator}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 border px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90 lg:flex-none"
            style={{ background: GOLD, borderColor: GOLD }}
          >
            <FiPlus size={13} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================
   EMPLOYEE AVATAR — flat bordered icon + name/code
========================================================== */
const EmployeeAvatar = ({ operator }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-[#F9F9F9] text-[#0F1D24]">
      <FiUser size={14} />
    </div>
    <div className="min-w-0 leading-tight">
      <h3 className="truncate text-[11px] font-semibold text-[#0F1D24]">{operator.operator_name}</h3>
      <p className="font-mono text-[9.5px] text-[#9B9B9B]">{operator.operator_code}</p>
    </div>
  </div>
);

/* ==========================================================
   EMPLOYEE ACTIONS — flat icon buttons
========================================================== */
const EmployeeActions = ({ operator, onView, onDelete }) => (
  <div className="flex justify-center gap-0.5">
    <button
      onClick={() => onView?.(operator)}
      title="View"
      className="flex h-7 w-7 items-center justify-center border border-[#C6C6C6] text-[#0F1D24] transition hover:bg-[#EFEFEF]"
    >
      <FiEye size={13} />
    </button>
    <button
      onClick={() => onDelete?.(operator)}
      title="Delete"
      className="flex h-7 w-7 items-center justify-center border border-[#C6C6C6] text-red-600 transition hover:bg-red-50"
    >
      <FiTrash2 size={13} />
    </button>
  </div>
);

/* ==========================================================
   PERFORMANCE BADGE — flat bordered chip + dot
========================================================== */
const performanceStatus = (value) => {
  if (value >= 90) return { color: "text-green-700", dot: "bg-green-500" };
  if (value >= 70) return { color: "text-amber-700", dot: "bg-amber-500" };
  if (value > 0) return { color: "text-red-700", dot: "bg-red-500" };
  return { color: "text-[#9B9B9B]", dot: "bg-gray-400" };
};

const PerformanceBadge = ({ value }) => {
  const { color, dot } = performanceStatus(value);
  return (
    <span className={`inline-flex items-center gap-1.5 border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${color}`}>
      <span className={`h-1.5 w-1.5 flex-shrink-0 ${dot}`} />
      {value}%
    </span>
  );
};

/* ==========================================================
   EMPLOYEE ROW — flat row, zebra + gold hover
========================================================== */
const EmployeeRow = ({ operator, index, onView, onDelete }) => {
  const performance = Number(operator.performance) || 0;

  return (
    <tr
      className={`border-b border-[#C6C6C6]/60 transition-colors hover:bg-[#FDF6E3] ${
        index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
      }`}
    >
      <td className="px-2 py-1.5">
        <EmployeeAvatar operator={operator} />
      </td>
      <td className="px-2 py-1.5">
        <span className="inline-flex items-center border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
          {operator.hall}
        </span>
      </td>
      <td className="px-2 py-1.5">
        <span className="inline-flex items-center border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
          {operator.shift}
        </span>
      </td>
      <td className="px-2 py-1.5">
        <PerformanceBadge value={performance} />
      </td>
      <td className="px-2 py-1.5">
        <EmployeeActions operator={operator} onView={onView} onDelete={onDelete} />
      </td>
    </tr>
  );
};

/* ==========================================================
   EMPLOYEE PAGINATION — flat, single-screen friendly
========================================================== */
const EmployeePagination = ({ currentPage = 1, totalPages = 1, totalRecords = 0, limit = 100, onPageChange }) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const rangeStart = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="flex flex-shrink-0 flex-col gap-2 border-t border-[#C6C6C6] bg-[#F5F5F5] px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
      <p className="font-mono text-[10.5px] font-medium text-[#0F1D24]/75">
        {rangeStart}-{rangeEnd} of <span className="font-bold text-[#0F1D24]">{totalRecords}</span> operators ·
        Page <span className="font-bold text-[#0F1D24]">{currentPage}</span> / {totalPages}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-7 items-center gap-1 border border-[#C6C6C6] bg-white px-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft size={12} />
          Prev
        </button>
        <button
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-7 items-center gap-1 border border-[#C6C6C6] bg-white px-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <FiChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

/* ==========================================================
   EMPLOYEE TABLE — flat bordered table, scrolls internally
========================================================== */
const EmployeeTable = ({
  operators,
  loading,
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onView,
  onDelete,
}) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[#C6C6C6] bg-white">
    {/* Header */}
    <div className="flex flex-shrink-0 flex-col gap-1.5 border-b border-[#C6C6C6] bg-[#F5F5F5] px-3 py-1.5 md:flex-row md:items-center md:justify-between">
      <div className="leading-tight">
        <h2 className="text-[12px] font-extrabold text-[#0F1D24]">Operator List</h2>
        <p className="text-[9.5px] font-medium text-[#9B9B9B]">
          Total <span className="font-bold text-[#0F1D24]">{totalRecords}</span> Operators
        </p>
      </div>
      <span
        className="inline-flex w-fit items-center border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]"
        style={{ borderLeft: `3px solid ${GOLD}` }}
      >
        Live Workforce
      </span>
    </div>

    {/* Table */}
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="min-w-full text-[11px]">
        <thead className="sticky top-0 z-10 border-b border-[#C6C6C6] bg-[#F5F5F5]">
          <tr>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Operator</th>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Hall</th>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Shift</th>
            <th className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Performance</th>
            <th className="px-2 py-1.5 text-center text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                Loading operators...
              </td>
            </tr>
          ) : operators.length > 0 ? (
            operators.map((operator, index) => (
              <EmployeeRow key={operator.id} operator={operator} index={index} onView={onView} onDelete={onDelete} />
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-8 text-center text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                No operators found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <EmployeePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalRecords={totalRecords}
      limit={limit}
      onPageChange={onPageChange}
    />
  </div>
);

/* ==========================================================
   FORM FIELD — matches Users/Parts modal style
========================================================== */
const Field = ({ label, name, value, onChange, disabled, required }) => (
  <div>
    <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B]"
    />
  </div>
);

/* ==========================================================
   OPERATOR MODAL — Add / View, flat sharp-corner form modal
========================================================== */
const initialState = {
  operator_name: "",
  operator_code: "",
  shift: "",
  hall: "",
};

const OperatorModal = ({ isOpen, mode = "add", operator = null, onClose, onSave, saving = false, error = "" }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      setForm(mode === "add" ? initialState : operator || initialState);
    }
  }, [isOpen, mode, operator]);

  if (!isOpen) return null;

  const isView = mode === "view";

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isView) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md border border-[#C6C6C6] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
          <div className="leading-tight">
            <h2 className="text-[13px] font-extrabold text-[#0F1D24]">{isView ? "Operator Details" : "Add Operator"}</h2>
            <p className="text-[9.5px] font-medium text-[#9B9B9B]">{isView ? "Read-only view" : "Create a new operator record"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#0F1D24] hover:bg-[#F5F5F5]">
            <FiX size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          {error && (
            <div className="mb-2.5 border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10.5px] font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Field label="Operator Name" name="operator_name" value={form.operator_name} onChange={handleChange} disabled={isView} required />
            <Field label="Operator Code" name="operator_code" value={form.operator_code} onChange={handleChange} disabled={isView} required />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Shift" name="shift" value={form.shift} onChange={handleChange} disabled={isView} required />
              <Field label="Hall" name="hall" value={form.hall} onChange={handleChange} disabled={isView} required />
            </div>

            {isView && (
              <div className="mt-1 border border-[#C6C6C6] bg-[#F9F9F9] px-2.5 py-2">
                <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Performance</p>
                <div className="flex flex-wrap items-center gap-2">
                  <PerformanceBadge value={operator?.performance ?? 0} />
                  <span className="text-[9.5px] font-medium text-[#9B9B9B]">
                    {operator?.total_actual ?? 0} / {operator?.total_target ?? 0} units (actual/target)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end gap-2 border-t border-[#C6C6C6] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#C6C6C6] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5]"
            >
              {isView ? "Close" : "Cancel"}
            </button>

            {!isView && (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: GOLD, borderColor: GOLD }}
              >
                <FiSave size={13} />
                {saving ? "Saving..." : "Add Operator"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================
   CONFIRM DIALOG — flat confirm dialog
========================================================== */
const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm border border-[#C6C6C6] bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#C6C6C6] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center border border-red-200 bg-red-50 text-red-600">
              <FiAlertTriangle size={15} />
            </span>
            <h2 className="text-[12.5px] font-extrabold text-[#0F1D24]">{title}</h2>
          </div>
          <button onClick={onCancel} disabled={loading} className="p-1 text-[#0F1D24] hover:bg-[#F5F5F5]">
            <FiX size={16} />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="text-[11px] leading-relaxed text-[#0F1D24]/75">{message}</p>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#C6C6C6] px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border border-[#C6C6C6] px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="border border-red-600 bg-red-600 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================
   EMPLOYEES PAGE — single screen, no page-level scrollbar
========================================================== */
const Employees = () => {
  const [search, setSearch] = useState("");
  const [hall, setHall] = useState("All");
  const [shift, setShift] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [halls, setHalls] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [topPerformers, setTopPerformers] = useState([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [viewOperator, setViewOperator] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, hall, shift]);

  useEffect(() => {
    getOperatorMeta()
      .then((res) => {
        setHalls(res.halls || []);
        setShifts(res.shifts || []);
      })
      .catch(() => {});

    getTopPerformers(3)
      .then((res) => setTopPerformers(res.data || []))
      .catch(() => {});
  }, []);

  const fetchOperators = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await getOperators({
        search: debouncedSearch,
        hall,
        shift,
        page: currentPage,
        limit: LIMIT,
      });
      setOperators(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (err) {
      setListError(err.message || "Failed to load operators");
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, hall, shift, currentPage]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const refreshTopPerformers = () => {
    getTopPerformers(3)
      .then((res) => setTopPerformers(res.data || []))
      .catch(() => {});
  };

  const handleResetFilters = () => {
    setSearch("");
    setHall("All");
    setShift("All");
  };

  const handleAddOperator = () => {
    setSaveError("");
    setIsAddOpen(true);
  };

  const handleSaveOperator = async (data) => {
    setSaving(true);
    setSaveError("");
    try {
      await addOperator(data);
      setIsAddOpen(false);
      setCurrentPage(1);
      await fetchOperators();
      refreshTopPerformers();
    } catch (err) {
      setSaveError(err.message || "Failed to add operator");
    } finally {
      setSaving(false);
    }
  };

  const handleView = (operator) => setViewOperator(operator);
  const handleDeleteRequest = (operator) => setDeleteTarget(operator);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOperator(deleteTarget.id);
      setDeleteTarget(null);
      await fetchOperators();
      refreshTopPerformers();
    } catch (err) {
      setListError(err.message || "Failed to delete operator");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportOperators({ search: debouncedSearch, hall, shift });
    } catch (err) {
      setListError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
          <TopPerformerBanner topPerformers={topPerformers} />

          <EmployeeFilters
            search={search}
            setSearch={setSearch}
            hall={hall}
            setHall={setHall}
            shift={shift}
            setShift={setShift}
            halls={halls}
            shifts={shifts}
            onAddOperator={handleAddOperator}
            onResetFilters={handleResetFilters}
            onExport={handleExport}
            exporting={exporting}
          />

          {listError && (
            <div className="flex-shrink-0 border border-red-200 bg-red-50 px-3 py-1.5 text-[10.5px] font-bold text-red-600">
              {listError}
            </div>
          )}

          <EmployeeTable
            operators={operators}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={LIMIT}
            onPageChange={setCurrentPage}
            onView={handleView}
            onDelete={handleDeleteRequest}
          />
        </main>
      </div>

      <OperatorModal
        isOpen={isAddOpen}
        mode="add"
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveOperator}
        saving={saving}
        error={saveError}
      />

      <OperatorModal isOpen={!!viewOperator} mode="view" operator={viewOperator} onClose={() => setViewOperator(null)} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete operator?"
        message={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.operator_name} (${deleteTarget.operator_code}). This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Employees;