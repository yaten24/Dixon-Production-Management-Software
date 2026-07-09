import React, { useEffect, useState } from "react";

const employees = [
  { id: "EMP001", name: "Rahul Kumar" },
  { id: "EMP002", name: "Mohit Sharma" },
  { id: "EMP003", name: "Amit Singh" },
  { id: "EMP004", name: "Deepak Kumar" },
];

const machines = [  
  {
    id: "MC001",
    hall: "Hall-1",
    machineName: "Milacron 1300 T",
  },
  {
    id: "MC002",
    hall: "Hall-1",
    machineName: "Super Master 408 T1",
  },
  {
    id: "MC003",
    hall: "Hall-4",
    machineName: "Haitian 800 T",
  },
  {
    id: "MC004",
    hall: "Hall-4",
    machineName: "Haitian 650 T",
  },
  {
    id: "MC005",
    hall: "C-8",
    machineName: "Injection Line 01",
  },
];

export default function MachineAssignment() {
  const [assignments, setAssignments] = useState(() => {
    const data = localStorage.getItem("machineAssignments");
    return data ? JSON.parse(data) : [];
  });

  const [form, setForm] = useState({
    employeeId: "",
    hall: "",
    machineId: "",
    shift: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    localStorage.setItem(
      "machineAssignments",
      JSON.stringify(assignments)
    );
  }, [assignments]);

  const filteredMachines = machines.filter(
    (m) => m.hall === form.hall
  );

  const handleAssign = () => {
    if (
      !form.employeeId ||
      !form.hall ||
      !form.machineId ||
      !form.shift
    ) {
      alert("Please fill all fields");
      return;
    }

    const employee = employees.find(
      (e) => e.id === form.employeeId
    );

    const machine = machines.find(
      (m) => m.id === form.machineId
    );

    const machineAlreadyAssigned = assignments.find(
      (item) =>
        item.machineId === form.machineId &&
        item.shift === form.shift &&
        item.date === form.date
    );

    if (machineAlreadyAssigned) {
      alert("Machine already assigned");
      return;
    }

    const operatorAlreadyAssigned = assignments.find(
      (item) =>
        item.employeeId === form.employeeId &&
        item.shift === form.shift &&
        item.date === form.date
    );

    if (operatorAlreadyAssigned) {
      alert("Employee already assigned");
      return;
    }

    const newAssignment = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      hall: form.hall,
      machineId: machine.id,
      machineName: machine.machineName,
      shift: form.shift,
      date: form.date,
      status: "Active",
    };

    setAssignments([...assignments, newAssignment]);

    setForm({
      employeeId: "",
      hall: "",
      machineId: "",
      shift: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const deleteAssignment = (id) => {
    setAssignments(
      assignments.filter((item) => item.id !== id)
    );
  };

  const totalMachines = machines.length;
  const assignedMachines = assignments.length;
  const freeMachines =
    totalMachines - assignedMachines;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Machine Assignment
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Employees</p>
          <h2 className="text-3xl font-bold">
            {employees.length}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Machines</p>
          <h2 className="text-3xl font-bold">
            {machines.length}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Assigned</p>
          <h2 className="text-3xl font-bold text-green-600">
            {assignedMachines}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Free</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {freeMachines}
          </h2>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Assign Machine
        </h2>

        <div className="grid md:grid-cols-5 gap-4">
          <select
            className="border rounded-lg p-3"
            value={form.employeeId}
            onChange={(e) =>
              setForm({
                ...form,
                employeeId: e.target.value,
              })
            }
          >
            <option value="">
              Select Employee
            </option>

            {employees.map((emp) => (
              <option
                key={emp.id}
                value={emp.id}
              >
                {emp.id} - {emp.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg p-3"
            value={form.hall}
            onChange={(e) =>
              setForm({
                ...form,
                hall: e.target.value,
                machineId: "",
              })
            }
          >
            <option value="">
              Select Hall
            </option>
            <option>Hall-1</option>
            <option>Hall-2</option>
            <option>Hall-3</option>
            <option>Hall-4</option>
            <option>C-8</option>
          </select>

          <select
            className="border rounded-lg p-3"
            value={form.machineId}
            onChange={(e) =>
              setForm({
                ...form,
                machineId: e.target.value,
              })
            }
          >
            <option value="">
              Select Machine
            </option>

            {filteredMachines.map((machine) => (
              <option
                key={machine.id}
                value={machine.id}
              >
                {machine.machineName}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg p-3"
            value={form.shift}
            onChange={(e) =>
              setForm({
                ...form,
                shift: e.target.value,
              })
            }
          >
            <option value="">
              Shift
            </option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>

          <input
            type="date"
            className="border rounded-lg p-3"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
          />
        </div>

        <button
          onClick={handleAssign}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Assign Machine
        </button>
      </div>

      {/* Assignment Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            Assigned Machines
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">
                Employee
              </th>
              <th className="p-3 text-left">
                Hall
              </th>
              <th className="p-3 text-left">
                Machine
              </th>
              <th className="p-3 text-left">
                Shift
              </th>
              <th className="p-3 text-left">
                Date
              </th>
              <th className="p-3 text-left">
                Status
              </th>
              <th className="p-3 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-8"
                >
                  No Assignment Found
                </td>
              </tr>
            ) : (
              assignments.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                >
                  <td className="p-3">
                    {item.employeeName}
                  </td>

                  <td className="p-3">
                    {item.hall}
                  </td>

                  <td className="p-3">
                    {item.machineName}
                  </td>

                  <td className="p-3">
                    {item.shift}
                  </td>

                  <td className="p-3">
                    {item.date}
                  </td>

                  <td className="p-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      Active
                    </span>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() =>
                        deleteAssignment(
                          item.id
                        )
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
