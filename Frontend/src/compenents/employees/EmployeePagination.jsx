import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const EmployeePagination = ({ currentPage = 1, totalPages = 1, totalRecords = 0, limit = 100, onPageChange }) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const rangeStart = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-600">
        Showing <span className="font-semibold text-gray-800">{rangeStart}-{rangeEnd}</span> of{" "}
        <span className="font-semibold text-gray-800">{totalRecords}</span> operators ·{" "}
        Page <span className="font-semibold text-gray-800">{currentPage}</span> of{" "}
        <span className="font-semibold text-gray-800">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className={`flex items-center justify-center gap-1 h-7 px-3 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 transition-all duration-200 ${
            !canPrev ? "opacity-40 cursor-not-allowed" : "hover:border-blue-600 hover:bg-blue-600 hover:text-white"
          }`}
        >
          <FiChevronLeft size={12} />
          Prev
        </button>

        <button
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          className={`flex items-center justify-center gap-1 h-7 px-3 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 transition-all duration-200 ${
            !canNext ? "opacity-40 cursor-not-allowed" : "hover:border-blue-600 hover:bg-blue-600 hover:text-white"
          }`}
        >
          Next
          <FiChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default EmployeePagination;
