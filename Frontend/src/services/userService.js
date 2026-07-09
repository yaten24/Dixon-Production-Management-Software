import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/users`
  : "http://localhost:5000/api/users";

// Backend (snake_case, Suspended) -> Frontend shape (camelCase, Locked)
export const normalizeUser = (u) => ({
  id: u.id,
  employeeId: u.employee_id,
  name: u.name,
  username: u.username,
  email: u.email,
  phone: u.mobile,          // <-- "mobile" ki jagah "phone" (UserTable isi naam se access karta hai)
  role: u.role,
  department: u.department,
  hall: u.hall || u.department || "-",
  status: u.status === "Suspended" ? "Locked" : u.status,
  permissionLevel: u.permission_level,
  lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : "-",
  createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : "-",
});

// Frontend shape -> Backend payload (create/update ke liye)
export const denormalizeUser = (formData) => ({
  employee_id: formData.employeeId,
  name: formData.name,
  username: formData.username,
  email: formData.email,
  mobile: formData.phone,   // <-- yahan bhi "phone" -> "mobile" map hoga backend ke liye
  role: formData.role,
  department: formData.department,
  status: formData.status === "Locked" ? "Suspended" : formData.status,
  ...(formData.password ? { password: formData.password } : {}),
});

export const fetchUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data.data.map(normalizeUser);
};

export const createUserApi = async (formData) => {
  const res = await axios.post(API_URL, denormalizeUser(formData));
  return normalizeUser(res.data.data);
};

export const updateUserApi = async (id, formData) => {
  const res = await axios.put(`${API_URL}/${id}`, denormalizeUser(formData));
  return normalizeUser(res.data.data);
};

export const deleteUserApi = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};