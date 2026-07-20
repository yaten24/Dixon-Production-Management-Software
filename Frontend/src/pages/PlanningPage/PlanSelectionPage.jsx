import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCalendarDays, HiOutlineClock, HiArrowRight } from 'react-icons/hi2';

const PLAN_OPTIONS = [
  {
    key: 'monthly',
    title: 'Monthly Plan',
    description: 'Set up machine, operator, and target allocation for a full production month.',
    icon: HiOutlineCalendarDays,
    path: '/employee/production/plans/monthly',
  },
  {
    key: 'daily',
    title: 'Daily Plan',
    description: "Quickly plan a single day's shift-wise machine and target allocation.",
    icon: HiOutlineClock,
    path: '/employee/production/plans/daily',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

// Deterministic pseudo-random star field so it doesn't reshuffle on every render
const STARS = Array.from({ length: 55 }, (_, i) => {
  const seed = i * 137.5;
  const x = (seed * 3.7) % 100;
  const y = (seed * 5.3) % 100;
  const size = 1 + ((i * 13) % 3); // 1–3px
  const duration = 3 + ((i * 7) % 5); // 3–7s
  const delay = (i % 10) * 0.3;
  const gold = i % 4 === 0;
  return { id: i, x, y, size, duration, delay, gold };
});

export default function PlanSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (plan) => {
    navigate(plan.path, { state: { planType: plan.key } });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F5F5] px-4 sm:px-6">
      {/* Smooth twinkling star field */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {STARS.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.gold ? '#FDC94D' : '#0F1D24',
            }}
            animate={{ opacity: [0.15, 0.9, 0.15], scale: [1, 1.4, 1] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative flex w-full max-w-md flex-col items-center gap-6 sm:max-w-none sm:gap-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FDC94D]">
            Production Planning
          </span>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#0F1D24] sm:text-2xl">
            Select Plan Type
          </h1>
          <p className="mt-1 text-xs font-medium text-[#9B9B9B]">
            Choose how you'd like to set up your production plan
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:gap-4"
        >
          {PLAN_OPTIONS.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.button
                key={plan.key}
                variants={cardVariants}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={() => handleSelect(plan)}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-md border border-[#C6C6C6] bg-white px-4 py-4 text-left shadow-[0_1px_0_rgba(15,23,42,0.05)] transition-colors duration-200 hover:border-[#0F1D24] hover:shadow-[0_8px_24px_rgba(15,29,36,0.08)] sm:w-64 sm:px-5 md:w-72"
              >
                {/* Signature accent: a thin yellow rule that grows in on hover */}
                <span className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-[#FDC94D] transition-transform duration-200 ease-out group-hover:scale-y-100" />

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#C6C6C6] bg-[#F5F5F5] text-[#0F1D24] transition-all duration-200 group-hover:border-[#0F1D24] group-hover:bg-[#0F1D24] group-hover:text-[#FDC94D]">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold tracking-tight text-[#0F1D24]">
                    {plan.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-[#9B9B9B] sm:truncate">
                    {plan.description}
                  </p>
                </div>

                <HiArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-[#9B9B9B] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-[#0F1D24] group-hover:opacity-100" />
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}