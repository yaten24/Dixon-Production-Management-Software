import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { menuCards } from "../../data/userHomeData";
import QuickAccessCard from "./QuickAccessCard";

const QuickAccess = () => {
  const navigate = useNavigate();

  const handleNavigation = (card) => {
    if (card.path) {
      navigate(card.path);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative mt-2 overflow-hidden rounded border border-slate-200 bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/60 p-2 shadow-sm lg:mt-2 lg:p-2"
    >
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded bg-blue-200/30 blur-3xl" />

      {/* Header */}

      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800 lg:text-xl">
            Quick Access
          </h2>

          <p className="text-xs text-slate-500">
            Select a module to continue your work
          </p>
        </div>
      </div>

      {/* Cards */}

      <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4">
        {menuCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
          >
            <QuickAccessCard card={card} onClick={handleNavigation} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default QuickAccess;