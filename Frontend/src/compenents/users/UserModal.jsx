import React, { useEffect, useState } from "react";
import { FiSave, FiX, FiLoader } from "react-icons/fi";

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

const roles = [
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

const departments = [
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

const UserModal = ({
  isOpen,
  onClose,
  onSave,
  editUser = null,
  loading = false,
}) => {
  const [form, setForm] = useState(initialState);

  // ==========================
  // Edit Mode
  // ==========================

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

  // ==========================
  // Handle Change
  // ==========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // Submit
  // ==========================
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
      <div className="w-full max-w-2xl rounded bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-[#E2E4E9] px-3 py-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 leading-tight">
              {editUser ? "Update User" : "Create User"}
            </h2>

            <p className="text-[10px] text-slate-500 leading-tight">
              Manage software users
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-50"
          >
            <FiX size={14} />
          </button>
        </div>

        {/* Body */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto p-3"
        >
          {/* Basic Information */}

          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Input
              label="Employee ID"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              placeholder={
                editUser ? "Leave blank to keep current" : "Enter password"
              }
              required={!editUser}
            />

            <Select
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              options={roles}
              disabled={loading}
            />

            <Select
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              options={departments}
              disabled={loading}
            />
          </div>

          {/* Contact */}

          <h3 className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />

            <Input
              label="Mobile Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
            />

            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={loading}
              options={["Active", "Inactive", "Locked"]}
            />
          </div>

          {/* Permission Level note */}

          <div className="mt-3 rounded border border-[#E2E4E9] bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-500">
            Permission level is set automatically based on the selected role.
          </div>

          {/* Footer */}

          <div className="mt-3 flex justify-end gap-2 border-t border-[#E2E4E9] pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <FiLoader className="animate-spin" size={13} />
              ) : (
                <FiSave size={13} />
              )}

              {loading ? "Saving..." : editUser ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  placeholder = "",
}) => (
  <div>
    <label className="mb-1 block text-[10px] font-medium text-slate-600">
      {label}
    </label>

    <input
      className="h-8 w-full rounded border border-[#E2E4E9] px-2.5 text-xs outline-none focus:border-[#2563EB] disabled:bg-slate-50"
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

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
}) => (
  <div>
    <label className="mb-1 block text-[10px] font-medium text-slate-600">
      {label}
    </label>

    <select
      className="h-8 w-full rounded border border-[#E2E4E9] px-2 text-xs outline-none focus:border-[#2563EB] disabled:bg-slate-50"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default UserModal;
