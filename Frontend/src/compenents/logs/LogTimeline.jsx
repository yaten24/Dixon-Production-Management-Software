import React from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEye,
  FaClock,
} from "react-icons/fa";

const timelineData = [
  {
    id: 1,
    time: "09:10 AM",
    date: "29 Jun 2026",
    user: "Yaten Singh",
    department: "Production",
    action: "Created",
    module: "Production",
    hall: "Hall-4",
    machine: "SMT-05",
    description: "Created Production Entry",
    status: "Success",
  },
  {
    id: 2,
    time: "09:45 AM",
    date: "29 Jun 2026",
    user: "Supervisor",
    department: "Quality",
    action: "Updated",
    module: "Inspection",
    hall: "Hall-3",
    machine: "AOI-02",
    description: "Updated Inspection Result",
    status: "Success",
  },
  {
    id: 3,
    time: "10:20 AM",
    date: "29 Jun 2026",
    user: "Operator-08",
    department: "Production",
    action: "Stopped",
    module: "Machine",
    hall: "Hall-4",
    machine: "SMT-12",
    description: "Machine Stopped",
    status: "Warning",
  },
  {
    id: 4,
    time: "11:15 AM",
    date: "29 Jun 2026",
    user: "Admin",
    department: "HR",
    action: "Deleted",
    module: "Employees",
    hall: "-",
    machine: "-",
    description: "Deleted Employee Record",
    status: "Failed",
  },
];

const statusColor = (status) => {
  switch (status) {
    case "Success":
      return {
        bg: "bg-green-500",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: <FaCheckCircle />,
      };

    case "Warning":
      return {
        bg: "bg-yellow-500",
        badge:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: <FaExclamationTriangle />,
      };

    default:
      return {
        bg: "bg-red-500",
        badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: <FaTimesCircle />,
      };
  }
};

const LogTimeline = ({ onView }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}

      <div className="border-b border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Activity Timeline
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Chronological view of all activities.
        </p>
      </div>

      <div className="relative p-8">
        {/* Vertical Line */}

        <div className="absolute left-14 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

        {/* Timeline Starts */}
        <div className="space-y-8">
          {timelineData.map((item, index) => {
            const status = statusColor(item.status);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                }}
                className="relative flex gap-6"
              >
                {/* Timeline Dot */}

                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full ${status.bg} text-white shadow-lg flex items-center justify-center`}
                  >
                    {status.icon}
                  </div>

                  {index !== timelineData.length - 1 && (
                    <div className="w-1 flex-1 bg-slate-200 dark:bg-slate-700 mt-2 rounded-full" />
                  )}
                </div>

                {/* Card */}

                <motion.div
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all"
                >
                  {/* Top */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                        {item.user.charAt(0)}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                          {item.user}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {item.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${status.badge}`}
                      >
                        {status.icon}
                        {item.status}
                      </span>

                      <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                        {item.action}
                      </span>
                    </div>
                  </div>

                  {/* Body */}

                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {item.description}
                    </h4>

                    <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-xl bg-slate-100 dark:bg-slate-900 p-4">
                        <p className="text-xs uppercase text-slate-500">
                          Module
                        </p>

                        <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                          {item.module}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 dark:bg-slate-900 p-4">
                        <p className="text-xs uppercase text-slate-500">Hall</p>

                        <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                          {item.hall}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 dark:bg-slate-900 p-4">
                        <p className="text-xs uppercase text-slate-500">
                          Machine
                        </p>

                        <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                          {item.machine}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 dark:bg-slate-900 p-4">
                        <p className="text-xs uppercase text-slate-500">Time</p>

                        <div className="mt-2 flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
                          <FaClock className="text-blue-600" />

                          {item.time}
                        </div>
                      </div>
                    </div>
                    {/* Footer */}

                    <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Activity Date
                        </p>

                        <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                          {item.date}
                        </p>
                      </div>

                      <button
                        onClick={() => onView(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-medium transition-all"
                      >
                        <FaEye />
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogTimeline;
