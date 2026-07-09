import axios from "./axios";

// Get All Operators
export const getAllOperators = async () => {
  const response = await axios.get("/operators");
  return response.data;
};

// Get Single Operator By Code
export const getOperatorByCode = async (operatorCode) => {
  const response = await axios.get(`/operators/code/${operatorCode}`);
  return response.data;
};

// Add Operator
export const addOperator = async (data) => {
  const response = await axios.post("/operators", data);
  return response.data;
};

// Update Operator
export const updateOperator = async (id, data) => {
  const response = await axios.put(`/operators/${id}`, data);
  return response.data;
};

// Delete Operator
export const deleteOperator = async (id) => {
  const response = await axios.delete(`/operators/${id}`);
  return response.data;
};