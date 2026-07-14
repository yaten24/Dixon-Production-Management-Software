const PlanningStats = ({ header }) => {
  const cards = [
    {
      title: "Total Machines",
      value: header.total_machines,
      color: "bg-blue-500",
    },
    { title: "Planned", value: header.planned_machines, color: "bg-green-500" },
    {
      title: "Pending",
      value: header.total_machines - header.planned_machines,
      color: "bg-yellow-500",
    },
    {
      title: "Total Target",
      value: (header.total_target_qty || 0).toLocaleString(),
      color: "bg-purple-500",
    },
    { title: "Status", value: header.status, color: "bg-indigo-500" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-1">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-white rounded-sm border border-[#E2E4E9]"
        >
          <div className={`h-2 rounded-t-sm ${c.color}`} />
          <div className="px-2 py-0.5">
            <p className="text-[15px] text-gray-500">{c.title}</p>
            <h2 className="text-xl font-bold font-mono mt-1 text-gray-800">
              {c.value}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanningStats;
