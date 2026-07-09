import React from "react";
import HallCards from "../compenents/userDashboard/HallCards";
import Header from "../compenents/dashboard/Header";

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}

      <Header />

      {/* Main */}

      <main className="mx-auto w-full p-2 lg:px-2 mt-11">
        {/* KPI */}

        <HallCards />

        {/* Footer */}
      </main>
    </div>
  );
};

export default UserDashboard;
