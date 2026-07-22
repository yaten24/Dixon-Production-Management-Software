import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi2";

import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const normalizeRole = (role) => (role || "").replace(/\s+/g, "").toLowerCase();

const ROLE_REDIRECTS = {
  [normalizeRole("Admin")]: "/dashboard",
  [normalizeRole("Supervisor")]: "/dashboard",
  [normalizeRole("Operator")]: "/production-entry",
  [normalizeRole("Assistant Manager")]: "/employee/home",
};

const DEFAULT_REDIRECT = "/dashboard";

// Subtle twinkling-stars background — matches the rest of the app
// (HallDashboard, DailyPlanDetail, UserHome all use this same pattern).
const STAR_COUNT = 70;

const StarsBackground = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${(i * 37.3) % 100}%`,
        left: `${(i * 53.7) % 100}%`,
        size: 1 + (i % 3),
        duration: 2.5 + (i % 5),
        delay: (i % 12) * 0.25,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-[#0F1D24]"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={{ opacity: [0.08, 0.4, 0.08] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

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
    border-[#C6C6C6]
    bg-white
    pl-10
    pr-4
    text-sm
    text-[#0F1D24]
    placeholder:text-[#9B9B9B]
    outline-none
    transition-all
    focus:border-[#0F1D24]
    focus:ring-1
    focus:ring-[#0F1D24]/20
    disabled:bg-[#F5F5F5]
    disabled:text-[#9B9B9B]
  `;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F5F5F5] px-3 py-6">
      <StarsBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm overflow-hidden rounded-sm border border-[#C6C6C6]/60 bg-white shadow-[0_1px_2px_rgba(15,29,36,0.05)]"
      >
        {/* top accent line */}
        <div className="h-0.5 w-full bg-[#FDC94D]" />

        <div className="p-5 sm:p-6">
          {/* LOGO + HEADER */}

          <div className="text-center">
            <img
              src="/Dixon_Technologies_Logo.png"
              alt="Dixon Technologies"
              className="mx-auto h-9 object-contain"
            />

            <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-[#FDC94D]">
              Production Management
            </span>

            <h2 className="mt-0.5 text-base font-bold tracking-tight text-[#0F1D24]">Sign In</h2>

            <p className="mt-1 text-[11px] font-medium text-[#9B9B9B]">
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
              <label className="mb-1 block text-[10px] font-mono font-bold uppercase tracking-wide text-[#9B9B9B]">
                Employee ID
              </label>

              <div className="relative">
                <FaUserShield
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]"
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
              <label className="mb-1 block text-[10px] font-mono font-bold uppercase tracking-wide text-[#9B9B9B]">
                Password
              </label>

              <div className="relative">
                <FaLock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] transition-colors hover:text-[#0F1D24]"
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
              whileHover={{ y: submitting ? 0 : -2 }}
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
                bg-[#0F1D24]
                text-sm
                font-semibold
                text-[#FDC94D]
                shadow-[0_8px_18px_-8px_rgba(15,29,36,0.45)]
                transition-colors
                hover:bg-[#0F1D24]/90
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {submitting && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FDC94D]/30 border-t-[#FDC94D]" />
              )}
              {submitting ? "Signing in..." : "Login"}
            </motion.button>
          </form>

          {/* FOOTER */}

          <div className="mt-5 border-t border-[#C6C6C6]/60 pt-3.5">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-[#C6C6C6] py-2 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <HiOutlineArrowLeft size={14} />
              Back to Home
            </button>

            <div className="mt-3 text-center">
              <p className="text-[11px] font-semibold text-[#0F1D24]">
                Dixon Technologies (India) Limited
              </p>
              <p className="mt-0.5 text-[10px] text-[#9B9B9B]">
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