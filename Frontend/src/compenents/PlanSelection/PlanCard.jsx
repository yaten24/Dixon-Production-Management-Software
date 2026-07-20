import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarRange,
  Check,
  Clock,
  Settings2,
} from 'lucide-react';

const iconMap = { Calendar, CalendarDays, CalendarRange, Settings2 };

export default function PlanCard({ plan, isSelected, onSelect, onConfirm, cardRef, onKeyDown }) {
  const Icon = iconMap[plan.icon] ?? Calendar;

  return (
    <motion.div
      ref={cardRef}
      role="option"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`${plan.name}. ${plan.description} Estimated time ${plan.estimatedTime}.`}
      onClick={() => onSelect(plan.id)}
      onDoubleClick={() => onConfirm(plan.id)}
      onKeyDown={(e) => onKeyDown(e, plan.id)}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`group relative cursor-pointer rounded-[20px] border p-6 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        isSelected
          ? 'border-blue-500 bg-[#DBEAFE] shadow-[0_0_0_4px_rgba(37,99,235,0.12)]'
          : 'border-slate-200 bg-white shadow-sm hover:shadow-lg'
      }`}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
        >
          <Check size={14} strokeWidth={3} />
        </motion.div>
      )}

      <motion.div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
          isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
        }`}
        whileHover={{ scale: 1.08, rotate: 4 }}
      >
        <Icon size={24} />
      </motion.div>

      <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{plan.description}</p>

      <ul className="mt-4 space-y-1.5">
        {plan.useCases.slice(0, 3).map((useCase) => (
          <li key={useCase} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            {useCase}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Clock size={14} />
          {plan.estimatedTime}
        </span>
        <motion.span
          className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"
          whileHover={{ x: 2 }}
        >
          <ArrowRight size={16} />
        </motion.span>
      </div>
    </motion.div>
  );
}