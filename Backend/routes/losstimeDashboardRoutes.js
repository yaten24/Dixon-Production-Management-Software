const express = require("express");
const router = express.Router();
const lossTimeController = require("../controllers/losstimeDashboardController");
// const authMiddleware = require("../middlewares/authMiddleware"); // adjust path to your actual middleware

// router.use(authMiddleware);

router.get("/reasons", lossTimeController.getReasons);
router.get("/summary", lossTimeController.getSummary);

module.exports = router;
