// ==============================
// Status Badge Colors
// ==============================
export const getStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 border border-green-200";

    case "Inactive":
      return "bg-gray-100 text-gray-700 border border-gray-200";

    case "Locked":
      return "bg-red-100 text-red-700 border border-red-200";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

// ==============================
// Role Badge Colors
// ==============================
export const getRoleColor = (role) => {
  switch (role) {
    case "Administrator":
      return "bg-purple-100 text-purple-700";

    case "Plant Head":
      return "bg-indigo-100 text-indigo-700";

    case "Production Manager":
      return "bg-blue-100 text-blue-700";

    case "Production Engineer":
      return "bg-cyan-100 text-cyan-700";

    case "Supervisor":
      return "bg-orange-100 text-orange-700";

    case "Operator":
      return "bg-emerald-100 text-emerald-700";

    case "Quality Engineer":
      return "bg-pink-100 text-pink-700";

    case "Maintenance Engineer":
      return "bg-yellow-100 text-yellow-700";

    case "Store Manager":
      return "bg-teal-100 text-teal-700";

    case "HR":
      return "bg-rose-100 text-rose-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

// ==============================
// Search Users
// ==============================
export const searchUsers = (users, keyword) => {
  if (!keyword) return users;

  const search = keyword.toLowerCase();

  return users.filter((user) => [user.name, user.username, user.email, user.employeeId, user.phone, user.department, user.role, user.hall].join(" ").toLowerCase().includes(search));
};

// ==============================
// Filter Users
// ==============================
export const filterUsers = (users, role, department, hall, status) => {
  return users.filter((user) => {
    const roleMatch = role === "All" || !role || user.role === role;

    const departmentMatch = department === "All" || !department || user.department === department;

    const hallMatch = hall === "All" || !hall || user.hall === hall;

    const statusMatch = status === "All" || !status || user.status === status;

    return roleMatch && departmentMatch && hallMatch && statusMatch;
  });
};

// ==============================
// Pagination
// ==============================
export const paginateUsers = (users, currentPage, itemsPerPage) => {
  const start = (currentPage - 1) * itemsPerPage;

  return users.slice(start, start + itemsPerPage);
};

// ==============================
// Total Pages
// ==============================
export const getTotalPages = (users, itemsPerPage) => {
  return Math.ceil(users.length / itemsPerPage);
};

// ==============================
// User Statistics
// ==============================
export const getUserStats = (users) => {
  return {
    total: users.length,

    active: users.filter((u) => u.status === "Active").length,

    inactive: users.filter((u) => u.status === "Inactive").length,

    locked: users.filter((u) => u.status === "Locked").length,

    administrators: users.filter((u) => u.role === "Administrator").length,
  };
};

// ==============================
// Unique Roles
// ==============================
export const getRoles = (users) => {
  return ["All", ...new Set(users.map((u) => u.role))];
};

// ==============================
// Unique Departments
// ==============================
export const getDepartments = (users) => {
  return ["All", ...new Set(users.map((u) => u.department))];
};

// ==============================
// Unique Halls
// ==============================
export const getHalls = (users) => {
  return ["All", ...new Set(users.map((u) => u.hall))];
};

// ==============================
// Unique Status
// ==============================
export const getStatuses = () => {
  return ["All", "Active", "Inactive", "Locked"];
};

// ==============================
// Format Date
// ==============================
export const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ==============================
// Sort Users
// ==============================
export const sortUsers = (users, field, direction = "asc") => {
  const sorted = [...users].sort((a, b) => {
    const valueA = a[field]?.toString().toLowerCase() || "";
    const valueB = b[field]?.toString().toLowerCase() || "";

    if (valueA < valueB) return direction === "asc" ? -1 : 1;

    if (valueA > valueB) return direction === "asc" ? 1 : -1;

    return 0;
  });

  return sorted;
};

// ==============================
// Export CSV
// ==============================
export const exportCSV = (users) => {
  const headers = ["Employee ID", "Name", "Username", "Role", "Department", "Hall", "Email", "Phone", "Status"];

  const rows = users.map((u) => [u.employeeId, u.name, u.username, u.role, u.department, u.hall, u.email, u.phone, u.status]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "users.csv";

  link.click();
};
