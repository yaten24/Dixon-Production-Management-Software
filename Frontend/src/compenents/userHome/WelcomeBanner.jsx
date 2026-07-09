import React from "react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

const WelcomeBanner = ({ userName = "Aman Kumar", designation = "Production Engineer" }) => {
  return (
    <section className="mb-8">
      <div className="overflow-hidden rounded border border-blue-100 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 shadow-lg">
        <div className="flex flex-col justify-between gap-8 p-8 lg:flex-row lg:items-center">
          {/* Left */}

          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded bg-white/10 px-4 py-2 backdrop-blur">
              <HiOutlineBuildingOffice2 size={18} />

              <span className="text-sm font-medium">Dixon Technologies (India) Limited</span>
            </div>

            <h1 className="text-4xl font-bold text-white">Welcome Back, {userName} 👋</h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">Welcome to the Smart Factory Management System. Monitor production, quality, OEE, attendance, machine performance and reports from one centralized dashboard.</p>
          </div>

          {/* Right */}

          <div className="min-w-[280px] rounded border border-white/20 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-widest text-blue-100">Logged In User</p>

            <h3 className="mt-3 text-2xl font-bold text-white">{userName}</h3>

            <p className="mt-1 text-blue-100">{designation}</p>

            <div className="mt-6 border-t border-white/20 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100">Shift</span>

                <span className="rounded bg-green-500 px-3 py-1 text-xs font-semibold text-white">Morning</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-blue-100">Status</span>

                <span className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeBanner;
