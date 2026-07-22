// OverviewCard.jsx
import React, { useEffect, useRef, useState } from "react";

const TONE_STYLES = {
  blue: { value: "text-[#0F1D24]", accent: "bg-[#0F1D24]", iconText: "text-[#0F1D24]" },
  green: { value: "text-emerald-700", accent: "bg-emerald-600", iconText: "text-emerald-700" },
  red: { value: "text-red-700", accent: "bg-red-600", iconText: "text-red-700" },
  amber: { value: "text-[#0F1D24]", accent: "bg-[#FDC94D]", iconText: "text-[#0F1D24]" },
};

const SIZE_STYLES = {
  lg: {
    pad: "p-3",
    title: "text-[10.5px]",
    value: "text-[38px]",
    subtitle: "text-[11px]",
  },
  md: {
    pad: "p-2",
    title: "text-[9px]",
    value: "text-[19px]",
    subtitle: "text-[9.5px]",
  },
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useCountUp = (value, duration = 500) => {
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
      setDisplay(
        `${isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString()}${suffix}`
      );
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

// Desktop-app widget: flat panel, left accent rail (like a Windows
// "KPI tile"), grid-line borders instead of floating shadow cards.
const OverviewCard = ({ item }) => {
  const Icon = item.icon;
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.blue;
  const s = SIZE_STYLES[item.size] || SIZE_STYLES.md;
  const displayValue = useCountUp(item.value);

  return (
    <div className="relative flex h-full border border-[#C6C6C6] bg-white hover:bg-[#FAFAFA] transition-colors duration-100">
      {/* Left accent rail */}
      <div className={`w-[3px] flex-shrink-0 ${tone.accent}`} />

      <div className={`relative flex flex-1 items-start justify-between ${s.pad} gap-2`}>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className={`truncate font-bold uppercase tracking-wide leading-none text-[#9B9B9B] ${s.title}`}>
            {item.title}
          </p>
          <h2 className={`mt-1 font-mono font-extrabold leading-none tracking-tight ${s.value} ${tone.value}`}>
            {displayValue}
          </h2>
          <p className={`mt-1 truncate font-semibold leading-tight text-[#9B9B9B] ${s.subtitle}`}>
            {item.subtitle}
          </p>
        </div>

        <div className={`flex flex-shrink-0 items-center justify-center h-6 w-6 border border-[#C6C6C6] ${tone.iconText}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;