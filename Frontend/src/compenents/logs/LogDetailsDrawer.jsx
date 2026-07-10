import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaClipboardList,
  FaUser,
  FaBuilding,
  FaMicrochip,
  FaDesktop,
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-800 dark:text-white break-words">
        {value || "-"}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Success:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",

    Warning:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",

    Failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
        colors[status] || colors.Success
      }`}
    >
      <FaCheckCircle size={12} />

      {status}
    </span>
  );
};

const LogDetailsDrawer = ({ open, log, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 220,
            }}
            className="fixed right-0 top-0 z-50 h-screen w-full sm:w-[520px] xl:w-[620px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            {/* Header */}

            <div className="border-b border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
                    <FaClipboardList />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                      Activity Details
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Complete audit trail information
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Body */}

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Activity Status</p>

                  <div className="mt-2">
                    <StatusBadge status={log?.status} />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Activity ID</p>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    LOG-{log?.id || "0000"}
                  </h3>
                </div>
              </div>

              {/* Basic Information */}

              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <DetailItem
                    icon={<FaUser />}
                    label="User"
                    value={log?.user}
                  />

                  <DetailItem
                    icon={<FaBuilding />}
                    label="Department"
                    value={log?.department}
                  />

                  <DetailItem
                    icon={<FaClipboardList />}
                    label="Module"
                    value={log?.module}
                  />

                  <DetailItem
                    icon={<FaCalendarAlt />}
                    label="Date & Time"
                    value={`${log?.date || "-"} ${log?.time || ""}`}
                  />
                </div>
              </div>
              {/* Machine Information */}

              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Production Information
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <DetailItem
                    icon={<FaMicrochip />}
                    label="Machine"
                    value={log?.machine}
                  />

                  <DetailItem
                    icon={<FaBuilding />}
                    label="Hall"
                    value={log?.hall}
                  />

                  <DetailItem
                    icon={<FaClipboardList />}
                    label="Action"
                    value={log?.action}
                  />

                  <DetailItem
                    icon={<FaClipboardList />}
                    label="Description"
                    value={log?.description}
                  />
                </div>
              </div>

              {/* Device Information */}

              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Device Information
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <DetailItem
                    icon={<FaDesktop />}
                    label="Device"
                    value={log?.device}
                  />

                  <DetailItem
                    icon={<FaGlobe />}
                    label="Browser"
                    value={log?.browser}
                  />

                  <DetailItem
                    icon={<FaGlobe />}
                    label="IP Address"
                    value={log?.ip}
                  />

                  <DetailItem
                    icon={<FaMapMarkerAlt />}
                    label="Location"
                    value={log?.location || "Dehradun Plant"}
                  />
                </div>
              </div>

              {/* Summary Card */}

              <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                    {log?.user?.charAt(0) || "U"}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {log?.user}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400">
                      {log?.department}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={log?.status} />
                    </div>
                  </div>
                </div>
              </div>
              {/* ======================================================
                    CHANGES
              ======================================================= */}

              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Changes
                </h3>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-5 py-3 text-left">Field</th>

                        <th className="px-5 py-3 text-left">Previous</th>

                        <th className="px-5 py-3 text-left">Current</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-5 py-3 font-medium">Status</td>

                        <td className="px-5 py-3 text-red-500">Pending</td>

                        <td className="px-5 py-3 text-green-600">
                          {log?.status}
                        </td>
                      </tr>

                      <tr className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-5 py-3 font-medium">Machine</td>

                        <td className="px-5 py-3">SMT-01</td>

                        <td className="px-5 py-3">{log?.machine}</td>
                      </tr>

                      <tr className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-5 py-3 font-medium">Hall</td>

                        <td className="px-5 py-3">Hall-1</td>

                        <td className="px-5 py-3">{log?.hall}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ======================================================
                    REMARKS
              ======================================================= */}

              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Remarks
                </h3>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-5">
                  <p className="leading-7 text-slate-600 dark:text-slate-300">
                    {log?.description ||
                      "No remarks available for this activity."}
                  </p>
                </div>
              </div>
            </div>

            {/* ======================================================
                    FOOTER
            ======================================================= */}

            <div className="border-t border-slate-200 dark:border-slate-800 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(JSON.stringify(log, null, 2))
                  }
                  className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Copy Details
                </button>

                <button className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition">
                  Download
                </button>

                <button
                  onClick={onClose}
                  className="py-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogDetailsDrawer;
