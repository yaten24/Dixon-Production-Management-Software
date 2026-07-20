import {
  HiOutlineClipboardDocumentList,
  HiOutlineSquares2X2,
  HiOutlineDocumentChartBar,
  HiOutlineCpuChip,
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineUserGroup,
  HiOutlineWrenchScrewdriver,
  HiOutlineCube,
  HiOutlineBuildingOffice2,
  HiOutlineChartBarSquare,
  HiOutlineClipboard,
  HiOutlineShieldCheck,
  HiOutlineArchiveBox,
  HiOutlineCog6Tooth,
  HiOutlineFlag,
} from "react-icons/hi2";

export const menuCards = [
  {
    id: 1,
    title: "Production Entry",
    description: "Production, Rejection & Loss Time",
    icon: HiOutlineClipboardDocumentList,
    color: "bg-blue-600",
    hover: "hover:border-blue-500",
    path: "/employee/production/entry",
  },

  {
    id: 4,
    title: "Production Targets",
    description: "Machine-wise Target Planning",
    icon: HiOutlineFlag,
    color: "bg-red-600",
    hover: "hover:border-red-500",
    path: "/employee/production/plans",
  },

  {
    id: 6,
    title: "Machine Allocation",
    description: "Assign Operators to Machines",
    icon: HiOutlineUserGroup,
    color: "bg-pink-600",
    hover: "hover:border-pink-500",
    path: "/production/update-machine-operator",
  },

  {
    id: 15,
    title: "Production History",
    description: "Machine-wise Historical Records",
    icon: HiOutlineClipboard,
    color: "bg-teal-600",
    hover: "hover:border-teal-500",
    path: "/employee/production/history",
  },

  {
    id: 2,
    title: "Hall Overview",
    description: "Hall-wise Production Summary",
    icon: HiOutlineBuildingOffice2,
    color: "bg-sky-600",
    hover: "hover:border-sky-500",
    path: "/employee/dashboard",
  },

  {
    id: 5,
    title: "Machine Overview",
    description: "View Hall-wise Machine Status",
    icon: HiOutlineCpuChip,
    color: "bg-cyan-600",
    hover: "hover:border-cyan-500",
    path: "/employee/machines/overview",
  },

  // {
  //   id: 7,
  //   title: "Production Targets",
  //   description: "Machine-wise Target Planning",
  //   icon: HiOutlineFlag,
  //   color: "bg-red-600",
  //   hover: "hover:border-red-500",
  //   path: "/user/production-targets",
  // },

  {
    id: 8,
    title: "Rejection Management",
    description: "Analyze Production Rejects",
    icon: HiOutlineExclamationTriangle,
    color: "bg-rose-600",
    hover: "hover:border-rose-500",
    path: "/employee/rejections",
  },

  {
    id: 9,
    title: "Loss Time Management",
    description: "Track Downtime & Loss Reasons",
    icon: HiOutlineClock,
    color: "bg-yellow-500",
    hover: "hover:border-yellow-400",
    path: "/user/loss-time",
  },

  {
    id: 10,
    title: "Mould Change",
    description: "Track Mould Change Activities",
    icon: HiOutlineArrowPath,
    color: "bg-indigo-600",
    hover: "hover:border-indigo-500",
    path: "/employee/mould-change",
  },

  // {
  //   id: 11,
  //   title: "Maintenance",
  //   description: "Machine Maintenance Schedule",
  //   icon: HiOutlineWrenchScrewdriver,
  //   color: "bg-gray-700",
  //   hover: "hover:border-gray-600",
  //   path: "/user/maintenance",
  // },

  // {
  //   id: 12,
  //   title: "Part Master",
  //   description: "Manage Parts & Cycle Time",
  //   icon: HiOutlineCube,
  //   color: "bg-emerald-600",
  //   hover: "hover:border-emerald-500",
  //   path: "/user/parts",
  // },

  // {
  //   id: 13,
  //   title: "Hall Overview",
  //   description: "Hall-wise Production Summary",
  //   icon: HiOutlineBuildingOffice2,
  //   color: "bg-sky-600",
  //   hover: "hover:border-sky-500",
  //   path: "/user/hall-overview",
  // },

  {
    id: 14,
    title: "Performance Analysis",
    description: "Operator & Machine Performance",
    icon: HiOutlineChartBarSquare,
    color: "bg-lime-600",
    hover: "hover:border-lime-500",
    path: "/user/performance",
  },

  {
    id: 3,
    title: "Reports",
    description: "Daily, Monthly & Excel Reports",
    icon: HiOutlineDocumentChartBar,
    color: "bg-orange-500",
    hover: "hover:border-orange-500",
    path: "/employee/reports",
  },

  // {
  //   id: 16,
  //   title: "Quality Control",
  //   description: "Inspection & Quality Monitoring",
  //   icon: HiOutlineShieldCheck,
  //   color: "bg-violet-600",
  //   hover: "hover:border-violet-500",
  //   path: "/user/quality",
  // },

  // {
  //   id: 17,
  //   title: "Inventory",
  //   description: "Raw Material & FG Tracking",
  //   icon: HiOutlineArchiveBox,
  //   color: "bg-amber-600",
  //   hover: "hover:border-amber-500",
  //   path: "/user/inventory",
  // },

  {
    id: 18,
    title: "Production Settings",
    description: "Configure Production Modules",
    icon: HiOutlineCog6Tooth,
    color: "bg-slate-600",
    hover: "hover:border-slate-500",
    path: "/employee/settings",
  },
];
