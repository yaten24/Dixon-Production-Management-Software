import { motion } from "framer-motion";
import { HiOutlineCog, HiOutlineCheckCircle, HiOutlineClock, HiOutlineFlag, HiOutlineSignal } from "react-icons/hi2";

const PlanningStats = ({ header }) => {
  const pending = header.total_machines - header.planned_machines;

  const cards = [
    {
      title: "Total Machines",
      value: header.total_machines,
      icon: HiOutlineCog,
      bg: "bg-[#0F1D24]",
      text: "text-[#FDC94D]",
      bar: "bg-[#0F1D24]",
    },
    {
      title: "Planned",
      value: header.planned_machines,
      icon: HiOutlineCheckCircle,
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      bar: "bg-emerald-500",
    },
    {
      title: "Pending",
      value: pending,
      icon: HiOutlineClock,
      bg: "bg-amber-100",
      text: "text-amber-600",
      bar: "bg-amber-500",
    },
    {
      title: "Total Target",
      value: (header.total_target_qty || 0).toLocaleString(),
      icon: HiOutlineFlag,
      bg: "bg-[#FDC94D]/25",
      text: "text-[#0F1D24]",
      bar: "bg-[#FDC94D]",
    },
    {
      title: "Status",
      value: header.status,
      icon: HiOutlineSignal,
      bg: "bg-[#0F1D24]/10",
      text: "text-[#0F1D24]",
      bar: "bg-[#0F1D24]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((c, index) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
            className="group relative overflow-hidden rounded border border-[#C6C6C6]/50 bg-white p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#9B9B9B]">
                  {c.title}
                </p>
                <h2 className="mt-1 truncate text-base font-bold leading-tight text-[#0F1D24]">
                  {c.value}
                </h2>
              </div>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${c.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${c.text}`} />
              </div>
            </div>
            <div className={`absolute inset-x-0 bottom-0 h-[3px] ${c.bar}`} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlanningStats;