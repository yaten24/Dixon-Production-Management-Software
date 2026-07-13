import React, { useEffect, useMemo, useState } from "react";
import {
  Factory,
  Building2,
  Clock,
  Search,
  ChevronDown,
  RefreshCcw,
  X,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  History,
} from "lucide-react";

const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C-8"];
const shifts = ["A", "B", "General"];

const initialAllocations = [
  { id: 1, machineCode: "IM-01", machineName: "160T Toshiba", hall: "Hall 1", shift: "A", employeeId: "EMP001", operatorName: "Rahul Kumar", status: "Running" },
  { id: 2, machineCode: "IM-02", machineName: "250T JSW", hall: "Hall 1", shift: "A", employeeId: "EMP002", operatorName: "Amit Sharma", status: "Running" },
  { id: 3, machineCode: "IM-03", machineName: "350T JSW", hall: "Hall 1", shift: "B", employeeId: "EMP003", operatorName: "Rohit Singh", status: "Idle" },
  { id: 4, machineCode: "IM-04", machineName: "450T Toshiba", hall: "Hall 2", shift: "A", employeeId: "EMP004", operatorName: "Vikas Kumar", status: "Running" },
  { id: 5, machineCode: "IM-05", machineName: "650T JSW", hall: "Hall 3", shift: "C", employeeId: "EMP005", operatorName: "Ankit Kumar", status: "Maintenance" },
];

const operators = [
  { employeeId: "EMP001", name: "Rahul Kumar" },
  { employeeId: "EMP002", name: "Amit Sharma" },
  { employeeId: "EMP003", name: "Rohit Singh" },
  { employeeId: "EMP004", name: "Vikas Kumar" },
  { employeeId: "EMP005", name: "Ankit Kumar" },
  { employeeId: "EMP006", name: "Mohit Sharma" },
  { employeeId: "EMP007", name: "Deepak Kumar" },
];

const reasons = [
  "Shift Change",
  "Operator Leave",
  "Production Planning",
  "Machine Breakdown",
  "Quality Issue",
  "Supervisor Decision",
  "Training",
  "Other",
];

