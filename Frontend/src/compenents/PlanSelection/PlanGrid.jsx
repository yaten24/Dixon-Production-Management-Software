import EmptyState from './EmptyState';
import PlanCard from './PlanCard';

export default function PlanGrid({ plans, selectedPlan, onSelect, onConfirm, cardRefs }) {
  const handleKeyDown = (e, planId) => {
    const idx = plans.findIndex((p) => p.id === planId);

    if (e.key === 'Enter') {
      e.preventDefault();
      onSelect(planId);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = plans[(idx + 1) % plans.length];
      cardRefs.current[next.id]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = plans[(idx - 1 + plans.length) % plans.length];
      cardRefs.current[prev.id]?.focus();
    }
  };

  if (plans.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      role="listbox"
      aria-label="Production plan types"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2"
    >
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isSelected={selectedPlan === plan.id}
          onSelect={onSelect}
          onConfirm={onConfirm}
          cardRef={(el) => (cardRefs.current[plan.id] = el)}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
}