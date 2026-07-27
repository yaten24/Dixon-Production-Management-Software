import api from "./axios";

export const loginUser = async (employeeId, password) => {
  const res = await api.post("/auth/login", { employeeId, password });
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};