const statusStyles = {
  Running: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Idle: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Maintenance: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const statusDot = {
  Running: "bg-emerald-500",
  Idle: "bg-amber-500",
  Maintenance: "bg-rose-500",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UpdateMachineOperator() {
  const [allocations, setAllocations] = useState(initialAllocations);
  const [hall, setHall] = useState("Hall 1");
  const [shift, setShift] = useState("A");
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [operatorSearch, setOperatorSearch] = useState("");
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState([]);

  const filteredMachines = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allocations.filter((item) => {
      const matchesFilters = item.hall === hall && item.shift === shift;
      if (!matchesFilters) return false;
      if (!q) return true;
      return (
        item.machineCode.toLowerCase().includes(q) ||
        item.machineName.toLowerCase().includes(q) ||
        item.operatorName.toLowerCase().includes(q)
      );
    });
  }, [allocations, hall, shift, search]);

  const filteredOperators = useMemo(() => {
    const q = operatorSearch.toLowerCase().trim();
    return operators.filter(
      (item) =>
        item.employeeId.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }, [operatorSearch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function openUpdateModal(machine) {
    setSelectedMachine(machine);
    setSelectedOperator(null);
    setOperatorSearch("");
    setReason("");
    setRemarks("");
    setErrors({});
    setOpenModal(true);
  }

  function closeModal() {
    setOpenModal(false);
    setSelectedMachine(null);
    setSelectedOperator(null);
    setOperatorSearch("");
    setReason("");
    setRemarks("");
    setErrors({});
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && openModal) closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openModal]);

  function handleSubmit() {
    const nextErrors = {};
    if (!selectedOperator) nextErrors.operator = "Select a new operator.";
    else if (selectedOperator.employeeId === selectedMachine.employeeId)
      nextErrors.operator = "New operator must differ from the current one.";
    if (!reason) nextErrors.reason = "Select a reason for the change.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setAllocations((prev) =>
      prev.map((m) =>
        m.id === selectedMachine.id
          ? {
              ...m,
              employeeId: selectedOperator.employeeId,
              operatorName: selectedOperator.name,
            }
          : m
      )
    );

    setLog((prev) => [
      {
        id: Date.now(),
        machineCode: selectedMachine.machineCode,
        from: selectedMachine.operatorName,
        to: selectedOperator.name,
        reason,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ].slice(0, 6));

    setToast(`${selectedMachine.machineCode} reassigned to ${selectedOperator.name}`);
    closeModal();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <RefreshCcw className="text-slate-900 w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-amber-400 font-semibold">
              Floor Operations
            </p>
            <h1 className="text-xl font-bold text-white leading-tight">
              Update Machine Operator
            </h1>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-slate-400 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live shift data
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Hall
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                <select
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-9 py-3 appearance-none outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-800"
                >
                  {halls.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={17} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Shift
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-9 py-3 appearance-none outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-800"
                >
                  {shifts.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={17} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Search Machine
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                <input
                  type="text"
                  placeholder="Machine code, name or operator..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Machine Allocations</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {hall} &middot; Shift {shift}
              </p>
            </div>
            <div className="bg-slate-900 text-amber-400 px-4 py-2 rounded-xl font-mono font-semibold text-sm">
              {filteredMachines.length} {filteredMachines.length === 1 ? "MACHINE" : "MACHINES"}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Machine</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Current Operator</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Employee ID</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3.5 text-center font-semibold text-slate-500 text-xs uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.length > 0 ? (
                  filteredMachines.map((machine) => (
                    <tr key={machine.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-sm">
                          {machine.machineCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{machine.machineName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {initials(machine.operatorName)}
                          </div>
                          <span className="font-medium text-slate-800">{machine.operatorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-sm">{machine.employeeId}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[machine.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[machine.status]}`} />
                          {machine.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openUpdateModal(machine)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Factory className="mx-auto text-slate-300 mb-4" size={48} />
                      <h3 className="text-base font-semibold text-slate-600">No machines found</h3>
                      <p className="text-slate-400 mt-1 text-sm">Try a different Hall, Shift, or search term.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent changes */}
        {log.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">Recent reassignments</h3>
            </div>
            <div className="space-y-2.5">
              {log.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{entry.time}</span>
                  <span className="font-mono font-semibold text-slate-700">{entry.machineCode}</span>
                  <span className="text-slate-500">{entry.from}</span>
                  <ArrowRight size={13} className="text-slate-300" />
                  <span className="text-slate-800 font-medium">{entry.to}</span>
                  <span className="text-slate-400 ml-auto">{entry.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Update Machine Operator</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedMachine?.machineCode} &middot; {selectedMachine?.hall}, Shift {selectedMachine?.shift}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition text-slate-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-7 overflow-y-auto">
              <div className="grid lg:grid-cols-2 gap-7">
                {/* LEFT */}
                <div className="space-y-5">
                  <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                      Machine Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400">Machine Code</label>
                        <p className="mt-1 font-mono font-bold text-slate-800">{selectedMachine?.machineCode}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Hall</label>
                        <p className="mt-1 font-medium text-slate-800">{selectedMachine?.hall}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-400">Machine Name</label>
                        <p className="mt-1 font-medium text-slate-800">{selectedMachine?.machineName}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Shift</label>
                        <p className="mt-1 text-slate-800">{selectedMachine?.shift}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[selectedMachine?.status]}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[selectedMachine?.status]}`} />
                            {selectedMachine?.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                      Current Operator
                    </h3>
                    <div className="rounded-lg bg-slate-50 p-4 flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0">
                        {initials(selectedMachine?.operatorName)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{selectedMachine?.operatorName}</h4>
                        <p className="text-slate-500 text-sm font-mono">{selectedMachine?.employeeId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Reassignment Preview</p>
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-400 mb-1">Current</p>
                        <p className="font-semibold text-slate-700 text-sm truncate">{selectedMachine?.operatorName}</p>
                      </div>
                      <ArrowRight className="text-amber-500 shrink-0" size={18} />
                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-400 mb-1">New</p>
                        <p className={`font-semibold text-sm truncate ${selectedOperator ? "text-slate-800" : "text-slate-300"}`}>
                          {selectedOperator ? selectedOperator.name : "Not selected"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Select New Operator
                  </h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                    <input
                      type="text"
                      placeholder="Search Employee ID or Name..."
                      value={operatorSearch}
                      onChange={(e) => setOperatorSearch(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl h-[260px] overflow-y-auto">
                    {filteredOperators.length > 0 ? (
                      filteredOperators.map((operator) => {
                        const isCurrent = operator.employeeId === selectedMachine?.employeeId;
                        const isSelected = selectedOperator?.employeeId === operator.employeeId;
                        return (
                          <div
                            key={operator.employeeId}
                            onClick={() => !isCurrent && setSelectedOperator(operator)}
                            className={`flex items-center justify-between px-4 py-3.5 border-b border-slate-100 last:border-b-0 transition
                              ${isCurrent ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"}
                              ${isSelected ? "bg-amber-50 border-l-4 border-l-amber-500 pl-3.5" : ""}`}
                          >
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm">{operator.name}</h4>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{operator.employeeId}</p>
                            </div>
                            {isCurrent && <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Current</span>}
                            {isSelected && <CheckCircle2 size={18} className="text-amber-500" />}
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">No operator found</div>
                    )}
                  </div>
                  {errors.operator && (
                    <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5">
                      <AlertCircle size={14} /> {errors.operator}
                    </p>
                  )}

                  {/* Reason */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Change</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 bg-white
                        ${errors.reason ? "border-rose-400" : "border-slate-300"}`}
                    >
                      <option value="">Select reason</option>
                      {reasons.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    {errors.reason && (
                      <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5">
                        <AlertCircle size={14} /> {errors.reason}
                      </p>
                    )}
                  </div>

                  {/* Remarks */}
                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks (optional)</label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add any notes about this change..."
                      className="w-full border border-slate-300 rounded-xl p-3.5 resize-none outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-7 py-4 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-500">Verify details before confirming the reassignment.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 transition text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition text-sm"
                >
                  Update Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}