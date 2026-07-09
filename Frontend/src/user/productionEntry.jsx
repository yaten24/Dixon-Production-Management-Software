import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaIndustry } from "react-icons/fa";
import machineData from "../data/machinesData";

const ProductionEntry = () => {
  const [entries, setEntries] = useState([]);

  const rejectReasonOptions = [
    "Short Moulding",
    "Silver Mark",
    "Black Spot",
    "Colour Change",
    "Colour Variation",
    "Warpage",
    "Flow Mark",
    "Cut Mark",
    "Shrinkage",
    "Missing",
    "Burn Mark",
    "Weld Line",
  ];

  const lossTimeReasonOptions = [
    "Breakdown - Machine Breakdown",
    "Breakdown - Mould Breakdown",
    "Breakdown - Process Trouble",
    "Setup Adjustment - Mould Change",
    "Tool Change - Mould Polishing Cleaning",
    "Tool Change - Nozzle Change",
    "Tool Change - Insert Ejector Pin Slider Pin Spring Coupler Copper Electrode Change",
    "Start-up Loss - Shift Start Delay",
    "Minor Stoppages - Under 10 Min",
    "Speed Loss - Unskilled Manpower Actual Speed Low",
    "Defect Rework Loss",
    "Schedule Down Time - Planned Stoppage",
    "Management Loss - No Manpower",
    "Management Loss - No Power",
    "Management Loss - Raw Material Shortage",
    "Management Loss - Conveyor Stop",
    "Management Loss - Bin Trolly Short",
    "Operating Motion Loss",
    "Other",
  ];

  const shiftATimes = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
  ];

  const shiftBTimes = [
    "20:00 - 21:00",
    "21:00 - 22:00",
    "22:00 - 23:00",
    "23:00 - 00:00",
    "00:00 - 01:00",
    "01:00 - 02:00",
    "02:00 - 03:00",
    "03:00 - 04:00",
    "04:00 - 05:00",
    "05:00 - 06:00",
    "06:00 - 07:00",
    "07:00 - 08:00",
  ];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hall: "",
    machine: "",
    operatorId: "",
    part: "",
    shift: "",
    timeSlot: "",
    standardCycleTime: "",
    actualCycleTime: "",
    target: "",
    actual: "",
    reject: "",
    rejectReason: "",
    rejectReasonQty: "",
    lossTimeReason: "",
    lossTimeMinutes: "",
    remarks: "",
  });

  const filteredMachines = machineData.filter(
    (machine) =>
      machine.hall?.trim().toLowerCase() ===
      formData.hall?.trim().toLowerCase()
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleHallChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      hall: e.target.value,
      machine: "",
    }));
  };

  const handleMachineChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      machine: e.target.value,
    }));
  };

  const handleShiftChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      shift: e.target.value,
      timeSlot: "",
    }));
  };

  const efficiency =
    Number(formData.target) > 0
      ? (
          (Number(formData.actual) /
            Number(formData.target)) *
          100
        ).toFixed(2)
      : 0;
      
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      id: Date.now(),
      ...formData,
      efficiency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEntries((prev) => [payload, ...prev]);

    setFormData({
      date: new Date().toISOString().split("T")[0],
      hall: "",
      machine: "",
      operatorId: "",
      part: "",
      shift: "",
      timeSlot: "",
      standardCycleTime: "",
      actualCycleTime: "",
      target: "",
      actual: "",
      reject: "",
      rejectReason: "",
      rejectReasonQty: "",
      lossTimeReason: "",
      lossTimeMinutes: "",
      remarks: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0F172A] px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <FaIndustry
            size={36}
            className="text-blue-400"
          />

          <div>
            <h1 className="text-2xl font-bold text-white">
              Production Entry
            </h1>

                       <p className="text-slate-400 text-sm">
              Dixon Manufacturing Management System
            </p>
          </div>
        </div>
      </motion.div>

      <div className="p-4">

        {/* Status Cards */}

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-5 gap-[1px] bg-slate-300 mb-4"
        >
          <div className="bg-white p-4">
            <p className="text-xs text-slate-500">Hall</p>
            <h3 className="font-medium">
              {formData.hall || "-"}
            </h3>
          </div>

          <div className="bg-white p-4">
            <p className="text-xs text-slate-500">Machine</p>
            <h3 className="font-medium">
              {formData.machine || "-"}
            </h3>
          </div>

          <div className="bg-white p-4">
            <p className="text-xs text-slate-500">Shift</p>
            <h3 className="font-medium">
              {formData.shift || "-"}
            </h3>
          </div>

          <div className="bg-white p-4">
            <p className="text-xs text-slate-500">Time Slot</p>
            <h3 className="font-medium">
              {formData.timeSlot || "-"}
            </h3>
          </div>

          <div className="bg-white p-4">
            <p className="text-xs text-slate-500">Efficiency</p>
            <h3 className="font-semibold text-blue-600">
              {efficiency}%
            </h3>
          </div>
        </motion.div>

        {/* Production Form */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200"
        >
          <div className="bg-slate-800 text-white px-4 py-3 flex justify-between">
            <h2>Production Information</h2>

            <span className="text-xs text-slate-300">
              Dixon Production Management System
            </span>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4"
          >

            {/* Production Date */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Production Date
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              />
            </div>

            {/* Hall */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Production Hall
              </label>

              <select
                name="hall"
                value={formData.hall}
                onChange={handleHallChange}
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              >
                <option value="">Select Hall</option>
                <option value="Hall-1">Hall-1</option>
                <option value="Hall-2">Hall-2</option>
                <option value="Hall-3">Hall-3</option>
                <option value="Hall-4">Hall-4</option>
                <option value="C-8">C-8</option>
              </select>
            </div>

            {/* Machine */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Machine Name
              </label>

              <select
                name="machine"
                value={formData.machine}
                onChange={handleMachineChange}
                disabled={!formData.hall}
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              >
                <option value="">
                  Select Machine
                </option>

                {filteredMachines.map((machine) => (
                  <option
                    key={machine.id}
                    value={machine.name}
                  >
                    {machine.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator ID */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Operator ID
              </label>

              <input
                type="text"
                name="operatorId"
                value={formData.operatorId}
                onChange={handleChange}
                placeholder="Enter Operator ID"
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              />
            </div>

            {/* Part Name */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Part Name
              </label>

              <input
                type="text"
                name="part"
                value={formData.part}
                onChange={handleChange}
                placeholder="Enter Part Name"
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              />
            </div>

            {/* Shift */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Shift
              </label>

              <select
                name="shift"
                value={formData.shift}
                onChange={handleShiftChange}
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              >
                <option value="">
                  Select Shift
                </option>

                <option value="A">
                  Shift A (08 AM - 08 PM)
                </option>

                <option value="B">
                  Shift B (08 PM - 08 AM)
                </option>
              </select>
            </div>

            {/* Time Slot */}

            {formData.shift && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
              >
                <label className="text-sm font-medium text-slate-700">
                  Time Slot
                </label>

                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  className="border border-slate-300 p-3 outline-none"
                >
                  <option value="">
                    Select Time Slot
                  </option>

                  {(formData.shift === "A"
                    ? shiftATimes
                    : shiftBTimes
                  ).map((time) => (
                    <option
                      key={time}
                      value={time}
                    >
                      {time}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
                        {/* Standard Cycle Time */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Standard Cycle Time (Sec)
              </label>

              <input
                type="number"
                step="0.01"
                name="standardCycleTime"
                value={formData.standardCycleTime}
                onChange={handleChange}
                placeholder="Enter Standard CT"
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              />
            </div>

            {/* Actual Cycle Time */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Actual Cycle Time (Sec)
              </label>

              <input
                type="number"
                step="0.01"
                name="actualCycleTime"
                value={formData.actualCycleTime}
                onChange={handleChange}
                placeholder="Enter Actual CT"
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              />
            </div>

            {/* Target Quantity */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Target Quantity
              </label>

              <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleChange}
                placeholder="Enter Target Qty"
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              />
            </div>

            {/* Actual Quantity */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Actual Quantity
              </label>

              <input
                type="number"
                name="actual"
                value={formData.actual}
                onChange={handleChange}
                placeholder="Enter Actual Qty"
                className="border border-slate-300 p-3 outline-none focus:border-blue-600 transition-all duration-300"
              />
            </div>

            {/* Reject Quantity */}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Reject Quantity
              </label>

              <input
                type="number"
                name="reject"
                value={formData.reject}
                onChange={handleChange}
                placeholder="Enter Reject Qty"
                className="border border-red-300 p-3 outline-none focus:border-red-500 transition-all duration-300"
              />
            </div>

            {/* Reject Reason */}

            {Number(formData.reject) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-1"
              >
                <label className="text-sm font-medium text-red-600">
                  Reject Reason
                </label>

                <select
                  name="rejectReason"
                  value={formData.rejectReason}
                  onChange={handleChange}
                  className="border border-red-300 p-3 outline-none"
                >
                  <option value="">Select Reject Reason</option>

                  {rejectReasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Reject Reason Quantity */}

            {formData.rejectReason && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-1"
              >
                <label className="text-sm font-medium text-red-600">
                  Reject Qty For Selected Reason
                </label>

                <input
                  type="number"
                  name="rejectReasonQty"
                  value={formData.rejectReasonQty}
                  onChange={handleChange}
                  placeholder={`${formData.rejectReason} Qty`}
                  className="border border-red-300 p-3 outline-none"
                />
              </motion.div>
            )}

            {/* Loss Time Reason */}

            {formData.rejectReasonQty && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-1 md:col-span-2"
              >
                <label className="text-sm font-medium text-orange-600">
                  Loss Time Reason
                </label>

                <select
                  name="lossTimeReason"
                  value={formData.lossTimeReason}
                  onChange={handleChange}
                  className="border border-orange-300 p-3 outline-none"
                >
                  <option value="">Select Loss Time Reason</option>

                  {lossTimeReasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Loss Time Minutes */}

            {formData.lossTimeReason && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-1"
              >
                <label className="text-sm font-medium text-orange-600">
                  Loss Time (Minutes)
                </label>

                <input
                  type="number"
                  name="lossTimeMinutes"
                  value={formData.lossTimeMinutes}
                  onChange={handleChange}
                  placeholder="Enter Loss Time"
                  className="border border-orange-300 p-3 outline-none"
                />
              </motion.div>
            )}

            {/* Remarks */}

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Remarks
              </label>

              <textarea
                rows="3"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter Remarks"
                className="border border-slate-300 p-3 outline-none"
              />
            </div>

            {/* Efficiency */}

            <div className="md:col-span-4">
              <div className="border border-slate-200 bg-slate-50 p-4">

                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    Production Efficiency
                  </span>

                  <span className="font-bold text-blue-600">
                    {efficiency}%
                  </span>
                </div>

                <div className="h-3 bg-slate-300 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${efficiency}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-blue-600"
                  />
                </div>

              </div>
            </div>

            {/* Save Button */}

            <div className="md:col-span-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium transition-all"
              >
                Save Production Entry
              </motion.button>
            </div>

          </motion.form>
        </motion.div>

        {/* Production Table */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 bg-white border border-slate-200 overflow-x-auto"
        >
          <div className="bg-slate-800 text-white px-4 py-3">
            Production Entries
          </div>

          {/* Yahan tumhara existing table code rahega */}
        </motion.div>

      </div>
    </div>
  );
};

export default ProductionEntry;