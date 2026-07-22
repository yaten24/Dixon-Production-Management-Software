// QuickAccessCard.jsx
import React from "react";

// Ribbon/toolbar-button style — icon stacked over label, like
// Office/Windows ribbon groups, not a web "link card".
const QuickAccessCard = ({ card, onClick }) => {
  const Icon = card.icon;
  const handleCardClick = () => onClick(card);

  return (
    <button
      onClick={handleCardClick}
      className="group flex w-full flex-col items-center justify-center gap-1 border border-[#C6C6C6] bg-white px-2 py-2.5 transition-colors duration-100 hover:bg-[#0F1D24] active:bg-[#0F1D24]"
    >
      <div className="flex h-8 w-8 items-center justify-center border border-[#C6C6C6] bg-[#FAFAFA] text-[#0F1D24] transition-colors duration-100 group-hover:border-[#FDC94D]/40 group-hover:bg-[#0F1D24] group-hover:text-[#FDC94D]">
        <Icon className="h-4 w-4" />
      </div>
      <span className="truncate text-[10.5px] font-bold tracking-tight text-[#0F1D24] transition-colors duration-100 group-hover:text-white">
        {card.title}
      </span>
    </button>
  );
};

export default QuickAccessCard;