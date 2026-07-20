import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi2";

import { loginUser } from "../api/Authapi";
import { useAuth } from "../context/AuthContext";

// FIX: this used to be an "Admin Login" page that always sent everyone to
// /dashboard. It's now a single general login page — after the backend
// authenticates, we read the user's role from the response and redirect
// each role to its own home screen, instead of hardcoding one destination.
// ASSUMPTION: adjust these paths/role names to match your actual routes.
//
// FIX: roles are matched after stripping ALL whitespace and lowercasing,
// on both sides (the map's keys and the value coming back from the
// backend). Without this, "Assistant Manager", "AssistantManager",
// "assistant manager", and "ASSISTANT MANAGER" would all be treated as
// different roles and silently fall through to DEFAULT_REDIRECT — a
// mismatch that's easy to introduce any time the backend's exact string
// format changes (a stray space, different casing, etc.).
const normalizeRole = (role) => (role || "").replace(/\s+/g, "").toLowerCase();

const ROLE_REDIRECTS = {
  [normalizeRole("Admin")]: "/dashboard",
  [normalizeRole("Supervisor")]: "/dashboard",
  [normalizeRole("Operator")]: "/production-entry",
  [normalizeRole("Assistant Manager")]: "/employee/home",
};

const DEFAULT_REDIRECT = "/dashboard";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employeeId = e.target.employeeId.value.trim();
    const password = e.target.password.value;

    setError("");
    setSubmitting(true);

    try {
      const res = await loginUser(employeeId, password);

      if (res.success) {
        login(res.user);

        const destination =
          ROLE_REDIRECTS[normalizeRole(res.user.role)] || DEFAULT_REDIRECT;

        navigate(destination);
      } else {
        setError(res.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `
    w-full
    h-10
    rounded-sm
    border
    border-[#E2E4E9]
    bg-white
    pl-10
    pr-4
    text-sm
    text-slate-800
    placeholder:text-slate-400
    outline-none
    transition-all
    focus:border-blue-500
    focus:ring-1
    focus:ring-blue-500
    disabled:bg-slate-50
    disabled:text-slate-400
  `;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-3 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm overflow-hidden rounded-sm border border-[#E2E4E9] bg-white"
      >
        {/* top accent line */}
        <div className="h-0.5 w-full bg-[#2563EB]" />

        <div className="p-5 sm:p-6">
          {/* LOGO + HEADER */}

          <div className="text-center">
            <img
              src="/Dixon_Technologies_Logo.png"
              alt="Dixon Technologies"
              className="mx-auto h-9 object-contain"
            />

            <h2 className="mt-3 text-base font-bold text-slate-800">Sign In</h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Access the Production Management System
            </p>
          </div>

          {/* ERROR BANNER */}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600"
            >
              {error}
            </motion.div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {/* EMPLOYEE ID */}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Employee ID
              </label>

              <div className="relative">
                <FaUserShield
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="employeeId"
                  placeholder="Enter Employee ID"
                  required
                  autoComplete="username"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Password
              </label>

              <div className="relative">
                <FaLock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  required
                  autoComplete="current-password"
                  disabled={submitting}
                  className={`${inputClass} pr-10`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? (
                    <FaEyeSlash size={13} />
                  ) : (
                    <FaEye size={13} />
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}

            <motion.button
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              type="submit"
              disabled={submitting}
              className="
                mt-1
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-sm
                bg-[#2563EB]
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-colors
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {submitting && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {submitting ? "Signing in..." : "Login"}
            </motion.button>
          </form>

          {/* FOOTER */}

          <div className="mt-5 border-t border-[#E2E4E9] pt-3.5">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-[#E2E4E9] py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-400 hover:text-[#2563EB]"
            >
              <HiOutlineArrowLeft size={14} />
              Back to Home
            </button>

            <div className="mt-3 text-center">
              <p className="text-[11px] font-medium text-slate-600">
                Dixon Technologies (India) Limited
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                &copy; {new Date().getFullYear()} All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
