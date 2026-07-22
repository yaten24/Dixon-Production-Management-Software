import React from "react";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

import SummaryCard from "./SummaryCard"; // uses the polished standalone version — no more duplicate inline card

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
    <div className="w-full flex-shrink-0 space-y-1">
      {noDataAtAll && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700"
        >
          <FaExclamationTriangle className="flex-shrink-0 text-amber-500" />
          <span>
            No production data uploaded by the supervisor for this date — showing 0 for all halls.
          </span>
        </motion.div>
      )}

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${allCards.length}, minmax(140px, 1fr))` }}
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