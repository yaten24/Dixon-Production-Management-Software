import React from "react";
import { motion } from "framer-motion";
import {
  FaClipboardList,
  FaCalendarDay,
  FaUsers,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBug,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

const stats = [
  {
    title: "Total Logs",
    value: "12,548",
    change: "+18%",
    trend: "up",
    icon: <FaClipboardList />,
    color: "from-blue-500 to-indigo-600",
    progress: 92,
  },
  {
    title: "Today's Activities",
    value: "284",
    change: "+9%",
    trend: "up",
    icon: <FaCalendarDay />,
    color: "from-emerald-500 to-green-600",
    progress: 74,
  },
  {
    title: "Active Users",
    value: "42",
    change: "+5%",
    trend: "up",
    icon: <FaUsers />,
    color: "from-cyan-500 to-sky-600",
    progress: 66,
  },
  {
    title: "Failed Logins",
    value: "03",
    change: "-12%",
    trend: "down",
    icon: <FaExclamationTriangle />,
    color: "from-orange-500 to-red-500",
    progress: 18,
  },
  {
    title: "Critical Actions",
    value: "15",
    change: "+2%",
    trend: "up",
    icon: <FaShieldAlt />,
    color: "from-violet-500 to-fuchsia-600",
    progress: 34,
  },
  {
    title: "System Errors",
    value: "02",
    change: "-6%",
    trend: "down",
    icon: <FaBug />,
    color: "from-red-500 to-pink-600",
    progress: 12,
  },
];

const LogStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-5">
      {stats.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.08,
          }}
          whileHover={{
            y: -5,
            transition: { duration: 0.2 },
          }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
        >
          {/* Background Glow */}

          <div
            className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-20 bg-gradient-to-r ${item.color}`}
          />

          <div className="relative p-5">
            {/* Top */}

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                  {item.value}
                </h2>
              </div>

              <div
                className={`h-14 w-14 rounded-xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center text-2xl shadow-lg`}
              >
                {item.icon}
              </div>
            </div>

            {/* Trend */}

            <div className="mt-5 flex items-center justify-between">
              <div
                className={`flex items-center gap-2 text-sm font-semibold ${
                  item.trend === "up" ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.trend === "up" ? <FaArrowUp /> : <FaArrowDown />}

                {item.change}
              </div>

              <span className="text-xs text-slate-400">vs yesterday</span>
            </div>

            {/* Progress */}

            <div className="mt-5">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{
                    duration: 1,
                    delay: index * 0.15,
                  }}
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Progress</span>

                <span>{item.progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LogStats;
