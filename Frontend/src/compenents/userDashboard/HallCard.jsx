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
        rounded border border-slate-200 bg-white
        p-1 shadow-sm transition-shadow duration-200
        hover:shadow-md
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-blue-50">
            <HiOutlineBuildingOffice2 size={15} className="text-blue-600" />
          </div>
          <h3 className="truncate text-sm font-bold text-slate-900">
            {hall.hall}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
            isRunning
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {hall.status}
        </span>
      </div>

      {/* Body */}
      <div className="mt-2 space-y-1 border-y border-slate-100 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <HiOutlineFlag size={13} className="text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500">Target</span>
          </div>
          <span className="text-sm font-bold text-slate-900">
            {hall.target.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <HiOutlineCube size={13} className="text-green-500" />
            <span className="text-[11px] font-medium text-slate-500">Actual</span>
          </div>
          <span className="text-sm font-bold text-green-600">
            {hall.actual.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <HiOutlineExclamationTriangle size={13} className="text-red-500" />
            <span className="text-[11px] font-medium text-slate-500">Reject</span>
          </div>
          <span className="text-sm font-bold text-red-600">
            {hall.rejection}
          </span>
        </div>
      </div>

      {/* Achievement */}
      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">Achievement</span>
          <span className="text-xs font-bold text-blue-600">
            {hall.achievement}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-slate-200">
          <div
            className="h-full rounded bg-blue-600 transition-all"
            style={{ width: hall.achievement }}
          />
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={handleButtonClick}
        className="
          mt-2 flex w-full items-center justify-center gap-1
          rounded bg-blue-600 py-1.5 text-xs font-semibold text-white
          transition hover:bg-blue-700
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