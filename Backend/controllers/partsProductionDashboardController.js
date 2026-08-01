// controllers/productionEntry.controller.js
const productionModel = require("../models/partsProductionDashboardModel");

const VALID_PERIOD_TYPES = ["day", "month", "year"];

function defaultPeriodValue(periodType) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  if (periodType === "day") return `${yyyy}-${mm}-${dd}`;
  if (periodType === "year") return `${yyyy}`;
  return `${yyyy}-${mm}`; // month default
}

function validatePeriod(periodType, periodValue) {
  if (!VALID_PERIOD_TYPES.includes(periodType)) {
    return "periodType must be one of: day, month, year";
  }
  if (!periodValue) return "periodValue is required";

  if (periodType === "day" && !/^\d{4}-\d{2}-\d{2}$/.test(periodValue)) {
    return "periodValue must be in YYYY-MM-DD format for periodType=day";
  }
  if (periodType === "month" && !/^\d{4}-\d{2}$/.test(periodValue)) {
    return "periodValue must be in YYYY-MM format for periodType=month";
  }
  if (periodType === "year" && !/^\d{4}$/.test(periodValue)) {
    return "periodValue must be in YYYY format for periodType=year";
  }
  return null;
}

// GET /api/production/dashboard?periodType=month&periodValue=2026-08&category=&customer=
exports.getDashboard = async (req, res) => {
  try {
    console.log("getDashboard called with query:", req.query);
    const periodType = req.query.periodType || "month";
    const periodValue = req.query.periodValue || defaultPeriodValue(periodType);
    const category = req.query.category || null;
    const customer = req.query.customer || null;

    const validationError = validatePeriod(periodType, periodValue);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const filters = { periodType, periodValue, category, customer };

    const [summary, parts] = await Promise.all([
      productionModel.getSummaryStats(filters),
      productionModel.getPartWiseProduction(filters),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        periodType,
        periodValue,
        category,
        customer,
        summary,
        parts,
      },
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch production dashboard data",
    });
  }
};

// GET /api/production/filters
exports.getFilters = async (req, res) => {
  try {
    const options = await productionModel.getFilterOptions();
    return res.status(200).json({ success: true, data: options });
  } catch (err) {
    console.error("getFilters error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filter options",
    });
  }
};