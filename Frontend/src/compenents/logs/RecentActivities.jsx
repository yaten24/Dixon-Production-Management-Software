import React from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const activities = [
  {
    id: 1,
    user: "Yaten Singh",
    activity: "Created Production Entry",
    time: "2 min ago",
    status: "Success",
  },
  {
    id: 2,
    user: "Supervisor",
    activity: "Updated Inspection Result",
    time: "8 min ago",
    status: "Success",
  },
  {
    id: 3,
    user: "Operator-08",
    activity: "Machine Stopped",
    time: "15 min ago",
    status: "Warning",
  },
  {
    id: 4,
    user: "Admin",
    activity: "Deleted Employee",
    time: "26 min ago",
    status: "Failed",
  },
  {
    id: 5,
    user: "Planner",
    activity: "Generated Daily Report",
    time: "39 min ago",
    status: "Success",
  },
];

const getStatus = (status) => {
  switch (status) {
    case "Success":
      return {
        icon: <FaCheckCircle />,
        dot: "bg-green-500",
        text: "text-green-600 dark:text-green-400",
      };

    case "Warning":
      return {
        icon: <FaExclamationTriangle />,
        dot: "bg-yellow-500",
        text: "text-yellow-600 dark:text-yellow-400",
      };

    default:
      return {
        icon: <FaTimesCircle />,
        dot: "bg-red-500",
        text: "text-red-600 dark:text-red-400",
      };
  }
};

const RecentActivities = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Header */}

      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Recent Activities
            </h2>

            <p className="text-sm text-slate-500 mt-1">Latest system events</p>
          </div>

          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <FaClock />
          </div>
        </div>
      </div>

      {/* Activity List */}

      <div className="max-h-[520px] overflow-y-auto">
        {activities.map((item, index) => {
          const status = getStatus(item.status);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              whileHover={{
                x: 4,
              }}
              className="border-b border-slate-100 dark:border-slate-800 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
            >
              <div className="p-5 flex items-start gap-4">
                {/* Avatar */}

                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    {item.user.charAt(0)}
                  </div>

                  <div
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${status.dot}`}
                  />
                </div>

                {/* Content */}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                      {item.user}
                    </h3>

                    <div
                      className={`flex items-center gap-1 text-sm ${status.text}`}
                    >
                      {status.icon}
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-6">
                    {item.activity}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                      <FaClock />

                      {item.time}
                    </span>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        item.status === "Success"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : item.status === "Warning"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}

      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold transition">
          View All Activities
        </button>
      </div>
    </motion.div>
  );
};

export default RecentActivities;
