import React from "react";
import { getStatusColor } from "../../config/userHelpers";

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(status)}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${status === "Active" ? "bg-green-500" : status === "Inactive" ? "bg-gray-500" : "bg-red-500"}`}
      ></span>

      {status}
    </span>
  );
};

export default StatusBadge;
