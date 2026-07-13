const PlanningSummary = ({ rows }) => {
  const totalMachines = rows.length;

  const plannedMachines = rows.filter(
    (row) =>
      row.operatorId &&
      row.partNumber &&
      Number(row.targetQty) > 0
  ).length;

  const pendingMachines = totalMachines - plannedMachines;

  const totalTarget = rows.reduce(
    (sum, row) => sum + (Number(row.targetQty) || 0),
    0
  );

  const avgCycleTime =
    rows.filter((r) => r.cycleTime).length > 0
      ? (
          rows.reduce(
            (sum, row) => sum + (Number(row.cycleTime) || 0),
            0
          ) /
          rows.filter((r) => r.cycleTime).length
        ).toFixed(2)
      : 0;

  const cards = [
    {
      title: "Total Machines",
      value: totalMachines,
      color: "bg-blue-500",
    },
    {
      title: "Planned",
      value: plannedMachines,
      color: "bg-green-500",
    },
    {
      title: "Pending",
      value: pendingMachines,
      color: "bg-yellow-500",
    },
    {
      title: "Total Target",
      value: totalTarget.toLocaleString(),
      color: "bg-purple-500",
    },
    {
      title: "Avg Cycle Time",
      value: `${avgCycleTime} sec`,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">

      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow border"
        >
          <div
            className={`h-2 rounded-t-xl ${card.color}`}
          />

          <div className="p-5">

            <p className="text-sm text-gray-500">
              {card.title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {card.value}
            </h2>

          </div>
        </div>
      ))}

    </div>
  );
};

export default PlanningSummary;