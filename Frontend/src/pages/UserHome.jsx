import React from "react";


import useClock from "../hooks/useClock";
import HomeHeader from "../compenents/userHome/HomeHeader";
import WelcomeBanner from "../compenents/userHome/WelcomeBanner";
import OverviewSection from "../compenents/userHome/OverviewSection";
import QuickAccess from "../compenents/userHome/QuickAccess";
import Footer from "../compenents/userHome/Footer";
import Header from "../compenents/dashboard/Header";

const UserHome = () => {
  const currentTime = useClock();

  const handleLogout = () => {
    console.log("Logout");

    // Example:
    // localStorage.removeItem("token");
    // navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}

      <Header />

      {/* Main */}

      <main className="w-full px-2 mt-13">

        {/* Overview */}

        <OverviewSection />

        {/* Modules */}

        <QuickAccess />

        {/* Footer */}

        {/* <Footer /> */}
      </main>
    </div>
  );
};

export default UserHome;
