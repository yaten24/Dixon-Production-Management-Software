import React from "react";
import { motion } from "framer-motion";
import {
  FaClock,
  FaBoxes,
  FaChartLine,
  FaExclamationTriangle,
  FaIndustry,
  FaCog,
  FaTools,
} from "react-icons/fa";

const Card = ({ icon, title, value, subtitle, accent, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-1.5 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: accent }} />
      <div className="flex items-center gap-1.5 pl-1">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0F1D24]">
          <span className="text-[10px] text-[#FDC94D]">{icon}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
            {title}
          </p>
          <h2 className="truncate text-xs font-bold leading-tight text-[#0F1D24]">
            {value}
          </h2>
          <p className="truncate text-[8px] text-[#9B9B9B]">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};

const LossSummaryCards = ({
  totalLossMinutes,
  productionLoss,
  averageDowntime,
  totalEvents,
  highestHall,
  highestMachine,
  highestReason,
}) => {
  const cards = [
    { title: "Loss Time", value: `${totalLossMinutes}m`, subtitle: "Overall", icon: <FaClock />, accent: "#DC2626" },
    { title: "Prod Loss", value: productionLoss, subtitle: "Quantity", icon: <FaBoxes />, accent: "#DC2626" },
    { title: "Avg DT", value: `${averageDowntime}m`, subtitle: "Per Event", icon: <FaChartLine />, accent: "#0F1D24" },
    { title: "Events", value: totalEvents, subtitle: "Recorded", icon: <FaExclamationTriangle />, accent: "#FDC94D" },
    { title: "Top Hall", value: highestHall?.hall || "-", subtitle: `${highestHall?.lossMinutes || 0} min`, icon: <FaIndustry />, accent: "#0F1D24" },
    { title: "Top Machine", value: highestMachine?.machine || "-", subtitle: `${highestMachine?.lossMinutes || 0} min`, icon: <FaCog />, accent: "#0F1D24" },
    { title: "Top Reason", value: highestReason?.reason || "-", subtitle: `${highestReason?.lossMinutes || 0} min`, icon: <FaTools />, accent: "#FDC94D" },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
      {cards.map((c, i) => (
        <Card key={c.title} {...c} index={i} />
      ))}
    </div>
  );
};

export default LossSummaryCards;