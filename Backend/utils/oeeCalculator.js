// Simplified OEE calculator for molding hall/machine.
// Availability = (Planned Minutes - Loss Minutes) / Planned Minutes
// Performance  = Actual Qty / Target Qty        (capped 0-100%)
// Quality      = (Actual Qty - Reject Qty) / Actual Qty
// Planned Minutes = machineCount * daysInRange * 1440 (Shift A + Shift B = full day)
const daysBetween = (from, to) => {
  if (!from || !to) return 1;
  const start = new Date(from);
  const end = new Date(to);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
};

exports.calculateOEE = ({ target, actual, reject, lossMinutes, machineCount, from, to }) => {
  const days = daysBetween(from, to);
  const plannedMinutes = Math.max(machineCount, 1) * days * 1440;

  const availability = plannedMinutes > 0
    ? Math.max(0, Math.min(1, (plannedMinutes - lossMinutes) / plannedMinutes))
    : 0;
  const performance = target > 0 ? Math.max(0, Math.min(1, actual / target)) : 0;
  const quality = actual > 0 ? Math.max(0, Math.min(1, (actual - reject) / actual)) : 0;

  const oee = availability * performance * quality * 100;

  return {
    availability: Number((availability * 100).toFixed(1)),
    performance: Number((performance * 100).toFixed(1)),
    quality: Number((quality * 100).toFixed(1)),
    oee: Number(oee.toFixed(1)),
  };
};