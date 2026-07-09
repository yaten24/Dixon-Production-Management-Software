import React from "react";
import { FaTools } from "react-icons/fa";

const NoMachineFound = ({ colSpan = 6 }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FaTools className="text-2xl text-gray-400" />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            No Machines Found
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Try changing the hall filter or search keyword.
          </p>
        </div>
      </td>
    </tr>
  );
};

export default NoMachineFound;