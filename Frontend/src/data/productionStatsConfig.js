// frontend/src/data/productionStatsConfig.js
import {
  HiOutlineFlag,
  HiOutlineCube,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineBolt,
  HiOutlineExclamationTriangle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

/*
  key   -> matches the field name coming from GET /api/dashboard/production-stats
  format -> optional formatter applied to the raw value before display
*/
export const productionStatsConfig = [
  {
    id: "targetQty",
    key: "targetQty",
    title: "Target Qty",
    icon: HiOutlineFlag,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    id: "actualQty",
    key: "actualQty",
    title: "Actual Qty",
    icon: HiOutlineCube,
    bg: "bg-indigo-50",
    color: "text-indigo-600",
  },
  {
    id: "goodQty",
    key: "goodQty",
    title: "Good Qty",
    icon: HiOutlineCheckCircle,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
  {
    id: "rejectQty",
    key: "rejectQty",
    title: "Reject Qty",
    icon: HiOutlineXCircle,
    bg: "bg-red-50",
    color: "text-red-600",
  },
  {
    id: "rejectionRate",
    key: "rejectionRate",
    title: "Reject %",
    icon: HiOutlineExclamationTriangle,
    bg: "bg-orange-50",
    color: "text-orange-600",
    format: (v) => `${v}%`,
  },
  {
    id: "efficiency",
    key: "efficiency",
    title: "Efficiency",
    icon: HiOutlineBolt,
    bg: "bg-amber-50",
    color: "text-amber-600",
    format: (v) => `${v}%`,
  },
  {
    id: "lossMinutes",
    key: "lossMinutes",
    title: "Loss Time",
    icon: HiOutlineClock,
    bg: "bg-violet-50",
    color: "text-violet-600",
    format: (v) => `${v}m`,
  },
  {
    id: "activeMachines",
    key: "activeMachines",
    title: "Active Machines",
    icon: HiOutlineCog6Tooth,
    bg: "bg-cyan-50",
    color: "text-cyan-600",
  },
];
