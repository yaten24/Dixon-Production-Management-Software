import React from "react";
import { FaChevronRight, FaExclamationTriangle } from "react-icons/fa";

const ChartCard = ({
  icon,
  iconBg,
  title,
  subtitle,
  onViewHall,
  full,
  hasData = true,
  emptyLabel = "No data available",
  emptyDescription = "No entries found for the selected filters.",
  children,
}) => {
  return (
    <div
      className={`flex h-full min-h-0 flex-col border bg-white p-2 ${
        hasData ? "border-[#C6C6C6]" : "border-amber-300"
      } ${full ? "w-full" : ""}`}
    >
      <div className="mb-2 flex flex-shrink-0 items-center justify-between border-b border-[#C6C6C6] pb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center border"
            style={{
              background: hasData ? iconBg : "#C6C6C6",
              borderColor: hasData ? iconBg : "#C6C6C6",
            }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[12.5px] font-bold text-[#0F1D24]">{title}</h3>
              {!hasData && (
                <span className="flex items-center gap-1 border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-amber-700">
                  <FaExclamationTriangle className="text-[8px]" />
                  No Data
                </span>
              )}
            </div>
            <p className="text-[9.5px] font-medium text-[#9B9B9B]">{subtitle}</p>
          </div>
        </div>

        {onViewHall && (
          <button
            onClick={onViewHall}
            className="flex items-center gap-1 border border-[#C6C6C6] px-2 py-1 text-[10px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D]"
          >
            View Details
            <FaChevronRight className="text-[8px]" />
          </button>
        )}
      </div>

      {hasData ? (
        <div className="min-h-0 flex-1">{children}</div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 border border-dashed border-[#C6C6C6] bg-[#FAFAFA] px-4 py-6 text-center">
          <div className="flex h-9 w-9 items-center justify-center border border-amber-300 bg-amber-50 text-amber-500">
            <FaExclamationTriangle className="text-sm" />
          </div>
          <p className="text-[12px] font-bold text-[#0F1D24]">{emptyLabel}</p>
          <p className="max-w-xs text-[10.5px] text-[#9B9B9B]">{emptyDescription}</p>
        </div>
      )}
    </div>
  );
};

export default ChartCard;