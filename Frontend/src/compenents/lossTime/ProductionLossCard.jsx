import React from "react";
import {
  FaBoxes,
  FaClock,
  FaChartLine,
  FaPercentage,
} from "react-icons/fa";

const MiniCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}) => {
  return (
    <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-4">

      <div className="flex items-center justify-between">

        <div className="flex-1">

          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
            {title}
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {value}
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            {subtitle}
          </p>

        </div>

        <div
          className={`h-11 w-11 flex items-center justify-center text-white ${color}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

const ProductionLossCard = ({
  productionLoss,
  totalLossMinutes,
  averageDowntime,
  lossPercentage,
}) => {
  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-blue-600 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

        <div>

          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
            Production Loss Overview
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Overall production loss KPI summary
          </p>

        </div>

        <span className="text-xs font-medium text-blue-600">
          Live Analysis
        </span>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">

        <MiniCard
          title="Production Loss"
          value={productionLoss}
          subtitle="Lost Production Qty"
          icon={
            <FaBoxes size={18} />
          }
          color="bg-red-500"
        />

        <MiniCard
          title="Total Downtime"
          value={`${totalLossMinutes}m`}
          subtitle="Overall Loss Time"
          icon={
            <FaClock size={18} />
          }
          color="bg-blue-600"
        />

        <MiniCard
          title="Avg Downtime"
          value={`${averageDowntime}m`}
          subtitle="Per Event"
          icon={
            <FaChartLine size={18} />
          }
          color="bg-green-600"
        />

        <MiniCard
          title="Loss %"
          value={`${lossPercentage}%`}
          subtitle="Production Impact"
          icon={
            <FaPercentage size={18} />
          }
          color="bg-orange-500"
        />

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3">

        <span className="text-xs text-gray-500">
          Production Performance Summary
        </span>

        <span className="text-xs font-medium text-blue-600">
          Updated from Loss Time Data
        </span>

      </div>

    </div>
  );
};

export default ProductionLossCard;