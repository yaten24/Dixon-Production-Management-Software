import { Routes, Route } from "react-router-dom";

// Public
import Home from "../pages/TeamMemberPages/Home";
import NotFound from "../pages/CommanPages/NotFound";

// Admin
import Dashboard from "../pages/ManagerPages/Dashboard";
import Employees from "../pages/AdminPages/Employees";
import Users from "../pages/AdminPages/Users";
import Machines from "../pages/AdminPages/Machines";
import PartsPage from "../pages/AdminPages/PartsPage";
import ActivityLogs from "../pages/AdminPages/Activitylogs";

import ProductionDashboard from "../pages/ManagerPages/ProductionDashboard";
import MouldChangeDashboard from "../pages/ManagerPages/MouldChangeDashboard";
import AllRejectionReasons from "../pages/ManagerPages/RejectionReasons";
import LossAnalysisDashboard from "../pages/ManagerPages/LossTimeDashboard";

import AdvProductionEntry from "../pages/TeamMemberPages/advProductionEnrty";
import ReportsPage from "../pages/CommanPages/ReportsPage";

import PlanSelectionPage from "../pages/PlanningPage/PlanSelectionPage";
import MonthlyPlanPage from "../pages/PlanningPage/MonthlyPlanPage";
import CreateMonthlyPlan from "../pages/PlanningPage/CreateMonthlyPlan";

import MachineOverviewDashboard from "../pages/MachineOverview";
// import MachineOperatorManagement from "../pages/MachineOperatorManagement";
// import AllocateMachineOperator from "../pages/AllocateMachineOperator";
import UpdateMachineOperator from "../pages/TeamMemberPages/UpdateMachineOperator";
import MonthlyProductionPlans from "../pages/PlanningPage/MonthlyPlanPage";
import DailyPlanPage from "../pages/PlanningPage/DailyPlanPage";
import DailyProductionPlan from "../pages/PlanningPage/CreateDailyPlan";
import MonthlyPlanView from "../pages/PlanningPage/MonthlyPlanView";
import ViewDailyPlanPage from "../pages/PlanningPage/DailyPlanView";
import DailyPlanOperatorAssignment from "../pages/PlanningPage/DailyPlanOperatorAssignment";
import DailyPlanPageForOperatorAllocation from "../pages/PlanningPage/DailyPlanPageForOperatorAllocation";
import HourlyMachineTracking from "../pages/CommanPages/HourlyMachineTracking";
import AdminDashboard from "../pages/AdminPages/AdminDashboard";
import Login from "../pages/CommanPages/Login";
import UserHome from "../pages/TeamMemberPages/UserHome";
import UserDashboard from "../pages/TeamMemberPages/UserDashboard";
import ProductionHistoryPage from "../pages/TeamMemberPages/ProductionHistoryPage";
import HallDashboard from "../pages/TeamMemberPages/HallDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ---------------- PUBLIC ---------------- */}
      <Route path="/" element={<Login />} />
      {/* <Route path="/login" element={<Login />} /> */}
      {/* ---------------- Manager ---------------- */}
      <Route path="/production/overall/dashboard" element={<Dashboard />} />
      <Route path="/production/reports" element={<ReportsPage />} />


      <Route path="/activity-logs" element={<ActivityLogs />} />
      <Route path="/production/dashboard" element={<ProductionDashboard />} />
      <Route path="/production/hourly" element={<HourlyMachineTracking />} />
      <Route path="/production/halls/:hallId" element={<HallDashboard />} />
      <Route
        path="/production/halls/:hallId/heatmap"
        element={<HourlyMachineTracking />}
      />
      {/* ---------- ADMIN PRODUCTION ---------- */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/logs" element={<ActivityLogs />} />
      <Route path="/admin/operators" element={<Employees />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/machines" element={<Machines />} />
      <Route path="/admin/parts" element={<PartsPage />} />
      <Route
        path="admin/production/halls/:hallId"
        element={<HallDashboard />}
      />
      <Route path="/production/rejection" element={<AllRejectionReasons />} />
      <Route path="/production/loss-time" element={<LossAnalysisDashboard />} />
      <Route
        path="/production/mould-change"
        element={<MouldChangeDashboard />}
      />
      {/* ---------------- EMPLOYEE ---------------- */}
      <Route path="/employee/home" element={<UserHome />} />
      <Route path="/employee/dashboard" element={<UserDashboard />} />
      {/* ---------- EMPLOYEE PRODUCTION ---------- */}
      <Route
        path="/employee/production/entry"
        element={<AdvProductionEntry />}
      />
      <Route
        path="/employee/production/history"
        element={<ProductionHistoryPage />}
      />
      <Route path="/employee/production/reports" element={<ReportsPage />} />
      {/* ---------- PRODUCTION PLANNING ---------- */}
      <Route
        path="/employee/production/plans"
        element={<PlanSelectionPage />}
      />
      <Route
        path="/employee/production/plans/daily"
        element={<DailyPlanPage />}
      />
      <Route
        path="/employee/production/plans/daily/operator/allocation"
        element={<DailyPlanPageForOperatorAllocation />}
      />
      <Route
        path="/employee/production/plans/:id/operator/allocation"
        element={<DailyPlanOperatorAssignment />}
      />
      <Route
        path="/employee/production/plans/daily/create"
        element={<DailyProductionPlan />}
      />
      <Route
        path="/employee/production/plans/daily/detail/:id"
        element={<ViewDailyPlanPage />}
      />
      <Route
        path="/employee/production/plans/monthly"
        element={<MonthlyPlanPage />}
      />
      <Route
        path="/employee/production/plans/monthly/create"
        element={<CreateMonthlyPlan />}
      />
      <Route
        path="/employee/production/plans/monthly/detail/:id"
        element={<MonthlyPlanView />}
      />
      ` `{/* ---------- MACHINE MANAGEMENT ---------- */}
      <Route
        path="/employee/machines/overview"
        element={<MachineOverviewDashboard />}
      />
      {/* <Route
        path="/employee/machines/allocation"
        element={<MachineOperatorManagement />}
      />

      <Route
        path="/employee/machines/allocation/create"
        element={<AllocateMachineOperator />}
      /> */}
      <Route
        path="/employee/machines/allocation/update"
        element={<UpdateMachineOperator />}
      />
      {/* ---------------- 404 ---------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
