import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineWrenchScrewdriver,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const StatusBadge = ({ status }) => {
  const config = {
    Running: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: HiOutlinePlay,
      label: "Running",
    },

    Idle: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: HiOutlinePause,
      label: "Idle",
    },

    Breakdown: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: HiOutlineExclamationTriangle,
      label: "Breakdown",
    },

    Maintenance: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: HiOutlineWrenchScrewdriver,
      label: "Maintenance",
    },
  };

  const current =
    config[status] || config.Idle;

  const Icon = current.icon;

  return (
    <div
      className={`
      inline-flex
      items-center
      gap-2
      px-3
      py-1
      rounded-full
      text-xs
      font-semibold
      ${current.bg}
      ${current.text}
    `}
    >
      <Icon className="text-sm" />

      {current.label}
    </div>
  );
};

export default StatusBadge;