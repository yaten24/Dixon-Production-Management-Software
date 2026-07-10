import React from "react";
import { motion } from "framer-motion";
import { HiOutlineArrowRight } from "react-icons/hi2";

// NOTE: `card.color` (from data/userHomeData.js) is intentionally no
// longer used for styling. It made every module card a different
// color, which read as inconsistent. Every card now shares the same
// single brand accent (#2563EB) so the grid reads as one cohesive,
// professional module — differentiated only by icon + label, not hue.

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative cursor-pointer overflow-hidden rounded-sm border border-slate-200 bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#2563EB] text-white shadow-sm">
          <Icon className="h-5.5 w-5.5" />
        </div>

        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 text-slate-500 transition-colors duration-200 group-hover:bg-[#2563EB] group-hover:text-white"
          whileHover={{ x: 2 }}
        >
          <HiOutlineArrowRight className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Body */}
      <div className="relative mt-3">
        <h3 className="text-sm font-bold text-slate-900 transition-colors duration-200 group-hover:text-[#2563EB]">
          {card.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-600">
          {card.description}
        </p>
      </div>

      {/* Divider */}
      <div className="relative mt-3 h-px w-full bg-slate-200" />

      {/* Footer */}
      <motion.button
        onClick={handleButtonClick}
        whileTap={{ scale: 0.98 }}
        className="relative mt-3 flex w-full items-center justify-center gap-1.5 rounded-sm bg-[#2563EB] py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Open
        <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
};

export default QuickAccessCard;