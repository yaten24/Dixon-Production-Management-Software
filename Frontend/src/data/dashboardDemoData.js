/* =========================================================================
   DEMO DATA — wire these up to real hooks/APIs later. Shapes are kept flat
   and simple on purpose so swapping in live data is a straight drop-in.
   ========================================================================= */

export const dayTarget = {
  target: 0,
  actual: 0,
  good: 0,
  reject: 0,
};

export const shiftData = [
  { label: "Shift A", target: 0, actual: 0 },
  { label: "Shift B", target: 0, actual: 0 },
];

export const lossTimeReasons = [
  { label: "Mould Change", minutes: 0 },
  { label: "Material Shortage", minutes: 0 },
  { label: "Machine Breakdown", minutes: 0 },
  { label: "Power Cut", minutes: 0 },
  { label: "Other", minutes: 0 },
];

export const machineStatus = { active: 0, total: 0 };
export const userStatus = { active: 0, label: "Operators logged in" };

export const lastDay = {
  dateLabel: "Yesterday · Jul 17",
  target: 0,
  actual: 0,
  oee: 0,
};

export const currentMonth = {
  label: "July 2026",
  target: 0,
  actual: 0,
  bestDay: "-",
};

export const weeklyOee = [
  { day: "Sat", oee: 0, availability: 0, performance: 0, quality: 0 },
  { day: "Sun", oee: 0, availability: 0, performance: 0, quality: 0 },
  { day: "Mon", oee: 0, availability: 0, performance: 0, quality: 0 },
  { day: "Tue", oee: 0, availability: 0, performance: 0, quality: 0 },
  { day: "Wed", oee: 0, availability: 0, performance: 0, quality: 0 },
  { day: "Thu", oee: 0, availability: 0, performance: 0, quality: 0 },
  { day: "Fri", oee: 0, availability: 0, performance: 0, quality: 0 },
];

export const mouldChangeSummary = {
  planned: 0,
  unplanned: 0,
  completed: 0,
  pending: 0,
  avgChangeTime: 0,
};