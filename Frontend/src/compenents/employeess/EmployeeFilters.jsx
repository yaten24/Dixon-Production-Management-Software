import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiPlus, FiSave, FiX } from "react-icons/fi";

const EmployeeFilters = ({
  search,
  setSearch,
  department,
  setDepartment,
  shift,
  setShift,
  onAddEmployee,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
    onAddEmployee?.();
  };

  const handleSave = (data) => {
    // TODO: wire this up to your actual create-employee API call
    console.log("New employee data:", data);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded shadow-sm border border-gray-100 p-2">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-1.5">
          {/* Search */}

          <div className="relative lg:col-span-2">
            <FaSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Employee ID or Name..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department */}

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="h-8 px-2.5 text-xs rounded border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            <option value="Production">Production</option>
            <option value="Assembly">Assembly</option>
            <option value="Quality">Quality</option>
            <option value="Packaging">Packaging</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {/* Shift */}

          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="h-8 px-2.5 text-xs rounded border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Shifts</option>
            <option value="Morning">Day</option>
            <option value="Night">Night</option>
          </select>

          {/* Add Employee */}

          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded bg-blue-600 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            <FiPlus size={14} />
            Add Employee
          </button>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editUser={null}
      />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* UserModal - create/edit employee form                               */
/* ------------------------------------------------------------------ */

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
  permissions: {
    level1: false,
    level2: false,
    level3: false,
  },
};

const roles = ["Supervisor", "Engineer", "Sr. Engineer", "Assistant Manager", "Deputy Manager", "Manager", "Assistant General Manager", "Deputy General Manager", "General Manager", "Sr. General Manager", "Assistant Vice President", "Vice President", "Sr. Vice President", "President"];

const departments = ["Moulding", "ToolRoom", "Maintenance", "Human Resource", "Stores", "Assembly", "IE", "PPC", "Quality", "R&D", "NPD", "Account", "Purchase", "IT", "SAP", "Marketing", "Other"];

const UserModal = ({ isOpen, onClose, onSave, editUser = null }) => {
  const [form, setForm] = useState(editUser ?? initialState);
  const [previousModalState, setPreviousModalState] = useState({
    editUser,
    isOpen,
  });

  if (
    previousModalState.editUser !== editUser ||
    previousModalState.isOpen !== isOpen
  ) {
    setPreviousModalState({ editUser, isOpen });

    if (isOpen) {
      setForm(editUser ?? initialState);
    }
  }

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const setPermission = (level) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        level1: level === 1,
        level2: level === 2,
        level3: level === 3,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = { ...form };

    if (editUser && !data.password.trim()) {
      delete data.password;
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
          <div>
            <h2 className="text-base font-semibold text-slate-800 leading-tight">{editUser ? "Edit Employee" : "Add Employee"}</h2>

            <p className="text-[10px] text-slate-500 leading-tight">Manage employee records</p>
          </div>

          <button onClick={onClose} className="rounded cursor-pointer p-1.5 hover:bg-slate-100">
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-4">
          {/* Basic */}

          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} />

            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />

            <Input label="Username" name="username" value={form.username} onChange={handleChange} />

            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder={editUser ? "Leave blank to keep current password" : "Enter password"} />

            <Select label="Role" name="role" value={form.role} onChange={handleChange} options={roles} />
          </div>

          {/* Contact */}

          <h3 className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">Contact Information</h3>

          <div className="grid grid-cols-2 gap-2.5">
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} />

            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          {/* Work */}

          <h3 className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">Work Information</h3>

          <div className="grid grid-cols-2 gap-2.5">
            <Select label="Department" name="department" value={form.department} onChange={handleChange} options={departments} />

            <Select label="Status" name="status" value={form.status} onChange={handleChange} options={["Active", "Inactive", "Locked"]} />
          </div>
          {/* Permission Level */}

          <h3 className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">Permission Level</h3>

          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={form.permissions.level1} onChange={() => setPermission(1)} className="h-3.5 w-3.5 accent-blue-600" />

                <span className="text-xs font-medium">Level 1</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={form.permissions.level2} onChange={() => setPermission(2)} className="h-3.5 w-3.5 accent-amber-500" />

                <span className="text-xs font-medium">Level 2</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={form.permissions.level3} onChange={() => setPermission(3)} className="h-3.5 w-3.5 accent-red-600" />

                <span className="text-xs font-medium">Level 3</span>
              </label>
            </div>

            <p className="mt-1.5 text-[10px] text-slate-500">Select only one permission level.</p>
          </div>

          {/* Footer */}

          <div className="mt-4 flex justify-end gap-2 pt-2.5 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded border border-slate-300 cursor-pointer px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>

            <button type="submit" className="flex items-center gap-1.5 rounded bg-blue-600 cursor-pointer px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              <FiSave size={13} />
              {editUser ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="mb-0.5 block text-xs font-medium text-slate-700">{label}</label>

    <input type={type} name={name} value={value} onChange={onChange} className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs outline-none transition focus:border-blue-500" />
  </div>
);

const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="mb-0.5 block text-xs font-medium text-slate-700">{label}</label>

    <select name={name} value={value} onChange={onChange} className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs outline-none transition focus:border-blue-500">
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default EmployeeFilters;