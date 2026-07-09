import React from "react";
import { motion } from "framer-motion";
import { HiOutlineArrowRight } from "react-icons/hi2";

const QuickAccessCard = ({ card, onClick }) => {
  const Icon = card.icon;

  const handleCardClick = () => onClick(card);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    onClick(card);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative cursor-pointer overflow-hidden rounded border border-slate-200 bg-white p-2 shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Decorative gradient glow on hover */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20 ${card.color}`}
      />

      {/* Header */}

      <div className="relative flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`flex h-14 w-14 items-center justify-center rounded text-white shadow-md ${card.color}`}
        >
          <Icon className="h-7 w-7" />
        </motion.div>

        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 text-slate-400 transition-colors duration-200 group-hover:bg-blue-50 group-hover:text-blue-600"
          whileHover={{ x: 3 }}
        >
          <HiOutlineArrowRight className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Body */}

      <div className="relative mt-4">
        <h3 className="text-base font-bold text-slate-800 transition-colors duration-200 group-hover:text-blue-600">
          {card.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
          {card.description}
        </p>
      </div>

      {/* Divider */}

      <div className="relative mt-4 h-px w-full bg-slate-100" />

      {/* Footer */}

      <motion.button
        onClick={handleButtonClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`relative mt-4 flex w-full items-center justify-center gap-1.5 rounded py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity duration-200 hover:opacity-90 ${card.color}`}
      >
        Open
        <HiOutlineArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
};

export default QuickAccessCard;