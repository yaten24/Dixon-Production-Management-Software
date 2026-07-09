import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiMail,
  FiPhone,
  FiHome,
  FiClock,
  FiCalendar,
  FiEdit2,
  FiLock,
  FiUnlock,
  FiShield,
} from "react-icons/fi";

import StatusBadge from "./StatusBadge";
import RoleBadge from "./RoleBadge";

const UserDrawer = ({ isOpen, onClose, user, onEdit, onToggleStatus }) => {
  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25 }} className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-3 py-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 leading-tight">User Details</h2>

            <p className="text-[10px] text-slate-500 leading-tight">Employee Information</p>
          </div>

          <button onClick={onClose} className="rounded p-1.5 hover:bg-slate-100">
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto">
          {/* Profile */}

          <div className="border-b border-slate-100 px-3 py-2.5">
            <h3 className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</h3>

            <p className="text-[10px] text-slate-500 leading-tight">{user.employeeId}</p>

            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>
          </div>

          {/* Details */}

          <div className="space-y-3 p-3">
            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-slate-700">Contact Information</h4>

              <div className="space-y-1.5">
                <InfoRow icon={<FiMail />} label="Email" value={user.email} />

                <InfoRow icon={<FiPhone />} label="Phone" value={user.phone} />
              </div>
            </div>
            {/* Work Information */}

            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-slate-700">Work Information</h4>

              <div className="space-y-1.5">
                <InfoRow icon={<FiHome />} label="Department" value={user.department} />

                <InfoRow icon={<FiShield />} label="Role" value={user.role} />

                <InfoRow icon={<FiClock />} label="Status" value={user.status} />
              </div>
            </div>

            {/* Activity */}

            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-slate-700">Activity</h4>

              <div className="space-y-1.5">
                <InfoRow icon={<FiClock />} label="Last Login" value={user.lastLogin} />

                <InfoRow icon={<FiCalendar />} label="Created On" value={user.createdAt} />
              </div>
            </div>

            {/* Permission */}

            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-slate-700">Permission Level</h4>

              <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                <span className="text-xs font-medium text-slate-700">
                  {user.permissionLevel != null ? `Level ${user.permissionLevel}` : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="sticky bottom-0 flex gap-2 border-t border-slate-100 bg-white p-3">
          <button onClick={() => onEdit(user)} className="flex-1 rounded bg-blue-600 py-2 text-xs font-medium text-white transition hover:bg-blue-700">
            <span className="flex items-center justify-center gap-1.5">
              <FiEdit2 size={13} />
              Edit User
            </span>
          </button>

          <button onClick={() => onToggleStatus(user)} className={`flex-1 rounded py-2 text-xs font-medium text-white transition ${user.status === "Locked" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
            <span className="flex items-center justify-center gap-1.5">
              {user.status === "Locked" ? (
                <>
                  <FiUnlock size={13} />
                  Unlock
                </>
              ) : (
                <>
                  <FiLock size={13} />
                  Lock
                </>
              )}
            </span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5">
    <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600 shrink-0">
      <span className="text-[11px]">{icon}</span>
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500 leading-tight">{label}</p>

      <p className="truncate text-xs font-medium text-slate-800 leading-tight">{value || "-"}</p>
    </div>
  </div>
);

export default UserDrawer;