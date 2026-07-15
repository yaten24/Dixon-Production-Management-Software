// Shift A: 8 AM - 8 PM, Shift B: 8 PM - 8 AM. Dono 12hr, 1hr ke intervals.
export const SHIFT_HOURS = 12;
export const SHIFT_SECONDS = SHIFT_HOURS * 3600; // 43200

const fmt = (h) => {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${period}`;
};

export const getTimeSlots = (shift) => {
  const startHour = shift === "A" ? 8 : 20;
  const slots = [];
  for (let i = 0; i < SHIFT_HOURS; i++) {
    const s = (startHour + i) % 24;
    const e = (startHour + i + 1) % 24;
    slots.push({
      value: `${String(s).padStart(2, "0")}:00-${String(e).padStart(2, "0")}:00`,
      label: `${fmt(s)} - ${fmt(e)}`,
      startHour: s,
    });
  }
  return slots;
};

// Standard cycle time se target qty (poori shift ke liye)
export const calcTargetQty = (cycleTimeSeconds, availableSeconds = SHIFT_SECONDS) => {
  const ct = Number(cycleTimeSeconds);
  if (!ct || ct <= 0) return 0;
  return Math.floor(availableSeconds / ct);
};

// Mould change ek slot pe hoti hai to shift khatam hone tak jitna time bacha hai
// wahi target calculate karne ke kaam aayega.
export const remainingSecondsFromSlot = (shift, slotStartHour) => {
  if (slotStartHour === null || slotStartHour === undefined) return SHIFT_SECONDS;
  const shiftStart = shift === "A" ? 8 : 20;
  let elapsedHours = slotStartHour - shiftStart;
  if (elapsedHours < 0) elapsedHours += 24;
  const remainingHours = SHIFT_HOURS - elapsedHours;
  return Math.max(remainingHours, 0) * 3600;
};