import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaIndustry, FaUsers, FaBoxes, FaCogs } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ==========================================================
// Starfield — mostly small twinkling dots, plus a handful of
// bigger glowing "hero" stars for a more prominent background
// (this is the public landing page, so it can be a bit bolder
// than the twinkle used on internal dashboard pages).
// ==========================================================
const SMALL_STAR_COUNT = 60;
const BIG_STAR_COUNT = 10;

const StarsBackground = () => {
  const smallStars = useMemo(
    () =>
      Array.from({ length: SMALL_STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${(i * 37.3) % 100}%`,
        left: `${(i * 53.7) % 100}%`,
        size: 1 + (i % 3),
        duration: 2.5 + (i % 5),
        delay: (i % 12) * 0.25,
      })),
    []
  );

  const bigStars = useMemo(
    () =>
      Array.from({ length: BIG_STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${(i * 71.3 + 8) % 100}%`,
        left: `${(i * 43.7 + 5) % 100}%`,
        size: 5 + (i % 3) * 2,
        duration: 3.5 + (i % 4),
        delay: (i % 8) * 0.3,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {smallStars.map((s) => (
        <motion.span
          key={`sm-${s.id}`}
          className="absolute rounded-full bg-[#0F1D24]"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={{ opacity: [0.08, 0.4, 0.08] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
      {bigStars.map((s) => (
        <motion.span
          key={`lg-${s.id}`}
          className="absolute rounded-full bg-[#FDC94D]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 2.5}px ${s.size * 0.8}px rgba(253,201,77,0.35)`,
          }}
          animate={{ opacity: [0.15, 0.7, 0.15], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();

  const statistics = [
    { id: 1, title: "Production Halls", value: "05", icon: <FaIndustry /> },
    { id: 2, title: "Production Lines", value: "85", icon: <FaCogs /> },
    { id: 3, title: "Daily Production", value: "25K+", icon: <FaBoxes /> },
    { id: 4, title: "Operators", value: "100+", icon: <FaUsers /> },
  ];

  return (
    <div className="relative min-h-screen bg-[#F5F5F5]">
      <StarsBackground />

      <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center px-3 py-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-sm border border-[#C6C6C6]/60 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,29,36,0.05)] sm:p-4"
        >
          {/* Header */}
          <div className="text-center">
            <img
              src="/Dixon_Technologies_Logo.png"
              alt="Dixon Technologies"
              className="mx-auto h-8 object-contain"
            />

            <span className="mt-2.5 inline-block rounded-full border border-[#FDC94D]/40 bg-[#FDC94D]/10 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#0F1D24]">
              Dixon Technologies
            </span>

            <h2 className="mt-2 text-lg font-extrabold tracking-tight text-[#0F1D24] sm:text-xl">
              Production Management System
            </h2>

            <div className="mx-auto mt-1.5 h-[3px] w-10 rounded-full bg-[#FDC94D]" />

            <p className="mx-auto mt-2 max-w-md text-[10.5px] leading-4 text-[#9B9B9B]">
              Monitoring production targets, actual output, rejection analysis
              and manufacturing performance across Dixon Technologies.
            </p>
          </div>

          {/* ================= Statistics ================= */}
          <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            {statistics.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between rounded-sm border border-[#C6C6C6]/50 bg-[#F5F5F5] p-2 transition-colors hover:border-[#0F1D24]/40"
              >
                <div>
                  <h3 className="font-mono text-sm font-bold leading-none text-[#0F1D24]">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-[9px] font-medium leading-none text-[#9B9B9B]">
                    {item.title}
                  </p>
                </div>
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm bg-[#0F1D24] text-[10px] text-[#FDC94D]">
                  {item.icon}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ================= Quick Information ================= */}
          <div className="mt-2.5 hidden rounded-sm border border-[#C6C6C6]/50 bg-[#F5F5F5] p-2.5 md:block">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <h3 className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FDC94D]" />
                  Production
                </h3>
                <p className="mt-1 text-[10.5px] leading-4 text-[#9B9B9B]">
                  Monitor daily targets, actual production and hall-wise performance.
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FDC94D]" />
                  Quality
                </h3>
                <p className="mt-1 text-[10.5px] leading-4 text-[#9B9B9B]">
                  Track rejections and analyze manufacturing quality in real time.
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FDC94D]" />
                  Reports
                </h3>
                <p className="mt-1 text-[10.5px] leading-4 text-[#9B9B9B]">
                  Generate daily, weekly and monthly reports for management.
                </p>
              </div>
            </div>
          </div>

          {/* ================= Login Button ================= */}
          <div className="mt-3">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="mx-auto flex h-9 w-full max-w-xs items-center justify-center rounded-sm bg-[#0F1D24] text-[13px] font-semibold text-[#FDC94D] shadow-[0_8px_18px_-8px_rgba(15,29,36,0.45)] transition-colors hover:bg-[#0F1D24]/90"
            >
              Login
            </motion.button>
          </div>

          {/* ================= Footer ================= */}
          <div className="mt-3 border-t border-[#C6C6C6]/50 pt-2">
            <div className="flex flex-col items-center justify-between gap-0.5 text-center text-[9.5px] text-[#9B9B9B] sm:flex-row">
              <p>&copy; {new Date().getFullYear()} Dixon Technologies (India) Limited</p>
              <p className="hidden sm:block">Production Management System</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;