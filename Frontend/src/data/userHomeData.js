import {
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentChartBar,
  HiOutlineArrowPath,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineChartBarSquare,
  HiOutlineClipboard,
  HiOutlineFlag,
} from "react-icons/hi2";

export const menuCards = [
  // ================= Dashboard =================
  {
    id: 1,
    title: "Hall Dashboard",
    description: "View Hall-wise Production Overview",
    icon: HiOutlineBuildingOffice2,
    color: "bg-sky-600",
    hover: "hover:border-sky-500",
    path: "/employee/dashboard",
  },

  // ================= Planning =================
  {
    id: 2,
    title: "Production Planning",
    description: "Daily & Monthly Production Plans",
    icon: HiOutlineFlag,
    color: "bg-red-600",
    hover: "hover:border-red-500",
    path: "/employee/production/plans",
  },

  // ================= Allocation =================
  {
    id: 3,
    title: "Machine Allocation",
    description: "Assign Operators to Production Machines",
    icon: HiOutlineUserGroup,
    color: "bg-pink-600",
    hover: "hover:border-pink-500",
    path: "/employee/production/plans/daily/operator/allocation",
  },

  // ================= Production =================
  {
    id: 4,
    title: "Production Entry",
    description: "Record Production, Rejections & Loss Time",
    icon: HiOutlineClipboardDocumentList,
    color: "bg-blue-600",
    hover: "hover:border-blue-500",
    path: "/employee/production/entry",
  },

  // ================= Mould =================
  {
    id: 5,
    title: "Mould Change",
    description: "Manage Mould Change Activities",
    icon: HiOutlineArrowPath,
    color: "bg-indigo-600",
    hover: "hover:border-indigo-500",
    path: "/employee/mould-change",
  },

  // ================= History =================
  {
    id: 6,
    title: "Production History",
    description: "Browse Historical Production Records",
    icon: HiOutlineClipboard,
    color: "bg-teal-600",
    hover: "hover:border-teal-500",
    path: "/employee/production/history",
  },

  // ================= Reports =================
  {
    id: 7,
    title: "Reports",
    description: "Generate Daily, Monthly & Excel Reports",
    icon: HiOutlineDocumentChartBar,
    color: "bg-orange-500",
    hover: "hover:border-orange-500",
    path: "/employee/production/reports",
  },

  // ================= Analytics =================
  {
    id: 8,
    title: "Performance Analytics",
    description: "Analyze Operator & Machine Performance",
    icon: HiOutlineChartBarSquare,
    color: "bg-lime-600",
    hover: "hover:border-lime-500",
    path: "/employee/analytics/performance",
  },
];