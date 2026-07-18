// pages/ActivityLogs.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import Sidebar from "../../compenents/dashboard/Sidebar";
import Header from "../../compenents/dashboard/Header";

// Set this to your API base URL (or read from an env var in your build setup)
const API_BASE = "http://localhost:5000/api";

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

// Tailwind classes + icon per action
const ACTION_STYLES = {
  CREATE: {
    badge: "bg-emerald-600",
    border: "border-l-emerald-600",
    icon: FaPlus,
  },
  UPDATE: { badge: "bg-amber-600", border: "border-l-amber-600", icon: FaPen },
  DELETE: { badge: "bg-red-600", border: "border-l-red-600", icon: FaTrash },
  VIEW: { badge: "bg-blue-600", border: "border-l-blue-600", icon: FaEye },
  LOGIN: {
    badge: "bg-cyan-600",
    border: "border-l-cyan-600",
    icon: FaSignInAlt,
  },
  LOGOUT: {
    badge: "bg-slate-500",
    border: "border-l-slate-500",
    icon: FaSignOutAlt,
  },
  EXPORT: {
    badge: "bg-violet-600",
    border: "border-l-violet-600",
    icon: FaFileExport,
  },
  IMPORT: {
    badge: "bg-teal-600",
    border: "border-l-teal-600",
    icon: FaFileImport,
  },
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
  "w-full rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200";

const labelClass =
  "text-[10px] font-semibold uppercase tracking-wide text-slate-500";

const cardClass = "bg-white rounded border border-slate-200 shadow-sm p-3";

const btnMotion = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: { type: "spring", stiffness: 400, damping: 20 },
};

