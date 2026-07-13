import React from "react";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

const EmployeeActions = ({
  employee,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex justify-center gap-1">
      {/* View Button */}
      <button
        onClick={() => onView?.(employee)}
        title="View"
        className="
          flex
          items-center
          justify-center
          h-7
          w-7
          rounded
          bg-blue-100
          text-blue-600
          hover:bg-blue-600
          hover:text-white
          transition-all
          duration-300
        "
      >
        <FiEye size={13} />
      </button>

      {/* Edit Button */}
      <button
        onClick={() => onEdit?.(employee)}
        title="Edit"
        className="
          flex
          items-center
          justify-center
          h-7
          w-7
          rounded
          bg-green-100
          text-green-600
          hover:bg-green-600
          hover:text-white
          transition-all
          duration-300
        "
      >
        <FiEdit2 size={13} />
      </button>

      {/* Delete Button */}
      <button
        onClick={() => onDelete?.(employee)}
        title="Delete"
        className="
          flex
          items-center
          justify-center
          h-7
          w-7
          rounded
          bg-red-100
          text-red-600
          hover:bg-red-600
          hover:text-white
          transition-all
          duration-300
        "
      >
        <FiTrash2 size={13} />
      </button>
    </div>
  );
};

export default EmployeeActions;