import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const EmployeePagination = ({
  currentPage = 1,
  totalPages = 3,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
      {/* Left */}

      <p className="text-xs text-gray-600">
        Page <span className="font-semibold text-gray-800">{currentPage}</span> of{" "}
        <span className="font-semibold text-gray-800">{totalPages}</span>
      </p>

      {/* Right */}

      <div className="flex items-center gap-1">
        {/* Previous */}

        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`
            flex
            items-center
            justify-center
            gap-1
            h-7
            px-2
            rounded
            border
            border-gray-200
            bg-white
            text-xs
            font-medium
            text-gray-600
            transition-all
            duration-200
            ${
              currentPage === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:border-blue-600 hover:bg-blue-600 hover:text-white"
            }
          `}
        >
          <FiChevronLeft size={12} />
          Prev
        </button>

        {/* Page Numbers */}

        <div className="flex items-center gap-0.5">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                w-7
                h-7
                rounded
                text-xs
                font-medium
                transition-all
                duration-200
                ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 border border-gray-200 bg-white hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next */}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`
            flex
            items-center
            justify-center
            gap-1
            h-7
            px-2
            rounded
            border
            border-gray-200
            bg-white
            text-xs
            font-medium
            text-gray-600
            transition-all
            duration-200
            ${
              currentPage === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:border-blue-600 hover:bg-blue-600 hover:text-white"
            }
          `}
        >
          Next
          <FiChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default EmployeePagination;