import React from "react";
import { motion } from "framer-motion";
import { FaIndustry, FaUsers, FaBoxes, FaCogs } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const statistics = [
    {
      id: 1,
      title: "Production Halls",
      value: "05",
      icon: <FaIndustry />,
    },
    {
      id: 2,
      title: "Production Lines",
      value: "85",
      icon: <FaCogs />,
    },
    {
      id: 3,
      title: "Daily Production",
      value: "25K+",
      icon: <FaBoxes />,
    },
    {
      id: 4,
      title: "Operators",
      value: "100+",
      icon: <FaUsers />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-3 py-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-sm border border-[#E2E4E9] bg-white p-4 sm:p-5"
        >
          {/* Header */}

          <div className="text-center">
            <img
              src="/Dixon_Technologies_Logo.png"
              alt="Dixon Technologies"
              className="mx-auto h-9 object-contain sm:h-10"
            />

            <h2 className="mt-2 text-sm font-bold text-[#2563EB] sm:text-base">
              Production Management System
            </h2>

            <p className="mx-auto mt-1.5 max-w-lg text-[11px] leading-5 text-slate-500 sm:text-xs">
              A centralized platform for monitoring production targets, actual
              production, rejection analysis and manufacturing performance
              across Dixon Technologies.
            </p>
          </div>

          {/* ================= Statistics ================= */}

          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {statistics.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-sm border border-[#E2E4E9] bg-slate-50 p-2.5 transition-colors hover:border-blue-400"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 sm:text-lg font-mono">
                        {item.value}
                      </h3>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {item.title}
                      </p>
                    </div>

                    <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#2563EB] text-xs text-white sm:h-8 sm:w-8">
                      {item.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ================= Quick Information ================= */}

          <div className="mt-3 hidden rounded-sm border border-[#E2E4E9] bg-slate-50 p-3 md:block">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">
                  Production
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Monitor daily targets, actual production and hall-wise
                  performance.
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">
                  Quality
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Track rejections and analyze manufacturing quality in real
                  time.
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">
                  Reports
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Generate daily, weekly and monthly reports for management.
                </p>
              </div>
            </div>
          </div>

          {/* ================= Login Button ================= */}

          <div className="mt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="
                mx-auto
                flex
                h-10
                w-full
                max-w-xs
                items-center
                justify-center
                rounded-sm
                bg-[#2563EB]
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-colors
                hover:bg-blue-700
              "
            >
              Login
            </motion.button>
          </div>

          {/* ================= Footer ================= */}

          <div className="mt-4 border-t border-[#E2E4E9] pt-2.5">
            <div className="flex flex-col items-center justify-between gap-1 text-center text-[10px] text-slate-400 sm:flex-row">
              <p>
                &copy; {new Date().getFullYear()} Dixon Technologies (India)
                Limited
              </p>

              <p className="hidden sm:block">Production Management System</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
