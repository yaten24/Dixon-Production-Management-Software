import React from "react";
import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaFileExcel,
  FaFilePdf,
  FaUsers,
  FaIndustry,
  FaClipboardCheck,
  FaChartLine,
  FaDownload,
  FaCalendarAlt,
} from "react-icons/fa";
import Sidebar from "../../compenents/dashboard/Sidebar";
import Header from "../../compenents/dashboard/Header";


const Reports = () => {
  const reports = [
    {
      reportName: "Daily Attendance Report",
      date: "18-06-2026",
      type: "Excel",
      status: "Generated",
    },
    {
      reportName: "Machine Utilization Report",
      date: "18-06-2026",
      type: "PDF",
      status: "Generated",
    },
    {
      reportName: "Production Efficiency Report",
      date: "17-06-2026",
      type: "Excel",
      status: "Generated",
    },
    {
      reportName: "Shift Allocation Report",
      date: "17-06-2026",
      type: "PDF",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <div className="p-1 space-y-2">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Reports & Analytics
              </h1>

              <p className="text-gray-500 mt-1">
                Generate and manage manpower reports
              </p>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 flex items-center gap-3 transition">
              <FaDownload />
              Export All Reports
            </button>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Employees</p>
                  <h2 className="text-4xl font-bold mt-2">350</h2>
                </div>

                <FaUsers className="text-4xl text-blue-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Machines</p>
                  <h2 className="text-4xl font-bold mt-2">72</h2>
                </div>

                <FaIndustry className="text-4xl text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Attendance</p>
                  <h2 className="text-4xl font-bold mt-2 text-purple-600">
                    91%
                  </h2>
                </div>

                <FaClipboardCheck className="text-4xl text-purple-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Efficiency</p>
                  <h2 className="text-4xl font-bold mt-2 text-orange-600">
                    92%
                  </h2>
                </div>

                <FaChartLine className="text-4xl text-orange-600" />
              </div>
            </div>

          </div>

          {/* Report Categories */}
          <div className="grid md:grid-cols-3 gap-5">

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-200 p-6 shadow-sm cursor-pointer"
            >
              <FaFileExcel className="text-5xl text-green-600 mb-4" />

              <h3 className="text-xl font-semibold">
                Excel Reports
              </h3>

              <p className="text-gray-500 mt-2">
                Export attendance and manpower data.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-200 p-6 shadow-sm cursor-pointer"
            >
              <FaFilePdf className="text-5xl text-red-600 mb-4" />

              <h3 className="text-xl font-semibold">
                PDF Reports
              </h3>

              <p className="text-gray-500 mt-2">
                Generate printable management reports.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-200 p-6 shadow-sm cursor-pointer"
            >
              <FaCalendarAlt className="text-5xl text-blue-600 mb-4" />

              <h3 className="text-xl font-semibold">
                Monthly Reports
              </h3>

              <p className="text-gray-500 mt-2">
                View monthly manpower trends.
              </p>
            </motion.div>

          </div>

          {/* Reports Table */}
          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Generated Reports
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Report Name</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Format</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {report.reportName}
                      </td>

                      <td className="p-4">
                        {report.date}
                      </td>

                      <td className="p-4">
                        {report.type}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-sm font-medium ${
                            report.status === "Generated"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

          {/* Report Summary */}
          <div className="bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <FaFileAlt className="text-4xl text-blue-600" />

              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Report Center
                </h3>

                <p className="text-gray-500">
                  Generate attendance, machine utilization,
                  production efficiency and manpower reports.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;