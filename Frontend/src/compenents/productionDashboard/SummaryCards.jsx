import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

import SummaryCard from "./SummaryCard";

// Desktop-app grid: flat bordered tiles with grid-line gaps
// (gap-px bg-[#C6C6C6] trick), no motion, bumped font sizes and
// padding so the extra tile width isn't left as dead space.
const SummaryCards = ({ overall, hallSummary = [], halls = [], hallAccent, onSelectHall }) => {
  const summaryMap = new Map(hallSummary.map((h) => [h.hall, h]));

  const normalizedHallCards = halls.map((hallName) => {
    const existing = summaryMap.get(hallName);
    return {
      hall: hallName,
      target: existing ? Number(existing.target) || 0 : 0,
      actual: existing ? Number(existing.actual) || 0 : 0,
      rejection: existing ? Number(existing.rejection) || 0 : 0,
      hasData: Boolean(existing),
    };
  });

  const allCards = [
    {
      hall: "Overall Production",
      target: Number(overall?.target) || 0,
      actual: Number(overall?.actual) || 0,
      rejection: Number(overall?.rejection) || 0,
      color: "#0F1D24",
      isOverall: true,
    },
    ...normalizedHallCards.map((h) => ({ ...h, color: hallAccent[h.hall] || "#0F1D24" })),
  ];

  const noDataAtAll = normalizedHallCards.every((h) => !h.hasData);

  return (
    <div className="w-full flex-shrink-0">
      {noDataAtAll && (
        <div className="flex items-center gap-2 border border-amber-300 bg-amber-50 px-3 py-2 text-[11.5px] font-semibold text-amber-700">
          <FaExclamationTriangle className="flex-shrink-0 text-amber-500" />
          <span>
            No production data uploaded by the supervisor for this date — showing 0 for all halls.
          </span>
        </div>
      )}

      <div
        className="grid gap-px bg-[#C6C6C6] border border-[#C6C6C6]"
        style={{ gridTemplateColumns: `repeat(${allCards.length}, minmax(220px, 1fr))` }}
      >
        {allCards.map((card) => (
          <SummaryCard
            key={card.hall}
            hall={card.hall}
            target={card.target}
            actual={card.actual}
            rejection={card.rejection}
            color={card.color}
            hasData={card.isOverall ? !noDataAtAll : card.hasData}
            onClick={() => onSelectHall(card.isOverall ? "All" : card.hall)}
          />
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;