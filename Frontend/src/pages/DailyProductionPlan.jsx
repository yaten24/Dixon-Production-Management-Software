import { useEffect, useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
} from "react-icons/hi2";

import PlanningFilters from "../compenents/productionPlan/PlanningFilters";
import MachinePlanningTable from "../compenents/productionPlan/MachinePlanningTable";
import PlanningSummary from "../compenents/productionPlan/PlanningSummary";

const DailyProductionPlan = () => {
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    planningDate: new Date().toISOString().split("T")[0],
    hall: "",
    shift: "",
  });

  const [machines, setMachines] = useState([]);

  const [operators, setOperators] = useState([]);

  const [parts, setParts] = useState([]);

  const [planRows, setPlanRows] = useState([]);

  const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "C-8"];

  const shifts = ["A", "B", "C"];

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadPlanningData = async () => {
    if (!filters.hall || !filters.shift) {
      alert("Please select Hall & Shift");
      return;
    }

    try {
      setLoading(true);

      /**
       * Replace this block with API later
       */

      const machineResponse = [
        {
          machineCode: "IM-01",
          machineName: "Injection Machine 01",
        },
        {
          machineCode: "IM-02",
          machineName: "Injection Machine 02",
        },
        {
          machineCode: "IM-03",
          machineName: "Injection Machine 03",
        },
      ];

      const operatorResponse = [
        {
          operatorId: "OP001",
          operatorName: "Rahul",
        },
        {
          operatorId: "OP002",
          operatorName: "Aman",
        },
        {
          operatorId: "OP003",
          operatorName: "Deepak",
        },
      ];

      const partResponse = [
        {
          partNumber: "PN1001",
          partName: "Back Cover",
          cycleTime: 42,
        },
        {
          partNumber: "PN1002",
          partName: "Camera Ring",
          cycleTime: 38,
        },
        {
          partNumber: "PN1003",
          partName: "Battery Cover",
          cycleTime: 45,
        },
      ];

      const existingPlan = machineResponse.map((machine) => ({
        machineCode: machine.machineCode,
        machineName: machine.machineName,
        operatorId: "",
        partNumber: "",
        targetQty: "",
        status: "Pending",
      }));

      setMachines(machineResponse);
      setOperators(operatorResponse);
      setParts(partResponse);
      setPlanRows(existingPlan);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl bg-white shadow">
        <div className="border-b p-6">
          <h1 className="text-2xl font-bold">Daily Production Planning</h1>

          <p className="text-sm text-gray-500 mt-1">
            Create and manage machine-wise production planning.
          </p>
        </div>

        <PlanningFilters
          filters={filters}
          halls={halls}
          shifts={shifts}
          loading={loading}
          onChange={handleFilterChange}
          onLoad={loadPlanningData}
        />
      </div>

      {planRows.length > 0 && (
        <>
          <MachinePlanningTable
            machines={machines}
            rows={planRows}
            setRows={setPlanRows}
            operators={operators}
            parts={parts}
          />

          <PlanningSummary rows={planRows} />
        </>
      )}
    </div>
  );
};

export default DailyProductionPlan;
