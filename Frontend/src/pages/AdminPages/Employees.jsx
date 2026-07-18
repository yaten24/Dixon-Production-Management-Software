import React, { useCallback, useEffect, useState } from "react";

import Sidebar from "../../compenents/dashboard/Sidebar";
import Header from "../../compenents/dashboard/Header";

import EmployeeFilters from "../../compenents/employees/EmployeeFilters";
import EmployeeTable from "../../compenents/employees/EmployeeTable";
import OperatorModal from "../../compenents/employees/OperatorModal";
import ConfirmDialog from "../../compenents/employees/ConfirmDialog";
import TopPerformerBanner from "../../compenents/employees/TopPerformerBanner";

import {
  getOperators,
  getOperatorMeta,
  getTopPerformers,
  addOperator,
  deleteOperator,
  exportOperators,
} from "../../services/operatorService";

const LIMIT = 100;

const Employees = () => {
  // ===========================
  // Filters
  // ===========================
  const [search, setSearch] = useState("");
  const [hall, setHall] = useState("All");
  const [shift, setShift] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [halls, setHalls] = useState([]);
  const [shifts, setShifts] = useState([]);

  // ===========================
  // List + pagination
  // ===========================
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // ===========================
  // Top performers
  // ===========================
  const [topPerformers, setTopPerformers] = useState([]);

  // ===========================
  // Add modal
  // ===========================
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ===========================
  // View modal
  // ===========================
  const [viewOperator, setViewOperator] = useState(null);

  // ===========================
  // Delete confirm
  // ===========================
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ===========================
  // Export
  // ===========================
  const [exporting, setExporting] = useState(false);

  // Debounce search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, hall, shift]);

  // Load dropdown options + top performers once.
  useEffect(() => {
    getOperatorMeta()
      .then((res) => {
        setHalls(res.halls || []);
        setShifts(res.shifts || []);
      })
      .catch(() => {
        /* non-fatal: filters will just show no options */
      });

    getTopPerformers(3)
      .then((res) => setTopPerformers(res.data || []))
      .catch(() => {
        /* non-fatal */
      });
  }, []);

  const fetchOperators = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await getOperators({
        search: debouncedSearch,
        hall,
        shift,
        page: currentPage,
        limit: LIMIT,
      });
      setOperators(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (err) {
      setListError(err.message || "Failed to load operators");
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, hall, shift, currentPage]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const refreshTopPerformers = () => {
    getTopPerformers(3)
      .then((res) => setTopPerformers(res.data || []))
      .catch(() => {});
  };

  // ===========================
  // Actions
  // ===========================
  const handleResetFilters = () => {
    setSearch("");
    setHall("All");
    setShift("All");
  };

  const handleAddOperator = () => {
    setSaveError("");
    setIsAddOpen(true);
  };

  const handleSaveOperator = async (data) => {
    setSaving(true);
    setSaveError("");
    try {
      await addOperator(data);
      setIsAddOpen(false);
      setCurrentPage(1);
      await fetchOperators();
      refreshTopPerformers();
    } catch (err) {
      setSaveError(err.message || "Failed to add operator");
    } finally {
      setSaving(false);
    }
  };

  const handleView = (operator) => setViewOperator(operator);

  const handleDeleteRequest = (operator) => setDeleteTarget(operator);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOperator(deleteTarget.id);
      setDeleteTarget(null);
      await fetchOperators();
      refreshTopPerformers();
    } catch (err) {
      setListError(err.message || "Failed to delete operator");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportOperators({ search: debouncedSearch, hall, shift });
    } catch (err) {
      setListError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  // ===========================
  // UI
  // ===========================
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        <main className="flex-1 overflow-y-auto p-1">
          <div className="mx-auto w-full rounded border border-slate-200 bg-white shadow-sm p-1 lg:p-1">
            <div className="space-y-1">
              <TopPerformerBanner topPerformers={topPerformers} />

              <EmployeeFilters
                search={search}
                setSearch={setSearch}
                hall={hall}
                setHall={setHall}
                shift={shift}
                setShift={setShift}
                halls={halls}
                shifts={shifts}
                onAddOperator={handleAddOperator}
                onResetFilters={handleResetFilters}
                onExport={handleExport}
                exporting={exporting}
              />

              {listError && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
                  {listError}
                </div>
              )}

              <EmployeeTable
                operators={operators}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                limit={LIMIT}
                onPageChange={setCurrentPage}
                onView={handleView}
                onDelete={handleDeleteRequest}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Add operator */}
      <OperatorModal
        isOpen={isAddOpen}
        mode="add"
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveOperator}
        saving={saving}
        error={saveError}
      />

      {/* View operator */}
      <OperatorModal
        isOpen={!!viewOperator}
        mode="view"
        operator={viewOperator}
        onClose={() => setViewOperator(null)}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete operator?"
        message={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.operator_name} (${deleteTarget.operator_code}). This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Employees;
