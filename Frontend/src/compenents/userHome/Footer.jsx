import React from "react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

const Footer = () => {
  return (
    <footer className="mt-2 rounded border border-slate-200 bg-white shadow-sm">
      {/* Top */}

      <div className="grid gap-6 p-2 md:grid-cols-2 xl:grid-cols-3">
        {/* Company */}

        <div>
          <div className="flex items-center gap-3">
            <img src="/Dixon_Technologies_Logo.png" alt="Dixon Technologies" className="h-10 object-contain" />
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">Production Management System helps monitor daily production, rejection, loss time and manufacturing performance for efficient factory operations.</p>
        </div>

        {/* Modules */}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <HiOutlineBuildingOffice2 size={18} className="text-blue-600" />

            <h3 className="font-semibold text-slate-800">Production Modules</h3>
          </div>

          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Production Entry</li>

            <li>• Production Dashboard</li>

            <li>• Rejection Analysis</li>

            <li>• Loss Time Analysis</li>

            <li>• Shift Production Summary</li>

            <li>• Production Reports</li>
          </ul>
        </div>

        {/* System */}

        <div>
          <h3 className="mb-3 font-semibold text-slate-800">System Status</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Version</span>

              <span className="font-semibold text-slate-700">v1.0.0</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Production Server</span>

              <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Online</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Database</span>

              <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Connected</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Last Sync</span>

              <span className="font-medium text-slate-700">Just Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}

      <div className="border-t border-slate-200 px-5 py-4">
        <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Dixon Technologies (India) Limited.</p>

          <p>Production Management System • Internal Factory Portal</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
