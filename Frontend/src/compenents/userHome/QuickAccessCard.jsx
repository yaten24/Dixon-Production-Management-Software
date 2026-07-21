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

  return (
    <motion.button
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex w-full items-center gap-2 rounded border border-[#C6C6C6]/50 bg-white px-2 py-1.5 text-left transition-colors duration-150 hover:border-[#0F1D24]/40 hover:bg-[#F5F5F5]"
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#0F1D24] text-[#FDC94D]">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <span className="flex-1 truncate text-[12.5px] font-bold tracking-tight text-[#0F1D24]">
        {card.title}
      </span>

      <HiOutlineArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-[#9B9B9B] transition-colors duration-150 group-hover:text-[#0F1D24]" />
    </motion.button>
  );
};

export default QuickAccessCard;