import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const generatePages = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="mt-3 flex flex-col gap-2 rounded border border-gray-200 bg-white px-3 py-2 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      {/* Left */}
      <p className="text-xs text-gray-600">
        Showing <span className="font-semibold">{startItem}</span> to{" "}
        <span className="font-semibold">{endItem}</span> of{" "}
        <span className="font-semibold">{totalItems}</span> users
      </p>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiChevronLeft size={14} />
        </button>

        {/* Page Numbers */}
        {generatePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-7 w-7 rounded text-xs font-medium transition ${currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
