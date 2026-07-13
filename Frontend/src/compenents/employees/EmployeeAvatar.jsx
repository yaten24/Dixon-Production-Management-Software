import React from "react";
import { FaUserCircle } from "react-icons/fa";

const EmployeeAvatar = ({ operator }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <FaUserCircle className="text-lg text-blue-600" />
      </div>

      <div className="min-w-0">
        <h3 className="text-xs font-semibold text-gray-800 truncate leading-tight">{operator.operator_name}</h3>
        <p className="text-[10px] text-gray-500 leading-tight">{operator.operator_code}</p>
      </div>
    </div>
  );
};

export default EmployeeAvatar;
