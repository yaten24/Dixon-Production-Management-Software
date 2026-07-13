import {
  HiOutlineUser,
  HiOutlineCube,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import StatusBadge from "./StatusBadge";

const MachineCard = ({ machine, onClick }) => {
  const progress =
    machine.target > 0
      ? Math.min((machine.actual / machine.target) * 100, 100)
      : 0;

  return (
    <div
      onClick={onClick}
      className="
      bg-white
      rounded-2xl
      shadow-md
      border
      hover:shadow-2xl
      hover:-translate-y-1
      transition-all
      duration-300
      overflow-hidden
      cursor-pointer
    "
    >
      {/* Header */}

      <div className="flex items-center justify-between p-5 border-b">
        <div>
          <h2 className="text-xl font-bold">{machine.machineCode}</h2>

          <p className="text-xs text-gray-500">{machine.machineName}</p>
        </div>

        <StatusBadge status={machine.status} />
      </div>

      {/* Body */}

      <div className="p-5 space-y-4">
        {/* Operator */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineUser className="text-blue-600" />

            <span className="text-sm">Operator</span>
          </div>

          <span className="font-semibold">{machine.operatorName || "--"}</span>
        </div>

        {/* Part */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineCube className="text-green-600" />

            <span className="text-sm">Part</span>
          </div>

          <span className="font-semibold">{machine.partNumber || "--"}</span>
        </div>

        {/* Progress */}

        <div className="flex justify-center py-4">
          <div className="relative w-32 h-32">
            <svg width="128" height="128">
              <circle
                cx="64"
                cy="64"
                r="55"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="10"
              />

              <circle
                cx="64"
                cy="64"
                r="55"
                fill="none"
                stroke="#2563EB"
                strokeWidth="10"
                strokeDasharray="345"
                strokeDashoffset={345 - (345 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold">{progress.toFixed(0)}%</h2>

              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>

        {/* Target */}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-xs text-gray-500">Target</p>

            <h3 className="text-xl font-bold">{machine.target}</h3>
          </div>

          <div className="rounded-xl bg-green-50 p-3">
            <p className="text-xs text-gray-500">Actual</p>

            <h3 className="text-xl font-bold">{machine.actual}</h3>
          </div>
        </div>

        {/* Reject */}

        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationTriangle className="text-red-600" />
            Reject
          </div>

          <strong>{machine.reject}</strong>
        </div>

        {/* Loss */}

        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineClock className="text-orange-600" />
            Loss Time
          </div>

          <strong>{machine.lossTime} min</strong>
        </div>

        {/* Cycle */}

        <div className="flex justify-between">
          <span>Cycle</span>

          <strong>
            {machine.currentCycle} / {machine.cycleTime} sec
          </strong>
        </div>
      </div>
    </div>
  );
};

export default MachineCard;
