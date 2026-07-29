const express = require("express");
const controller = require("../controllers/productionReportController");

const router = express.Router();

// dropdown options for hall/machine filters
router.get("/filters", controller.filters);

// GET /api/reports/daily?date=2026-07-29&hall=&shift=&machine=
// GET /api/reports/daily-summary?date=2026-07-29
// GET /api/reports/monthly?month=7&year=2026&hall=
// GET /api/reports/monthly-summary?month=7&year=2026&hall=
router.get("/:type", controller.show);

// GET /api/reports/:type/export?...same params — downloads .xlsx
router.get("/:type/export", controller.exportXlsx);

module.exports = router;