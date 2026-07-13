import React, { useEffect, useState } from "react";
import { FiSave, FiX } from "react-icons/fi";

const initialState = {
  operator_name: "",
  operator_code: "",
  shift: "",
  hall: "",
};

// mode: "add" | "view"
const OperatorModal = ({ isOpen, mode = "add", operator = null, onClose, onSave, saving = false, error = "" }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      setForm(mode === "add" ? initialState : operator || initialState);
    }
  }, [isOpen, mode, operator]);

  if (!isOpen) return null;

  const isView = mode === "view";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isView) return;
    onSave(form);
  };

  const performanceColor = (value) => {
    if (value >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (value >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
          <div>
            <h2 className="text-base font-semibold text-slate-800 leading-tight">
              {isView ? "Operator Details" : "Add Operator"}
            </h2>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isView ? "Read-only view" : "Create a new operator record"}
            </p>
          </div>
          <button onClick={onClose} className="rounded cursor-pointer p-1.5 hover:bg-slate-100">
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-2.5 rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            <Field
              label="Operator Name"
              name="operator_name"
              value={form.operator_name}
              onChange={handleChange}
              disabled={isView}
              required
            />
            <Field
              label="Operator Code"
              name="operator_code"
              value={form.operator_code}
              onChange={handleChange}
              disabled={isView}
              required
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Shift" name="shift" value={form.shift} onChange={handleChange} disabled={isView} required />
              <Field label="Hall" name="hall" value={form.hall} onChange={handleChange} disabled={isView} required />
            </div>

            {isView && (
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 mt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Performance
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${performanceColor(
                      operator?.performance ?? 0
                    )}`}
                  >
                    {operator?.performance ?? 0}% completion
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {operator?.total_actual ?? 0} / {operator?.total_target ?? 0} units (actual/target)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-2 pt-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 cursor-pointer px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {isView ? "Close" : "Cancel"}
            </button>

            {!isView && (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded bg-blue-600 cursor-pointer px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSave size={13} />
                {saving ? "Saving..." : "Add Operator"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, disabled, required }) => (
  <div>
    <label className="mb-0.5 block text-xs font-medium text-slate-700">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs outline-none transition focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
    />
  </div>
);

export default OperatorModal;
