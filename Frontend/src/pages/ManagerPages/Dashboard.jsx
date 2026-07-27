import React from "react";
import Sidebar from "../../compenents/dashboard/Sidebar";
import HeroTargetCard from "../../compenents/dashboard/HeroTargetCard";
import ShiftWiseCard from "../../compenents/dashboard/ShiftWiseCard";
import QuantityCard from "../../compenents/dashboard/QuantityCard";
import StatTile from "../../compenents/dashboard/StatTile";
import LossTimeCard from "../../compenents/dashboard/LossTimeCard";
import SummaryCard from "../../compenents/dashboard/SummaryCard";
import MouldChangeSummaryCard from "../../compenents/dashboard/MouldChangeSummaryCard";
import WeeklyOeeChart from "../../compenents/dashboard/WeeklyOeeChart";
import {
  dayTarget,
  shiftData,
  lossTimeReasons,
  machineStatus,
  userStatus,
  lastDay,
  currentMonth,
  weeklyOee,
  mouldChangeSummary,
} from "../../data/dashboardDemoData";
import { pct } from "../../utils/dashboardMath";
import {
  Users,
  Cog,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Wrench,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F5F5F5]">
      <Sidebar />

      <style>{`
        @media (min-width: 1024px) {
          .mc-kpi-grid {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            grid-template-rows: repeat(2, minmax(0, 1fr));
            grid-template-areas:
              "hero hero hero shift shift shift good good reject reject machines users"
              "hero hero hero loss loss loss lastday lastday lastday month month month";
          }
          .mc-hero { grid-area: hero; }
          .mc-shift { grid-area: shift; }
          .mc-good { grid-area: good; }
          .mc-reject { grid-area: reject; }
          .mc-machines { grid-area: machines; }
          .mc-users { grid-area: users; }
          .mc-loss { grid-area: loss; }
          .mc-lastday { grid-area: lastday; }
          .mc-month { grid-area: month; }
        }
      `}</style>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5">
          <div className="mc-kpi-grid grid min-h-0 flex-[1.35] grid-cols-2 auto-rows-fr gap-1.5 sm:grid-cols-4">
            <HeroTargetCard
              className="mc-hero col-span-2 sm:col-span-4"
              target={dayTarget.target}
              actual={dayTarget.actual}
              good={dayTarget.good}
              reject={dayTarget.reject}
            />

            <ShiftWiseCard
              className="mc-shift col-span-2 sm:col-span-2"
              shifts={shiftData}
            />

            <QuantityCard
              className="mc-good col-span-1"
              tone="good"
              label="Good Quantity"
              value={dayTarget.good}
              sub={`${pct(dayTarget.good, dayTarget.actual)}% of actual output`}
              TrendIcon={TrendingUp}
              trendLabel="0% vs yday"
            />

            <QuantityCard
              className="mc-reject col-span-1"
              tone="reject"
              label="Reject Quantity"
              value={dayTarget.reject}
              sub={`${pct(dayTarget.reject, dayTarget.actual)}% of actual output`}
              TrendIcon={TrendingDown}
              trendLabel="0% vs yday"
            />

            <StatTile
              className="mc-machines col-span-1"
              icon={Cog}
              value={`${machineStatus.active}/${machineStatus.total}`}
              label="Active Machines"
            />

            <StatTile
              className="mc-users col-span-1"
              icon={Users}
              value={userStatus.active}
              label={userStatus.label}
            />

            <LossTimeCard
              className="mc-loss col-span-2 sm:col-span-2"
              reasons={lossTimeReasons}
            />

            <SummaryCard
              className="mc-lastday col-span-2 sm:col-span-2"
              icon={CalendarDays}
              title={lastDay.dateLabel}
              rows={[
                {
                  label: "Target",
                  value: lastDay.target.toLocaleString("en-IN"),
                },
                {
                  label: "Actual",
                  value: lastDay.actual.toLocaleString("en-IN"),
                },
                { label: "OEE", value: `${lastDay.oee}%` },
              ]}
            />

            <MouldChangeSummaryCard
              className="mc-month col-span-2 sm:col-span-2"
              icon={Wrench}
              title="Mould Change Summary"
              planned={mouldChangeSummary.planned}
              unplanned={mouldChangeSummary.unplanned}
              completed={mouldChangeSummary.completed}
              pending={mouldChangeSummary.pending}
              avgChangeTime={mouldChangeSummary.avgChangeTime}
            />
          </div>

          <WeeklyOeeChart className="min-h-0 flex-1" data={weeklyOee} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
