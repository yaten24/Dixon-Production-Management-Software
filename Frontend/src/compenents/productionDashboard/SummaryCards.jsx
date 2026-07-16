import React from "react";
import SummaryCard from "./SummaryCard";

const SummaryCards = ({ overall, hallSummary, hallAccent, onSelectHall }) => {
  const allCards = [
    { hall: "Overall Production", ...overall, color: "#2563EB", isOverall: true },
    ...hallSummary.map((h) => ({ ...h, color: hallAccent[h.hall] || "#2563EB" })),
  ];

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${allCards.length}, minmax(160px, 1fr))`,
        }}
      >
        {allCards.map((card) => (
          <SummaryCard
            key={card.hall}
            hall={card.hall}
            target={card.target}
            actual={card.actual}
            rejection={card.rejection}
            color={card.color}
            onClick={() => onSelectHall(card.isOverall ? "All" : card.hall)}
          />
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;