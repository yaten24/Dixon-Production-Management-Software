import MachineCard from "./MachineCard";

const MachineGrid = ({ machines, onSelectMachine }) => {
  if (machines.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border p-10 text-center">
        <h2 className="text-xl font-semibold">No Machines Found</h2>

        <p className="text-gray-500 mt-2">No machine available.</p>
      </div>
    );
  }

  return (
    <div
      className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      2xl:grid-cols-5
      gap-6
    "
    >
      {machines.map((machine) => (
        <MachineCard
          key={machine.id}
          machine={machine}
          onClick={() => onSelectMachine(machine)}
        />
      ))}
    </div>
  );
};

export default MachineGrid;
