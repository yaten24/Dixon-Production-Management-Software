import React from "react";
import { motion } from "framer-motion";
import { HiOutlineArrowRight } from "react-icons/hi2";

// Brand palette (from client's color reference):
// highlight #0F1D24 (deep navy)  — primary: icons, titles, hover fills
// gray      #9B9B9B              — secondary text
// accent    #FDC94D (warm gold)  — sparing highlight: eyebrow, bar, arrow-hover
// darken    #C6C6C6              — borders, dividers, neutral surfaces

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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative cursor-pointer overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-transparent hover:shadow-[0_12px_28px_-8px_rgba(15,29,36,0.22)]"
    >
      {/* Top accent bar — gold, glows in on hover */}
      <div className="absolute inset-x-0 top-0 h-[3px] scale-x-0 origin-left bg-[#FDC94D] transition-transform duration-300 group-hover:scale-x-100" />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0F1D24] text-[#FDC94D] shadow-sm ring-4 ring-[#0F1D24]/5 transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>

        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded bg-[#F5F5F5] text-[#9B9B9B] opacity-0 transition-all duration-300 group-hover:bg-[#FDC94D]/20 group-hover:text-[#0F1D24] group-hover:opacity-100"
          whileHover={{ x: 2 }}
        >
          <HiOutlineArrowRight className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Body */}
      <div className="relative mt-2">
        <h3 className="text-sm font-bold tracking-tight text-[#0F1D24] transition-colors duration-300 group-hover:text-[#0F1D24]">
          {card.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-[#9B9B9B]">
          {card.description}
        </p>
      </div>

      {/* Divider */}
      <div className="relative mt-2 h-px w-full bg-[#C6C6C6]/40" />

      {/* Footer — ghost by default, navy fill + gold text on hover */}
      <motion.button
        onClick={handleButtonClick}
        whileTap={{ scale: 0.98 }}
        className="relative mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-[#C6C6C6]/60 py-2 text-xs font-semibold text-[#0F1D24] transition-all duration-300 group-hover:border-transparent group-hover:bg-[#0F1D24] group-hover:text-[#FDC94D]"
      >
        Open
        <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
};

export default QuickAccessCard;