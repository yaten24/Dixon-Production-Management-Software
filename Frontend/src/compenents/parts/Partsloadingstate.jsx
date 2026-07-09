import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBoxOpen } from "react-icons/fa";

const loadingMessages = [
  "Loading Parts Master...",
  "Synchronizing Database...",
  "Fetching Latest Records...",
  "Preparing Dashboard...",
];

const skeletonRows = Array.from({ length: 5 });

const PartsLoadingState = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="border border-[#E2E4E9] bg-white rounded-sm overflow-hidden"
    >
      {/* top accent line */}
      <div className="h-0.5 w-full bg-[#2563EB]" />

      <div className="px-4 py-5 flex flex-col items-center">
        {/* SPINNER */}
        <div className="relative h-12 w-12 flex items-center justify-center mb-3">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2563EB] border-r-[#2563EB]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-blue-300"
            animate={{ rotate: -360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaBoxOpen className="text-[#2563EB] text-sm" />
          </motion.div>
        </div>

        {/* ROTATING MESSAGE */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-xs font-semibold text-slate-700"
          >
            {loadingMessages[messageIndex]}
          </motion.p>
        </AnimatePresence>

        {/* DOTS */}
        <div className="flex items-center gap-1 mt-1.5">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1 w-1 rounded-full bg-[#2563EB]"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: dot * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* SHIMMER PROGRESS BAR */}
        <div className="w-40 h-1 rounded-sm bg-slate-100 overflow-hidden mt-2.5">
          <motion.div
            className="h-full w-1/3 rounded-sm bg-[#2563EB]"
            animate={{ x: ["-100%", "220%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* SKELETON TABLE PREVIEW */}
      <div className="border-t border-[#E2E4E9]">
        {/* header row */}
        <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-slate-50 border-b border-[#E2E4E9]">
          {[0, 1, 2, 3, 4].map((col) => (
            <div key={col} className="h-2 rounded-sm bg-slate-300" />
          ))}
        </div>

        {/* body rows */}
        {skeletonRows.map((_, row) => (
          <motion.div
            key={row}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              delay: row * 0.1,
              ease: "easeInOut",
            }}
            className={`relative overflow-hidden grid grid-cols-5 gap-2 px-3 py-2 ${
              row !== skeletonRows.length - 1 ? "border-b border-[#E2E4E9]" : ""
            }`}
          >
            {/* shimmer sweep */}
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ["-120%", "150%"] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: row * 0.12,
                ease: "linear",
              }}
            />

            <div className="h-2 w-3/4 rounded-sm bg-slate-200" />
            <div className="h-2 w-full rounded-sm bg-slate-200" />
            <div className="h-2 w-1/2 rounded-sm bg-slate-200" />
            <div className="h-2 w-2/3 rounded-sm bg-slate-200" />
            <div className="h-2 w-1/2 rounded-sm bg-slate-200 justify-self-end" />
          </motion.div>
        ))}
      </div>

      {/* FOOTER STATUS */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[#E2E4E9] bg-slate-50">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[10px] text-slate-500">
            Connected to Parts Master Database
          </span>
        </div>

        <motion.span
          className="text-[10px] font-semibold text-[#2563EB]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          Please wait...
        </motion.span>
      </div>
    </motion.div>
  );
};

export default PartsLoadingState;
