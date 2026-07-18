import React from "react";

export const CardShell = ({ className = "", children }) => (
  <div
    className={`flex min-h-0 flex-col rounded-sm border border-[#C6C6C6]/70 bg-white p-2 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export const CardLabel = ({
  icon: Icon,
  children,
  tone = "text-[#9B9B9B]",
}) => (
  <div
    className={`flex flex-shrink-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-wide ${tone}`}
  >
    {Icon && <Icon size={11} />}
    {children}
  </div>
);
