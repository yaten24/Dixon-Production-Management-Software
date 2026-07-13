import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

// Generic confirm dialog. Used for "delete operator" confirmation but reusable elsewhere.
const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded bg-white shadow-xl">
        <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiAlertTriangle size={14} />
            </span>
            <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          </div>
          <button onClick={onCancel} className="rounded p-1 hover:bg-slate-100" disabled={loading}>
            <FiX size={16} />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
