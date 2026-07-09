import React from "react";
import { useNavigate } from "react-router-dom";
import { hallRouteConfig } from "../../data/dashboardData";
import useHallWiseOverview from "../../hooks/useHallWiseOverview";
import HallCard from "./HallCard";

const HallCards = () => {
  const navigate = useNavigate();
  const { halls, loading, error, refresh } = useHallWiseOverview();

  const handleNavigation = (hall) => {
    navigate(hall.route);
  };

  // ==========================================================
  // Merge live backend numbers (halls) with static route config
  // (hallRouteConfig). Any hall present in the config but missing
  // from the API response (e.g. zero entries today) still renders
  // with zeroed-out values instead of vanishing from the grid.
  // ==========================================================
  const mergedHalls = hallRouteConfig.map((cfg) => {
    const live = halls.find((h) => h.hall === cfg.hall);

    return {
      id: cfg.hall,
      hall: cfg.hall,
      route: cfg.route,
      target: live?.target ?? 0,
      actual: live?.actual ?? 0,
      rejection: live?.rejection ?? 0,
      achievement: live?.achievement ?? "0%",
      status: live?.status ?? "Idle",
      machinesRunning: live?.machinesRunning ?? 0,
      machinesTotal: live?.machinesTotal ?? 0,
    };
  });

  const runningCount = mergedHalls.filter((h) => h.status === "Running").length;

  return (
    <section>
      {/* Header */}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between rounded border border-slate-200 bg-white p-2 shadow-sm">
          {/* Left */}

          <div className="flex items-center gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
                Manufacturing
              </span>

              <h2 className="text-2xl font-bold text-slate-800">
                Production Halls
              </h2>

              <p className="text-sm text-slate-500">
                Select a production hall to monitor production performance
              </p>
            </div>
          </div>

          {/* Right */}

          <div className="rounded bg-blue-50 p-2 text-center">
            <p className="text-4xl font-bold text-blue-700">
              {runningCount}/{mergedHalls.length}
            </p>

            <p className="text-xs font-medium text-slate-600">Running Halls</p>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="mb-2 flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <span>{error}</span>
          <button
            onClick={refresh}
            className="font-semibold underline hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !halls.length ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : (
        /* Hall Cards */
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {mergedHalls.map((hall) => (
            <HallCard key={hall.id} hall={hall} onClick={handleNavigation} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HallCards;
