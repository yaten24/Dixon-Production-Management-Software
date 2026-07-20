import { Routes, Route } from "react-router-dom";
import Reports from "../pages/AdminPages/Reports";
import ProductionEntry from "../user/productionEntry";
import ProductionPlanning from "../user/ProductionPlanning";
import Login from "../auth/Login";
import AllRejectionReasons from "../pages/AdminPages/RejectionReasons";
import Users from "../pages/Users";
import UserHome from "../pages/UserHome";
import UserDashboard from "../pages/UserDashboard";
import ProductionDashboard from "../pages/AdminPages/ProductionDashboard";
import Logs from "../pages/Logs";
import UserProfile from "../pages/UserProfile";
import HallDashboard from "../pages/HallDashboard";
import DailyProductionPlan from "../pages/DailyProductionPlan";
import MachineOverviewDashboard from "../pages/MachineOverview";
import MachineOperatorManagement from "../pages/MachineOperatorManagement";
import AllocateMachineOperator from "../pages/AllocateMachineOperator";
import UpdateMachineOperator from "../pages/UpdateMachineOperator";
import ProductionHistoryPage from "../pages/ProductionHistoryPage";
import AdvProductionEntry from "../pages/advProductionEnrty";
import LossAnalysisDashboard from "../pages/AdminPages/LossTimeDashboard";
import PartsPage from "../pages/AdminPages/PartsPage";
import DashboardFilters from "../compenents/productionDashboard/DashboardFilters";
import Employees from "../pages/AdminPages/Employees";
import Machines from "../pages/AdminPages/Machines";
import MouldChangeDashboard from "../pages/AdminPages/MouldChangeDashboard";
import ReportsPage from "../pages/AdminPages/ReportsPage"
import ActivityLogs from "../pages/AdminPages/Activitylogs"
import NotFound from "../pages/NotFound"
import Home from "../pages/Home"
import Dashboard from "../pages/AdminPages/Dashboard";
import PlanSelectionPage from "../pages/EmployeePage/PlanSelectionPage";
import MonthlyPlanPage from "../pages/EmployeePage/MonthlyPlanPage";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/machines" element={<Machines />} />
      <Route path="/reports" element={<Reports />} />
      {/* <Route path="/machine-assignment" element={<MachineAssignment />} /> */}
      <Route path="/production-entry" element={<ProductionEntry />} />
      <Route path="/user/production/entry" element={<AdvProductionEntry />} />
      <Route path="/production-planning" element={<ProductionPlanning />} />
      <Route path="/production/hall/:hallId" element={<HallDashboard />} />
      <Route path="/mould-change" element={<MouldChangeDashboard />} />
      <Route path="/rejection" element={<AllRejectionReasons />} />
      <Route path="/loss-time" element={<LossAnalysisDashboard />} />
      <Route path="/users" element={<Users />} />
      {/* <Route path="/user/login" element={<Login />} /> */}
      <Route path="/user/home" element={<UserHome />} />
      <Route path="/user/profile" element={<UserProfile />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/user/history" element={<ProductionHistoryPage />} />
      <Route path="/user/reports" element={<ReportsPage />} />
      <Route
        path="/user/production/daily-plan"
        element={<PlanSelectionPage />}
      />
      <Route
        path="/employee/ppc/daily"
        element={<MonthlyPlanPage />}
      />
      <Route
        path="/user/production/daily-plan"
        element={<PlanSelectionPage />}
      />
      <Route
        path="/user/machines/overview"
        element={<MachineOverviewDashboard />}
      />
      <Route
        path="/user/machine-allocation"
        element={<MachineOperatorManagement />}
      />
      <Route
        path="production/machine-allocation"
        element={<AllocateMachineOperator />}
      />
      <Route
        path="/production/update-machine-operator"
        element={<UpdateMachineOperator />}
      />
      <Route path="/parts" element={<PartsPage />} />

      <Route path="/production" element={<ProductionDashboard />} />
      <Route path="/logs" element={<ActivityLogs />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
