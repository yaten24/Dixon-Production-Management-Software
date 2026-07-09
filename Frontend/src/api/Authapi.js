import api from "./axios";

// ASSUMPTION: routes are mounted at /api/auth/... on the backend
// (e.g. app.use("/api/auth", userRoutes)). Adjust the paths below if your
// mount point is different (e.g. /api/users/login).

export const loginUser = async (employeeId, password) => {
  const res = await api.post("/auth/login", { employeeId, password });
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

// Called on every page load (from AuthContext) to check "is there already
// a valid session cookie?" — this is what replaces localStorage: the
// browser sends the httpOnly cookie automatically, the backend verifies
// it, and returns the current user if the cookie is valid.
export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};
