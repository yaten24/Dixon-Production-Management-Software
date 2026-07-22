// QuickAccess.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { menuCards } from "../../data/userHomeData";
import QuickAccessCard from "./QuickAccessCard";

// Desktop panel matching OverviewSection's group-box treatment.
const QuickAccess = () => {
  const navigate = useNavigate();

  const handleNavigation = (card) => {
    if (card.path) navigate(card.path);
  };

  return (
    <section className="relative mt-1.5 border border-[#C6C6C6] bg-white">
      <div className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-2.5 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1D24]/60">
          Modules
        </span>
        <h2 className="text-[13px] font-bold tracking-tight text-[#0F1D24] leading-tight">
          Quick Access
        </h2>
        <p className="text-[10.5px] font-medium text-[#9B9B9B]">
          Select a module to continue your work
        </p>
      </div>

      <div className="grid grid-cols-3 gap-px bg-[#C6C6C6] p-px sm:grid-cols-4 lg:grid-cols-6">
        {menuCards.map((card) => (
          <QuickAccessCard key={card.id} card={card} onClick={handleNavigation} />
        ))}
      </div>
    </section>
  );
};

export default QuickAccess;