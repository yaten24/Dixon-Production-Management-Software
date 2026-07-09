import React from "react";
import { motion } from "framer-motion";
import {
  FaUserCheck,
  FaUserTimes,
  FaUsers,
  FaCalendarCheck,
  FaSearch,
  FaDownload,
} from "react-icons/fa";
import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

const Attendance = () => {
  const attendanceData = [
    {
      empId: "EMP001",
      name: "Rajesh Kumar",
      department: "Production",
      shift: "Morning",
      status: "Present",
    },
    {
      empId: "EMP002",
      name: "Amit Singh",
      department: "Assembly",
      shift: "Evening",
      status: "Present",
    },
    {
      empId: "EMP003",
      name: "Rohit Sharma",
      department: "Quality",
      shift: "Night",
      status: "Absent",
    },
    {
      empId: "EMP004",
      name: "Vikas Verma",
      department: "Packing",
      shift: "Morning",
      status: "Present",
    },
    {
      empId: "EMP005",
      name: "Sandeep Kumar",
      department: "Testing",
      shift: "Evening",
      status: "Present",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="p-6 space-y-6">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Attendance Management
              </h1>

              <p className="text-gray-500 mt-1">
                Monitor daily workforce attendance
              </p>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 flex items-center gap-3 transition">
              <FaDownload />
              Export Attendance
            </button>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Total Employees</p>
                  <h2 className="text-4xl font-bold mt-2">350</h2>
                </div>

                <FaUsers className="text-4xl text-blue-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Present</p>
                  <h2 className="text-4xl font-bold mt-2 text-green-600">
                    320
                  </h2>
                </div>

                <FaUserCheck className="text-4xl text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Absent</p>
                  <h2 className="text-4xl font-bold mt-2 text-red-600">
                    30
                  </h2>
                </div>

                <FaUserTimes className="text-4xl text-red-600" />
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

                <FaCalendarCheck className="text-4xl text-purple-600" />
              </div>
            </div>

          </div>

          {/* Attendance Progress */}
          <div className="bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Today's Attendance Rate
              </h2>

              <span className="font-bold text-green-600">
                91%
              </span>
            </div>

            <div className="h-4 bg-gray-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "91%" }}
                transition={{ duration: 1.5 }}
                className="h-full bg-green-500"
              />
            </div>
          </div>

          {/* Shift Attendance */}
          <div className="grid md:grid-cols-3 gap-5">

            <div className="bg-blue-50 border border-blue-100 p-5">
              <h3 className="font-semibold text-blue-700">
                Morning Shift
              </h3>

              <p className="text-4xl font-bold mt-3">
                120
              </p>

              <p className="text-gray-500 mt-1">
                Employees Present
              </p>
            </div>

            <div className="bg-green-50 border border-green-100 p-5">
              <h3 className="font-semibold text-green-700">
                Evening Shift
              </h3>

              <p className="text-4xl font-bold mt-3">
                110
              </p>

              <p className="text-gray-500 mt-1">
                Employees Present
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-100 p-5">
              <h3 className="font-semibold text-purple-700">
                Night Shift
              </h3>

              <p className="text-4xl font-bold mt-3">
                90
              </p>

              <p className="text-gray-500 mt-1">
                Employees Present
              </p>
            </div>

          </div>

          {/* Search */}
          <div className="bg-white border border-gray-200 p-4 shadow-sm">
            <div className="relative">
              <FaSearch className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                placeholder="Search employee attendance..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Attendance Records
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Employee ID</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Shift</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceData.map((employee, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {employee.empId}
                      </td>

                      <td className="p-4">
                        {employee.name}
                      </td>

                      <td className="p-4">
                        {employee.department}
                      </td>

                      <td className="p-4">
                        {employee.shift}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-sm font-medium ${
                            employee.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Attendance;