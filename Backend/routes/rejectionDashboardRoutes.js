const express = require("express");
const router = express.Router();
const rejectionController = require("../controllers/rejectionDashboardController");
// const authMiddleware = require("../middlewares/authMiddleware"); // adjust path to your actual middleware

// router.use(authMiddleware);

router.get("/reasons", rejectionController.getReasons);
router.get("/summary", rejectionController.getSummary);

module.exports = router;

// In your main app/server file:
// const rejectionRoutes = require("./routes/rejectionRoutes");
// app.use("/api/rejection-dashboard", rejectionRoutes);