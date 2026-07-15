import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";

import Header from "../compenents/dashboard/Header";
import Hall1Stats from "../compenents/hallDashboard/Hall1Stats";
import Hall1TrendChart from "../compenents/hallDashboard/Hall1TrendChart";
import Hall1MachineChart from "../compenents/hallDashboard/Hall1MachineChart";
import Hall1MachineOEE from "../compenents/hallDashboard/Hall1MachineOEE";
import { Hall1ShiftSummary } from "../compenents/hallDashboard/Hall1ShiftSummary";
import { Hall1TopRejects } from "../compenents/hallDashboard/Hall1TopRejects";

import { getHallCodeFromId } from "../data/dashboardData";
import useHallDashboard from "../hooks/useHallDashboard";
import { exportHallDashboardToExcel } from "../utils/exportHallDashboard";

const getBusinessDateDefault = () => {
  const now = new Date();
  if (now.getHours() < 8) now.setDate(now.getDate() - 1);
  return now.toISOString().slice(0, 10);
};

const defaultFilters = () => {
  const today = getBusinessDateDefault();
  return { from: today, to: today, machine: "All Machines", shift: "All" };
};

const HallDashboard = () => {
  const { hallId } = useParams();
  const hallCode = getHallCodeFromId(hallId);

  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);

  useEffect(() => {
    const fresh = defaultFilters();
    setFilters(fresh);
    setDraftFilters(fresh);
  }, [hallCode]);

  const {
    stats,
    machineWise,
    hourlyTrend,
    shiftSummary,
    topRejects,
    machines,
    loading,
    error,
    refresh,
  } = useHallDashboard(hallCode, filters);

  const handleApplyFilters = () => setFilters(draftFilters);

  const handleExport = () => {
    exportHallDashboardToExcel({
      hallCode,
      filters,
      stats,
      machineWise,
      shiftSummary,
      topRejects,
    });
  };

  const kpiStats = useMemo(() => {
    if (!stats) return null;
    return {
      target: stats.target,
      actual: stats.actual,
      reject: stats.reject,
      achievement: `${stats.achievement}%`,
      oee: stats.oee,
    };
  }, [stats]);

  if (!hallCode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="max-w-[1800px] mx-auto px-1 sm:px-2 lg:px-2 py-2 space-y-1 mt-11">
        {error && (
          <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {error}
          </div>
        )}

        <Hall1Stats
          hallCode={hallCode}
          stats={kpiStats}
          loading={loading}
          machines={machines}
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          onApply={handleApplyFilters}
          onRefresh={refresh}
          onExport={handleExport}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          <Hall1MachineChart
            hallCode={hallCode}
            data={machineWise}
            machines={machines}
            loading={loading}
          />
          <Hall1TrendChart
            hallCode={hallCode}
            data={hourlyTrend}
            date={filters.to}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
          <Hall1ShiftSummary
            hallCode={hallCode}
            shiftSummary={shiftSummary}
            loading={loading}
          />
          <Hall1TopRejects
            hallCode={hallCode}
            data={topRejects}
            loading={loading}
          />
          <Hall1MachineOEE
            hallCode={hallCode}
            data={machineWise}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default HallDashboard;