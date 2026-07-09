import React, { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";

import Header from "../compenents/dashboard/Header";
import Hall1Stats from "../compenents/hallDashboard/Hall1Stats";
import Hall1TrendChart from "../compenents/hallDashboard/Hall1TrendChart";
import Hall1MachineChart from "../compenents/hallDashboard/Hall1MachineChart";
import { Hall1ShiftSummary } from "../compenents/hallDashboard/Hall1ShiftSummary";
import { Hall1TopRejects } from "../compenents/hallDashboard/Hall1TopRejects";

import { getHallCodeFromId } from "../data/dashboardData";
import useHallDashboard from "../hooks/useHallDashboard";

// business-date default (matches backend's 8AM shift-day boundary)
const getBusinessDateDefault = () => {
  const now = new Date();
  if (now.getHours() < 8) now.setDate(now.getDate() - 1);
  return now.toISOString().slice(0, 10);
};

const HallDashboard = () => {
  const { hallId } = useParams();
  const hallCode = getHallCodeFromId(hallId);

  const today = getBusinessDateDefault();

  const [filters, setFilters] = useState({
    from: today,
    to: today,
    machine: "All Machines",
  });

  // draft state for the filter inputs, applied only on "Apply" click
  const [draftFilters, setDraftFilters] = useState(filters);

  const { stats, machineWise, hourlyTrend, shiftSummary, topRejects, machines, loading, error } =
    useHallDashboard(hallCode, filters);

  const handleApplyFilters = () => {
    setFilters(draftFilters);
  };

  const kpiStats = useMemo(() => {
    if (!stats) return null;
    return {
      target: stats.target,
      actual: stats.actual,
      reject: stats.reject,
      achievement: `${stats.achievement}%`,
    };
  }, [stats]);

  // invalid hallId (e.g. /production/hall/99) → redirect home
  if (!hallCode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-[1800px] mx-auto px-2 sm:px-2 lg:px-4 py-2 space-y-2 mt-11">
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* KPI Cards + Filters */}
        <Hall1Stats
          hallCode={hallCode}
          stats={kpiStats}
          loading={loading}
          machines={machines}
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          onApply={handleApplyFilters}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          <Hall1MachineChart hallCode={hallCode} data={machineWise} loading={loading} />
          <Hall1TrendChart hallCode={hallCode} data={hourlyTrend} date={filters.to} loading={loading} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          <Hall1ShiftSummary hallCode={hallCode} shiftSummary={shiftSummary} loading={loading} />
          <Hall1TopRejects hallCode={hallCode} data={topRejects} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default HallDashboard;