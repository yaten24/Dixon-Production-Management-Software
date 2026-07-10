import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaEye,
  FaSort,
} from "react-icons/fa";

/* ============================================================
    DEMO DATA
============================================================ */

const logsData = [
  {
    id: 1,
    time: "09:10 AM",
    date: "29 Jun 2026",
    user: "Yaten Singh",
    department: "Production",
    module: "Production",
    action: "Created",
    description: "Created production entry for Hall-4 SMT Line.",
    hall: "Hall-4",
    machine: "SMT-05",
    device: "Windows",
    browser: "Chrome",
    ip: "192.168.0.11",
    status: "Success",
  },
  {
    id: 2,
    time: "09:42 AM",
    date: "29 Jun 2026",
    user: "Admin",
    department: "HR",
    module: "Employees",
    action: "Updated",
    description: "Updated employee shift.",
    hall: "Hall-2",
    machine: "-",
    device: "Windows",
    browser: "Edge",
    ip: "192.168.0.20",
    status: "Success",
  },
  {
    id: 3,
    time: "10:18 AM",
    date: "29 Jun 2026",
    user: "Operator-08",
    department: "Production",
    module: "Machine",
    action: "Stopped",
    description: "Machine stopped because of material shortage.",
    hall: "Hall-4",
    machine: "SMT-12",
    device: "Android",
    browser: "Chrome",
    ip: "192.168.0.61",
    status: "Warning",
  },
  {
    id: 4,
    time: "11:05 AM",
    date: "29 Jun 2026",
    user: "Supervisor",
    department: "Quality",
    module: "Inspection",
    action: "Rejected",
    description: "Rejected production batch.",
    hall: "Hall-3",
    machine: "AOI-03",
    device: "Windows",
    browser: "Chrome",
    ip: "192.168.0.71",
    status: "Failed",
  },
];

/* ============================================================
    STATUS BADGE
============================================================ */

const StatusBadge = ({ status }) => {
  const styles = {
    Success:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",

    Warning:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",

    Failed: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };

  const icons = {
    Success: <FaCheckCircle size={12} />,
    Warning: <FaExclamationTriangle size={12} />,
    Failed: <FaTimesCircle size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || styles.Success
      }`}
    >
      {icons[status]}
      {status}
    </span>
  );
};

/* ============================================================
    ACTION BADGE
============================================================ */

const ActionBadge = ({ action }) => {
  const colors = {
    Created: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",

    Updated:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",

    Deleted: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",

    Stopped:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",

    Rejected:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[action] ||
        "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
      }`}
    >
      {action}
    </span>
  );
};

/* ============================================================
    COMPONENT
============================================================ */

const LogsTable = ({ onView }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortField, setSortField] = useState("time");
  const [sortDirection, setSortDirection] = useState("asc");

  const sortedLogs = useMemo(() => {
    const data = [...logsData];

    data.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;

      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;

      return 0;
    });

    return data;
  }, [sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Header */}

      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Activity Logs
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showing {sortedLogs.length} activity records.
          </p>
        </div>

        <div className="text-sm font-medium text-blue-600">
          Selected : {selectedRows.length}
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* TABLE HEADER STARTS IN PART 4.2 */}
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {/* Checkbox */}

              <th className="px-5 py-4 w-12 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              {/* Time */}

              <th
                onClick={() => handleSort("time")}
                className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  Time
                  <FaSort className="text-xs opacity-60" />
                </div>
              </th>

              {/* User */}

              <th
                onClick={() => handleSort("user")}
                className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  User
                  <FaSort className="text-xs opacity-60" />
                </div>
              </th>

              {/* Department */}

              <th
                onClick={() => handleSort("department")}
                className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  Department
                  <FaSort className="text-xs opacity-60" />
                </div>
              </th>

              {/* Module */}

              <th
                onClick={() => handleSort("module")}
                className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  Module
                  <FaSort className="text-xs opacity-60" />
                </div>
              </th>

              {/* Action */}

              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                Action
              </th>

              {/* Hall */}

              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                Hall
              </th>

              {/* Machine */}

              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                Machine
              </th>

              {/* Status */}

              <th
                onClick={() => handleSort("status")}
                className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  Status
                  <FaSort className="text-xs opacity-60" />
                </div>
              </th>

              {/* Device */}

              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                Device
              </th>

              {/* Browser */}

              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                Browser
              </th>

              {/* IP */}

              <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                IP Address
              </th>

              {/* Actions */}

              <th className="px-5 py-4 text-center font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                View
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {sortedLogs.map((log, index) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.04,
                }}
                whileHover={{
                  backgroundColor: "rgba(59,130,246,0.05)",
                }}
                className="transition-colors"
              >
                {/* Checkbox */}

                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(log.id)}
                    onChange={() => toggleRow(log.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                </td>

                {/* Time */}

                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="font-semibold text-slate-800 dark:text-white">
                    {log.time}
                  </div>

                  <div className="text-xs text-slate-500">{log.date}</div>
                </td>

                {/* User */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
                      {log.user.charAt(0)}
                    </div>

                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {log.user}
                      </div>

                      <div className="text-xs text-slate-500">
                        {log.department}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Department */}

                <td className="px-5 py-4">
                  <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    {log.department}
                  </span>
                </td>

                {/* Module */}

                <td className="px-5 py-4">
                  <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                    {log.module}
                  </span>
                </td>

                {/* Action */}

                <td className="px-5 py-4">
                  <ActionBadge action={log.action} />
                </td>

                {/* Hall */}

                <td className="px-5 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                  {log.hall}
                </td>

                {/* Machine */}

                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="font-medium text-slate-800 dark:text-white">
                    {log.machine}
                  </span>
                </td>

                {/* Status */}

                <td className="px-5 py-4">
                  <StatusBadge status={log.status} />
                </td>

                {/* Device */}

                <td className="px-5 py-4">
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    {log.device}
                  </span>
                </td>

                {/* Browser */}

                <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                  {log.browser}
                </td>

                {/* IP */}

                <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {log.ip}
                </td>

                {/* View */}

                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => onView(log)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <FaEye />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}

      <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left */}

          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing
              <span className="mx-1 font-semibold text-slate-700 dark:text-slate-200">
                1
              </span>
              -
              <span className="mx-1 font-semibold text-slate-700 dark:text-slate-200">
                {sortedLogs.length}
              </span>
              of
              <span className="mx-1 font-semibold text-slate-700 dark:text-slate-200">
                {sortedLogs.length}
              </span>
              logs
            </p>

            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                  {selectedRows.length} Selected
                </span>

                <button
                  onClick={() => setSelectedRows([])}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              Previous
            </button>

            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                className={`h-10 w-10 rounded-lg transition font-semibold ${
                  page === 1
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {page}
              </button>
            ))}

            <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LogsTable;
