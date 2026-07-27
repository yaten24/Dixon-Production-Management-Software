import React, { memo, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiTrash2,
  FiUser,
  FiX,
  FiMail,
  FiPhone,
  FiHome,
  FiClock,
  FiCalendar,
  FiEdit2,
  FiLock,
  FiUnlock,
  FiShield,
  FiSave,
  FiLoader,
  FiEye,
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiDownload,
  FiUsers,
  FiUserCheck,
  FiSlash,
} from "react-icons/fi";
import { getRoleColor, getStatusColor } from "../../config/userHelpers";

// ============================================================
// THEME TOKENS — kept consistent with AdminDashboard / Sidebar
// ============================================================
const NAVY = "#0F1D24";
const GOLD = "#FDC94D";
const BORDER = "#C6C6C6";

/* ==========================================================
   ROLE BADGE — flat bordered chip, sharp corners
========================================================== */
export const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex items-center border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${getRoleColor(role)}`}
  >
    {role}
  </span>
);

/* ==========================================================
   STATUS BADGE — flat bordered chip + status dot
========================================================== */
export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 border border-[#C6C6C6] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${getStatusColor(status)}`}
  >
    <span
      className={`h-1.5 w-1.5 flex-shrink-0 ${
        status === "Active" ? "bg-green-500" : status === "Inactive" ? "bg-gray-500" : "bg-red-500"
      }`}
    />
    {status}
  </span>
);

/* ==========================================================
   USER STATS — compact stat tiles, flat border + left accent
========================================================== */
const StatCard = ({ title, value, icon, accent, loading }) => (
  <div
    className="flex items-center gap-2.5 border border-[#C6C6C6] bg-white px-3 py-2"
    style={{ borderLeft: `3px solid ${accent}` }}
  >
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#C6C6C6]" style={{ color: accent }}>
      <span className="text-sm">{icon}</span>
    </div>
    <div className="min-w-0 leading-tight">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{title}</p>
      {loading ? (
        <div className="mt-1 h-4 w-10 animate-pulse bg-[#E5E5E5]" />
      ) : (
        <p className="font-mono text-[18px] font-extrabold leading-none text-[#0F1D24]">{value}</p>
      )}
    </div>
  </div>
);

export const UserStats = memo(({ users = [], loading = false }) => {
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "Active").length;
    const inactiveUsers = users.filter((u) => u.status === "Inactive").length;
    // Backend "Suspended" ko normalizeUser already "Locked" mein map karta hai,
    // isliye yahan bhi "Locked" hi check karna hai, "Suspended" nahi
    const lockedUsers = users.filter((u) => u.status === "Locked").length;
    const adminUsers = users.filter((u) => u.role === "Admin").length;

    return [
      { title: "Total Users", value: totalUsers, icon: <FiUsers />, accent: "#2563EB" },
      { title: "Active Users", value: activeUsers, icon: <FiUserCheck />, accent: "#16A34A" },
      { title: "Inactive Users", value: inactiveUsers, icon: <FiSlash />, accent: "#9B9B9B" },
      { title: "Locked", value: lockedUsers, icon: <FiLock />, accent: "#EA580C" },
      { title: "Administrators", value: adminUsers, icon: <FiShield />, accent: "#9333EA" },
    ];
  }, [users]);

  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} loading={loading} />
      ))}
    </div>
  );
});
UserStats.displayName = "UserStats";

