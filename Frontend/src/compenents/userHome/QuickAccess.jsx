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
      className="relative mt-2 rounded-sm border border-slate-200 bg-white p-2 shadow-sm lg:mt-2 lg:p-3"
    >
      {/* Header */}
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Quick Access</h2>
          <p className="text-xs font-medium text-slate-600">
            Select a module to continue your work
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="relative grid grid-cols-3 gap-1 lg:grid-cols-6">
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