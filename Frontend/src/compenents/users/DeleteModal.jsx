import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiTrash2, FiUser, FiX } from "react-icons/fi";

const DeleteModal = ({ isOpen, onClose, onConfirm, user, loading = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md overflow-hidden rounded bg-white shadow-2xl">
              {/* Header */}

              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded bg-red-100">
                    <FiAlertTriangle size={22} className="text-red-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      Delete User
                    </h2>

                    <p className="text-xs text-slate-500">
                      This will deactivate the user's access
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded p-2 hover:bg-slate-100"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Body */}

              <div className="space-y-4 p-5">
                <div className="flex items-center gap-4 rounded border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200">
                    <FiUser size={28} className="text-slate-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">
                      {user?.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Employee ID : {user?.employeeId}
                    </p>

                    <p className="text-sm text-slate-500">{user?.role}</p>
                  </div>
                </div>

                <div className="rounded border border-red-200 bg-red-50 p-4">
                  <p className="text-sm leading-6 text-red-700">
                    Are you sure you want to delete this user? Their account
                    will be deactivated and they will immediately lose access to
                    the system. Records are retained for audit purposes and can
                    be restored by an administrator if needed.
                  </p>
                </div>
              </div>

              {/* Footer */}

              <div className="flex justify-end gap-2 bg-white px-5 py-4">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="rounded border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex items-center gap-2 rounded bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiTrash2 size={16} />

                  {loading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;
