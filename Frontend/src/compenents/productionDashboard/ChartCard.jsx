import React from "react";
import { FaChevronRight } from "react-icons/fa";

const ChartCard = ({ icon, iconBg, title, subtitle, onViewHall, full, children }) => {
  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded border border-gray-100 bg-white p-2 shadow-sm ${
        full ? "w-full" : ""
      }`}
    >
      <div className="mb-2 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded shadow-sm"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-800">{title}</h3>
            <p className="text-[9px] text-gray-500">{subtitle}</p>
          </div>
        </div>

        {onViewHall && (
          <button
            onClick={onViewHall}
            className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700"
          >
            View Details
            <FaChevronRight className="text-[8px]" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
};

export default ChartCard;