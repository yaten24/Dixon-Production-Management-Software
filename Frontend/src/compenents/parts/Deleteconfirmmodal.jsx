import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

const DeleteConfirmModal = ({ part, deleting, onCancel, onConfirm }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-sm border border-[#E2E4E9] bg-white shadow-lg"
        >
          <div className="flex flex-col items-center px-5 py-5 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              Delete this part?
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-mono font-semibold">
                {part?.part_number}
              </span>{" "}
              — {part?.part_name} will be permanently removed. This cannot be
              undone.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E2E4E9] px-4 py-2.5">
            <button
              onClick={onCancel}
              className="h-8 rounded-sm border border-[#E2E4E9] px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex h-8 items-center gap-1.5 rounded-sm bg-red-600 px-3.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting && <Loader2 size={13} className="animate-spin" />}
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;