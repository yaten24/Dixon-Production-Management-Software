import React from "react";
import { FiEye, FiTrash2 } from "react-icons/fi";

const EmployeeActions = ({ operator, onView, onDelete }) => {
  return (
    <div className="flex justify-center gap-1">
      <button
        onClick={() => onView?.(operator)}
        title="View"
        className="flex items-center justify-center h-7 w-7 rounded bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
      >
        <FiEye size={13} />
      </button>

      <button
        onClick={() => onDelete?.(operator)}
        title="Delete"
        className="flex items-center justify-center h-7 w-7 rounded bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
      >
        <FiTrash2 size={13} />
      </button>
    </div>
  );
};

export default EmployeeActions;
