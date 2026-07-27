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

import PlanSelectionPage from "../pages/PlanningPage/PlanSelectionPage";
import MonthlyPlanPage from "../pages/PlanningPage/MonthlyPlanPage";
import CreateMonthlyPlan from "../pages/PlanningPage/CreateMonthlyPlan";
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
import ManagerReportsPage from "../pages/ManagerPages/ReportsPage";
import ReportsPage from "../pages/TeamMemberPages/ReportsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ---------------- PUBLIC ---------------- */}
      <Route path="/" element={<Login />} />
      {/* <Route path="/login" element={<Login />} /> */}
      {/* ---------------- Manager ---------------- */}
      <Route path="/management/overall/dashboard" element={<Dashboard />} />
      <Route path="/management/reports" element={<ManagerReportsPage />} />
      <Route path="/management/activity-logs" element={<ActivityLogs />} />
      <Route path="/management/dashboard" element={<ProductionDashboard />} />
      <Route path="/management/hourly" element={<HourlyMachineTracking />} />
      <Route path="/management/halls/:hallId" element={<HallDashboard />} />
      <Route path="/management/halls/:hallId/heatmap" element={<HourlyMachineTracking />} />
      <Route path="/management/rejection" element={<AllRejectionReasons />} />
      <Route path="/management/loss-time" element={<LossAnalysisDashboard />} />
      <Route path="/management/mould-change" element={<MouldChangeDashboard />} />

      {/* ---------- ADMIN PRODUCTION ---------- */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/logs" element={<ActivityLogs />} />
      <Route path="/admin/operators" element={<Employees />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/machines" element={<Machines />} />
      <Route path="/admin/parts" element={<PartsPage />} />
      <Route path="admin/production/halls/:hallId" element={<HallDashboard />} />

      {/* ---------------- Production ---------------- */}
      <Route path="/production/home" element={<UserHome />} />
      <Route path="/production/dashboard" element={<UserDashboarproduction />} />
      <Route path="/production/production/entry" element={<AdvProductionEntry />} />
      <Route path="/production/production/history" element={<ProductionHistoryPage />} />
      <Route path="/production/production/reports" element={<ReportsPage />} />
      <Route path="/production/production/plans" element={<PlanSelectionPage />} />
      <Route
        path="/production/production/plans/daily"
        element={<DailyPlanPage />}
      />
      <Route
        path="/production/production/plans/daily/operator/allocation"
        element={<DailyPlanPageForOperatorAllocation />}
      />
      <Route
        path="/production/production/plans/:id/operator/allocation"
        element={<DailyPlanOperatorAssignment />}
      />
      <Route
        path="/production/production/plans/daily/create"
        element={<DailyProductionPlan />}
      />
      <Route
        path="/production/production/plans/daily/detail/:id"
        element={<ViewDailyPlanPage />}
      />
      <Route
        path="/production/production/plans/monthly"
        element={<MonthlyPlanPage />}
      />
      <Route
        path="/production/production/plans/monthly/create"
        element={<CreateMonthlyPlan />}
      />
      <Route
        path="/production/production/plans/monthly/detail/:id"
        element={<MonthlyPlanView />}
      />
      ` `{/* ---------- MACHINE MANAGEMENT ---------- */}
      {/* <Route
        path="/employee/machines/allocation"
        element={<MachineOperatorManagement />}
      />

      <Route
        path="/employee/machines/allocation/create"
        element={<AllocateMachineOperator />}
      /> */}
      <Route
        path="/production/machines/allocation/update"
        element={<UpdateMachineOperator />}
      />
      {/* ---------------- 404 ---------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
