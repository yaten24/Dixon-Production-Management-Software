import React, { useMemo } from "react";
import SummaryCard from "./SummaryCard";

const SummaryCards = ({ hallHourlyData, hallAccent }) => {
  const summaryData = useMemo(() => {
    const hallSummary = Object.entries(hallHourlyData).map(
      ([hall, rows]) => {
        const target = rows.reduce((sum, row) => sum + row.target, 0);
        const actual = rows.reduce((sum, row) => sum + row.actual, 0);

        // Demo rejection (Replace with API later)
        const rejection = Math.round(actual * 0.03);

        return { hall, target, actual, rejection };
      }
    );

    const overall = hallSummary.reduce(
      (acc, hall) => {
        acc.target += hall.target;
        acc.actual += hall.actual;
        acc.rejection += hall.rejection;
        return acc;
      },
      { target: 0, actual: 0, rejection: 0 }
    );

    return { overall, hallSummary };
  }, [hallHourlyData]);

  const allCards = [
    {
      hall: "Overall Production",
      ...summaryData.overall,
      color: "#2563EB",
    },
    ...summaryData.hallSummary.map((hall) => ({
      ...hall,
      color: hallAccent[hall.hall],
    })),
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
          />
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;