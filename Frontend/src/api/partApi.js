import api from "./axios";

export const getAllParts = async () => {
  const response = await api.get("/parts");
  return response.data;
};

export const addPart = async (data) => {
  const response = await api.post("/parts", data);
  return response.data;
};

export const updatePart = async (id, data) => {
  const response = await api.put(`/parts/${id}`, data);
  return response.data;
};

export const deletePart = async (id) => {
  const response = await api.delete(`/parts/${id}`);
  return response.data;
};

export const searchParts = async (keyword) => {
  const response = await api.get(`/parts/search?keyword=${keyword}`);
  return response.data;
};

export const createPart = async (part) => {
  const res = await api.post("/parts", part);
  return res.data;
};