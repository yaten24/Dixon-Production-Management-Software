import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const statusStyles = {
  Active: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2,
  },
  Inactive: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
  },
};

const PartStatusBadge = ({ status }) => {
  const current = statusStyles[status] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: CheckCircle2,
  };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${current.bg} ${current.text} ${current.border}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
};

export default React.memo(PartStatusBadge);
