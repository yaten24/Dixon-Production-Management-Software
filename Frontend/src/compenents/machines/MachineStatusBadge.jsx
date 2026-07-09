import React from "react";

const MachineStatusBadge = ({ status }) => {
  const statusConfig = {
    Running: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Running",
    },
    Stopped: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Stopped",
    },
    Idle: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Stopped",
    },
    Maintenance: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Maintenance",
    },
  };

  const current = statusConfig[status] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${current.bg} ${current.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1 ${
          status === "Running"
            ? "bg-green-500"
            : status === "Stopped" || status === "Idle"
            ? "bg-red-500"
            : status === "Maintenance"
            ? "bg-yellow-500"
            : "bg-gray-500"
        }`}
      />

      {current.label}
    </span>
  );
};

export default MachineStatusBadge;