function FieldIcon({ Icon }) {
  return (
    <Icon
      size={11}
      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
    />
  );
}

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

  // Fetch distinct modules once, for the filter dropdown
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

  // Exports all records matching the currently applied filters (not just
  // the current page) as a downloadable CSV.
  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("page", 1);
      params.append("limit", 5000); // export cap — raise via backend if needed
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
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="p-2 space-y-2.5"
          >
            {/* TOP BAR: title, record count, export */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <FaHistory size={12} />
                </div>
                Activity Log
              </h1>

              <div className="flex items-center gap-2">
                <motion.div
                  key={pagination.total}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 rounded shadow-sm px-3 py-1 text-[11px] font-semibold text-slate-600"
                >
                  <FaLayerGroup size={9} className="text-slate-400" />
                  {pagination.total.toLocaleString("en-IN")} records
                </motion.div>

                <motion.button
                  {...btnMotion}
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaFileExport size={11} />
                  {exporting ? "Exporting…" : "Export report"}
                </motion.button>
              </div>
            </motion.div>

            {/* FILTERS */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              onSubmit={applyFilters}
              className={cardClass}
            >
              <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                <FaFilter size={10} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  Filters
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label htmlFor="f-search" className={labelClass}>
                    Search
                  </label>
                  <div className="relative">
                    <FieldIcon Icon={FaSearch} />
                    <input
                      id="f-search"
                      type="text"
                      placeholder="Description, IP, device…"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label htmlFor="f-module" className={labelClass}>
                    Module
                  </label>
                  <div className="relative">
                    <FieldIcon Icon={FaLayerGroup} />
                    <select
                      id="f-module"
                      value={filters.module}
                      onChange={(e) =>
                        handleFilterChange("module", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">All modules</option>
                      {modules.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label htmlFor="f-action" className={labelClass}>
                    Action
                  </label>
                  <div className="relative">
                    <FieldIcon Icon={FaBolt} />
                    <select
                      id="f-action"
                      value={filters.action}
                      onChange={(e) =>
                        handleFilterChange("action", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">All actions</option>
                      {ACTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label htmlFor="f-user" className={labelClass}>
                    User ID
                  </label>
                  <div className="relative">
                    <FieldIcon Icon={FaUser} />
                    <input
                      id="f-user"
                      type="number"
                      placeholder="e.g. 12"
                      value={filters.user_id}
                      onChange={(e) =>
                        handleFilterChange("user_id", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label htmlFor="f-record" className={labelClass}>
                    Record ID
                  </label>
                  <div className="relative">
                    <FieldIcon Icon={FaHashtag} />
                    <input
                      id="f-record"
                      type="number"
                      placeholder="e.g. 4531"
                      value={filters.record_id}
                      onChange={(e) =>
                        handleFilterChange("record_id", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label htmlFor="f-from" className={labelClass}>
                    From
                  </label>
                  <div className="relative">
                    <FieldIcon Icon={FaCalendarAlt} />
                    <input
                      id="f-from"
                      type="date"
                      value={filters.date_from}
                      onChange={(e) =>
                        handleFilterChange("date_from", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label htmlFor="f-to" className={labelClass}>
                    To
                  </label>
                  <div className="relative">
                    <FieldIcon Icon={FaCalendarAlt} />
                    <input
                      id="f-to"
                      type="date"
                      value={filters.date_to}
                      onChange={(e) =>
                        handleFilterChange("date_to", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex items-end gap-1.5">
                  <motion.button
                    {...btnMotion}
                    type="submit"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-200"
                  >
                    <FaFilter size={10} />
                    Apply
                  </motion.button>
                  <motion.button
                    {...btnMotion}
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-200"
                  >
                    <FaTimes size={10} />
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* TABLE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden overflow-x-auto"
            >
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th
                      onClick={() => toggleSort("created_at")}
                      className="text-left px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 cursor-pointer whitespace-nowrap select-none hover:text-slate-800 transition-colors duration-150"
                    >
                      Time{sortArrow("created_at")}
                    </th>
                    <th
                      onClick={() => toggleSort("user_id")}
                      className="text-left px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 cursor-pointer whitespace-nowrap select-none hover:text-slate-800 transition-colors duration-150"
                    >
                      User{sortArrow("user_id")}
                    </th>
                    <th
                      onClick={() => toggleSort("module")}
                      className="text-left px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 cursor-pointer whitespace-nowrap select-none hover:text-slate-800 transition-colors duration-150"
                    >
                      Module{sortArrow("module")}
                    </th>
                    <th
                      onClick={() => toggleSort("action")}
                      className="text-left px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 cursor-pointer whitespace-nowrap select-none hover:text-slate-800 transition-colors duration-150"
                    >
                      Action{sortArrow("action")}
                    </th>
                    <th className="text-left px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Record
                    </th>
                    <th className="text-left px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Description
                    </th>
                    <th className="text-left px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <FaGlobe size={9} /> IP address
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-slate-500"
                      >
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-slate-500"
                      >
                        No activity found for these filters.
                      </td>
                    </tr>
                  )}
                  <AnimatePresence>
                    {!loading &&
                      logs.map((log, i) => {
                        const style =
                          ACTION_STYLES[log.action] || ACTION_STYLES.VIEW;
                        const ActionIcon = style.icon;
                        return (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: Math.min(i * 0.02, 0.3),
                            }}
                            className={`border-l-[3px] ${style.border} border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150`}
                          >
                            <td className="px-2.5 py-1.5 align-top font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {formatDate(log.created_at)}
                            </td>
                            <td className="px-2.5 py-1.5 align-top">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                  <FaUser size={8} />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800 text-xs">
                                    {log.user_name || `User #${log.user_id}`}
                                  </div>
                                  {log.user_email && (
                                    <div className="text-[10px] text-slate-500">
                                      {log.user_email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-2.5 py-1.5 align-top text-slate-700">
                              {log.module}
                            </td>
                            <td className="px-2.5 py-1.5 align-top">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide text-white ${style.badge}`}
                              >
                                <ActionIcon size={8} />
                                {log.action}
                              </span>
                            </td>
                            <td className="px-2.5 py-1.5 align-top font-mono text-[11px] text-slate-500">
                              {log.record_id ?? "—"}
                            </td>
                            <td className="px-2.5 py-1.5 align-top max-w-xs text-slate-700">
                              {log.description || "—"}
                            </td>
                            <td className="px-2.5 py-1.5 align-top font-mono text-[11px] text-slate-500">
                              {log.ip_address || "—"}
                            </td>
                          </motion.tr>
                        );
                      })}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
              <motion.button
                {...btnMotion}
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
                className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-slate-50 transition-colors duration-150"
              >
                <FaChevronLeft size={9} />
                Prev
              </motion.button>
              <span>
                Page {pagination.page} of {pagination.total_pages || 1}
              </span>
              <motion.button
                {...btnMotion}
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => goToPage(pagination.page + 1)}
                className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-slate-50 transition-colors duration-150"
              >
                Next
                <FaChevronRight size={9} />
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
