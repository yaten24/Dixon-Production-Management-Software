import api from "./axios";

export const getHallStats = (params) =>
  api.get("/hall-dashboard/stats", { params }).then((res) => res.data);

export const getHallMachineWise = (params) =>
  api.get("/hall-dashboard/machine-wise", { params }).then((res) => res.data);

export const getHallHourlyTrend = (params) =>
  api.get("/hall-dashboard/hourly-trend", { params }).then((res) => res.data);

export const getHallShiftSummary = (params) =>
  api.get("/hall-dashboard/shift-summary", { params }).then((res) => res.data);

export const getHallTopRejects = (params) =>
  api.get("/hall-dashboard/top-rejects", { params }).then((res) => res.data);

export const getHallMachines = (params) =>
  api.get("/hall-dashboard/machines", { params }).then((res) => res.data);
