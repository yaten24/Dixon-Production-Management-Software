import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RotateCcw,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  PackageSearch,
} from "lucide-react";

import Sidebar from "./Sidebar";
import {
  getAllParts,
  getFilterOptions,
  deletePart as deletePartApi,
  addPart,
  updatePart,
} from "../../api/partApi";

// ============================================================
// THEME TOKENS — kept consistent with AdminDashboard / Sidebar / Users / Machines
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";
const MUTED = "#9B9B9B";

const PAGE_SIZE = 100;
const DEBOUNCE_MS = 350;

/* ==========================================================
   PART STATUS BADGE — flat bordered chip + dot
========================================================== */
const PartStatusBadge = React.memo(({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${
      status === "Active" ? "text-green-700" : "text-red-700"
    }`}
  >
    <span className={`h-1.5 w-1.5 flex-shrink-0 ${status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
    {status}
  </span>
));
PartStatusBadge.displayName = "PartStatusBadge";

/* ==========================================================
   PART ACTIONS — flat icon buttons
========================================================== */
const PartActions = React.memo(({ part, onView, onEdit, onDelete }) => (
  <div className="flex items-center justify-center gap-0.5">
    <button onClick={() => onView?.(part)} className="p-1 text-[#0F1D24] transition hover:bg-[#EFEFEF]" title="View">
      <Eye size={13} />
    </button>
    <button onClick={() => onEdit?.(part)} className="p-1 text-[#2563EB] transition hover:bg-blue-50" title="Edit">
      <Pencil size={13} />
    </button>
    <button onClick={() => onDelete?.(part)} className="p-1 text-red-600 transition hover:bg-red-50" title="Delete">
      <Trash2 size={13} />
    </button>
  </div>
));
PartActions.displayName = "PartActions";

/* ==========================================================
   PART ROW — flat row, zebra + gold hover
========================================================== */
const PartRow = React.memo(({ part, index, serialNumber, onView, onEdit, onDelete }) => (
  <tr
    className={`border-b border-[#C6C6C6]/60 transition-colors hover:bg-[#FDF6E3] ${
      index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
    }`}
  >
    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10.5px] font-semibold text-[#9B9B9B]">
      {serialNumber}
    </td>
    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[11px] font-bold text-[#0F1D24]">
      {part.part_number}
    </td>
    <td className="px-2 py-1.5">
      <p className="text-[11px] font-semibold leading-tight text-[#0F1D24]">{part.part_name}</p>
      <p className="text-[9px] leading-tight text-[#9B9B9B]">Production Part</p>
    </td>
    <td className="px-2 py-1.5">
      <span className="inline-flex items-center border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
        {part.product_category}
      </span>
    </td>
    <td className="px-2 py-1.5 text-[11px] text-[#0F1D24]/75">{part.source}</td>
    <td className="px-2 py-1.5 text-[11px] text-[#0F1D24]/75">{part.customer}</td>
    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[11px] font-semibold text-[#2563EB]">
      {part.standard_cycle_time} sec
    </td>
    <td className="whitespace-nowrap px-2 py-1.5">
      <span
        className={`font-mono text-[11px] font-semibold ${
          Number(part.actual_cycle_time) <= Number(part.standard_cycle_time) ? "text-green-600" : "text-red-600"
        }`}
      >
        {part.actual_cycle_time} sec
      </span>
    </td>
    <td className="px-2 py-1.5">
      <PartStatusBadge status={part.status} />
    </td>
    <td className="px-2 py-1.5 text-center">
      <PartActions part={part} onView={onView} onEdit={onEdit} onDelete={onDelete} />
    </td>
  </tr>
));
PartRow.displayName = "PartRow";

/* ==========================================================
   PARTS TABLE — flat bordered table, sticky header, scrolls internally
========================================================== */
const columns = [
  "S.No",
  "Part Number",
  "Part Name",
  "Category",
  "Source",
  "Customer",
  "Std CT",
  "Actual CT",
  "Status",
  "Actions",
];

const PartsTable = ({ parts = [], onView, onEdit, onDelete }) => {
  if (parts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 border border-[#C6C6C6] bg-white">
        <div className="flex h-12 w-12 items-center justify-center border border-[#C6C6C6] bg-[#F9F9F9] text-[#9B9B9B]">
          <PackageSearch size={20} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">No Parts Found</p>
        <p className="text-[10.5px] font-medium text-[#9B9B9B]">Try changing filters or search keyword.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[#C6C6C6] bg-white">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-full text-[11px]">
          <thead className="sticky top-0 z-10 border-b border-[#C6C6C6] bg-[#F5F5F5]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parts.map((part, index) => (
              <PartRow
                key={part.id}
                part={part}
                index={index}
                serialNumber={index + 1}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ==========================================================
   PARTS FILTERS — flat control box
========================================================== */
const PartsFilters = React.memo(
  ({
    search,
    setSearch,
    category,
    setCategory,
    customer,
    setCustomer,
    source,
    setSource,
    status,
    setStatus,
    categories = [],
    customers = [],
    sources = [],
    onAddPart,
  }) => {
    const resetFilters = () => {
      setSearch("");
      setCategory("All");
      setCustomer("All");
      setSource("All");
      setStatus("All");
    };

    const selectClass =
      "h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24]";

    return (
      <div className="border border-[#C6C6C6] bg-white px-3 py-2.5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search part number or name..."
              className="h-8 w-full border border-[#C6C6C6] pl-8 pr-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24]"
            />
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectClass} lg:w-32`}>
            <option value="All">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select value={customer} onChange={(e) => setCustomer(e.target.value)} className={`${selectClass} lg:w-32`}>
            <option value="All">All Customers</option>
            {customers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select value={source} onChange={(e) => setSource(e.target.value)} className={`${selectClass} lg:w-32`}>
            <option value="All">All Sources</option>
            {sources.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${selectClass} lg:w-28`}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="flex w-full gap-1.5 lg:ml-auto lg:w-auto">
            <button
              onClick={resetFilters}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 border border-[#C6C6C6] px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] lg:flex-none"
            >
              <RotateCcw size={12} />
              Reset
            </button>

            <button
              onClick={() => onAddPart?.()}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 border px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90 lg:flex-none"
              style={{ background: GOLD, borderColor: GOLD }}
            >
              <Plus size={13} />
              Add Part
            </button>
          </div>
        </div>
      </div>
    );
  }
);
PartsFilters.displayName = "PartsFilters";

/* ==========================================================
   PAGINATION CONTROLS — flat, single-screen friendly
========================================================== */
const PaginationControls = ({ page, totalPages, totalCount, pageSize, onPrev, onNext }) => {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-shrink-0 items-center justify-between border border-[#C6C6C6] bg-white px-3 py-2">
      <span className="font-mono text-[10.5px] font-medium text-[#0F1D24]/75">
        {start}-{end} of <span className="font-bold text-[#0F1D24]">{totalCount}</span>
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="flex h-7 items-center gap-1 border border-[#C6C6C6] px-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={12} />
          Prev
        </button>

        <span className="font-mono text-[10.5px] font-bold text-[#0F1D24]">
          Page {page} / {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="flex h-7 items-center gap-1 border border-[#C6C6C6] px-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

/* ==========================================================
   FORM PRIMITIVES — matches Users modal style
========================================================== */
const FormInput = ({ label, value, onChange, type = "text", disabled = false, required = false, step }) => (
  <div>
    <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</label>
    <input
      className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B]"
      value={value}
      onChange={onChange}
      type={type}
      step={step}
      disabled={disabled}
      required={required}
    />
  </div>
);

/* ==========================================================
   PART MODAL — Add / Edit, flat sharp-corner form modal
========================================================== */
const emptyForm = {
  part_number: "",
  part_name: "",
  product_category: "",
  source: "",
  customer: "",
  standard_cycle_time: "",
  actual_cycle_time: "",
  status: "Active",
};

const PartModal = ({ mode = "add", part, onClose, onSuccess }) => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && part) {
      setForm({
        part_number: part.part_number || "",
        part_name: part.part_name || "",
        product_category: part.product_category || "",
        source: part.source || "",
        customer: part.customer || "",
        standard_cycle_time: part.standard_cycle_time ?? "",
        actual_cycle_time: part.actual_cycle_time ?? "",
        status: part.status || "Active",
      });
    } else {
      setForm(emptyForm);
    }
  }, [mode, part]);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.part_number ||
      !form.part_name ||
      !form.product_category ||
      !form.source ||
      !form.customer ||
      !form.standard_cycle_time
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      if (mode === "edit" && part) {
        await updatePart(part.id, form);
      } else {
        await addPart(form);
      }
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg border border-[#C6C6C6] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
          <div className="leading-tight">
            <h2 className="text-[13px] font-extrabold text-[#0F1D24]">{mode === "edit" ? "Edit Part" : "Add New Part"}</h2>
            <p className="text-[9.5px] font-medium text-[#9B9B9B]">Manage parts master</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#0F1D24] hover:bg-[#F5F5F5]">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FormInput label="Part Number *" value={form.part_number} onChange={handleChange("part_number")} disabled={mode === "edit"} required />
            <FormInput label="Part Name *" value={form.part_name} onChange={handleChange("part_name")} required />
            <FormInput label="Category *" value={form.product_category} onChange={handleChange("product_category")} required />
            <FormInput label="Source *" value={form.source} onChange={handleChange("source")} required />
            <FormInput label="Customer *" value={form.customer} onChange={handleChange("customer")} required />

            <div>
              <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Status</label>
              <select
                className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24]"
                value={form.status}
                onChange={handleChange("status")}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <FormInput
              label="Standard Cycle Time (sec) *"
              type="number"
              step="0.1"
              value={form.standard_cycle_time}
              onChange={handleChange("standard_cycle_time")}
              required
            />
            <FormInput
              label="Actual Cycle Time (sec)"
              type="number"
              step="0.1"
              value={form.actual_cycle_time}
              onChange={handleChange("actual_cycle_time")}
            />
          </div>

          {error && <p className="mt-2 text-[10.5px] font-bold text-red-600">{error}</p>}

          <div className="mt-3 flex justify-end gap-2 border-t border-[#C6C6C6] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#C6C6C6] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: GOLD, borderColor: GOLD }}
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {mode === "edit" ? "Save Changes" : "Add Part"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================
   PART VIEW MODAL — flat detail view
========================================================== */
const ViewField = ({ label, value, mono }) => (
  <div className="border border-[#C6C6C6] bg-[#F9F9F9] px-2.5 py-1.5">
    <p className="text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
    <p className={`text-[11px] font-semibold text-[#0F1D24] ${mono ? "font-mono" : ""}`}>{value || "-"}</p>
  </div>
);

const PartViewModal = ({ part, onClose, onEdit }) => {
  if (!part) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg border border-[#C6C6C6] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-[13px] font-extrabold text-[#0F1D24]">{part.part_number}</h2>
            <PartStatusBadge status={part.status} />
          </div>
          <button onClick={onClose} className="p-1.5 text-[#0F1D24] hover:bg-[#F5F5F5]">
            <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3">
          <ViewField label="Part Name" value={part.part_name} />
          <ViewField label="Category" value={part.product_category} />
          <ViewField label="Source" value={part.source} />
          <ViewField label="Customer" value={part.customer} />
          <ViewField label="Standard Cycle Time" value={part.standard_cycle_time ? `${part.standard_cycle_time} sec` : null} mono />
          <ViewField label="Actual Cycle Time" value={part.actual_cycle_time ? `${part.actual_cycle_time} sec` : null} mono />
        </div>

        <div className="flex justify-end gap-2 border-t border-[#C6C6C6] px-3 py-2.5">
          <button onClick={onClose} className="border border-[#C6C6C6] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5]">
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90"
            style={{ background: GOLD, borderColor: GOLD }}
          >
            <Pencil size={12} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================
   DELETE CONFIRM MODAL — flat confirm dialog
========================================================== */
const DeleteConfirmModal = ({ part, deleting, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-sm border border-[#C6C6C6] bg-white shadow-xl">
      <div className="flex flex-col items-center px-5 py-5 text-center">
        <div className="mb-2.5 flex h-11 w-11 items-center justify-center border border-red-200 bg-red-50">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <h2 className="text-[13px] font-extrabold text-[#0F1D24]">Delete this part?</h2>
        <p className="mt-1 text-[10.5px] font-medium leading-5 text-[#9B9B9B]">
          <span className="font-mono font-bold text-[#0F1D24]">{part?.part_number}</span> — {part?.part_name} will be
          permanently removed. This cannot be undone.
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#C6C6C6] px-4 py-2.5">
        <button
          onClick={onCancel}
          className="border border-[#C6C6C6] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex items-center gap-1.5 border border-red-600 bg-red-600 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting && <Loader2 size={13} className="animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ==========================================================
   PARTS LOADING STATE — flat, compact
========================================================== */
const PartsLoadingState = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 border border-[#C6C6C6] bg-white">
    <Loader2 className="animate-spin text-[#0F1D24]" size={20} />
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">Loading Parts...</p>
  </div>
);

/* ==========================================================
   PARTS PAGE — single screen, no page-level scrollbar
========================================================== */
const PartsPage = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customer, setCustomer] = useState("All");
  const [source, setSource] = useState("All");
  const [status, setStatus] = useState("All");

  const [filterOptions, setFilterOptions] = useState({ categories: [], customers: [], sources: [] });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [activePart, setActivePart] = useState(null);

  const [viewPart, setViewPart] = useState(null);

  const [partToDelete, setPartToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchParts = useCallback(async (targetPage, filters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllParts(targetPage, PAGE_SIZE, filters);

      setParts(response.data || []);
      setTotalCount(response.total ?? response.data?.length ?? 0);
      setTotalPages(response.totalPages || 1);
      setPage(response.page || targetPage);
    } catch (err) {
      console.error("Failed to fetch parts:", err);
      setError("Failed to load parts. Please try again.");
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentFilters = { search, category, customer, source, status };

  useEffect(() => {
    fetchParts(1, {});
    getFilterOptions()
      .then((res) => setFilterOptions(res.data || {}))
      .catch((err) => console.error("Failed to fetch filter options:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchParts(1, { search, category, customer, source, status });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, customer, source, status]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    fetchParts(nextPage, currentFilters);
  };

  const openAddModal = () => {
    setModalMode("add");
    setActivePart(null);
    setModalOpen(true);
  };

  const openEditModal = (part) => {
    setModalMode("edit");
    setActivePart(part);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActivePart(null);
  };

  const handleModalSuccess = () => {
    closeModal();
    fetchParts(page, currentFilters);
  };

  const openViewModal = (part) => setViewPart(part);
  const closeViewModal = () => setViewPart(null);

  const openDeleteModal = (part) => setPartToDelete(part);
  const closeDeleteModal = () => setPartToDelete(null);

  const confirmDelete = async () => {
    if (!partToDelete) return;
    try {
      setDeleting(true);
      await deletePartApi(partToDelete.id);
      const isLastRowOnPage = parts.length === 1 && page > 1;
      closeDeleteModal();
      await fetchParts(isLastRowOnPage ? page - 1 : page, currentFilters);
    } catch (err) {
      console.error("Failed to delete part:", err);
      setError("Failed to delete part. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
          {/* Count / error strip */}
          <div className="flex flex-shrink-0 items-center justify-between border border-[#C6C6C6] bg-white px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="border border-[#C6C6C6] px-2 py-0.5 font-mono text-[11px] font-bold text-[#2563EB]"
                style={{ borderLeft: "3px solid #2563EB" }}
              >
                {totalCount}
              </span>
              <span className="text-[10.5px] font-medium text-[#9B9B9B]">parts match current filters</span>
            </div>
            {error && <span className="text-[10.5px] font-bold text-red-600">{error}</span>}
          </div>

          <PartsFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            customer={customer}
            setCustomer={setCustomer}
            source={source}
            setSource={setSource}
            status={status}
            setStatus={setStatus}
            categories={filterOptions.categories}
            customers={filterOptions.customers}
            sources={filterOptions.sources}
            onAddPart={openAddModal}
          />

          {loading ? (
            <PartsLoadingState />
          ) : (
            <PartsTable parts={parts} onView={openViewModal} onEdit={openEditModal} onDelete={openDeleteModal} />
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPrev={() => goToPage(page - 1)}
            onNext={() => goToPage(page + 1)}
          />
        </main>
      </div>

      {modalOpen && <PartModal mode={modalMode} part={activePart} onClose={closeModal} onSuccess={handleModalSuccess} />}

      {viewPart && (
        <PartViewModal
          part={viewPart}
          onClose={closeViewModal}
          onEdit={() => {
            closeViewModal();
            openEditModal(viewPart);
          }}
        />
      )}

      {partToDelete && (
        <DeleteConfirmModal part={partToDelete} deleting={deleting} onCancel={closeDeleteModal} onConfirm={confirmDelete} />
      )}
    </div>
  );
};

export default PartsPage;