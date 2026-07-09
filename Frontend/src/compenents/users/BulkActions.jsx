import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiLock, FiUnlock, FiDownload, FiX } from "react-icons/fi";

const BulkActions = ({
  selectedUsers = [],
  onDelete,
  onLock,
  onUnlock,
  onExport,
  onClearSelection,
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="rounded border border-blue-200 bg-blue-50 p-2"
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-xs font-semibold text-white">
                {selectedUsers.length}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-800 leading-tight">
                  {selectedUsers.length} User
                  {selectedUsers.length > 1 ? "s" : ""} Selected
                </h3>

                <p className="text-[10px] text-slate-500 leading-tight">
                  Choose an action for selected users.
                </p>
              </div>
            </div>

            {/* Right */}

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={onLock}
                disabled={loading}
                className="flex items-center gap-1.5 rounded bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiLock size={12} />
                Lock
              </button>

              <button
                onClick={onUnlock}
                disabled={loading}
                className="flex items-center gap-1.5 rounded bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiUnlock size={12} />
                Unlock
              </button>

              <button
                onClick={onExport}
                disabled={loading}
                className="flex items-center gap-1.5 rounded bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiDownload size={12} />
                Export
              </button>

              <button
                onClick={onDelete}
                disabled={loading}
                className="flex items-center gap-1.5 rounded bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiTrash2 size={12} />
                Delete
              </button>

              <button
                onClick={onClearSelection}
                disabled={loading}
                className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiX size={12} />
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActions;
