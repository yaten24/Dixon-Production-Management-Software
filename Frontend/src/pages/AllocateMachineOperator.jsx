import React, { useMemo, useState } from "react";
import {
  Calendar,
  Building2,
  Factory,
  Search,
  User,
  Clock,
  ChevronDown,
  Save,
  X,
} from "lucide-react";

const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C-8"];

const shifts = ["A", "B", "C", "General"];

const operators = [
  {
    employeeId: "EMP001",
    name: "Rahul Kumar",
    department: "Production",
    designation: "Machine Operator",
    status: "Available",
  },
  {
    employeeId: "EMP002",
    name: "Amit Sharma",
    department: "Production",
    designation: "Machine Operator",
    status: "Available",
  },
  {
    employeeId: "EMP003",
    name: "Rohit Singh",
    department: "Production",
    designation: "Machine Operator",
    status: "Busy",
  },
  {
    employeeId: "EMP004",
    name: "Vikas Kumar",
    department: "Production",
    designation: "Machine Operator",
    status: "Available",
  },
];

const machineList = [
  {
    machineCode: "IM-01",
    machineName: "160T Toshiba",
    hall: "Hall 1",
    allocated: false,
  },
  {
    machineCode: "IM-02",
    machineName: "180T Toshiba",
    hall: "Hall 1",
    allocated: false,
  },
  {
    machineCode: "IM-03",
    machineName: "250T JSW",
    hall: "Hall 1",
    allocated: true,
  },
  {
    machineCode: "IM-04",
    machineName: "350T JSW",
    hall: "Hall 2",
    allocated: false,
  },
  {
    machineCode: "IM-05",
    machineName: "450T Toshiba",
    hall: "Hall 2",
    allocated: false,
  },
  {
    machineCode: "IM-06",
    machineName: "650T JSW",
    hall: "Hall 3",
    allocated: false,
  },
];

