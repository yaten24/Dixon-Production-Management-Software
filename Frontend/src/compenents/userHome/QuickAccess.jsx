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
      className="relative mt-1 rounded border border-[#C6C6C6]/60 bg-[#F5F5F5] p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:mt-1 lg:p-2"
    >
      {/* Header */}
      <div className="relative mb-1 flex flex-wrap items-center justify-between gap-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FDC94D]">
            Modules
          </span>
          <h2 className="mt-0.5 text-sm font-bold tracking-tight text-[#0F1D24]">
            Quick Access
          </h2>
          <p className="text-xs font-medium text-[#9B9B9B]">
            Select a module to continue your work
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="relative grid grid-cols-3 gap-2.5 lg:grid-cols-6">
        {menuCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
          >
            <QuickAccessCard card={card} onClick={handleNavigation} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default QuickAccess;