import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaUndo,
  FaFileExport,
  FaCalendarAlt,
} from "react-icons/fa";

const LogFilters = () => {
  const [filters, setFilters] = useState({
    search: "",
    from: "",
    to: "",
    user: "",
    department: "",
    role: "",
    module: "",
    status: "",
    hall: "",
    shift: "",
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      from: "",
      to: "",
      user: "",
      department: "",
      role: "",
      module: "",
      status: "",
      hall: "",
      shift: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
    >
      {/* Header */}

      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <FaFilter />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              Advanced Filters
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Narrow down activity logs quickly.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}

      <div className="p-6">

        {/* Search */}

        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-4 text-slate-400" />

          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search Activity, Employee, Machine, Entry ID..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filters Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">

          {/* From */}

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
              From
            </label>

            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-4 text-slate-400" />

              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleChange}
                className="w-full pl-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* To */}

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
              To
            </label>

            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-4 text-slate-400" />

              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleChange}
                className="w-full pl-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* User */}

          <div>
            <label className="block text-sm font-medium mb-2">
              User
            </label>

            <select
              name="user"
              value={filters.user}
              onChange={handleChange}
              className="w-full py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">All Users</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Supervisor</option>
              <option>Operator</option>
            </select>
          </div>

          {/* Department */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Department
            </label>

            <select
              name="department"
              value={filters.department}
              onChange={handleChange}
              className="w-full py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">All Departments</option>
              <option>Production</option>
              <option>HR</option>
              <option>Planning</option>
              <option>Quality</option>
              <option>Maintenance</option>
              <option>Inventory</option>
            </select>
          </div>

          {/* Role */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Role
            </label>

            <select
              name="role"
              value={filters.role}
              onChange={handleChange}
              className="w-full py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">All Roles</option>
              <option>Admin</option>
              <option>Engineer</option>
              <option>Supervisor</option>
              <option>Operator</option>
            </select>
          </div>

          {/* Module */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Module
            </label>

            <select
              name="module"
              value={filters.module}
              onChange={handleChange}
              className="w-full py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">All Modules</option>
              <option>Production</option>
              <option>Attendance</option>
              <option>Machine</option>
              <option>Employee</option>
              <option>Reports</option>
              <option>Settings</option>
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">All Status</option>
              <option>Success</option>
              <option>Failed</option>
              <option>Warning</option>
            </select>
          </div>

          {/* Hall */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Hall
            </label>

            <select
              name="hall"
              value={filters.hall}
              onChange={handleChange}
              className="w-full py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">All Halls</option>
              <option>Hall-1</option>
              <option>Hall-2</option>
              <option>Hall-3</option>
              <option>Hall-4</option>
            </select>
          </div>

          {/* Shift */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Shift
            </label>

            <select
              name="shift"
              value={filters.shift}
              onChange={handleChange}
              className="w-full py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">All Shifts</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>General</option>
            </select>
          </div>

        </div>

        {/* Buttons */}

        <div className="mt-8 flex flex-wrap gap-4">

          <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition">
            Apply Filters
          </button>

          <button
            onClick={resetFilters}
            className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-medium flex items-center gap-2 transition"
          >
            <FaUndo />

            Reset
          </button>

          <button className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 transition">
            <FaFileExport />

            Export
          </button>

        </div>

      </div>
    </motion.div>
  );
};

export default LogFilters;