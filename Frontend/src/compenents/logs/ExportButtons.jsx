import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDownload,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaSyncAlt,
  FaChevronDown,
} from "react-icons/fa";

const ExportButtons = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = (type) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOpen(false);

      console.log(`Export ${type}`);
      // TODO:
      // connect backend
      // download file
    }, 1000);
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Refresh */}

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center"
      >
        <FaSyncAlt />
      </motion.button>

      {/* Export */}

      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-semibold transition"
        >
          <FaDownload />
          Export
          <FaChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="absolute right-0 mt-3 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden z-50"
            >
              <button
                onClick={() => handleExport("csv")}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <FaFileCsv className="text-green-600" />
                Export CSV
              </button>

              <button
                onClick={() => handleExport("excel")}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <FaFileExcel className="text-emerald-600" />
                Export Excel
              </button>

              <button
                onClick={() => handleExport("pdf")}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <FaFilePdf className="text-red-600" />
                Export PDF
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading */}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[999]"
        >
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl text-center">
            <div className="h-14 w-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />

            <h3 className="mt-5 text-lg font-semibold">Exporting...</h3>

            <p className="text-sm text-slate-500 mt-2">
              Please wait while your report is being generated.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExportButtons;
