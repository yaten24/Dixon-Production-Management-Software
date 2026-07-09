import React from "react";
import { FaChevronRight } from "react-icons/fa";

const ChartCard = ({
  icon,
  iconBg = "#2563EB",
  title,
  subtitle,
  onViewHall,
  children,
  full = false,
}) => {
  return (
    <div
      className={`group overflow-hidden rounded border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${
        full ? "xl:col-span-2" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <div
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] text-white shadow-sm"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-[10.5px] font-bold uppercase tracking-wide text-gray-800 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-[9px] text-gray-400 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {onViewHall && (
          <button
            onClick={onViewHall}
            className="flex flex-shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium text-blue-600 opacity-0 transition-opacity duration-150 hover:bg-blue-50 group-hover:opacity-100"
          >
            View
            <FaChevronRight className="text-[8px]" />
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="p-1.5">{children}</div>
    </div>
  );
};

export default ChartCard;