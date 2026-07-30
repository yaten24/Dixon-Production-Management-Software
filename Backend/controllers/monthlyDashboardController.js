const overviewModel = require("../models/monthlyDashboardModel");

// GET /dashboard/summary
async function getSummary(req, res, next) {
  try {
    const filters = overviewModel.parseSummaryFilters(req.query);
    const data = await overviewModel.getDashboardSummary(filters);

    res.json({
      success: true,
      message: "Dashboard summary fetched successfully.",
      data,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

// GET /dashboard/overview
// Feeds useDashboardOverview() -> Dashboard.jsx (KPI row, day-wise trend
// chart, Hall Wise Performance table, Live Machine Production table).
async function getOverview(req, res, next) {
  try {
    const filters = overviewModel.parseFilters(req.query);
    const data = await overviewModel.getDashboardOverview(filters);

    res.json({
      success: true,
      message: "Dashboard overview fetched successfully.",
      data,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, getOverview };