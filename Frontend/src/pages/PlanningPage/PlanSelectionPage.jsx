import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCalendarDays, HiOutlineClock, HiArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';

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
const STARS = Array.from({ length: 70 }, (_, i) => {
  const seed = i * 137.5;
  const x = (seed * 3.7) % 100;
  const y = (seed * 5.3) % 100;
  const size = 1 + ((i * 13) % 3); // 1–3px
  const duration = 3 + ((i * 7) % 6); // 3–8s
  const delay = (i % 12) * 0.3;
  const gold = i % 4 === 0;
  return { id: i, x, y, size, duration, delay, gold };
});

// Slow-drifting nebula glows for depth
const NEBULAE = [
  { x: '10%', y: '15%', size: 340, color: '#0F1D24', opacity: 0.05, duration: 16 },
  { x: '85%', y: '75%', size: 380, color: '#FDC94D', opacity: 0.08, duration: 20 },
  { x: '70%', y: '10%', size: 220, color: '#0F1D24', opacity: 0.04, duration: 14 },
];

export default function PlanSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (plan) => {
    navigate(plan.path, { state: { planType: plan.key } });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F5F5] px-4 sm:px-6">
      {/* Nebula glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {NEBULAE.map((n, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              left: n.x,
              top: n.y,
              width: n.size,
              height: n.size,
              backgroundColor: n.color,
              opacity: n.opacity,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              x: [0, 20, -10, 0],
              y: [0, -15, 10, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: n.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Twinkling star field */}
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
              boxShadow: star.gold
                ? '0 0 4px rgba(253,201,77,0.6)'
                : '0 0 3px rgba(15,29,36,0.35)',
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

      {/* Occasional shooting star */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-24 rounded bg-gradient-to-r from-transparent via-[#FDC94D] to-transparent"
        style={{ top: '18%', left: '-10%' }}
        animate={{ x: ['0vw', '130vw'], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 7,
          ease: 'easeIn',
        }}
      />

      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        title="Back"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded border border-[#C6C6C6]/70 bg-white text-[#0F1D24] shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-[#0F1D24] sm:left-6 sm:top-6"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
      </motion.button>

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
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded border border-[#C6C6C6] bg-white px-4 py-4 text-left shadow-[0_1px_0_rgba(15,23,42,0.05)] transition-colors duration-200 hover:border-[#0F1D24] hover:shadow-[0_8px_24px_rgba(15,29,36,0.08)] sm:w-64 sm:px-5 md:w-72"
              >
                {/* Signature accent: a thin yellow rule that grows in on hover */}
                <span className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-[#FDC94D] transition-transform duration-200 ease-out group-hover:scale-y-100" />

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#C6C6C6] bg-[#F5F5F5] text-[#0F1D24] transition-all duration-200 group-hover:border-[#0F1D24] group-hover:bg-[#0F1D24] group-hover:text-[#FDC94D]">
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