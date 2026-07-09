import React from "react";
import { FiEye, FiEdit2, FiTrash2, FiLock, FiUnlock, FiChevronUp, FiChevronDown, FiMail, FiPhone } from "react-icons/fi";

import StatusBadge from "./StatusBadge";
import RoleBadge from "./RoleBadge";

const UserTable = ({ users = [], selectedUsers = [], setSelectedUsers, sortField, sortDirection, onSort, onView, onEdit, onDelete, onToggleStatus }) => {
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelect = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((item) => item !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          {/* Header */}

          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200">
              <th className="px-2 py-1.5">
                <input type="checkbox" checked={users.length > 0 && selectedUsers.length === users.length} onChange={handleSelectAll} className="h-3.5 w-3.5 accent-blue-600" />
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

              <th className="px-2 py-1.5 text-center text-xs font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>

          {/* Body */}

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-200 odd:bg-white even:bg-slate-50 hover:bg-blue-50 transition-colors">
                <td className="px-2 py-1.5">
                  <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelect(user.id)} className="h-3.5 w-3.5 accent-blue-600" />
                </td>

                <td className="px-2 py-1.5 font-medium text-slate-700">{user.employeeId}</td>

                <td className="px-2 py-1.5">
                  <p className="font-semibold text-slate-800">{user.name}</p>
                </td>

                <td className="px-2 py-1.5">{user.username}</td>

                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <FiMail size={12} className="text-slate-400 shrink-0" />
                    <span>{user.email}</span>
                  </div>
                </td>
                {/* Mobile */}

                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <FiPhone size={12} className="text-slate-400 shrink-0" />

                    <span>{user.phone}</span>
                  </div>
                </td>

                {/* Role */}

                <td className="px-2 py-1.5">
                  <RoleBadge role={user.role} />
                </td>

                {/* Department */}

                <td className="px-2 py-1.5 text-slate-700">{user.department}</td>

                {/* Status */}

                <td className="px-2 py-1.5">
                  <StatusBadge status={user.status} />
                </td>

                {/* Last Login */}

                <td className="px-2 py-1.5 text-slate-500">{user.lastLogin}</td>

                {/* Actions */}

                <td className="px-2 py-1.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <button onClick={() => onView(user)} className="rounded p-1 text-slate-600 transition hover:bg-slate-100" title="View">
                      <FiEye size={14} />
                    </button>

                    <button onClick={() => onEdit(user)} className="rounded p-1 text-blue-600 transition hover:bg-blue-100" title="Edit">
                      <FiEdit2 size={14} />
                    </button>

                    <button onClick={() => onToggleStatus(user)} className={`rounded p-1 transition ${user.status === "Locked" ? "text-green-600 hover:bg-green-100" : "text-amber-600 hover:bg-amber-100"}`} title={user.status === "Locked" ? "Unlock" : "Lock"}>
                      {user.status === "Locked" ? <FiUnlock size={14} /> : <FiLock size={14} />}
                    </button>

                    <button onClick={() => onDelete(user)} className="rounded p-1 text-red-600 transition hover:bg-red-100" title="Delete">
                      <FiTrash2 size={14} />
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
const SortableHeader = ({ title, field, sortField, sortDirection, onSort }) => {
  const active = sortField === field;

  return (
    <th onClick={() => onSort(field)} className="cursor-pointer select-none px-2 py-1.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
      <div className="flex items-center gap-1">
        <span>{title}</span>

        {active ? (
          sortDirection === "asc" ? (
            <FiChevronUp size={13} className="text-blue-600" />
          ) : (
            <FiChevronDown size={13} className="text-blue-600" />
          )
        ) : (
          <div className="flex flex-col opacity-30">
            <FiChevronUp size={9} />
            <FiChevronDown size={9} className="-mt-1" />
          </div>
        )}
      </div>
    </th>
  );
};

export default UserTable;