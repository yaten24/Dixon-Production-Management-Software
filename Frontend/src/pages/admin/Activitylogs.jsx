// pages/ActivityLogs.jsx
import { useEffect, useState, useCallback } from "react";
import {
  FaHistory,
  FaFileExport,
  FaSearch,
  FaLayerGroup,
  FaBolt,
  FaUser,
  FaHashtag,
  FaCalendarAlt,
  FaGlobe,
  FaFilter,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaPen,
  FaTrash,
  FaEye,
  FaSignInAlt,
  FaSignOutAlt,
  FaFileImport,
} from "react-icons/fa";
import Sidebar from "./Sidebar";

// Set this to your API base URL (or read from an env var in your build setup)
const API_BASE = "http://localhost:5000/api";

// ============================================================
// THEME TOKENS — kept consistent with AdminDashboard / Sidebar / Users / Machines / Parts / Employees
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";
const MUTED = "#9B9B9B";

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "VIEW",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
  "IMPORT",
];

const EMPTY_FILTERS = {
  user_id: "",
  module: "",
  action: "",
  record_id: "",
  search: "",
  date_from: "",
  date_to: "",
};

// Flat bordered chip + dot + icon per action
const ACTION_STYLES = {
  CREATE: { color: "text-green-700", dot: "bg-green-500", icon: FaPlus },
  UPDATE: { color: "text-amber-700", dot: "bg-amber-500", icon: FaPen },
  DELETE: { color: "text-red-700", dot: "bg-red-500", icon: FaTrash },
  VIEW: { color: "text-blue-700", dot: "bg-blue-500", icon: FaEye },
  LOGIN: { color: "text-cyan-700", dot: "bg-cyan-500", icon: FaSignInAlt },
  LOGOUT: { color: "text-[#0F1D24]/70", dot: "bg-gray-500", icon: FaSignOutAlt },
  EXPORT: { color: "text-violet-700", dot: "bg-violet-500", icon: FaFileExport },
  IMPORT: { color: "text-teal-700", dot: "bg-teal-500", icon: FaFileImport },
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const inputClass =
  "h-8 w-full border border-[#C6C6C6] pl-8 pr-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24]";

const labelClass = "text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]";

function FieldIcon({ Icon }) {
  return (
    <Icon
      size={11}
      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]"
    />
  );
}

