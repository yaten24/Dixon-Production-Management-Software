// UserHome.jsx
import React from "react";
import OverviewSection from "../compenents/userHome/OverviewSection";
import QuickAccess from "../compenents/userHome/QuickAccess";
import Header, { HEADER_HEIGHT } from "../compenents/dashboard/Header";

// Plain desktop-app canvas — flat neutral background, no floating
// star/particle effects. Content sits in a fixed-width panel column.
const UserHome = () => {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <Header />

      <main
        className="w-full px-2 pb-2"
        style={{ paddingTop: HEADER_HEIGHT + 10 }}
      >
        <OverviewSection />
        <QuickAccess />
      </main>
    </div>
  );
};

export default UserHome;