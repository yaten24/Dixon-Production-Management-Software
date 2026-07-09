import React, { useState } from "react";
import { motion } from "framer-motion";

import { FaTable, FaStream, FaHistory } from "react-icons/fa";
import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";
import ExportButtons from "../compenents/logs/ExportButtons";
import LogStats from "../compenents/logs/LogStats";
import LogFilters from "../compenents/logs/LogFilters";
import LogsTable from "../compenents/logs/LogsTable";
import LogTimeline from "../compenents/logs/LogTimeline";
import RecentActivities from "../compenents/logs/RecentActivities";
import ActivityChart from "../compenents/logs/ActivityChart";
import HourlyChart from "../compenents/logs/HourlyChart";
import UserActivityChart from "../compenents/logs/UserActivityChart";
import LogDetailsDrawer from "../compenents/logs/LogDetailsDrawer";

const Logs = () => {
  const [viewMode, setViewMode] = useState("table");
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (log) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <div className="flex flex-col flex-1 mt-12 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="p-2 xl:p-8 space-y-6"
          >
            {/* =======================================================
                    PAGE HEADER
            ======================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <FaHistory size={22} />
                  </div>
                  Activity Logs
                </h1>

                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Monitor every activity performed inside the Production
                  Management System.
                </p>
              </div>

              <ExportButtons />
            </div>

            {/* =======================================================
                    STATS
            ======================================================== */}

            <LogStats />

            {/* =======================================================
                    FILTERS
            ======================================================== */}

            <LogFilters />

            {/* =======================================================
                    VIEW SWITCH
            ======================================================== */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Activity History
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View all audit records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <FaTable />
                  Table
                </button>

                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    viewMode === "timeline"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <FaStream />
                  Timeline
                </button>
              </div>
            </div>

            {/* =======================================================
                    MAIN GRID
            ======================================================== */}

            <div className="grid grid-cols-12 gap-6">
              {/* LEFT */}

              <div className="col-span-12 xl:col-span-9 space-y-6">
                {viewMode === "table" ? (
                  <LogsTable onView={openDrawer} />
                ) : (
                  <LogTimeline onView={openDrawer} />
                )}
              </div>

              {/* RIGHT */}

              <div className="col-span-12 xl:col-span-3 space-y-6">
                <RecentActivities />

                <ActivityChart />

                <HourlyChart />

                <UserActivityChart />
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* =======================================================
              DETAILS DRAWER
      ======================================================== */}

      <LogDetailsDrawer
        open={drawerOpen}
        log={selectedLog}
        onClose={closeDrawer}
      />
    </div>
  );
};

export default Logs;
