import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaIdBadge,
  FaEnvelope,
  FaBuilding,
  FaUserTag,
  FaCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import Header from "../compenents/dashboard/Header";

const HEADER_HEIGHT = 48;

// Staggered entrance — parent triggers children one after another instead
// of everything popping in at once.
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const isActive = user?.status?.toLowerCase() === "active";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const details = [
    { label: "Employee ID", value: user?.employee_id, icon: <FaIdBadge /> },
    { label: "Email", value: user?.email, icon: <FaEnvelope /> },
    { label: "Department", value: user?.department, icon: <FaBuilding /> },
    { label: "Role", value: user?.role, icon: <FaUserTag /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 relative overflow-hidden">
      <Header title="Profile" subtitle="Dixon Production Management System" />

      {/* ================= AMBIENT BACKGROUND — continuous, subtle ================= */}
      <motion.div
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"
        animate={{ x: [-20, 30, -20], y: [-10, 20, -10], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-indigo-200/25 blur-3xl"
        animate={{ x: [20, -20, 20], y: [10, -15, 10], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="relative mx-auto max-w-2xl px-3 py-4"
        style={{ paddingTop: HEADER_HEIGHT + 16 }}
      >
        {!user ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full items-center justify-center py-16 text-xs text-slate-400"
          >
            No user data available.
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative border border-[#E2E4E9] bg-white rounded-sm overflow-hidden"
          >
            {/* top accent — continuous shimmer sweep, not just a one-time fill */}
            <div className="relative h-0.5 w-full bg-[#E2E4E9] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* HEADER — avatar + name + role + status */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-2.5 border-b border-[#E2E4E9] px-5 py-6 text-center"
            >
              {/* Avatar with continuous pulsing glow ring behind it */}
              <div className="relative flex h-16 w-16 items-center justify-center">
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#2563EB]/25"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                    delay: 0.15,
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-lg font-bold text-white shadow-sm"
                >
                  {initials || <FaUserCircle className="text-3xl" />}
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <h2 className="text-base font-bold text-slate-800">
                  {user.name}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">{user.role}</p>
              </motion.div>

              <motion.span
                variants={itemVariants}
                className={`flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  <FaCircle size={5} />
                </motion.span>
                {user.status}
              </motion.span>
            </motion.div>

            {/* DETAILS GRID */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4"
            >
              {details.map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  whileHover={{ y: -2, borderColor: "#93c5fd" }}
                  className="border border-[#E2E4E9] bg-slate-50 rounded-sm px-3 py-2.5 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400">
                    <motion.span
                      className="text-[#2563EB]"
                      animate={{ y: [0, -2, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.25,
                        ease: "easeInOut",
                      }}
                    >
                      {item.icon}
                    </motion.span>
                    {item.label}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-700 font-mono truncate">
                    {item.value || "-"}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* LOGOUT */}
            <motion.div
              variants={itemVariants}
              className="border-t border-[#E2E4E9] p-4"
            >
              <motion.button
                whileHover={{ scale: loggingOut ? 1 : 1.01 }}
                whileTap={{ scale: loggingOut ? 1 : 0.98 }}
                onClick={handleLogout}
                disabled={loggingOut}
                className="
                  flex
                  h-9
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-sm
                  border
                  border-red-200
                  bg-red-50
                  text-xs
                  font-semibold
                  text-red-600
                  transition-colors
                  hover:bg-red-500
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {loggingOut ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                ) : (
                  <FaSignOutAlt size={12} />
                )}
                {loggingOut ? "Logging out..." : "Logout"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
