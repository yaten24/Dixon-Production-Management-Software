import React from "react";
import { motion } from "framer-motion";

import EmployeeRow from "./EmployeeRow";
import EmployeePagination from "./EmployeePagination";

const EmployeeTable = ({
  operators,
  loading,
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onView,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 px-3 py-1.5 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-bold text-gray-800 leading-tight">Operator List</h2>
          <p className="text-[10px] text-gray-500 leading-tight">
            Total <span className="font-semibold">{totalRecords}</span> Operators
          </p>
        </div>

        <span className="inline-flex items-center self-start md:self-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
          Live Workforce
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600">Operator</th>
              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600">Hall</th>
              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600">Shift</th>
              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600">Performance</th>
              <th className="px-3 py-1.5 text-center text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-gray-500">
                  Loading operators...
                </td>
              </tr>
            ) : operators.length > 0 ? (
              operators.map((operator, index) => (
                <EmployeeRow key={operator.id} operator={operator} index={index} onView={onView} onDelete={onDelete} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-gray-500">
                  No operators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <EmployeePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        limit={limit}
        onPageChange={onPageChange}
      />
    </motion.div>
  );
};

export default EmployeeTable;
