import React, { useMemo, useState } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import { rejectionData } from "../data/rejectionData";
import { hourlyRejectionData } from "../data/hourlyRejectionData";

import RejectionFilters from "../compenents/rejection/RejectionFilters";
import RejectionSummaryCards from "../compenents/rejection/RejectionSummaryCards";
import RejectionTrendChart from "../compenents/rejection/RejectionTrendChart";
import RejectionReasonChart from "../compenents/rejection/RejectionReasonChart";
import HallWiseChart from "../compenents/rejection/HallWiseChart";
import MachineWiseChart from "../compenents/rejection/MachineWiseChart";

/* ---------------- Helpers ---------------- */

const sumBy = (rows, keyFn) => {
  const map = {};

  rows.forEach((row) => {
    const key = keyFn(row);
    map[key] = (map[key] || 0) + Number(row.rejectQty || 0);
  });

  return map;
};

const topEntry = (map) => {
  const entries = Object.entries(map);

  if (!entries.length) return null;

  return entries.reduce(
    (best, [key, qty]) => (qty > best.qty ? { key, qty } : best),
    {
      key: entries[0][0],
      qty: entries[0][1],
    },
  );
};

/* ---------------- Component ---------------- */

const RejectionDashboard = () => {
  const [selectedHall, setSelectedHall] = useState("All");
  const [selectedShift, setSelectedShift] = useState("All");
  const [selectedReason, setSelectedReason] = useState("All");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- Filter ---------------- */

  const filteredData = useMemo(() => {
    return rejectionData.filter((row) => {
      if (selectedHall !== "All" && row.hall !== selectedHall) return false;

      if (selectedShift !== "All" && row.shift !== selectedShift) return false;

      if (selectedReason !== "All" && row.reason !== selectedReason)
        return false;

      if (fromDate && row.date < fromDate) return false;

      if (toDate && row.date > toDate) return false;

      return true;
    });
  }, [selectedHall, selectedShift, selectedReason, fromDate, toDate]);

  /* ---------------- Summary ---------------- */

  const totalRejectQty = useMemo(
    () =>
      filteredData.reduce((sum, row) => sum + Number(row.rejectQty || 0), 0),
    [filteredData],
  );

  const highestReason = useMemo(() => {
    const top = topEntry(sumBy(filteredData, (row) => row.reason));

    return top
      ? {
          reason: top.key,
          qty: top.qty,
        }
      : {};
  }, [filteredData]);

  const hallChartData = useMemo(() => {
    const map = sumBy(filteredData, (row) => row.hall);

    return Object.entries(map).map(([hall, qty]) => ({
      hall,
      qty,
    }));
  }, [filteredData]);

  const highestHall = useMemo(() => {
    const top = topEntry(sumBy(filteredData, (row) => row.hall));

    return top
      ? {
          hall: top.key,
          qty: top.qty,
        }
      : {};
  }, [filteredData]);

  const machineChartData = useMemo(() => {
    const map = sumBy(filteredData, (row) => row.machine);

    return Object.entries(map)
      .map(([machine, qty]) => ({
        machine,
        qty,
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [filteredData]);

  const highestMachine = useMemo(() => {
    const top = topEntry(sumBy(filteredData, (row) => row.machine));

    return top
      ? {
          machine: top.key,
          qty: top.qty,
        }
      : {};
  }, [filteredData]);

  const reasonChartRows = useMemo(
    () =>
      filteredData.map((row) => ({
        reason: row.reason,
        qty: Number(row.rejectQty || 0),
      })),
    [filteredData],
  );

  const trendChartData = useMemo(() => {
    const map = sumBy(hourlyRejectionData, (row) => row.hour);

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, qty]) => ({
        hour,
        qty,
      }));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}

      <Sidebar />

      {/* Right Section */}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}


        {/* Main Content */}

        <main className="flex-1 overflow-y-auto bg-slate-100 p-1">
          <div
            className="
              w-full
              rounded
              border
              border-slate-200
              bg-white
              shadow-sm
              p-1
            "
          >
            <div className="space-y-2">
              <RejectionFilters
                selectedHall={selectedHall}
                setSelectedHall={setSelectedHall}
                selectedShift={selectedShift}
                setSelectedShift={setSelectedShift}
                selectedReason={selectedReason}
                setSelectedReason={setSelectedReason}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
              />

              <RejectionSummaryCards
                totalRejectQty={totalRejectQty}
                highestReason={highestReason}
                highestHall={highestHall}
                highestMachine={highestMachine}
              />


              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <RejectionReasonChart data={reasonChartRows} />

                <HallWiseChart data={hallChartData} />
              </div>

              <MachineWiseChart data={machineChartData} />
              <RejectionTrendChart data={trendChartData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RejectionDashboard;
