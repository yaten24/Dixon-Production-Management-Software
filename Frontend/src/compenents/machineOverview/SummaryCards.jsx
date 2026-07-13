const SummaryCards = ({ machines }) => {
  const total = machines.length;

  const running = machines.filter((m) => m.status === "Running").length;

  const idle = machines.filter((m) => m.status === "Idle").length;

  const breakdown = machines.filter((m) => m.status === "Breakdown").length;

  const totalProduction = machines.reduce((sum, m) => sum + m.actual, 0);

  const avgEfficiency = total
    ? (machines.reduce((sum, m) => sum + m.efficiency, 0) / total).toFixed(1)
    : 0;

  const cards = [
    {
      title: "Machines",
      value: total,
      color: "bg-blue-600",
    },

    {
      title: "Running",
      value: running,
      color: "bg-green-600",
    },

    {
      title: "Idle",
      value: idle,
      color: "bg-yellow-500",
    },

    {
      title: "Breakdown",
      value: breakdown,
      color: "bg-red-600",
    },

    {
      title: "Today's Qty",
      value: totalProduction,
      color: "bg-indigo-600",
    },

    {
      title: "Efficiency",
      value: `${avgEfficiency}%`,
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow border overflow-hidden"
        >
          <div className={`h-2 ${card.color}`} />

          <div className="p-5">
            <p className="text-sm text-gray-500">{card.title}</p>

            <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
