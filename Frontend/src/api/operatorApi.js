import api from "./axios";

// Get All Operators (supports pagination + search + shift/hall filters)
// -> { success, count, total, page, limit, totalPages, data }
export const getAllOperators = async (params = {}) => {
  const response = await api.get("/operators", { params });
  return response.data;
};

// NEW: search-as-you-type suggestions for the Production Entry operator
// field. Reuses the existing GET /operators?search=&limit= endpoint —
// it already matches against BOTH operator_name and operator_code
// (see buildFilters in operatorModel.js), so typing either one works.
// Capped to a small limit + page 1 so the dropdown stays light.
export const searchOperators = async (keyword) => {
  const response = await api.get("/operators", {
    params: { search: keyword, limit: 20, page: 1 },
  });
  return response.data; // { success, data: [...], total, count, page, limit, totalPages }
};

// Get Single Operator By Code
export const getOperatorByCode = async (operatorCode) => {
  const response = await api.get(`/operators/code/${operatorCode}`);
  return response.data;
};

export const createOperator = async (operator) => {
  const res = await api.post("/operators", operator);
  return res.data;
};

// Add Operator
export const addOperator = async (data) => {
  const response = await api.post("/operators", data);
  return response.data;
};

// Update Operator
export const updateOperator = async (id, data) => {
  const response = await api.put(`/operators/${id}`, data);
  return response.data;
};

// Delete Operator
export const deleteOperator = async (id) => {
  const response = await api.delete(`/operators/${id}`);
  return response.data;
};