const AllocateMachineOperator = () => {
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().substring(0, 10),
  );

  const [hall, setHall] = useState("Hall 1");

  const [shift, setShift] = useState("A");

  const [operatorSearch, setOperatorSearch] = useState("");

  const [selectedOperator, setSelectedOperator] = useState(null);

  const [machineSearch, setMachineSearch] = useState("");

  const [selectedMachines, setSelectedMachines] = useState([]);

  const [remarks, setRemarks] = useState("");

  const filteredOperators = useMemo(() => {
    return operators.filter(
      (operator) =>
        operator.employeeId
          .toLowerCase()
          .includes(operatorSearch.toLowerCase()) ||
        operator.name.toLowerCase().includes(operatorSearch.toLowerCase()),
    );
  }, [operatorSearch]);

  const filteredMachines = useMemo(() => {
    return machineList.filter(
      (machine) =>
        machine.hall === hall &&
        (machine.machineCode
          .toLowerCase()
          .includes(machineSearch.toLowerCase()) ||
          machine.machineName
            .toLowerCase()
            .includes(machineSearch.toLowerCase())),
    );
  }, [hall, machineSearch]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Factory className="text-white w-8 h-8" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Allocate Machine to Operator
              </h1>

              <p className="text-slate-500 mt-1">
                Assign production machines to operators for a selected hall and
                shift.
              </p>
            </div>
          </div>
        </div>

        {/* Allocation Details */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-6">
            Allocation Details
          </h2>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {/* Date */}

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Allocation Date
              </label>

              <div className="relative">
                <Calendar
                  className="absolute left-4 top-3 text-slate-400"
                  size={18}
                />

                <input
                  type="date"
                  value={allocationDate}
                  onChange={(e) => setAllocationDate(e.target.value)}
                  className="w-full border rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Hall */}

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Hall
              </label>

              <div className="relative">
                <Building2
                  className="absolute left-4 top-3 text-slate-400"
                  size={18}
                />

                <select
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  className="w-full border rounded-xl pl-12 pr-10 py-3 appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {halls.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <ChevronDown
                  className="absolute right-4 top-3 text-slate-400"
                  size={18}
                />
              </div>
            </div>

            {/* Shift */}

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Shift
              </label>

              <div className="relative">
                <Clock
                  className="absolute left-4 top-3 text-slate-400"
                  size={18}
                />

                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full border rounded-xl pl-12 pr-10 py-3 appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {shifts.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <ChevronDown
                  className="absolute right-4 top-3 text-slate-400"
                  size={18}
                />
              </div>
            </div>
          </div>
        </div>
        {/* ============================
            Operator Selection Section
        ============================= */}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Left Side */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="text-blue-600" size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Search Operator
                </h2>

                <p className="text-sm text-slate-500">
                  Search using Employee ID or Operator Name
                </p>
              </div>
            </div>

            {/* Search Box */}

            <div className="relative mb-6">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Search Employee ID or Name..."
                value={operatorSearch}
                onChange={(e) => setOperatorSearch(e.target.value)}
                className="w-full border rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Operator List */}

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredOperators.length > 0 ? (
                filteredOperators.map((operator) => (
                  <div
                    key={operator.employeeId}
                    onClick={() => setSelectedOperator(operator)}
                    className={`cursor-pointer border rounded-xl p-4 transition-all duration-300

                    ${
                      selectedOperator?.employeeId === operator.employeeId
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {operator.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {operator.employeeId}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold

                        ${
                          operator.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {operator.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed rounded-xl py-12 text-center text-slate-400">
                  No Operator Found
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <User className="text-green-600" size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Operator Details
                </h2>

                <p className="text-sm text-slate-500">
                  Selected Operator Information
                </p>
              </div>
            </div>

            {selectedOperator ? (
              <div className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Employee ID
                  </label>

                  <p className="text-lg font-semibold text-slate-800 mt-1">
                    {selectedOperator.employeeId}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Name
                  </label>

                  <p className="text-lg font-semibold text-slate-800 mt-1">
                    {selectedOperator.name}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Department
                  </label>

                  <p className="text-slate-700 mt-1">
                    {selectedOperator.department}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Designation
                  </label>

                  <p className="text-slate-700 mt-1">
                    {selectedOperator.designation}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Current Status
                  </label>

                  <div className="mt-2">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold

                      ${
                        selectedOperator.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedOperator.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center py-12">
                <User className="text-slate-300 mb-4" size={60} />

                <h3 className="font-semibold text-slate-600">
                  No Operator Selected
                </h3>

                <p className="text-sm text-slate-400 mt-2">
                  Select an operator from the list to view details.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ============================
            Machine Search
        ============================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Factory className="text-orange-600" size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Available Machines
              </h2>

              <p className="text-sm text-slate-500">
                Select one or more machines for allocation.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search Machine Code or Machine Name..."
              value={machineSearch}
              onChange={(e) => setMachineSearch(e.target.value)}
              className="w-full border rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* ==========================================
                Machine Grid
        =========================================== */}

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5 mb-8">
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine) => {
              const isSelected = selectedMachines.some(
                (item) => item.machineCode === machine.machineCode,
              );

              return (
                <div
                  key={machine.machineCode}
                  onClick={() => {
                    if (machine.allocated) return;

                    if (isSelected) {
                      setSelectedMachines((prev) =>
                        prev.filter(
                          (item) => item.machineCode !== machine.machineCode,
                        ),
                      );
                    } else {
                      setSelectedMachines((prev) => [...prev, machine]);
                    }
                  }}
                  className={`rounded-2xl border p-5 cursor-pointer transition-all duration-300

                  ${
                    machine.allocated
                      ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                      : isSelected
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-blue-500 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {machine.machineCode}
                      </h3>

                      <p className="text-slate-500 mt-1">
                        {machine.machineName}
                      </p>

                      <p className="text-sm text-slate-400 mt-2">
                        {machine.hall}
                      </p>
                    </div>

                    {machine.allocated ? (
                      <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
                        Allocated
                      </span>
                    ) : isSelected ? (
                      <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Selected
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 border border-dashed rounded-2xl">
              <Factory size={60} className="mx-auto text-slate-300 mb-4" />

              <h3 className="text-lg font-semibold text-slate-600">
                No Machines Found
              </h3>

              <p className="text-slate-400 mt-2">
                Try searching with another machine code.
              </p>
            </div>
          )}
        </div>

        {/* ==========================================
                Selected Machines
        =========================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Selected Machines
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Machines that will be allocated to the selected operator.
              </p>
            </div>

            <div className="bg-blue-600 text-white rounded-xl px-5 py-2 font-semibold">
              {selectedMachines.length} Selected
            </div>
          </div>

          {selectedMachines.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {selectedMachines.map((machine) => (
                <div
                  key={machine.machineCode}
                  className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-4"
                >
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {machine.machineCode}
                    </h4>

                    <p className="text-sm text-slate-500">
                      {machine.machineName}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedMachines((prev) =>
                        prev.filter(
                          (item) => item.machineCode !== machine.machineCode,
                        ),
                      )
                    }
                    className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded-xl py-12 text-center">
              <Factory className="mx-auto text-slate-300 mb-3" size={55} />

              <h3 className="font-semibold text-slate-600">
                No Machine Selected
              </h3>

              <p className="text-slate-400 mt-2">
                Click on any available machine above.
              </p>
            </div>
          )}
        </div>
        {/* ==========================================
                Remarks
        =========================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-5">Remarks</h2>

          <textarea
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks (optional)..."
            className="w-full border rounded-xl p-4 outline-none resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ==========================================
                Footer Buttons
        =========================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Allocation Summary
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Operator :
                <span className="font-semibold text-slate-700 ml-2">
                  {selectedOperator ? selectedOperator.name : "Not Selected"}
                </span>
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Machines :
                <span className="font-semibold text-blue-600 ml-2">
                  {selectedMachines.length}
                </span>
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedOperator(null);
                  setSelectedMachines([]);
                  setRemarks("");
                  setOperatorSearch("");
                  setMachineSearch("");
                }}
                className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 flex items-center gap-2 transition"
              >
                <X size={18} />
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!selectedOperator) {
                    alert("Please select an operator.");
                    return;
                  }

                  if (selectedMachines.length === 0) {
                    alert("Please select at least one machine.");
                    return;
                  }

                  const payload = {
                    allocationDate,
                    hall,
                    shift,
                    employeeId: selectedOperator.employeeId,
                    employeeName: selectedOperator.name,
                    machines: selectedMachines.map((item) => item.machineCode),
                    remarks,
                  };

                  console.log(payload);

                  alert("Machine Allocated Successfully.");

                  // Reset Form

                  setSelectedOperator(null);
                  setSelectedMachines([]);
                  setRemarks("");
                  setOperatorSearch("");
                  setMachineSearch("");
                }}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition"
              >
                <Save size={18} />
                Allocate Machine
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocateMachineOperator;
