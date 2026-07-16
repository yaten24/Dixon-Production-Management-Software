// src/api/machineApi.js

import api from "./axios";

export const getAllMachines = async () => {
  const response = await api.get("/machines");
  return response.data;
};

export const addMachine = async (data) => {
  const response = await api.post("/machines", data);
  return response.data;
};

export const updateMachine = async (id, data) => {
  const response = await api.put(`/machines/${id}`, data);
  return response.data;
};

export const deleteMachine = async (id) => {
  const response = await api.delete(`/machines/${id}`);
  return response.data;
};

// ⭐ NEW
export const updateMachineStatus = async (id, status) => {
  const response = await api.patch(`/machines/${id}/status`, {
    status,
  });

  return response.data;
};

export const getMachines = async (params = {}) => {
  const response = await api.get("/machines", { params });
  return response.data;
};