import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Info, ListChecks, Sparkles, Users } from 'lucide-react';

export default function SelectionSummary({ plan }) {
  return (
    <div className="sticky top-6 h-fit rounded-[20px] border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Info size={16} className="text-blue-600" />
        Plan Information
      </h3>

      <AnimatePresence mode="wait">
        {plan ? (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-5"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Selected Plan
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">{plan.name}</p>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Sparkles size={13} /> Benefits
              </p>
              <ul className="mt-2 space-y-1.5">
                {plan.benefits.map((b) => (
                  <li key={b} className="text-sm text-slate-600">
                    • {b}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <ListChecks size={13} /> Required Information
              </p>
              <ul className="mt-2 space-y-1.5">
                {plan.requiredInfo.map((r) => (
                  <li key={r} className="text-sm text-slate-600">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
              <Clock size={15} className="text-blue-600" />
              <span className="text-sm text-slate-700">{plan.estimatedTime} to complete</span>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Users size={13} /> Recommended For
              </p>
              <p className="mt-1.5 text-sm text-slate-600">{plan.recommendedFor}</p>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-sm text-slate-400"
          >
            Select a plan type to see details, benefits, and required information here.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}