const ActionBadge = ({ action }) => {
  const style = ACTION_STYLES[action] || ACTION_STYLES.VIEW;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${style.color}`}>
      <span className={`h-1.5 w-1.5 flex-shrink-0 ${style.dot}`} />
      <Icon size={9} />
      {action}
    </span>
  );
};

export default function ActivityLogs() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [modules, setModules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });
  const [sort, setSort] = useState({
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/activity-logs/meta/modules`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setModules(json.data);
      })
      .catch(() => {});
  }, []);

  const fetchLogs = useCallback(
    (page = 1) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("page", page);
      params.append("limit", pagination.limit);
      params.append("sort_by", sort.sort_by);
      params.append("sort_order", sort.sort_order);

      fetch(`${API_BASE}/activity-logs?${params.toString()}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setLogs(json.data);
            setPagination(json.pagination);
          } else {
            setError(json.message || "Failed to load logs");
          }
        })
        .catch(() => setError("Could not reach the server"))
        .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [appliedFilters, sort, pagination.limit],
  );

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, sort]);

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  const toggleSort = (column) => {
    setSort((s) => ({
      sort_by: column,
      sort_order:
        s.sort_by === column && s.sort_order === "desc" ? "asc" : "desc",
    }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.total_pages) return;
    fetchLogs(page);
  };

  const sortArrow = (column) =>
    sort.sort_by === column ? (sort.sort_order === "desc" ? " ↓" : " ↑") : "";

  const csvEscape = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("page", 1);
      params.append("limit", 5000);
      params.append("sort_by", sort.sort_by);
      params.append("sort_order", sort.sort_order);

      const res = await fetch(`${API_BASE}/activity-logs?${params.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "Failed to export logs");
        return;
      }

      const columns = [
        "id",
        "created_at",
        "user_id",
        "user_name",
        "user_email",
        "module",
        "action",
        "record_id",
        "description",
        "ip_address",
        "device_info",
      ];
      const rows = json.data.map((log) =>
        columns.map((col) => csvEscape(log[col])).join(","),
      );
      const csv = [columns.join(","), ...rows].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      link.href = url;
      link.download = `activity-logs-${stamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Could not export logs");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
          {/* TOP BAR: title, record count, export */}
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="flex items-center gap-2 text-[13px] font-extrabold text-[#0F1D24]">
              <div className="flex h-7 w-7 items-center justify-center border" style={{ background: GOLD, borderColor: GOLD }}>
                <FaHistory size={12} className="text-[#0F1D24]" />
              </div>
              Activity Log
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-[#C6C6C6] bg-white px-3 py-1 font-mono text-[10.5px] font-bold text-[#0F1D24]">
                <FaLayerGroup size={9} className="text-[#9B9B9B]" />
                {pagination.total.toLocaleString("en-IN")} records
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 border border-green-600 bg-white px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaFileExport size={11} />
                {exporting ? "Exporting…" : "Export Report"}
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <form onSubmit={applyFilters} className="flex-shrink-0 border border-[#C6C6C6] bg-white px-3 py-2.5">
            <div className="mb-2 flex items-center gap-1.5 text-[#9B9B9B]">
              <FaFilter size={10} />
              <span className="text-[9.5px] font-bold uppercase tracking-wide">Filters</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="flex flex-col gap-0.5">
                <label htmlFor="f-search" className={labelClass}>Search</label>
                <div className="relative">
                  <FieldIcon Icon={FaSearch} />
                  <input
                    id="f-search"
                    type="text"
                    placeholder="Description, IP, device…"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label htmlFor="f-module" className={labelClass}>Module</label>
                <div className="relative">
                  <FieldIcon Icon={FaLayerGroup} />
                  <select
                    id="f-module"
                    value={filters.module}
                    onChange={(e) => handleFilterChange("module", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">All modules</option>
                    {modules.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label htmlFor="f-action" className={labelClass}>Action</label>
                <div className="relative">
                  <FieldIcon Icon={FaBolt} />
                  <select
                    id="f-action"
                    value={filters.action}
                    onChange={(e) => handleFilterChange("action", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">All actions</option>
                    {ACTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label htmlFor="f-user" className={labelClass}>User ID</label>
                <div className="relative">
                  <FieldIcon Icon={FaUser} />
                  <input
                    id="f-user"
                    type="number"
                    placeholder="e.g. 12"
                    value={filters.user_id}
                    onChange={(e) => handleFilterChange("user_id", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label htmlFor="f-record" className={labelClass}>Record ID</label>
                <div className="relative">
                  <FieldIcon Icon={FaHashtag} />
                  <input
                    id="f-record"
                    type="number"
                    placeholder="e.g. 4531"
                    value={filters.record_id}
                    onChange={(e) => handleFilterChange("record_id", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label htmlFor="f-from" className={labelClass}>From</label>
                <div className="relative">
                  <FieldIcon Icon={FaCalendarAlt} />
                  <input
                    id="f-from"
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange("date_from", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label htmlFor="f-to" className={labelClass}>To</label>
                <div className="relative">
                  <FieldIcon Icon={FaCalendarAlt} />
                  <input
                    id="f-to"
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange("date_to", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-end gap-1.5">
                <button
                  type="submit"
                  className="flex h-8 items-center gap-1.5 border px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90"
                  style={{ background: GOLD, borderColor: GOLD }}
                >
                  <FaFilter size={10} />
                  Apply
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex h-8 items-center gap-1.5 border border-[#C6C6C6] px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5]"
                >
                  <FaTimes size={10} />
                  Clear
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="flex-shrink-0 border border-red-200 bg-red-50 px-3 py-1.5 text-[10.5px] font-bold text-red-600">
              {error}
            </div>
          )}

          {/* TABLE — scrolls internally, page itself never scrolls */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[#C6C6C6] bg-white">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="min-w-full text-[11px]">
                <thead className="sticky top-0 z-10 border-b border-[#C6C6C6] bg-[#F5F5F5]">
                  <tr>
                    <th
                      onClick={() => toggleSort("created_at")}
                      className="cursor-pointer select-none whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#EFEFEF]"
                    >
                      Time{sortArrow("created_at")}
                    </th>
                    <th
                      onClick={() => toggleSort("user_id")}
                      className="cursor-pointer select-none whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#EFEFEF]"
                    >
                      User{sortArrow("user_id")}
                    </th>
                    <th
                      onClick={() => toggleSort("module")}
                      className="cursor-pointer select-none whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#EFEFEF]"
                    >
                      Module{sortArrow("module")}
                    </th>
                    <th
                      onClick={() => toggleSort("action")}
                      className="cursor-pointer select-none whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#EFEFEF]"
                    >
                      Action{sortArrow("action")}
                    </th>
                    <th className="whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
                      Record
                    </th>
                    <th className="whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
                      Description
                    </th>
                    <th className="whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
                      <span className="inline-flex items-center gap-1">
                        <FaGlobe size={9} /> IP Address
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                        No activity found for these filters.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    logs.map((log, i) => (
                      <tr
                        key={log.id}
                        className={`border-b border-[#C6C6C6]/60 transition-colors hover:bg-[#FDF6E3] ${
                          i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                        }`}
                      >
                        <td className="whitespace-nowrap px-2 py-1.5 align-top font-mono text-[10.5px] text-[#9B9B9B]">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-2 py-1.5 align-top">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#C6C6C6] bg-[#F9F9F9] text-[#9B9B9B]">
                              <FaUser size={9} />
                            </div>
                            <div className="leading-tight">
                              <div className="text-[11px] font-semibold text-[#0F1D24]">
                                {log.user_name || `User #${log.user_id}`}
                              </div>
                              {log.user_email && (
                                <div className="text-[9.5px] text-[#9B9B9B]">{log.user_email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 align-top text-[#0F1D24]/75">{log.module}</td>
                        <td className="px-2 py-1.5 align-top">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-2 py-1.5 align-top font-mono text-[10.5px] text-[#9B9B9B]">
                          {log.record_id ?? "—"}
                        </td>
                        <td className="max-w-xs px-2 py-1.5 align-top text-[#0F1D24]/75">
                          {log.description || "—"}
                        </td>
                        <td className="px-2 py-1.5 align-top font-mono text-[10.5px] text-[#9B9B9B]">
                          {log.ip_address || "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-shrink-0 items-center justify-center gap-3 border border-[#C6C6C6] bg-white px-3 py-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
              className="flex items-center gap-1.5 border border-[#C6C6C6] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft size={9} />
              Prev
            </button>
            <span className="font-mono text-[10.5px] font-bold text-[#0F1D24]">
              Page {pagination.page} of {pagination.total_pages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => goToPage(pagination.page + 1)}
              className="flex items-center gap-1.5 border border-[#C6C6C6] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FaChevronRight size={9} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}