import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaLock, FaEye, FaEyeSlash, FaIndustry } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi2";

import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

// ============================================================
// THEME TOKENS — same values as AdvProductionEntry.jsx, so the
// login screen and the app's interior screens read as one system.
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";

const normalizeRole = (role) => (role || "").replace(/\s+/g, "").toLowerCase();

const ROLE_REDIRECTS = {
  [normalizeRole("Admin")]: "/dashboard",
  [normalizeRole("Supervisor")]: "/dashboard",
  [normalizeRole("Operator")]: "/production-entry",
  [normalizeRole("Assistant Manager")]: "/employee/home",
};

const DEFAULT_REDIRECT = "/dashboard";

/* ------------------------------------------------------------------ */
/*  BRAND PANEL — schematic "circuit board" motif with signal pulses   */
/*  traveling along traces, plus the PMS Dehradun identity strip.      */
/* ------------------------------------------------------------------ */

const TRACE_PATHS = [
  "M -20 80 H 140 V 40 H 260 V 160 H 380 V 90 H 520",
  "M -20 220 H 90 V 300 H 220 V 240 H 400 V 340 H 520",
  "M -20 400 H 160 V 460 H 300 V 380 H 440 V 500 H 520",
  "M -20 560 H 120 V 600 H 260 V 540 H 420 V 620 H 520",
];

const VIAS = [
  [140, 80], [260, 40], [260, 160], [380, 160], [380, 90],
  [90, 220], [90, 300], [220, 300], [220, 240], [400, 240], [400, 340],
  [160, 400], [160, 460], [300, 460], [300, 380], [440, 380], [440, 500],
  [120, 560], [120, 600], [260, 600], [260, 540], [420, 540], [420, 620],
];

const CircuitBackdrop = () => (
  <svg
    viewBox="0 0 520 680"
    preserveAspectRatio="xMidYMid slice"
    className="absolute inset-0 h-full w-full opacity-[0.55]"
  >
    {TRACE_PATHS.map((d, i) => (
      <path key={`trace-${i}`} d={d} fill="none" stroke={GOLD} strokeOpacity="0.14" strokeWidth="1.5" />
    ))}

    {VIAS.map(([cx, cy], i) => (
      <circle key={`via-${i}`} cx={cx} cy={cy} r="2.5" fill={GOLD} fillOpacity="0.18" />
    ))}

    {TRACE_PATHS.map((d, i) => (
      <circle key={`pulse-${i}`} r="3.2" fill={GOLD}>
        <animateMotion path={d} dur={`${5 + i * 1.3}s`} begin={`${i * 0.9}s`} repeatCount="indefinite" rotate="auto" />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.08;0.92;1"
          dur={`${5 + i * 1.3}s`}
          begin={`${i * 0.9}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}
  </svg>
);

const BrandPanel = () => (
  <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#0A141A] p-10 lg:flex">
    <CircuitBackdrop />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A141A] via-[#0A141A]/60 to-[#0A141A]" />

    <div className="relative z-10 flex items-center justify-between">
      <img src="/Dixon_Technologies_Logo.png" alt="Dixon Technologies" className="h-8 object-contain brightness-0 invert" />
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        System Online
      </span>
    </div>

    <div className="relative z-10 max-w-md">
      {/* highlighted PMS Dehradun identity mark */}
      <span
        className="inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ borderColor: GOLD, color: GOLD, background: "rgba(253,201,77,0.08)" }}
      >
        <FaIndustry className="text-[10px]" />
        PMS &middot; Dehradun
      </span>

      <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-white">
        Every unit,
        <br />
        every line,
        <br />
        one system.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/50">
        Sign in to track production entries, monitor line status and manage
        shop-floor operations across every Dixon facility.
      </p>
    </div>

    <div className="relative z-10">
      <p className="font-mono text-[10px] uppercase tracking-wider text-white/30">
        Dixon Technologies Dehradun &middot; Internal Use Only
      </p>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  LOGIN FORM PANEL — flat, bordered, dense: same building blocks     */
/*  (top bar, labeled fields, h-9 controls) as AdvProductionEntry.     */
/* ------------------------------------------------------------------ */

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const timestamp = useMemo(
    () =>
      now.toLocaleString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [now]
  );

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

  // same control class the interior forms use: h-9, flat border,
  // sharp corners, small bold mono-ish type
  const textInputClass =
    "h-9 w-full border border-[#C6C6C6] bg-white pl-8 pr-3 text-[12.5px] font-semibold text-[#0F1D24] outline-none transition-colors duration-100 placeholder:font-medium placeholder:text-[#9B9B9B] focus:border-[#0F1D24] disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B]";

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#EFEFEF] lg:grid-cols-[1.1fr_0.9fr]">
      <BrandPanel />

      <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        {/* mobile-only compact brand strip */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-[#C6C6C6] bg-[#0F1D24] px-4 py-2.5 lg:hidden">
          <img src="/Dixon_Technologies_Logo.png" alt="Dixon Technologies" className="h-6 object-contain brightness-0 invert" />
          <span
            className="border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
            style={{ borderColor: GOLD, color: GOLD }}
          >
            PMS &middot; Dehradun
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative mt-12 w-full max-w-[340px] border border-[#C6C6C6] bg-white lg:mt-0"
        >
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${BORDER} 50%, ${GOLD} 100%)` }} />

          {/* top bar — mirrors AdvProductionEntry's h-[40px] header row */}
          <div className="flex h-[40px] items-center gap-2 border-b border-[#C6C6C6] bg-white px-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#0F1D24] bg-[#0F1D24]">
              <FaIndustry className="text-[11px] text-[#FDC94D]" />
            </div>
            <h1 className="flex items-center gap-1.5 text-[12.5px] font-bold leading-tight text-[#0F1D24]">
              PMS
              <span className="bg-[#FDC94D] px-1.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-[#0F1D24]">
                Dehradun
              </span>
            </h1>
            <span className="ml-auto hidden font-mono text-[9.5px] font-semibold text-[#9B9B9B] sm:block">{timestamp}</span>
          </div>

          <div className="p-3">
            <p className="text-[11px] font-semibold text-[#9B9B9B]">Sign in to your operations console</p>

            {error && (
              <div className="mt-2 border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-2.5 flex flex-col gap-2">
              <div>
                <label htmlFor="employeeId" className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                  Employee ID
                </label>
                <div className="relative">
                  <FaUserShield className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#9B9B9B]" />
                  <input
                    id="employeeId"
                    type="text"
                    name="employeeId"
                    placeholder="123456"
                    required
                    autoComplete="username"
                    disabled={submitting}
                    className={textInputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#9B9B9B]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    disabled={submitting}
                    className={`${textInputClass} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={submitting}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B9B9B] transition-colors duration-100 hover:text-[#0F1D24]"
                  >
                    {showPassword ? <FaEyeSlash className="text-[11px]" /> : <FaEye className="text-[11px]" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-0.5 flex h-9 w-full items-center justify-center gap-2 border border-[#0F1D24] bg-[#0F1D24] text-[11.5px] font-bold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {submitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-2.5 border-t border-[#C6C6C6] pt-2.5">

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-[#0F1D24]">Dixon Technologies Dehradun</p>
                <p className="text-[9.5px] text-[#9B9B9B]">&copy; {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;