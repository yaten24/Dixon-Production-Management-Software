import React, { useMemo } from "react";
import { motion } from "framer-motion";

import useClock from "../hooks/useClock";
import OverviewSection from "../compenents/userHome/OverviewSection";
import QuickAccess from "../compenents/userHome/QuickAccess";
import Header from "../compenents/dashboard/Header";

// Subtle twinkling-stars background — small fixed dots with a looping
// opacity pulse, seeded from the index so it doesn't reshuffle on re-render.
const STAR_COUNT = 70;

function StarsBackground() {
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
}

const UserHome = () => {
  const currentTime = useClock();

  const handleLogout = () => {
    console.log("Logout");

    // Example:
    // localStorage.removeItem("token");
    // navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      <StarsBackground />

      {/* Header */}

      <Header />

      {/* Main */}

      <main className="relative w-full px-2 mt-13">

        {/* Overview */}

        <OverviewSection />

        {/* Modules */}

        <QuickAccess />

        {/* Footer */}

        {/* <Footer /> */}
      </main>
    </div>
  );
};

export default UserHome;