import { useEffect, useMemo, useState } from "react";

import {
  searchUsers,
  filterUsers,
  paginateUsers,
  sortUsers,
  getTotalPages,
  getRoles,
  getDepartments,
  getHalls,
  getStatuses,
  exportCSV,
} from "../config/userHelpers";
import {
  fetchUsers,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "../services/userService";
import UserStats from "../compenents/users/UserStats";
import UserFilters from "../compenents/users/UserFilters";
import BulkActions from "../compenents/users/BulkActions";
import UserTable from "../compenents/users/UserTable";
import Pagination from "../compenents/users/Pagination";
import UserModal from "../compenents/users/UserModal";
import UserDrawer from "../compenents/users/UserDrawer";
import DeleteModal from "../compenents/users/DeleteModal";
import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

const Users = () => {
  // ===========================
  // Main Data
  // ===========================

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===========================
  // Load users from backend
  // ===========================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Users load nahi ho paye. Backend check karein.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ===========================
  // Search & Filters
  // ===========================

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [department, setDepartment] = useState("All");
  const [hall, setHall] = useState("All");
  const [status, setStatus] = useState("All");

  // ===========================
  // Sorting
  // ===========================

  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // ===========================
  // Pagination
  // ===========================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ===========================
  // Selection
  // ===========================

  const [selectedUsers, setSelectedUsers] = useState([]);

  // ===========================
  // Modals
  // ===========================

  const [openModal, setOpenModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ===========================
  // Selected User
  // ===========================

  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // ===========================
  // Action loading (save/delete button disable karne ke liye)
  // ===========================

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ===========================
  // Dropdown Options
  // ===========================

  const roles = getRoles(users);
  const departments = getDepartments(users);
  const halls = getHalls(users);
  const statuses = getStatuses();

  // ===========================
  // Search
  // ===========================

  const searchedUsers = useMemo(() => {
    return searchUsers(users, search);
  }, [users, search]);

  // ===========================
  // Filters
  // ===========================

  const filteredUsers = useMemo(() => {
    return filterUsers(searchedUsers, role, department, hall, status);
  }, [searchedUsers, role, department, hall, status]);

  // ===========================
  // Sorting
  // ===========================

  const sortedUsers = useMemo(() => {
    return sortUsers(filteredUsers, sortField, sortDirection);
  }, [filteredUsers, sortField, sortDirection]);

  // ===========================
  // Pagination
  // ===========================

  const paginatedUsers = useMemo(() => {
    return paginateUsers(sortedUsers, currentPage, itemsPerPage);
  }, [sortedUsers, currentPage]);

  const totalPages = getTotalPages(sortedUsers, itemsPerPage);

  // ===========================
  // Sorting
  // ===========================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ===========================
  // Clear Filters
  // ===========================

  const clearFilters = () => {
    setSearch("");
    setRole("All");
    setDepartment("All");
    setHall("All");
    setStatus("All");
    setCurrentPage(1);
  };

  // ===========================
  // View User
  // ===========================

  const handleView = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  // ===========================
  // Create User
  // ===========================

  const handleCreate = () => {
    setEditUser(null);
    setOpenModal(true);
  };

  // ===========================
  // Edit User
  // ===========================

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenModal(true);
  };

  // ===========================
  // Save User (Create / Update via API)
  // ===========================

  const handleSaveUser = async (formData) => {
    try {
      setActionLoading(true);
      setActionError(null);

      if (editUser) {
        const updated = await updateUserApi(editUser.id, formData);
        setUsers((prev) =>
          prev.map((u) => (u.id === editUser.id ? updated : u)),
        );
      } else {
        const created = await createUserApi(formData);
        setUsers((prev) => [created, ...prev]);
      }

      setOpenModal(false);
      setEditUser(null);
    } catch (err) {
      console.error("Save user error:", err);
      setActionError(err.response?.data?.message || "User save nahi ho paya.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===========================
  // Delete User (soft delete via API)
  // ===========================

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await deleteUserApi(selectedUser.id);
      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      setDeleteOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Delete user error:", err);
      setActionError("User delete nahi ho paya.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===========================
  // Lock / Unlock (status update via API)
  // ===========================

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Locked" ? "Active" : "Locked";
    try {
      const updated = await updateUserApi(user.id, {
        ...user,
        status: newStatus,
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? updated : item)),
      );
    } catch (err) {
      console.error("Toggle status error:", err);
      setActionError("Status update nahi ho paya.");
    }
  };

  // ===========================
  // Bulk Delete
  // ===========================

  const handleBulkDelete = async () => {
    try {
      setActionLoading(true);
      await Promise.all(selectedUsers.map((id) => deleteUserApi(id)));
      setUsers((prev) =>
        prev.filter((user) => !selectedUsers.includes(user.id)),
      );
      setSelectedUsers([]);
    } catch (err) {
      console.error("Bulk delete error:", err);
      setActionError("Kuch users delete nahi ho paye.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===========================
  // Bulk Lock
  // ===========================

  const handleBulkLock = async () => {
    try {
      setActionLoading(true);
      const targets = users.filter((u) => selectedUsers.includes(u.id));
      const updates = await Promise.all(
        targets.map((u) => updateUserApi(u.id, { ...u, status: "Locked" })),
      );
      setUsers((prev) =>
        prev.map((u) => updates.find((up) => up.id === u.id) || u),
      );
    } catch (err) {
      console.error("Bulk lock error:", err);
      setActionError("Kuch users lock nahi ho paye.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===========================
  // Bulk Unlock
  // ===========================

  const handleBulkUnlock = async () => {
    try {
      setActionLoading(true);
      const targets = users.filter((u) => selectedUsers.includes(u.id));
      const updates = await Promise.all(
        targets.map((u) => updateUserApi(u.id, { ...u, status: "Active" })),
      );
      setUsers((prev) =>
        prev.map((u) => updates.find((up) => up.id === u.id) || u),
      );
    } catch (err) {
      console.error("Bulk unlock error:", err);
      setActionError("Kuch users unlock nahi ho paye.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===========================
  // Export CSV
  // ===========================

  const handleExportCSV = () => {
    const data =
      selectedUsers.length > 0
        ? users.filter((user) => selectedUsers.includes(user.id))
        : users;

    exportCSV(data);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-1">
          {/* Error banner */}
          {(error || actionError) && (
            <div className="mb-2 rounded-sm border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 flex items-center justify-between">
              <span>{error || actionError}</span>
              <button
                onClick={() => {
                  setError(null);
                  setActionError(null);
                }}
                className="text-red-500 font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Filters */}
          <div>
            <UserFilters
              search={search}
              setSearch={setSearch}
              role={role}
              setRole={setRole}
              department={department}
              setDepartment={setDepartment}
              hall={hall}
              setHall={setHall}
              status={status}
              setStatus={setStatus}
              roles={roles}
              departments={departments}
              halls={halls}
              statuses={statuses}
              onCreateUser={handleCreate}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Bulk Actions */}
          <BulkActions
            selectedUsers={selectedUsers}
            onDelete={handleBulkDelete}
            onLock={handleBulkLock}
            onUnlock={handleBulkUnlock}
            onExport={handleExportCSV}
            onClearSelection={() => setSelectedUsers([])}
            loading={actionLoading}
          />

          {/* User Table */}
          <div className="mt-2">
            {loading ? (
              <div className="rounded-sm border border-[#E2E4E9] bg-white p-8 text-center text-sm text-slate-500">
                Users load ho rahe hain...
              </div>
            ) : (
              <UserTable
                users={paginatedUsers}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>

      {/* Modals */}

      <UserModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditUser(null);
        }}
        onSave={handleSaveUser}
        editUser={editUser}
        loading={actionLoading}
      />

      <UserDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onEdit={(user) => {
          setDrawerOpen(false);
          setEditUser(user);
          setOpenModal(true);
        }}
        onToggleStatus={handleToggleStatus}
      />

      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDelete}
        user={selectedUser}
        loading={actionLoading}
      />
    </div>
  );
};

export default Users;
