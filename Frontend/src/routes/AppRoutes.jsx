import { Routes, Route } from "react-router-dom";

// Public
import Home from "../pages/Home";
import Login from "../auth/Login";
import NotFound from "../pages/NotFound";

// Admin
import Dashboard from "../pages/AdminPages/Dashboard";
import Employees from "../pages/AdminPages/Employees";
import Users from "../pages/Users";
import Machines from "../pages/AdminPages/Machines";
import PartsPage from "../pages/AdminPages/PartsPage";
import Reports from "../pages/AdminPages/Reports";
import ActivityLogs from "../pages/AdminPages/Activitylogs";

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

import PlanSelectionPage from "../pages/EmployeePage/PlanSelectionPage";
import MonthlyPlanPage from "../pages/EmployeePage/MonthlyPlanPage";
import CreateMonthlyPlan from "../pages/EmployeePage/CreateMonthlyPlan";

import MachineOverviewDashboard from "../pages/MachineOverview";
import MachineOperatorManagement from "../pages/MachineOperatorManagement";
import AllocateMachineOperator from "../pages/AllocateMachineOperator";
import UpdateMachineOperator from "../pages/UpdateMachineOperator";
import MonthlyProductionPlans from "../pages/EmployeePage/MonthlyPlanPage";
import DailyPlanPage from "../pages/EmployeePage/DailyPlanPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ---------------- PUBLIC ---------------- */}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* ---------------- ADMIN ---------------- */}

      <Route path="/admin/dashboard" element={<Dashboard />} />

      <Route path="/admin/employees" element={<Employees />} />

      <Route path="/admin/users" element={<Users />} />

      <Route path="/admin/machines" element={<Machines />} />

      <Route path="/admin/parts" element={<PartsPage />} />

      <Route path="/admin/reports" element={<Reports />} />

      <Route path="/admin/activity-logs" element={<ActivityLogs />} />

      {/* ---------- ADMIN PRODUCTION ---------- */}

      <Route
        path="/admin/production/dashboard"
        element={<ProductionDashboard />}
      />

      <Route
        path="/admin/production/halls/:hallId"
        element={<HallDashboard />}
      />

      <Route
        path="/admin/production/rejection"
        element={<AllRejectionReasons />}
      />

      <Route
        path="/admin/production/loss-time"
        element={<LossAnalysisDashboard />}
      />

      <Route
        path="/admin/production/mould-change"
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
        element={<CreateMonthlyPlan />}
      />

      <Route
        path="/employee/production/plans/monthly"
        element={<DailyPlanPage />}
      />

      {/* ---------- MACHINE MANAGEMENT ---------- */}

      <Route
        path="/employee/machines/overview"
        element={<MachineOverviewDashboard />}
      />

      <Route
        path="/employee/machines/allocation"
        element={<MachineOperatorManagement />}
      />

      <Route
        path="/employee/machines/allocation/create"
        element={<AllocateMachineOperator />}
      />

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
