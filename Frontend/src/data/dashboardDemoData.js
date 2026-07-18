/* =========================================================================
   DEMO DATA — wire these up to real hooks/APIs later. Shapes are kept flat
   and simple on purpose so swapping in live data is a straight drop-in.
   ========================================================================= */

export const dayTarget = {
  target: 12000,
  actual: 9840,
  good: 9350,
  reject: 490,
};

export const shiftData = [
  { label: "Shift A", target: 6000, actual: 5120 },
  { label: "Shift B", target: 6000, actual: 4720 },
];

export const lossTimeReasons = [
  { label: "Mould Change", minutes: 62 },
  { label: "Material Shortage", minutes: 45 },
  { label: "Machine Breakdown", minutes: 38 },
  { label: "Power Cut", minutes: 25 },
  { label: "Other", minutes: 16 },
];

export const machineStatus = { active: 42, total: 50 };
export const userStatus = { active: 128, label: "Operators logged in" };

export const lastDay = {
  dateLabel: "Yesterday · Jul 17",
  target: 11800,
  actual: 10120,
  oee: 76,
};

export const currentMonth = {
  label: "July 2026",
  target: 350000,
  actual: 245600,
  bestDay: "Jul 09 · 96% OEE",
};

export const weeklyOee = [
  { day: "Sat", oee: 74, availability: 88, performance: 85, quality: 98 },
  { day: "Sun", oee: 71, availability: 85, performance: 84, quality: 97 },
  { day: "Mon", oee: 79, availability: 90, performance: 88, quality: 99 },
  { day: "Tue", oee: 82, availability: 92, performance: 89, quality: 99 },
  { day: "Wed", oee: 77, availability: 89, performance: 86, quality: 98 },
  { day: "Thu", oee: 80, availability: 91, performance: 87, quality: 99 },
  { day: "Fri", oee: 76, availability: 87, performance: 86, quality: 98 },
];