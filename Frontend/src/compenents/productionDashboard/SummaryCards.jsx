import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import SummaryCard from "./SummaryCard";

/**
 * halls: static list of all hall names, e.g. ["Hall 1","Hall 2","Hall 3","Hall 4","C-8"]
 * hallSummary: array from API — only contains halls that HAVE entries for the selected date
 * overall: { target, actual, rejection } for the whole day (may be all-zero)
 */
const SummaryCards = ({ overall, hallSummary = [], halls = [], hallAccent, onSelectHall }) => {
  // Map API data by hall name for quick lookup
  const summaryMap = new Map(hallSummary.map((h) => [h.hall, h]));

  // Always render every hall — fill missing ones with zeros
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
      color: "#2563EB",
      isOverall: true,
    },
    ...normalizedHallCards.map((h) => ({
      ...h,
      color: hallAccent[h.hall] || "#2563EB",
    })),
  ];

  // No hall has any entry for this date at all
  const noDataAtAll = normalizedHallCards.every((h) => !h.hasData);

  return (
    <div className="w-full flex-shrink-0 space-y-1.5">
      {noDataAtAll && (
        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">
          <FaExclamationTriangle className="flex-shrink-0 text-amber-500" />
          <span>
            No production data uploaded by the supervisor for this date — showing 0 for all halls.
          </span>
        </div>
      )}

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${allCards.length}, minmax(140px, 1fr))`,
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
            hasData={card.isOverall ? !noDataAtAll : card.hasData}
            onClick={() => onSelectHall(card.isOverall ? "All" : card.hall)}
          />
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;