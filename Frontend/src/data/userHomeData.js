import { HiOutlineClipboardDocumentList, HiOutlineSquares2X2, HiOutlineDocumentChartBar, HiOutlineUserCircle } from "react-icons/hi2";

/* ===========================
   QUICK ACCESS MODULES
=========================== */

import {
  HiOutlineFlag,
  HiOutlineClock,
} from "react-icons/hi2";

export const overviewData = [
  {
    id: 1,
    title: "Production",
    value: "24,580",
    subtitle: "Today",
    subtitleColor: "text-green-600",
    icon: HiOutlineClipboardDocumentList,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    valueColor: "text-blue-600",
  },
  {
    id: 2,
    title: "Target",
    value: "26,000",
    subtitle: "Today's Target",
    subtitleColor: "text-blue-600",
    icon: HiOutlineFlag,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    valueColor: "text-cyan-600",
  },
  {
    id: 3,
    title: "Rejection",
    value: "148",
    subtitle: "0.60% Reject Rate",
    subtitleColor: "text-red-500",
    icon: HiOutlineDocumentChartBar,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-600",
  },
  {
    id: 4,
    title: "Running Machines",
    value: "82",
    subtitle: "All Systems Normal",
    subtitleColor: "text-green-600",
    icon: HiOutlineSquares2X2,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-600",
  },
  {
    id: 5,
    title: "Loss Time",
    value: "01:42 Hrs",
    subtitle: "Today's Downtime",
    subtitleColor: "text-orange-600",
    icon: HiOutlineClock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueColor: "text-orange-600",
  },
];

export const menuCards = [
  {
    id: 1,
    title: "Data Entry",
    description: "Production, Rejection, Loss Time & Attendance",
    icon: HiOutlineClipboardDocumentList,
    color: "bg-blue-600",
    hover: "hover:border-blue-500",
    path: "/user/production/entry",
  },
  {
    id: 2,
    title: "Dashboard",
    description: "Production Analytics & Monitoring",
    icon: HiOutlineSquares2X2,
    color: "bg-green-600",
    hover: "hover:border-green-500",
    path: "/user/dashboard",
  },
  {
    id: 3,
    title: "Reports",
    description: "Daily, Monthly & Excel Reports",
    icon: HiOutlineDocumentChartBar,
    color: "bg-orange-500",
    hover: "hover:border-orange-500",
    path: "/user/reports",
  },
  {
    id: 4,
    title: "Profile",
    description: "Profile & Account Settings",
    icon: HiOutlineUserCircle,
    color: "bg-purple-600",
    hover: "hover:border-purple-500",
    path: "/user/profile",
  },
];

/* ===========================
   RECENT ACTIVITIES
=========================== */

export const recentActivities = [
  {
    id: 1,
    title: "Production Entry Updated",
    description: "Hall-1 • 2 min ago",
    status: "Live",
  },
  {
    id: 2,
    title: "Attendance Submitted",
    description: "Morning Shift • 8 min ago",
    status: "Success",
  },
  {
    id: 3,
    title: "Quality Inspection",
    description: "Hall-3 • 18 min ago",
    status: "Completed",
  },
  {
    id: 4,
    title: "Machine Maintenance",
    description: "Machine M-12 • 40 min ago",
    status: "Completed",
  },
  {
    id: 5,
    title: "Loss Time Updated",
    description: "Hall-2 • 1 hour ago",
    status: "Updated",
  },
];

/* ===========================
   SYSTEM STATUS
=========================== */

export const systemStatus = [
  {
    id: 1,
    module: "Production Line",
    status: "Online",
  },
  {
    id: 2,
    module: "Quality Inspection",
    status: "Online",
  },
  {
    id: 3,
    module: "Attendance Server",
    status: "Online",
  },
  {
    id: 4,
    module: "Machine Monitoring",
    status: "Online",
  },
  {
    id: 5,
    module: "Database",
    status: "Online",
  },
  {
    id: 6,
    module: "Report Service",
    status: "Online",
  },
];
