import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import AdminRoute from "./AdminRoute";
import ManagementRoute from "./ManagementRoute";
import ProductionRoute from "./ProductionRoute";

// Public
import NotFound from "../pages/CommanPages/NotFound";
import Login from "../pages/CommanPages/Login";

// Management
import Dashboard from "../pages/ManagementPages/Dashboard";
import ProductionDashboard from "../pages/ManagementPages/ProductionDashboard";
import MouldChangeDashboard from "../pages/ManagementPages/MouldChangeDashboard";
import AllRejectionReasons from "../pages/ManagementPages/RejectionReasons";
import LossAnalysisDashboard from "../pages/ManagementPages/LossTimeDashboard";
import ManagerReportsPage from "../pages/ManagementPages/ReportsPage";

// Admin
import AdminDashboard from "../pages/AdminPages/AdminDashboard";
import Employees from "../pages/AdminPages/Employees";
import Users from "../pages/AdminPages/Users";
import Machines from "../pages/AdminPages/Machines";
import PartsPage from "../pages/AdminPages/PartsPage";
import ActivityLogs from "../pages/AdminPages/Activitylogs";

// Production
import UserHome from "../pages/TeamMemberPages/UserHome";
import UserDashboard from "../pages/TeamMemberPages/UserDashboard";
import AdvProductionEntry from "../pages/TeamMemberPages/advProductionEnrty";
import ProductionHistoryPage from "../pages/TeamMemberPages/ProductionHistoryPage";
import ReportsPage from "../pages/TeamMemberPages/ReportsPage";
import UpdateMachineOperator from "../pages/TeamMemberPages/UpdateMachineOperator";

// Common
import HallDashboard from "../pages/TeamMemberPages/HallDashboard";
import HourlyMachineTracking from "../pages/CommanPages/HourlyMachineTracking";

// Planning
import MonthlyPlanPage from "../pages/PlanningPage/MonthlyPlanPage";
import CreateMonthlyPlan from "../pages/PlanningPage/CreateMonthlyPlan";
import DailyPlanPage from "../pages/PlanningPage/DailyPlanPage";
import DailyProductionPlan from "../pages/PlanningPage/CreateDailyPlan";
import MonthlyPlanView from "../pages/PlanningPage/MonthlyPlanView";
import ViewDailyPlanPage from "../pages/PlanningPage/DailyPlanView";
import DailyPlanOperatorAssignment from "../pages/PlanningPage/DailyPlanOperatorAssignment";
import DailyPlanPageForOperatorAllocation from "../pages/PlanningPage/DailyPlanPageForOperatorAllocation";
import PublicRoute from "./PublicRoute";
import Unauthorized from "../pages/CommanPages/Unauthorized";
import ManagementHallDashboard from "../pages/ManagementPages/HallDashBoard";
import ManagementHourlyMachineTracking from "../pages/ManagementPages/HourlyMachineTracking";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* ================= MANAGEMENT ================= */}

      <Route
        path="/management/overall/dashboard"
        element={
          <ManagementRoute>
            <Dashboard />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/dashboard"
        element={
          <ManagementRoute>
            <ProductionDashboard />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/reports"
        element={
          <ManagementRoute>
            <ManagerReportsPage />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/activity-logs"
        element={
          <ManagementRoute>
            <ActivityLogs />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/hourly"
        element={
          <ManagementRoute>
            <HourlyMachineTracking />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/halls/:hallId"
        element={
          <ManagementRoute>
            <ManagementHallDashboard />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/halls/:hallId/heatmap"
        element={
          <ManagementRoute>
            <ManagementHourlyMachineTracking />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/rejection"
        element={
          <ManagementRoute>
            <AllRejectionReasons />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/loss-time"
        element={
          <ManagementRoute>
            <LossAnalysisDashboard />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/mould-change"
        element={
          <ManagementRoute>
            <MouldChangeDashboard />
          </ManagementRoute>
        }
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/logs"
        element={
          <AdminRoute>
            <ActivityLogs />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/operators"
        element={
          <AdminRoute>
            <Employees />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/machines"
        element={
          <AdminRoute>
            <Machines />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/parts"
        element={
          <AdminRoute>
            <PartsPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/production/halls/:hallId"
        element={
          <AdminRoute>
            <HallDashboard />
          </AdminRoute>
        }
      />

      {/* ================= PRODUCTION ================= */}

      <Route
        path="/production/home"
        element={
          <ProductionRoute>
            <UserHome />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/dashboard"
        element={
          <ProductionRoute>
            <UserDashboard />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/entry"
        element={
          <ProductionRoute>
            <AdvProductionEntry />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/history"
        element={
          <ProductionRoute>
            <ProductionHistoryPage />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/reports"
        element={
          <ProductionRoute>
            <ReportsPage />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/halls/:hallId"
        element={
          <ProductionRoute>
            <HallDashboard />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/halls/:hallId/heatmap"
        element={
          <ProductionRoute>
            <HourlyMachineTracking />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/daily"
        element={
          <ProductionRoute>
            <DailyPlanPage />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/operator/allocation"
        element={
          <ProductionRoute>
            <DailyPlanPageForOperatorAllocation />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/:id/operator/allocation"
        element={
          <ProductionRoute>
            <DailyPlanOperatorAssignment />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/daily/create"
        element={
          <ProductionRoute>
            <DailyProductionPlan />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/detail/:id"
        element={
          <ProductionRoute>
            <ViewDailyPlanPage />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/monthly"
        element={
          <ProductionRoute>
            <MonthlyPlanPage />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/monthly/create"
        element={
          <ProductionRoute>
            <CreateMonthlyPlan />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/plans/monthly/detail/:id"
        element={
          <ProductionRoute>
            <MonthlyPlanView />
          </ProductionRoute>
        }
      />

      <Route
        path="/production/machines/allocation/update"
        element={
          <ProductionRoute>
            <UpdateMachineOperator />
          </ProductionRoute>
        }
      />

      {/* ================= 404 ================= */}

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
