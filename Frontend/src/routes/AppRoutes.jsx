import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Machines from "../pages/Machines";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Attendance from "../pages/Attendance";
import Reports from "../pages/Reports";
import MachineAssignment from "../pages/AsignMachine";
import ProductionEntry from "../user/productionEntry";
import AdvProductionEntry from "../user/advProductionEnrty";
import ProductionPlanning from "../user/ProductionPlanning";
import Login from "../auth/Login";
import MouldChangeDashboard from "../pages/MouldChangeDashboard";
import AllRejectionReasons from "../pages/AllRejectionReasons";
import LossTimeDashboard from "../pages/LossTimeDashboard";
import Users from "../pages/Users";
// import Login from "../pages/UserLogin";
import UserHome from "../pages/UserHome";
import UserDashboard from "../pages/UserDashboard";
import ProductionDashboard from "../pages/ProductionDashboard";
import Logs from "../pages/Logs";
import PartsPage from "../pages/PartsPage";
import UserProfile from "../pages/UserProfile";
import ReportsPage from "../pages/ReportsPage";
import HallDashboard from "../pages/HallDashboard";
import ActivityLogs from "../pages/Activitylogs";
import DailyProductionPlan from "../pages/DailyProductionPlan";
import MachineOverviewDashboard from "../pages/MachineOverview";
import MachineOperatorManagement from "../pages/MachineOperatorManagement";
import AllocateMachineOperator from "../pages/AllocateMachineOperator";
import UpdateMachineOperator from "../pages/UpdateMachineOperator";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/machines" element={<Machines />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/machine-assignment" element={<MachineAssignment />} />
      <Route path="/production-entry" element={<ProductionEntry />} />
      <Route path="/user/production/entry" element={<AdvProductionEntry />} />
      <Route path="/production-planning" element={<ProductionPlanning />} />
      <Route path="/production/hall/:hallId" element={<HallDashboard />} />
      <Route path="/mould-change" element={<MouldChangeDashboard />} />
      <Route path="/rejection" element={<AllRejectionReasons />} />
      <Route path="/loss-time" element={<LossTimeDashboard />} />
      <Route path="/users" element={<Users />} />
      {/* <Route path="/user/login" element={<Login />} /> */}
      <Route path="/user/home" element={<UserHome />} />
      <Route path="/user/profile" element={<UserProfile />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/user/history" element={<ReportsPage />} />
      <Route
        path="/user/production/daily-plan"
        element={<DailyProductionPlan />}
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
