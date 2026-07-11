import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

import { addPart, updatePart } from "../../api/partApi";

const emptyForm = {
  part_number: "",
  part_name: "",
  product_category: "",
  source: "",
  customer: "",
  standard_cycle_time: "",
  actual_cycle_time: "",
  status: "Active",
};

const PartModal = ({ mode = "add", part, onClose, onSuccess }) => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && part) {
      setForm({
        part_number: part.part_number || "",
        part_name: part.part_name || "",
        product_category: part.product_category || "",
        source: part.source || "",
        customer: part.customer || "",
        standard_cycle_time: part.standard_cycle_time ?? "",
        actual_cycle_time: part.actual_cycle_time ?? "",
        status: part.status || "Active",
      });
    } else {
      setForm(emptyForm);
    }
  }, [mode, part]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.part_number ||
      !form.part_name ||
      !form.product_category ||
      !form.source ||
      !form.customer ||
      !form.standard_cycle_time
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "edit" && part) {
        await updatePart(part.id, form);
      } else {
        await addPart(form);
      }

      onSuccess?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400";
  const labelClass = "text-[11px] font-medium text-slate-500 mb-1 block";

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
            <h2 className="text-sm font-semibold text-slate-800">
              {mode === "edit" ? "Edit Part" : "Add New Part"}
            </h2>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass}>Part Number *</label>
                <input
                  className={inputClass}
                  value={form.part_number}
                  onChange={handleChange("part_number")}
                  disabled={mode === "edit"}
                />
              </div>
              <div>
                <label className={labelClass}>Part Name *</label>
                <input
                  className={inputClass}
                  value={form.part_name}
                  onChange={handleChange("part_name")}
                />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <input
                  className={inputClass}
                  value={form.product_category}
                  onChange={handleChange("product_category")}
                />
              </div>
              <div>
                <label className={labelClass}>Source *</label>
                <input
                  className={inputClass}
                  value={form.source}
                  onChange={handleChange("source")}
                />
              </div>
              <div>
                <label className={labelClass}>Customer *</label>
                <input
                  className={inputClass}
                  value={form.customer}
                  onChange={handleChange("customer")}
                />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={handleChange("status")}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Standard Cycle Time (sec) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={`${inputClass} font-mono`}
                  value={form.standard_cycle_time}
                  onChange={handleChange("standard_cycle_time")}
                />
              </div>
              <div>
                <label className={labelClass}>Actual Cycle Time (sec)</label>
                <input
                  type="number"
                  step="0.1"
                  className={`${inputClass} font-mono`}
                  value={form.actual_cycle_time}
                  onChange={handleChange("actual_cycle_time")}
                />
              </div>
            </div>

            {error && (
              <p className="text-[11px] font-medium text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="h-8 rounded-sm border border-[#E2E4E9] px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-8 items-center gap-1.5 rounded-sm bg-[#2563EB] px-3.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                {mode === "edit" ? "Save Changes" : "Add Part"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PartModal;