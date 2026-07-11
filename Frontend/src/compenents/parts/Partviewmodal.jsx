import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil } from "lucide-react";

import PartStatusBadge from "./PartStatusBadge";

const Field = ({ label, value, mono }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-400">{label}</p>
    <p className={`text-xs font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

const PartViewModal = ({ part, onClose, onEdit }) => {
  if (!part) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-sm border border-[#E2E4E9] bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-[#E2E4E9] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800 font-mono">
                {part.part_number}
              </h2>
              <PartStatusBadge status={part.status} />
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 py-4">
            <Field label="Part Name" value={part.part_name} />
            <Field label="Category" value={part.product_category} />
            <Field label="Source" value={part.source} />
            <Field label="Customer" value={part.customer} />
            <Field
              label="Standard Cycle Time"
              value={part.standard_cycle_time ? `${part.standard_cycle_time} sec` : null}
              mono
            />
            <Field
              label="Actual Cycle Time"
              value={part.actual_cycle_time ? `${part.actual_cycle_time} sec` : null}
              mono
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E2E4E9] px-4 py-2.5">
            <button
              onClick={onClose}
              className="h-8 rounded-sm border border-[#E2E4E9] px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex h-8 items-center gap-1.5 rounded-sm bg-[#2563EB] px-3.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PartViewModal;