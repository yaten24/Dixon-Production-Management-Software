// OverviewCard.jsx
import React, { useEffect, useRef, useState } from "react";

const TONE_STYLES = {
  blue: {
    value: "text-[#0F1D24]",
    iconBg: "bg-[#0F1D24]",
    iconText: "text-[#FDC94D]",
    bar: "bg-[#0F1D24]",
  },
  green: {
    value: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    bar: "bg-emerald-600",
  },
  red: {
    value: "text-red-600",
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    bar: "bg-red-600",
  },
  amber: {
    value: "text-[#0F1D24]",
    iconBg: "bg-[#FDC94D]/20",
    iconText: "text-[#0F1D24]",
    bar: "bg-[#FDC94D]",
  },
};

// Value scales hard with card size — lg is the hero number.
const SIZE_STYLES = {
  lg: {
    pad: "p-3",
    icon: "h-10 w-10",
    iconInner: "h-5 w-5",
    title: "text-[10.5px]",
    value: "text-[42px]",
    subtitle: "text-[11.5px]",
    gap: "gap-2",
    bar: "mt-2 h-1.5",
  },
  md: {
    pad: "p-1.5",
    icon: "h-7 w-7",
    iconInner: "h-3.5 w-3.5",
    title: "text-[9px]",
    value: "text-[20px]",
    subtitle: "text-[9.5px]",
    gap: "gap-1.5",
    bar: "mt-1 h-1",
  },
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// ==========================================================
// useCountUp — pure requestAnimationFrame count-up, no library.
// Parses a leading numeric part from the value ("1,240", "45 min",
// "120/150", "3.2%") and animates only that part; the rest of the
// string is kept static as a suffix.
// ==========================================================
const useCountUp = (value, duration = 700) => {
  const [display, setDisplay] = useState(String(value));
  const prevNumRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const str = String(value);
    const match = str.match(/^([\d,]+(?:\.\d+)?)(.*)$/);

    if (!match) {
      setDisplay(str);
      return;
    }

    const targetNum = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2] || "";
    const isDecimal = match[1].includes(".");
    const startNum = prevNumRef.current;
    const startTime = performance.now();

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = startNum + (targetNum - startNum) * eased;

      setDisplay(`${isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString()}${suffix}`);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevNumRef.current = targetNum;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => frameRef.current && cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return display;
};

const OverviewCard = ({ item, index = 0 }) => {
  const Icon = item.icon;
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.blue;
  const s = SIZE_STYLES[item.size] || SIZE_STYLES.md;
  const isAlert = item.tone === "red";
  const displayValue = useCountUp(item.value);

  return (
    <>
      <style>{`
        @keyframes ovCardIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ovBarFill {
          from { width: 0%; }
          to { width: 80%; }
        }
        @keyframes ovAlertPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes ovValuePop {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        style={{ animation: `ovCardIn 0.3s ease-out ${index * 0.04}s both` }}
        className="group relative flex h-full flex-col overflow-hidden rounded border border-[#C6C6C6]/50 bg-white shadow-[0_1px_2px_rgba(15,29,36,0.05)] transition-all duration-300 hover:-translate-y-[3px] hover:border-transparent hover:shadow-[0_12px_28px_-8px_rgba(15,29,36,0.18)]"
      >
        <div className={`relative flex flex-1 items-start justify-between ${s.pad} ${s.gap}`}>
          {/* Left */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className={`truncate font-bold uppercase tracking-wide leading-none text-[#9B9B9B] ${s.title}`}>
              {item.title}
            </p>

            <h2
              style={{ animation: `ovValuePop 0.2s ease-out ${index * 0.04 + 0.05}s both` }}
              className={`mt-1 font-mono font-extrabold leading-none tracking-tight ${s.value} ${tone.value}`}
            >
              {displayValue}
            </h2>

            <p className={`mt-1 truncate font-semibold leading-tight text-[#9B9B9B] ${s.subtitle}`}>
              {item.subtitle}
            </p>
          </div>

          {/* Right — icon tinted to match this card's semantic color; alerts pulse */}
          <div
            style={isAlert ? { animation: "ovAlertPulse 1.8s ease-in-out infinite" } : undefined}
            className={`flex flex-shrink-0 items-center justify-center rounded ${s.icon} ${tone.iconBg} ${tone.iconText} shadow-sm`}
          >
            <Icon className={s.iconInner} />
          </div>
        </div>

        {/* Progress accent */}
        <div className={`relative mx-3 mb-3 overflow-hidden rounded bg-[#C6C6C6]/40 ${s.bar}`}>
          <div
            style={{ animation: `ovBarFill 0.6s ease-out ${index * 0.04 + 0.1}s both` }}
            className={`h-full rounded ${tone.bar}`}
          />
        </div>
      </div>
    </>
  );
};

export default OverviewCard;