import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import AdminRoute from "./AdminRoute";
import ManagementRoute from "./ManagementRoute";
import ProductionRoute from "./ProductionRoute";

// Public
import NotFound from "../pages/CommanPages/NotFound";
import Login from "../pages/CommanPages/Login";

// Management
import AllRejectionReasons from "../pages/ManagementPages/RejectionDashboard";
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
import UserDashboard from "../pages/ProductionPages/ProductionDashboard";
import AdvProductionEntry from "../pages/ProductionPages/ProductionEnrty";
import ProductionHistoryPage from "../pages/ProductionPages/ProductionHistoryPage";
import ReportsPage from "../pages/ProductionPages/ProductionReportsPage";

// Common
import HallDashboard from "../pages/ProductionPages/ProductionHallDashboard";
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
import ManagementHallDashboard from "../pages/ManagementPages/ProductionHallDashBoard";
import ManagementHourlyMachineTracking from "../pages/ManagementPages/HourlyMachineTracking";
import AdminProductionDashboard from "../pages/AdminPages/ProductionDashboard";
import AdminRejectionDashboard from "../pages/AdminPages/RejectionDashboard";
import AdminLossTimeDashboard from "../pages/AdminPages/LossTimeDashboard";
import AdminMouldChangeDashboard from "../pages/AdminPages/MouldChangeDashboard";
import AdminDailyPlanPageForOperatorAllocation from "../pages/AdminPages/DailyPlanPageForOperatorAllocation";
import AdminAdvProductionEntry from "../pages/AdminPages/advProductionEnrty";
import AdminProductionHistoryPage from "../pages/AdminPages/ProductionHistoryPage";
import AdminDailyProductionPlan from "../pages/AdminPages/CreateDailyPlan";
import AdminCreateMonthlyPlan from "../pages/AdminPages/CreateMonthlyPlan";
import AdminMonthlyPlanPage from "../pages/AdminPages/MonthlyPlanPage";
import AdminDailyPlanPage from "../pages/AdminPages/DailyPlanPage";
import AdminReportsPage from "../pages/AdminPages/ReportsPage";
import AdminViewDailyPlanPage from "../pages/AdminPages/DailyPlanView";
import AdminMonthlyPlanView from "../pages/AdminPages/MonthlyPlanView";
import ManagementMouldChangeDashboard from "../pages/ManagementPages/MoldChangeDashboard";
import ManagementProductionDashboard from "../pages/ManagementPages/ProductionDashboard";
import ProductionDashboard from "../pages/ProductionPages/ProductionDashboard";
import DateWiseProduction from "../pages/ManagementPages/DateWiseProduction";
import MachineWiseProduction from "../pages/ManagementPages/MachineWiseProduction";
import MoldChangeDashboard from "../pages/ManagementPages/MoldChangeDashboard";
import OverAllDashboard from "../pages/ManagementPages/OverAllDashboard";

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
            <OverAllDashboard />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/dashboard"
        element={
          <ManagementRoute>
            <ManagementProductionDashboard />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/monthly/production/dashboard"
        element={
          <ManagementRoute>
            <DateWiseProduction />
          </ManagementRoute>
        }
      />

      <Route
        path="/management/monthly/machines/production/dashboard"
        element={
          <ManagementRoute>
            <MachineWiseProduction />
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
        path="/management/mold-change"
        element={
          <ManagementRoute>
            <MoldChangeDashboard />
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
        path="/admin/production-dashboard"
        element={
          <AdminRoute>
            <AdminProductionDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/rejection-dashboard"
        element={
          <AdminRoute>
            <AdminRejectionDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/loss-time-dashboard"
        element={
          <AdminRoute>
            <AdminLossTimeDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/mold-change-dashboard"
        element={
          <AdminRoute>
            <AdminMouldChangeDashboard />
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

      <Route
        path="/admin/machine-allocation"
        element={
          <AdminRoute>
            <AdminDailyPlanPageForOperatorAllocation />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/production-entry"
        element={
          <AdminRoute>
            <AdminAdvProductionEntry />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/production-history"
        element={
          <AdminRoute>
            <AdminProductionHistoryPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/daily-plan"
        element={
          <AdminRoute>
            <AdminDailyPlanPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/production/plans/daily/create"
        element={
          <AdminRoute>
            <AdminDailyProductionPlan />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/production/plans/detail/:id"
        element={
          <AdminRoute>
            <AdminViewDailyPlanPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/monthly-plan"
        element={
          <AdminRoute>
            <AdminMonthlyPlanPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/production/plans/monthly/create"
        element={
          <AdminRoute>
            <AdminMonthlyPlanPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/production/plans/monthly/detail/:id"
        element={
          <AdminRoute>
            <AdminMonthlyPlanView />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        }
      />

      {/* ================= PRODUCTION ================= */}
      <Route
        path="/production/dashboard"
        element={
          <ProductionRoute>
            <ProductionDashboard />
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

      {/* ================= 404 ================= */}

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