/* ==========================================================
   USER FILTERS — flat control box, sharp inputs
========================================================== */
export const UserFilters = ({
  search,
  setSearch,
  role,
  setRole,
  department,
  setDepartment,
  hall,
  setHall,
  status,
  setStatus,
  roles = [],
  departments = [],
  halls = [],
  statuses = [],
  onCreateUser,
  onClearFilters,
}) => (
  <div className="border border-[#C6C6C6] bg-white px-3 py-2.5">
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      {/* Search */}
      <div className="relative w-full lg:max-w-xs">
        <FiSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
        <input
          type="text"
          placeholder="Search name, username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full border border-[#C6C6C6] pl-8 pr-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24]"
        />
      </div>

      {/* Role */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] lg:w-36"
      >
        {roles.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      {/* Department */}
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] lg:w-36"
      >
        {departments.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      {/* Hall */}
      <select
        value={hall}
        onChange={(e) => setHall(e.target.value)}
        className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] lg:w-32"
      >
        {halls.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] lg:w-32"
      >
        {statuses.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      {/* Buttons */}
      <div className="flex w-full gap-1.5 lg:ml-auto lg:w-auto">
        <button
          onClick={onClearFilters}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 border border-[#C6C6C6] px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] lg:flex-none"
        >
          <FiRefreshCw size={12} />
          Clear
        </button>

        <button
          onClick={onCreateUser}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 border px-3 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90 lg:flex-none"
          style={{ background: GOLD, borderColor: GOLD }}
        >
          <FiPlus size={13} />
          Create User
        </button>
      </div>
    </div>
  </div>
);

/* ==========================================================
   BULK ACTIONS — flat banner, gold accent border
========================================================== */
export const BulkActions = ({
  selectedUsers = [],
  onDelete,
  onLock,
  onUnlock,
  onExport,
  onClearSelection,
  loading = false,
}) => (
  <AnimatePresence>
    {selectedUsers.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="border border-[#C6C6C6] bg-white px-3 py-2"
        style={{ borderLeft: `3px solid ${GOLD}` }}
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          {/* Left */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center font-mono text-[11px] font-extrabold text-[#0F1D24]"
              style={{ background: GOLD }}
            >
              {selectedUsers.length}
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F1D24]">
                {selectedUsers.length} User{selectedUsers.length > 1 ? "s" : ""} Selected
              </p>
              <p className="text-[9.5px] font-medium text-[#9B9B9B]">Choose an action for selected users.</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onLock}
              disabled={loading}
              className="flex items-center gap-1.5 border border-[#C6C6C6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiLock size={12} />
              Lock
            </button>

            <button
              onClick={onUnlock}
              disabled={loading}
              className="flex items-center gap-1.5 border border-[#C6C6C6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiUnlock size={12} />
              Unlock
            </button>

            <button
              onClick={onExport}
              disabled={loading}
              className="flex items-center gap-1.5 border border-[#C6C6C6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload size={12} />
              Export
            </button>

            <button
              onClick={onDelete}
              disabled={loading}
              className="flex items-center gap-1.5 border border-red-300 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiTrash2 size={12} />
              Delete
            </button>

            <button
              onClick={onClearSelection}
              disabled={loading}
              className="flex items-center gap-1.5 border border-[#C6C6C6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiX size={12} />
              Clear
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ==========================================================
   USER TABLE — flat bordered table, sharp corners
========================================================== */
const SortableHeader = ({ title, field, sortField, sortDirection, onSort }) => {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="cursor-pointer select-none whitespace-nowrap px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24] transition hover:bg-[#EFEFEF]"
    >
      <div className="flex items-center gap-1">
        <span>{title}</span>
        {active ? (
          sortDirection === "asc" ? (
            <FiChevronUp size={12} style={{ color: NAVY }} />
          ) : (
            <FiChevronDown size={12} style={{ color: NAVY }} />
          )
        ) : (
          <div className="flex flex-col opacity-30">
            <FiChevronUp size={8} />
            <FiChevronDown size={8} className="-mt-1" />
          </div>
        )}
      </div>
    </th>
  );
};

export const UserTable = ({
  users = [],
  selectedUsers = [],
  setSelectedUsers,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? users.map((u) => u.id) : []);
  };

  const handleSelect = (id) => {
    setSelectedUsers(
      selectedUsers.includes(id) ? selectedUsers.filter((item) => item !== id) : [...selectedUsers, id]
    );
  };

  return (
    <div className="overflow-hidden border border-[#C6C6C6] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead className="sticky top-0 z-10 border-b border-[#C6C6C6] bg-[#F5F5F5]">
            <tr>
              <th className="px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                  className="h-3.5 w-3.5 accent-[#0F1D24]"
                />
              </th>
              <SortableHeader title="Employee ID" field="employeeId" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Name" field="name" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Username" field="username" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Email" field="email" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Mobile" field="phone" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Role" field="role" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Department" field="department" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Status" field="status" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader title="Last Login" field="lastLogin" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <th className="px-2 py-1.5 text-center text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                className={`border-b border-[#C6C6C6]/60 transition-colors hover:bg-[#FDF6E3] ${i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}
              >
                <td className="px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelect(user.id)}
                    className="h-3.5 w-3.5 accent-[#0F1D24]"
                  />
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 font-mono font-bold text-[#0F1D24]">{user.employeeId}</td>
                <td className="px-2 py-1.5 font-semibold text-[#0F1D24]">{user.name}</td>
                <td className="px-2 py-1.5 text-[#0F1D24]/75">{user.username}</td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5 text-[#0F1D24]/75">
                    <FiMail size={11} className="flex-shrink-0 text-[#9B9B9B]" />
                    <span>{user.email}</span>
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5 text-[#0F1D24]/75">
                    <FiPhone size={11} className="flex-shrink-0 text-[#9B9B9B]" />
                    <span>{user.phone}</span>
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-2 py-1.5 text-[#0F1D24]/75">{user.department}</td>
                <td className="px-2 py-1.5">
                  <StatusBadge status={user.status} />
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[#9B9B9B]">{user.lastLogin}</td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <button onClick={() => onView(user)} className="p-1 text-[#0F1D24] transition hover:bg-[#EFEFEF]" title="View">
                      <FiEye size={13} />
                    </button>
                    <button onClick={() => onEdit(user)} className="p-1 text-[#2563EB] transition hover:bg-blue-50" title="Edit">
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user)}
                      className={`p-1 transition ${user.status === "Locked" ? "text-green-600 hover:bg-green-50" : "text-amber-600 hover:bg-amber-50"}`}
                      title={user.status === "Locked" ? "Unlock" : "Lock"}
                    >
                      {user.status === "Locked" ? <FiUnlock size={13} /> : <FiLock size={13} />}
                    </button>
                    <button onClick={() => onDelete(user)} className="p-1 text-red-600 transition hover:bg-red-50" title="Delete">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ==========================================================
   PAGINATION — flat buttons, gold active state
========================================================== */
export const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-2 border border-[#C6C6C6] bg-white px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-[10.5px] font-medium text-[#0F1D24]/75">
        Showing <span className="font-mono font-bold text-[#0F1D24]">{startItem}</span> to{" "}
        <span className="font-mono font-bold text-[#0F1D24]">{endItem}</span> of{" "}
        <span className="font-mono font-bold text-[#0F1D24]">{totalItems}</span> users
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-7 w-7 items-center justify-center border border-[#C6C6C6] text-[#0F1D24] transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft size={13} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="flex h-7 w-7 items-center justify-center border font-mono text-[10.5px] font-bold transition"
            style={
              currentPage === page
                ? { background: NAVY, borderColor: NAVY, color: "#fff" }
                : { borderColor: BORDER, color: NAVY }
            }
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-7 w-7 items-center justify-center border border-[#C6C6C6] text-[#0F1D24] transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

/* ==========================================================
   USER MODAL — flat sharp-corner form modal
========================================================== */
const initialState = {
  employeeId: "",
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "Operator",
  department: "",
  status: "Active",
};

const roleOptions = [
  "Supervisor",
  "Engineer",
  "Sr. Engineer",
  "Assistant Manager",
  "Deputy Manager",
  "Manager",
  "Assistant General Manager",
  "Deputy General Manager",
  "General Manager",
  "Sr. General Manager",
  "Assistant Vice President",
  "Vice President",
  "Sr. Vice President",
  "President",
];

const departmentOptions = [
  "Moulding",
  "ToolRoom",
  "Maintenance",
  "Human Resource",
  "Stores",
  "Assembly",
  "IE",
  "PPC",
  "Quality",
  "R&D",
  "NPD",
  "Account",
  "Purchase",
  "IT",
  "SAP",
  "Marketing",
  "Other",
];

const Input = ({ label, name, value, onChange, type = "text", disabled = false, required = false, placeholder = "" }) => (
  <div>
    <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</label>
    <input
      className="h-8 w-full border border-[#C6C6C6] px-2.5 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] disabled:bg-[#F5F5F5]"
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, disabled = false }) => (
  <div>
    <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</label>
    <select
      className="h-8 w-full border border-[#C6C6C6] px-2 text-[11px] font-medium text-[#0F1D24] outline-none focus:border-[#0F1D24] disabled:bg-[#F5F5F5]"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

export const UserModal = ({ isOpen, onClose, onSave, editUser = null, loading = false }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (!isOpen) return;
    if (editUser) {
      setForm({
        employeeId: editUser.employeeId || editUser.employee_id || "",
        name: editUser.name || "",
        username: editUser.username || "",
        email: editUser.email || "",
        phone: editUser.phone || editUser.mobile || "",
        password: "",
        role: editUser.role || "Supervisor",
        department: editUser.department || "",
        status: editUser.status || "Active",
      });
    } else {
      setForm(initialState);
    }
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Note: yahan frontend-shape (camelCase, phone, status="Locked") hi bheja ja raha hai.
  // Backend ke liye conversion (mobile, Suspended, etc.) userService.denormalizeUser mein hota hai.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      employeeId: form.employeeId,
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone,
      role: form.role,
      department: form.department,
      status: form.status,
    };

    if (!editUser || form.password.trim()) {
      payload.password = form.password;
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl border border-[#C6C6C6] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C6C6C6] px-3 py-2">
          <div className="leading-tight">
            <h2 className="text-[13px] font-extrabold text-[#0F1D24]">{editUser ? "Update User" : "Create User"}</h2>
            <p className="text-[9.5px] font-medium text-[#9B9B9B]">Manage software users</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="p-1.5 text-[#0F1D24] hover:bg-[#F5F5F5] disabled:opacity-50">
            <FiX size={14} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-3">
          <h3 className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Basic Information</h3>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} disabled={loading} required />
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} disabled={loading} required />
            <Input label="Username" name="username" value={form.username} onChange={handleChange} disabled={loading} required />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              placeholder={editUser ? "Leave blank to keep current" : "Enter password"}
              required={!editUser}
            />
            <Select label="Role" name="role" value={form.role} onChange={handleChange} options={roleOptions} disabled={loading} />
            <Select label="Department" name="department" value={form.department} onChange={handleChange} options={departmentOptions} disabled={loading} />
          </div>

          <h3 className="mb-1.5 mt-3 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">Contact Information</h3>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} disabled={loading} />
            <Input label="Mobile Number" name="phone" value={form.phone} onChange={handleChange} disabled={loading} />
            <Select label="Status" name="status" value={form.status} onChange={handleChange} disabled={loading} options={["Active", "Inactive", "Locked"]} />
          </div>

          <div className="mt-3 border border-[#C6C6C6] bg-[#F5F5F5] px-2.5 py-1.5 text-[10px] font-medium text-[#9B9B9B]">
            Permission level is set automatically based on the selected role.
          </div>

          {/* Footer */}
          <div className="mt-3 flex justify-end gap-2 border-t border-[#C6C6C6] pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="border border-[#C6C6C6] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: GOLD, borderColor: GOLD }}
            >
              {loading ? <FiLoader className="animate-spin" size={13} /> : <FiSave size={13} />}
              {loading ? "Saving..." : editUser ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================
   USER DRAWER — flat side panel
========================================================== */
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 border border-[#C6C6C6] bg-[#F9F9F9] px-2.5 py-1.5">
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#C6C6C6]" style={{ color: "#2563EB" }}>
      <span className="text-[11px]">{icon}</span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-wide text-[#9B9B9B] leading-tight">{label}</p>
      <p className="truncate text-[11px] font-semibold text-[#0F1D24] leading-tight">{value || "-"}</p>
    </div>
  </div>
);

export const UserDrawer = ({ isOpen, onClose, user, onEdit, onToggleStatus }) => {
  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.25 }}
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-[#C6C6C6] bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6] bg-white px-3 py-2">
          <div className="leading-tight">
            <h2 className="text-[13px] font-extrabold text-[#0F1D24]">User Details</h2>
            <p className="text-[9.5px] font-medium text-[#9B9B9B]">Employee Information</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#0F1D24] hover:bg-[#F5F5F5]">
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Profile */}
          <div className="border-b border-[#C6C6C6] px-3 py-2.5">
            <h3 className="text-[13px] font-extrabold text-[#0F1D24] leading-tight">{user.name}</h3>
            <p className="font-mono text-[9.5px] font-semibold text-[#9B9B9B] leading-tight">{user.employeeId}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 p-3">
            <div>
              <h4 className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Contact Information</h4>
              <div className="space-y-1.5">
                <InfoRow icon={<FiMail />} label="Email" value={user.email} />
                <InfoRow icon={<FiPhone />} label="Phone" value={user.phone} />
              </div>
            </div>

            <div>
              <h4 className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Work Information</h4>
              <div className="space-y-1.5">
                <InfoRow icon={<FiHome />} label="Department" value={user.department} />
                <InfoRow icon={<FiShield />} label="Role" value={user.role} />
                <InfoRow icon={<FiClock />} label="Status" value={user.status} />
              </div>
            </div>

            <div>
              <h4 className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Activity</h4>
              <div className="space-y-1.5">
                <InfoRow icon={<FiClock />} label="Last Login" value={user.lastLogin} />
                <InfoRow icon={<FiCalendar />} label="Created On" value={user.createdAt} />
              </div>
            </div>

            <div>
              <h4 className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0F1D24]">Permission Level</h4>
              <div className="border border-[#C6C6C6] bg-[#F9F9F9] px-2.5 py-1.5">
                <span className="font-mono text-[11px] font-semibold text-[#0F1D24]">
                  {user.permissionLevel != null ? `Level ${user.permissionLevel}` : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-shrink-0 gap-2 border-t border-[#C6C6C6] bg-white p-3">
          <button
            onClick={() => onEdit(user)}
            className="flex flex-1 items-center justify-center gap-1.5 border py-2 text-[10.5px] font-bold uppercase tracking-wide text-[#0F1D24] hover:opacity-90"
            style={{ background: GOLD, borderColor: GOLD }}
          >
            <FiEdit2 size={13} />
            Edit User
          </button>

          <button
            onClick={() => onToggleStatus(user)}
            className={`flex flex-1 items-center justify-center gap-1.5 border py-2 text-[10.5px] font-bold uppercase tracking-wide text-white transition ${
              user.status === "Locked" ? "border-green-600 bg-green-600 hover:bg-green-700" : "border-red-600 bg-red-600 hover:bg-red-700"
            }`}
          >
            {user.status === "Locked" ? (
              <>
                <FiUnlock size={13} />
                Unlock
              </>
            ) : (
              <>
                <FiLock size={13} />
                Lock
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ==========================================================
   DELETE MODAL — flat sharp-corner confirm dialog
========================================================== */
export const DeleteModal = ({ isOpen, onClose, onConfirm, user, loading = false }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md overflow-hidden border border-[#C6C6C6] bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-red-200 bg-red-50">
                  <FiAlertTriangle size={22} className="text-red-600" />
                </div>
                <div className="leading-tight">
                  <h2 className="text-[15px] font-extrabold text-[#0F1D24]">Delete User</h2>
                  <p className="text-[10.5px] font-medium text-[#9B9B9B]">This will deactivate the user's access</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-[#0F1D24] hover:bg-[#F5F5F5]">
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-4 border border-[#C6C6C6] bg-[#F9F9F9] p-4">
                <div className="flex h-14 w-14 items-center justify-center border border-[#C6C6C6] bg-white">
                  <FiUser size={28} className="text-[#0F1D24]" />
                </div>
                <div className="flex-1 leading-tight">
                  <h3 className="font-extrabold text-[#0F1D24]">{user?.name}</h3>
                  <p className="text-[11px] font-medium text-[#9B9B9B]">Employee ID : {user?.employeeId}</p>
                  <p className="text-[11px] font-medium text-[#9B9B9B]">{user?.role}</p>
                </div>
              </div>

              <div className="border border-red-200 bg-red-50 p-4">
                <p className="text-[11.5px] leading-6 text-red-700">
                  Are you sure you want to delete this user? Their account will be deactivated and they will
                  immediately lose access to the system. Records are retained for audit purposes and can be restored
                  by an administrator if needed.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-[#C6C6C6] bg-white px-5 py-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="border border-[#C6C6C6] px-5 py-2 text-[11px] font-bold uppercase tracking-wide text-[#0F1D24] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex items-center gap-2 border border-red-600 bg-red-600 px-5 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiTrash2 size={14} />
                {loading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);