import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { FaIndustry, FaPlayCircle, FaStopCircle } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

const halls = [
  {
    id: 1,
    name: "Hall-1",
    path: "/hall-1",
    machines: 24,
    running: 22,
    stopped: 2,
  },
  {
    id: 2,
    name: "Hall-2",
    path: "/hall-2",
    machines: 18,
    running: 17,
    stopped: 1,
  },
  {
    id: 3,
    name: "Hall-3",
    path: "/hall-3",
    machines: 20,
    running: 18,
    stopped: 2,
  },
  {
    id: 4,
    name: "Hall-4",
    path: "/hall-4",
    machines: 26,
    running: 23,
    stopped: 3,
  },
  {
    id: 5,
    name: "C-8",
    path: "/c-8",
    machines: 16,
    running: 15,
    stopped: 1,
  },
];

const HallNavigation = () => {
  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        shadow-sm
        px-4
        py-3
      ">
      {/* Header */}

      <div className="flex items-center justify-between mb-3">
        <div>
          <h2
            className="
              text-base
              font-semibold
              text-slate-800
            ">
            Production Halls
          </h2>

          <p
            className="
              text-xs
              text-slate-500
            ">
            Select a hall dashboard
          </p>
        </div>

        <span
          className="
            text-xs
            bg-slate-100
            text-slate-600
            px-3
            py-1
            font-medium
          ">
          5 Halls
        </span>
      </div>

      {/* Hall Grid */}

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-3
          lg:grid-cols-5
          gap-2
        ">
        {halls.map((hall) => (
          <motion.div
            key={hall.id}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
            }}>
            <NavLink to={hall.path} end>
              {({ isActive }) => (
                <div
                  className={`
                    relative
                    border
                    transition-all
                    duration-200
                    overflow-hidden

                    ${isActive ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"}
                  `}>
                  {/* Active Bar */}

                  {isActive && (
                    <div
                      className="
                        absolute
                        left-0
                        top-0
                        w-full
                        h-1
                        bg-blue-600
                      "
                    />
                  )}

                  <div className="p-3">
                    {/* Top */}

                    <div className="flex items-center gap-2">
                      <div
                        className="
                          h-8
                          w-8
                          bg-blue-100
                          flex
                          items-center
                          justify-center
                        ">
                        <FaIndustry
                          className="
                            text-blue-600
                            text-sm
                          "
                        />
                      </div>

                      <div className="min-w-0">
                        <h3
                          className={`
                            text-sm
                            font-semibold
                            truncate

                            ${isActive ? "text-blue-700" : "text-slate-800"}
                          `}>
                          {hall.name}
                        </h3>

                        <p
                          className="
                            text-[11px]
                            text-slate-500
                          ">
                          {hall.machines} Machines
                        </p>
                      </div>
                    </div>
                    {/* ================= STATUS ================= */}

                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        justify-between
                      ">
                      {/* Running */}

                      <div className="flex items-center gap-1">
                        <FaPlayCircle
                          className="
                            text-green-600
                            text-xs
                          "
                        />

                        <span
                          className="
                            text-[11px]
                            text-slate-600
                          ">
                          {hall.running}
                        </span>
                      </div>

                      {/* Stopped */}

                      <div className="flex items-center gap-1">
                        <FaStopCircle
                          className="
                            text-red-600
                            text-xs
                          "
                        />

                        <span
                          className="
                            text-[11px]
                            text-slate-600
                          ">
                          {hall.stopped}
                        </span>
                      </div>

                      {/* Open */}

                      <div
                        className={`
    flex
    items-center
    gap-1
    px-2
    py-1
    rounded-md
    text-[11px]
    font-medium
    transition-all
    duration-200

    ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}
  `}>
                        <span>Open</span>

                        <FaArrowRight className="text-[10px]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </NavLink>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HallNavigation;
