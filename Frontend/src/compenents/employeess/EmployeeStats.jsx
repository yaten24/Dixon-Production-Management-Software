// EmployeeStats.jsx
import React from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaChartLine,
} from "react-icons/fa";

import StatCard from "./StatCard";

const EmployeeStats = ({ total, present, absent, attendance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1.5">
      <StatCard
        title="Total Employees"
        value={total}
        subtitle="+8 this month"
        icon={<FaUsers />}
        color="blue"
      />

      <StatCard
        title="Present"
        value={present}
        subtitle="On Duty"
        icon={<FaUserCheck />}
        color="green"
      />

      <StatCard
        title="Absent"
        value={absent}
        subtitle="Leave / Absent"
        icon={<FaUserTimes />}
        color="red"
      />

      <StatCard
        title="Attendance"
        value={`${attendance}%`}
        icon={<FaChartLine />}
        color="indigo"
        progress
      />
    </div>
  );
};

export default EmployeeStats;