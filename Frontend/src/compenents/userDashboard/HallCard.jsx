import React from "react";
import {
  HiOutlineBuildingOffice2,
  HiOutlineArrowRight,
  HiOutlineFlag,
  HiOutlineCube,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const HallCard = ({ hall, onClick }) => {
  const handleCardClick = () => onClick(hall);
  const handleButtonClick = (e) => {
    e.stopPropagation();
    onClick(hall);
  };

  const isRunning = hall.status === "Running";

  return (
    <div
      onClick={handleCardClick}
      className="
        group flex h-full cursor-pointer flex-col
        rounded border border-[#C6C6C6]/50 bg-white
        p-1 shadow-[0_1px_2px_rgba(15,29,36,0.05)] transition-all duration-300
        hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_12px_28px_-8px_rgba(15,29,36,0.18)]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#0F1D24]">
            <HiOutlineBuildingOffice2 size={15} className="text-[#FDC94D]" />
          </div>
          <h3 className="truncate text-sm font-bold text-[#0F1D24]">
            {hall.hall}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
            isRunning
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {hall.status}
        </span>
      </div>

      {/* Body */}
      <div className="mt-1 space-y-1 border-y border-[#C6C6C6]/40 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <HiOutlineFlag size={13} className="text-[#9B9B9B]" />
            <span className="text-[11px] font-medium text-[#9B9B9B]">Target</span>
          </div>
          <span className="text-sm font-bold text-[#0F1D24]">
            {hall.target.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <HiOutlineCube size={13} className="text-emerald-500" />
            <span className="text-[11px] font-medium text-[#9B9B9B]">Actual</span>
          </div>
          <span className="text-sm font-bold text-emerald-600">
            {hall.actual.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <HiOutlineExclamationTriangle size={13} className="text-red-500" />
            <span className="text-[11px] font-medium text-[#9B9B9B]">Reject</span>
          </div>
          <span className="text-sm font-bold text-red-600">
            {hall.rejection}
          </span>
        </div>
      </div>

      {/* Achievement */}
      <div className="mt-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#9B9B9B]">Achievement</span>
          <span className="text-xs font-bold text-[#0F1D24]">
            {hall.achievement}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#C6C6C6]/40">
          <div
            className="h-full rounded bg-[#FDC94D] transition-all"
            style={{ width: hall.achievement }}
          />
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={handleButtonClick}
        className="
          mt-2 flex w-full items-center justify-center gap-1
          rounded bg-[#0F1D24] py-1.5 text-xs font-semibold text-[#FDC94D]
          transition-colors hover:bg-[#0F1D24]/90
        "
      >
        Open Hall
        <HiOutlineArrowRight
          size={13}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
};

export default HallCard;