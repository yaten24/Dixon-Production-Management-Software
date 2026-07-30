// src/api/machineDashboardApi.js
import api from "./axios";

export async function fetchMachineWiseSummary({ year, month, hall, shift }) {
  const params = { year, month };
  if (hall && hall !== "All Halls" && hall !== "All") params.hall = hall;
  if (shift && shift !== "All Shifts" && shift !== "All") params.shift = shift;

  const res = await api.get("/machine-wise/production/dashboard/machine-summary", {
    params,
    withCredentials: true,
  });

  return res.data?.data;
}