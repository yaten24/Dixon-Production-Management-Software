const express = require("express");
const router = express.Router();
const { getMonthlyMachineWise } = require("../controllers/machineWiseProductionController");
// const { authMiddleware } = require("../middleware/authMiddleware"); // adjust to your actual path

router.get("/machine-summary", getMonthlyMachineWise);

module.exports = router;
