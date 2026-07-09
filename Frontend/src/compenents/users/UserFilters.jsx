import React from "react";
import { FiSearch, FiRefreshCw, FiPlus } from "react-icons/fi";

const UserFilters = ({
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
}) => {
  return (
    <div className="rounded border border-slate-200 bg-white p-2.5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded border border-slate-300 pl-8 pr-2 text-xs outline-none focus:border-blue-500"
          />
        </div>

        {/* Role */}
        <select value={role} onChange={(e) => setRole(e.target.value)} className="h-8 w-full rounded border border-slate-300 px-2 text-xs text-slate-700 outline-none focus:border-blue-500 lg:w-36">
          {roles.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        {/* Department */}
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="h-8 w-full rounded border border-slate-300 px-2 text-xs text-slate-700 outline-none focus:border-blue-500 lg:w-36">
          {departments.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        {/* Hall */}
        <select value={hall} onChange={(e) => setHall(e.target.value)} className="h-8 w-full rounded border border-slate-300 px-2 text-xs text-slate-700 outline-none focus:border-blue-500 lg:w-32">
          {halls.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        {/* Status */}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 w-full rounded border border-slate-300 px-2 text-xs text-slate-700 outline-none focus:border-blue-500 lg:w-32">
          {statuses.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex w-full gap-2 lg:ml-auto lg:w-auto">
          <button onClick={onClearFilters} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 lg:flex-none">
            <FiRefreshCw size={13} />
            Clear
          </button>

          <button onClick={onCreateUser} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 lg:flex-none">
            <FiPlus size={14} />
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;