const express = require("express");
const cors = require("cors");

const machineRoutes = require("./routes/machine.routes");
const partRoutes = require("./routes/part.routes");
const operatorRoutes = require("./routes/operatorRoutes");
const userRoutes = require("./routes/userRoutes");
const loginRoutes = require("./routes/loginRoutes");
const lossReasonRoutes = require("./routes/lossReasonRoutes");
const rejectionReasonRoutes = require("./routes/rejectionReasonRoutes");
const productionEntryRoutes = require("./routes/productionEntryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const hallDashboardRoutes = require("./routes/hallDashboardRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const reportRoutes = require("./routes/Reportroutes");
const productionPlanRoutes = require("./routes/productionPlanRoutes");
const productionHistoryRoutes = require("./routes/productuonHistoryRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const productionDashboardRoutes = require("./routes/productionDashboardRoutes");
const lossTimeDashboardRoutes = require("./routes/lossTimeRoutes")
const productionRejectDetailRoutes = require("./routes/productionRejectDetailRoutes");
const mouldChangeDashboardRoutes = require("./routes/mouldChangeDashboardRoutes");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://192.168.3.87:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/machines", machineRoutes);
app.use('/api/production', require('./routes/productionHeatMapRoutes'));
app.use("/api/parts", partRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/loss-reasons", lossReasonRoutes);
app.use("/api/rejection-reasons", rejectionReasonRoutes);
app.use("/api/production-entries", productionEntryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/hall-dashboard", hallDashboardRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/production/history", productionHistoryRoutes);
app.use("/api/production-plan", productionPlanRoutes);
app.use('/api/mould-changes', require('./routes/mouldChange.routes'));
app.use("/api/production-dashboard", productionDashboardRoutes);
app.use("/api/loss-time", lossTimeDashboardRoutes);
app.use("/api/production-reject-details", productionRejectDetailRoutes);
app.use("/api/mould-change-dashboard", mouldChangeDashboardRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use('/api/monthly-plans', require('./routes/monthlyPlan.routes'));
app.use('/api/daily-plans', require('./routes/dailyPlan.routes'));

module.exports = app;
