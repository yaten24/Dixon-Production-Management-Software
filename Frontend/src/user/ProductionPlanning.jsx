import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Factory, Calendar, ArrowRight, ArrowLeft, Save } from "lucide-react";

import machinesData from "../data/machinesData";

const shifts = [
  {
    value: "A",
    label: "Shift A",
  },
  {
    value: "B",
    label: "Shift B",
  },
];

const halls = ["Hall-1", "Hall-2", "Hall-3", "Hall-4", "C-8"];

const partOptions = ["Control Table", "Dashboard Lower", "Door Trim", "Console Panel", "Glove Box", "Rear Cover"];

const inputClass = "w-full h-11 border border-slate-300 px-3 outline-none focus:border-blue-600";

const ProductionPlanning = () => {
  const [step, setStep] = useState(1);

  const [planningInfo, setPlanningInfo] = useState({
    date: new Date().toISOString().split("T")[0],
    hall: "",
    shift: "",
  });

  const [machinePlans, setMachinePlans] = useState([]);

  const hallMachines = useMemo(() => {
    return machinesData.filter((machine) => machine.hall === planningInfo.hall);
  }, [planningInfo.hall]);

  const handleNext = () => {
    if (!planningInfo.date || !planningInfo.hall || !planningInfo.shift) {
      alert("Select Date Hall and Shift");
      return;
    }

    const plans = hallMachines.map((machine) => ({
      machineId: machine.id,
      machineName: machine.name,
      partName: "",
      operatorId: "",
    }));

    setMachinePlans(plans);

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };
  const updateMachinePlan = (machineId, field, value) => {
    setMachinePlans((prev) =>
      prev.map((machine) =>
        machine.machineId === machineId
          ? {
              ...machine,
              [field]: value,
            }
          : machine
      )
    );
  };

  const savePlanning = () => {
    const payload = {
      planId: `PLAN-${Date.now()}`,

      date: planningInfo.date,
      hall: planningInfo.hall,
      shift: planningInfo.shift,

      machines: machinePlans,

      createdAt: new Date().toISOString(),
    };

    console.log(payload);

    alert("Planning Saved Successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1800px] mx-auto p-4">
        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="
          bg-white
          border
          border-slate-200
          p-5
          mb-4
          shadow-sm
          ">
          <div className="flex items-center gap-3">
            <Factory size={28} />

            <div>
              <h1 className="text-2xl font-bold">Daily Production Planning</h1>

              <p className="text-sm text-slate-500">Supervisor Planning Module</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 20,
              }}
              className="
              bg-white
              border
              border-slate-200
              p-5
              shadow-sm
              ">
              <h2 className="text-lg font-semibold mb-5">Planning Setup</h2>

              <div
                className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-5
                ">
                {/* DATE */}

                <div>
                  <label className="block text-sm font-medium mb-2">Planning Date</label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="
                      absolute
                      left-3
                      top-3.5
                      text-slate-500
                      "
                    />

                    <input
                      type="date"
                      value={planningInfo.date}
                      onChange={(e) =>
                        setPlanningInfo({
                          ...planningInfo,
                          date: e.target.value,
                        })
                      }
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* HALL */}

                <div>
                  <label className="block text-sm font-medium mb-2">Hall</label>

                  <select
                    value={planningInfo.hall}
                    onChange={(e) =>
                      setPlanningInfo({
                        ...planningInfo,
                        hall: e.target.value,
                      })
                    }
                    className={inputClass}>
                    <option value="">Select Hall</option>

                    {halls.map((hall) => (
                      <option key={hall} value={hall}>
                        {hall}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SHIFT */}

                <div>
                  <label className="block text-sm font-medium mb-2">Shift</label>

                  <select
                    value={planningInfo.shift}
                    onChange={(e) =>
                      setPlanningInfo({
                        ...planningInfo,
                        shift: e.target.value,
                      })
                    }
                    className={inputClass}>
                    <option value="">Select Shift</option>

                    {shifts.map((shift) => (
                      <option key={shift.value} value={shift.value}>
                        {shift.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SUMMARY */}

              <div
                className="
                mt-6
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-3
                ">
                <div className="border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500">Date</p>

                  <p className="font-semibold">{planningInfo.date || "-"}</p>
                </div>

                <div className="border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500">Hall</p>

                  <p className="font-semibold">{planningInfo.hall || "-"}</p>
                </div>

                <div className="border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500">Shift</p>

                  <p className="font-semibold">{planningInfo.shift || "-"}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  className="
                  h-11
                  px-6
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  flex
                  items-center
                  gap-2
                  transition-all
                  duration-300
                  ">
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 START */}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              className="space-y-4">
              <div
                className="
                bg-white
                border
                border-slate-200
                p-5
                shadow-sm
                ">
                <h2 className="text-lg font-semibold">Machine Planning</h2>

                <p className="text-sm text-slate-500 mt-1">Hall Machines : {hallMachines.length}</p>
              </div>
              {machinePlans.map((machine) => (
                <motion.div
                  key={machine.machineId}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="
                  bg-white
                  border
                  border-slate-200
                  shadow-sm
                  ">
                  <div className="border-b border-slate-200 p-4">
                    <h3 className="font-semibold">{machine.machineName}</h3>

                    <p className="text-xs text-slate-500 mt-1">{machine.machineId}</p>
                  </div>

                  <div
                    className="
                    p-4
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                    ">
                    {/* PART */}

                    <div>
                      <label className="block text-sm font-medium mb-2">Part Name</label>

                      <select value={machine.partName} onChange={(e) => updateMachinePlan(machine.machineId, "partName", e.target.value)} className={inputClass}>
                        <option value="">Select Part</option>

                        {partOptions.map((part) => (
                          <option key={part} value={part}>
                            {part}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* OPERATOR */}

                    <div>
                      <label className="block text-sm font-medium mb-2">Operator ID</label>

                      <input type="text" value={machine.operatorId} placeholder="Enter Operator ID" onChange={(e) => updateMachinePlan(machine.machineId, "operatorId", e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* JSON PREVIEW */}

              <div
                className="
                bg-white
                border
                border-slate-200
                p-4
                shadow-sm
                ">
                <h3 className="font-semibold mb-3">Planning Preview</h3>

                <pre
                  className="
                  bg-slate-950
                  text-green-400
                  text-xs
                  p-4
                  overflow-auto
                  max-h-[350px]
                  ">
                  {JSON.stringify(
                    {
                      date: planningInfo.date,
                      hall: planningInfo.hall,
                      shift: planningInfo.shift,
                      machines: machinePlans,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* ACTIONS */}

              <div
                className="
                sticky
                bottom-0
                bg-white
                border-t
                border-slate-200
                p-4
                ">
                <div
                  className="
                  flex
                  flex-col
                  md:flex-row
                  justify-between
                  gap-3
                  ">
                  <button
                    onClick={handleBack}
                    className="
                    h-11
                    px-6
                    bg-slate-700
                    hover:bg-slate-800
                    text-white
                    flex
                    items-center
                    justify-center
                    gap-2
                    ">
                    <ArrowLeft size={18} />
                    Back
                  </button>

                  <button
                    onClick={savePlanning}
                    className="
                    h-11
                    px-8
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    flex
                    items-center
                    justify-center
                    gap-2
                    ">
                    <Save size={18} />
                    Save Planning
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductionPlanning;
