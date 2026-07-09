import React from "react";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineBell,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

import { motion, AnimatePresence } from "framer-motion";

const HomeHeader = ({
  currentTime,
  userName = "Aman Kumar",
  notificationCount = 0,
  onLogout,
  onNotifications,
  onSettings,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-1.5 px-2 py-1.5 sm:px-3 lg:px-4">
        {/* Left */}
        <div className="flex items-center">
          <img
            src="/Dixon_Technologies_Logo.png"
            alt="Dixon Technologies"
            className="h-6 sm:h-7 lg:h-8 w-auto object-contain"
          />
        </div>

        {/* Right */}
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {/* Date & Time */}

          <div className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-1">
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-slate-600">
              <HiOutlineCalendarDays
                size={12}
                className="text-blue-600 flex-shrink-0"
              />
              <span>{currentTime.toLocaleDateString()}</span>
            </div>

            <div className="h-3 w-px bg-slate-300" />

            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-slate-600">
              <HiOutlineClock
                size={12}
                className="text-green-600 flex-shrink-0"
              />

              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTime.toLocaleTimeString()}
                  initial={{
                    opacity: 0,
                    y: -8,
                    scale: 1,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  {currentTime.toLocaleTimeString()}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Notifications */}
          {/* <button
            onClick={onNotifications}
            className="relative flex h-7 w-7 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            title="Notifications"
          >
            <HiOutlineBell size={16} />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-bold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button> */}

          {/* Settings */}
          {/* <button
            onClick={onSettings}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            title="Settings"
          >
            <HiOutlineCog6Tooth size={16} />
          </button> */}

          {/* User */}
          <div className="rounded bg-slate-50 px-1.5 py-1 text-right max-w-[120px] sm:max-w-none">
            <h4 className="truncate text-[10px] sm:text-xs font-semibold leading-tight text-slate-800">
              {userName}
            </h4>

            <p className="truncate text-[8px] sm:text-[10px] leading-tight text-slate-500">
              Quality Assistant
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex h-7 w-7 items-center justify-center rounded bg-red-600 text-white transition hover:bg-red-700"
            title="Logout"
          >
            <HiOutlineArrowRightOnRectangle size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
