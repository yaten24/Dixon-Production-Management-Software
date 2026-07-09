import React from "react";
import {
  FaClock,
  FaBoxes,
  FaChartLine,
  FaExclamationTriangle,
  FaIndustry,
  FaCog,
  FaTools,
} from "react-icons/fa";

const Card = ({
  icon,
  title,
  value,
  subtitle,
  borderColor,
  iconBg,
  iconColor,
}) => {
  return (
    <div
      className={`bg-white border border-gray-200 border-l-[3px] ${borderColor} rounded shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-1`}
    >
      <div className="flex items-center gap-2">
        {/* Icon */}
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${iconBg}`}
        >
          <span className={`text-xs ${iconColor}`}>{icon}</span>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </p>
          <h2 className="truncate text-sm font-bold leading-tight text-gray-900">
            {value}
          </h2>
          <p className="truncate text-[9px] text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const LossSummaryCards = ({
  totalLossMinutes,
  productionLoss,
  averageDowntime,
  totalEvents,
  highestHall,
  highestMachine,
  highestReason,
}) => {
  return (
    <div className="mb-1 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      <Card
        title="Loss Time"
        value={`${totalLossMinutes}m`}
        subtitle="Overall"
        icon={<FaClock />}
        borderColor="border-l-red-500"
        iconBg="bg-red-50"
        iconColor="text-red-500"
      />

      <Card
        title="Prod Loss"
        value={productionLoss}
        subtitle="Quantity"
        icon={<FaBoxes />}
        borderColor="border-l-orange-500"
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
      />

      <Card
        title="Avg DT"
        value={`${averageDowntime}m`}
        subtitle="Per Event"
        icon={<FaChartLine />}
        borderColor="border-l-blue-500"
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
      />

      <Card
        title="Events"
        value={totalEvents}
        subtitle="Recorded"
        icon={<FaExclamationTriangle />}
        borderColor="border-l-purple-500"
        iconBg="bg-purple-50"
        iconColor="text-purple-500"
      />

      <Card
        title="Top Hall"
        value={highestHall?.hall || "-"}
        subtitle={`${highestHall?.lossMinutes || 0} min`}
        icon={<FaIndustry />}
        borderColor="border-l-green-500"
        iconBg="bg-green-50"
        iconColor="text-green-500"
      />

      <Card
        title="Top Machine"
        value={highestMachine?.machine || "-"}
        subtitle={`${highestMachine?.lossMinutes || 0} min`}
        icon={<FaCog />}
        borderColor="border-l-indigo-500"
        iconBg="bg-indigo-50"
        iconColor="text-indigo-500"
      />

      <Card
        title="Top Reason"
        value={highestReason?.reason || "-"}
        subtitle={`${highestReason?.lossMinutes || 0} min`}
        icon={<FaTools />}
        borderColor="border-l-pink-500"
        iconBg="bg-pink-50"
        iconColor="text-pink-500"
      />
    </div>
  );
};

export default LossSummaryCards;
