import { Routes, Route } from "react-router-dom";

// Public
import Home from "../pages/Home";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

// Admin
import Dashboard from "../pages/AdminPages/Dashboard";
import Employees from "../pages/admin/Employees";
import Users from "../pages/admin/Users";
import Machines from "../pages/admin/Machines";
import PartsPage from "../pages/admin/PartsPage";
import Reports from "../pages/AdminPages/Reports";
import ActivityLogs from "../pages/admin/Activitylogs";

import ProductionDashboard from "../pages/AdminPages/ProductionDashboard";
import HallDashboard from "../pages/HallDashboard";
import MouldChangeDashboard from "../pages/AdminPages/MouldChangeDashboard";
import AllRejectionReasons from "../pages/AdminPages/RejectionReasons";
import LossAnalysisDashboard from "../pages/AdminPages/LossTimeDashboard";

// Employee
import UserHome from "../pages/UserHome";
import UserDashboard from "../pages/UserDashboard";
import UserProfile from "../pages/UserProfile";

import AdvProductionEntry from "../pages/advProductionEnrty";
import ProductionHistoryPage from "../pages/ProductionHistoryPage";
import ReportsPage from "../pages/AdminPages/ReportsPage";

import PlanSelectionPage from "../pages/PlanningPage/PlanSelectionPage";
import MonthlyPlanPage from "../pages/PlanningPage/MonthlyPlanPage";
import CreateMonthlyPlan from "../pages/PlanningPage/CreateMonthlyPlan";

import MachineOverviewDashboard from "../pages/MachineOverview";
// import MachineOperatorManagement from "../pages/MachineOperatorManagement";
// import AllocateMachineOperator from "../pages/AllocateMachineOperator";
import UpdateMachineOperator from "../pages/UpdateMachineOperator";
import MonthlyProductionPlans from "../pages/PlanningPage/MonthlyPlanPage";
import DailyPlanPage from "../pages/PlanningPage/DailyPlanPage";
import DailyProductionPlan from "../pages/PlanningPage/CreateDailyPlan";
import MonthlyPlanView from "../pages/PlanningPage/MonthlyPlanView";
import ViewDailyPlanPage from "../pages/PlanningPage/DailyPlanView";
import DailyPlanOperatorAssignment from "../pages/PlanningPage/DailyPlanOperatorAssignment";
import DailyPlanPageForOperatorAllocation from "../pages/PlanningPage/DailyPlanPageForOperatorAllocation";
import HourlyMachineTracking from "../pages/HourlyMachineTracking";
import AdminDashboard from "../pages/admin/AdminDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ---------------- PUBLIC ---------------- */}
      <Route path="/" element={<Login />} />
      {/* <Route path="/login" element={<Login />} /> */}
      {/* ---------------- Manager ---------------- */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/activity-logs" element={<ActivityLogs />} />
      <Route path="/production/dashboard" element={<ProductionDashboard />} />
      <Route path="/production/hourly" element={<HourlyMachineTracking />} />
      <Route path="/production/halls/:hallId" element={<HallDashboard />} />
      <Route path="/production/halls/:hallId/heatmap" element={<HourlyMachineTracking />} />


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
      <Route path="/employee/profile" element={<UserProfile />} />
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
