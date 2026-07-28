import api from "./axios";

export const getDashboardOverview = (params = {}) => {
  return api
    .get("/dashboard/overview", { params })
    .then((res) => res.data);
};

export const getHallWiseOverview = (params = {}) => {
  return api
    .get("/dashboard/halls", { params })
    .then((res) => res.data);
};