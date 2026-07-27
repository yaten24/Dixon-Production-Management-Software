import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHome, FaArrowLeft, FaLock, FaSatellite } from "react-icons/fa";

/* ------------------------------------------------------------------ */
/*  Starfield generator — layered depth (small/dim → large/bright)    */
/* ------------------------------------------------------------------ */
const makeStars = (count, sizeRange, opacityRange) =>
  Array.from({ length: count }, (_, id) => ({
    id,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
    baseOpacity:
      Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }));

const Unauthorized = () => {
  const farStars = useMemo(() => makeStars(90, [0.5, 1.2], [0.15, 0.4]), []);
  const midStars = useMemo(() => makeStars(50, [1.2, 2], [0.3, 0.7]), []);
  const nearStars = useMemo(() => makeStars(25, [2, 3], [0.6, 1]), []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#03040c] flex items-center justify-center px-6 py-16">
      {/* ============================================================ */}
      {/*  Background: deep-space gradient + drifting nebulae           */}
      {/*  Tinted red instead of the 404 page's violet/cyan, to read    */}
      {/*  as a warning rather than "lost".                             */}
      {/* ============================================================ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0a0e_0%,_#03040c_55%,_#000000_100%)]" />

      <motion.div
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-red-700/20 blur-[160px]"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-1/4 -right-1/4 h-[550px] w-[550px] rounded-full bg-orange-700/15 blur-[160px]"
      />

      {/* ============================================================ */}
      {/*  Starfield — three parallax layers of twinkling stars         */}
      {/* ============================================================ */}
      <div className="absolute inset-0">
        {[...farStars, ...midStars, ...nearStars].map((s) => (
          <motion.span
            key={`${s.size}-${s.id}-${s.left}`}
            animate={{ opacity: [s.baseOpacity * 0.3, s.baseOpacity, s.baseOpacity * 0.3] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
            className="absolute rounded-full bg-white"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          />
        ))}

        {/* shooting stars */}
        <motion.span
          animate={{ x: [0, 500], y: [0, 220], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 7, ease: "easeIn" }}
          className="absolute left-[5%] top-[10%] h-px w-32 bg-gradient-to-r from-transparent via-white to-transparent"
        />
        <motion.span
          animate={{ x: [0, -450], y: [0, 260], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 9, ease: "easeIn", delay: 3 }}
          className="absolute right-[8%] top-[18%] h-px w-40 bg-gradient-to-l from-transparent via-red-200 to-transparent"
        />
      </div>

      {/* ============================================================ */}
      {/*  Content card                                                  */}
      {/* ============================================================ */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Orbit badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-sm"
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <FaSatellite className="text-red-300" size={13} />
          </motion.span>
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-slate-400">
            Dixon Production Management
          </span>
        </motion.div>

        {/* Big 403 with orbiting ring + pulsing lock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-red-400/20 md:h-[340px] md:w-[340px]"
          />
          <h1 className="select-none text-[110px] font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 md:text-[170px]">
            403
          </h1>
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-2 top-1 flex h-11 w-11 items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 backdrop-blur-sm md:h-14 md:w-14"
          >
            <FaLock className="text-red-300" size={16} />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl font-semibold text-white md:text-3xl"
        >
          Access denied.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-4 max-w-md text-[15px] leading-7 text-slate-400"
        >
          You don't have clearance to enter this sector. If you think this is
          a mistake, contact your administrator or head back to a page you
          have access to.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-transform hover:scale-[1.03] active:scale-95"
          >
            <FaHome size={13} />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-14 text-[11px] tracking-[0.25em] uppercase text-slate-600"
        >
          Dixon Production Management System © 2026
        </motion.p>
      </div>
    </div>
  );
};

export default Unauthorized;