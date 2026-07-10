import api from "./axios";

// Get All Operators
export const getAllOperators = async () => {
  const response = await api.get("/operators");
  return response.data;
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
