// StatCard.jsx
import React from "react";

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    iconBg: "bg-blue-100",
    bar: "bg-blue-600",
    value: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    iconBg: "bg-green-100",
    bar: "bg-green-600",
    value: "text-green-700",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    iconBg: "bg-red-100",
    bar: "bg-red-600",
    value: "text-red-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    iconBg: "bg-indigo-100",
    bar: "bg-indigo-600",
    value: "text-indigo-700",
  },
};

const StatCard = ({ title, value, subtitle, icon, color = "blue", progress = false }) => {
  const c = colorMap[color] || colorMap.blue;
  const progressValue = progress ? parseFloat(value) || 0 : null;

  return (
    <div className="group flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 truncate">
          {title}
        </p>

        <h3 className={`mt-0.5 text-lg font-bold leading-tight ${c.value}`}>
          {value}
        </h3>

        {progress ? (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
              style={{ width: `${Math.min(progressValue, 100)}%` }}
            />
          </div>
        ) : (
          subtitle && (
            <p className="mt-0.5 text-[10px] text-gray-400 leading-tight">{subtitle}</p>
          )
        )}
      </div>

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${c.iconBg} ${c.icon} text-sm ml-2 transition-transform duration-300 group-hover:scale-110`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatCard;