import React, { useEffect, useState, useCallback, useRef } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import PartsFilters from "../compenents/parts/PartsFilters";
import PartsTable from "../compenents/parts/PartsTable";
import PartsLoadingState from "../compenents/parts/PartsLoadingState";
import PartModal from "../compenents/parts/PartModal";
import PartViewModal from "../compenents/parts/PartViewModal";
import DeleteConfirmModal from "../compenents/parts/DeleteConfirmModal";
import PaginationControls from "../compenents/parts/PaginationControls";

import {
  getAllParts,
  getFilterOptions,
  deletePart as deletePartApi,
} from "../api/partApi";

const PAGE_SIZE = 100;
const DEBOUNCE_MS = 350;

const PartsPage = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters — UPDATED: these now drive a server-side query (see the
  // debounced effect below), so applying a filter searches the WHOLE
  // dataset, not just the currently loaded 100-row page.
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customer, setCustomer] = useState("All");
  const [source, setSource] = useState("All");
  const [status, setStatus] = useState("All");

  // Dropdown options — pulled from the whole table via /parts/filter-options,
  // not derived from whatever page happens to be loaded.
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    customers: [],
    sources: [],
  });

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [activePart, setActivePart] = useState(null);

  // View (Show) modal — NEW: this was previously unwired, so the Show
  // button in the row actions did nothing.
  const [viewPart, setViewPart] = useState(null);

  // Delete modal
  const [partToDelete, setPartToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchParts = useCallback(async (targetPage, filters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllParts(targetPage, PAGE_SIZE, filters);

      // API response shape:
      // { success, count, total, page, limit, totalPages, data: [] }
      setParts(response.data || []);
      setTotalCount(response.total ?? response.data?.length ?? 0);
      setTotalPages(response.totalPages || 1);
      setPage(response.page || targetPage);
    } catch (err) {
      console.error("Failed to fetch parts:", err);
      setError("Failed to load parts. Please try again.");
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentFilters = { search, category, customer, source, status };

  // Initial load: first 100 parts (no filters) + dropdown options.
  useEffect(() => {
    fetchParts(1, {});

    getFilterOptions()
      .then((res) => setFilterOptions(res.data || {}))
      .catch((err) => console.error("Failed to fetch filter options:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced re-fetch whenever any filter changes. Always resets to
  // page 1 since the result set changes with the filter.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchParts(1, { search, category, customer, source, status });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, customer, source, status]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    fetchParts(nextPage, currentFilters);
  };

  // ---- Add / Edit ----
  const openAddModal = () => {
    setModalMode("add");
    setActivePart(null);
    setModalOpen(true);
  };

  const openEditModal = (part) => {
    setModalMode("edit");
    setActivePart(part);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActivePart(null);
  };

  const handleModalSuccess = () => {
    closeModal();
    fetchParts(page, currentFilters); // refresh current page/filter in place
  };

  // ---- View ----
  const openViewModal = (part) => setViewPart(part);
  const closeViewModal = () => setViewPart(null);

  // ---- Delete ----
  const openDeleteModal = (part) => setPartToDelete(part);
  const closeDeleteModal = () => setPartToDelete(null);

  const confirmDelete = async () => {
    if (!partToDelete) return;

    try {
      setDeleting(true);
      await deletePartApi(partToDelete.id);

      const isLastRowOnPage = parts.length === 1 && page > 1;
      closeDeleteModal();
      await fetchParts(isLastRowOnPage ? page - 1 : page, currentFilters);
    } catch (err) {
      console.error("Failed to delete part:", err);
      setError("Failed to delete part. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden mt-12">
        <Header />

        <main className="flex-1 overflow-y-auto p-1">
          {loading ? (
            <PartsLoadingState />
          ) : (
            <div className="space-y-1">
              {/* Counting badge */}
              <div className="flex items-center justify-between rounded-sm border border-[#E2E4E9] bg-white px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-[#2563EB] font-mono">
                    {totalCount}
                  </span>
                  <span className="text-xs text-slate-500">
                    parts match current filters
                  </span>
                </div>

                {error && (
                  <span className="text-[11px] font-medium text-red-600">
                    {error}
                  </span>
                )}
              </div>

              <PartsFilters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                customer={customer}
                setCustomer={setCustomer}
                source={source}
                setSource={setSource}
                status={status}
                setStatus={setStatus}
                categories={filterOptions.categories}
                customers={filterOptions.customers}
                sources={filterOptions.sources}
                onAddPart={openAddModal}
              />

              <PartsTable
                parts={parts}
                onView={openViewModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />

              <PaginationControls
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                onPrev={() => goToPage(page - 1)}
                onNext={() => goToPage(page + 1)}
              />
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <PartModal
          mode={modalMode}
          part={activePart}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}

      {viewPart && (
        <PartViewModal
          part={viewPart}
          onClose={closeViewModal}
          onEdit={() => {
            closeViewModal();
            openEditModal(viewPart);
          }}
        />
      )}

      {partToDelete && (
        <DeleteConfirmModal
          part={partToDelete}
          deleting={deleting}
          onCancel={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default PartsPage;