import React from "react";
import { HiOutlineBuildingOffice2, HiOutlineArrowRight, HiOutlineFlag, HiOutlineCube, HiOutlineExclamationTriangle } from "react-icons/hi2";

const HallCard = ({ hall, onClick }) => {
  const handleCardClick = () => {
    onClick(hall);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    onClick(hall);
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        group
        cursor-pointer
        rounded
        border
        border-slate-200
        bg-white
        p-2
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-500
        hover:shadow-lg
      ">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-100">
            <HiOutlineBuildingOffice2 size={24} className="text-blue-600" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">{hall.hall}</h3>

            <p className="text-xs text-slate-500">Production Hall</p>
          </div>
        </div>

        <span className={`rounded px-3 py-1 text-xs font-semibold ${hall.status === "Running" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{hall.status}</span>
      </div>

      {/* Body */}

      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineFlag size={18} className="text-blue-600" />

            <span className="text-sm text-slate-600">Target</span>
          </div>

          <span className="font-semibold text-slate-800">{hall.target.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineCube size={18} className="text-green-600" />

            <span className="text-sm text-slate-600">Actual</span>
          </div>

          <span className="font-semibold text-green-600">{hall.actual.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationTriangle size={18} className="text-red-600" />

            <span className="text-sm text-slate-600">Reject</span>
          </div>

          <span className="font-semibold text-red-600">{hall.rejection}</span>
        </div>
      </div>

      {/* Achievement */}

      <div className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-500">Achievement</span>

          <span className="font-semibold text-blue-600">{hall.achievement}</span>
        </div>

        <div className="h-2 overflow-hidden rounded bg-slate-200">
          <div
            className="h-full rounded bg-blue-600"
            style={{
              width: hall.achievement,
            }}
          />
        </div>
      </div>

      {/* Footer */}

      <div className="border-t border-slate-100 pt-4">
        <button
          onClick={handleButtonClick}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded
            cursor-pointer
            bg-blue-600
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-blue-700
          ">
          Open Hall
          <HiOutlineArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default HallCard;
