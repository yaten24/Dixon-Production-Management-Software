// backend/controllers/reports.controller.js

const reportsModel = require("../models/reportsPageModel");

// ---------------------------------------------------------------
// Report catalogue — single source of truth for both:
//  1) GET /api/reports        (drives the "All Reports" table in the UI)
//  2) GET /api/reports/:key   (dispatches to the right model function)
//
// `mode` marks whether a report is meaningful in daily view, monthly
// view, or both — the frontend uses this to hide/show rows depending
// on the active Daily/Monthly toggle.
// ---------------------------------------------------------------
const REPORT_CATALOGUE = [
  {
    key: "daily-production",
    name: "Daily Production Report",
    category: "Production",
    description: "Daily production summary vs target",
    mode: "daily",
    handler: (f) => reportsModel.dailyProductionReport(f),
  },
  {
    key: "production-summary",
    name: "Production Summary Report",
    category: "Production",
    description: "Period wise production summary",
    mode: "both",
    handler: (f) => reportsModel.productionSummaryReport(f),
  },
  {
    key: "rejection-by-machine",
    name: "Rejection Report By Machine",
    category: "Rejection",
    description: "Machine wise rejection breakdown",
    mode: "both",
    handler: (f) => reportsModel.rejectionByMachineReport(f),
  },
  {
    key: "rejection-summary",
    name: "Rejection Summary Report",
    category: "Rejection",
    description: "Rejection summary with reasons",
    mode: "both",
    handler: (f) => reportsModel.rejectionSummaryReport(f),
  },
  {
    key: "loss-by-machine",
    name: "Loss Report Machine Wise",
    category: "Loss Time",
    description: "Machine wise loss time breakdown",
    mode: "both",
    handler: (f) => reportsModel.lossByMachineReport(f),
  },
  {
    key: "loss-summary",
    name: "Loss Summary Report",
    category: "Loss Time",
    description: "Overall loss time summary",
    mode: "both",
    handler: (f) => reportsModel.lossSummaryReport(f),
  },
  {
    key: "moldchange-by-machine",
    name: "Mold Change Machine Wise",
    category: "Mould",
    description: "Machine wise mold change details",
    mode: "both",
    handler: (f) => reportsModel.moldChangeByMachineReport(f),
  },
  {
    key: "moldchange-by-shift",
    name: "Mold Change Shift Wise",
    category: "Mould",
    description: "Shift wise mold change details",
    mode: "both",
    handler: (f) => reportsModel.moldChangeByShiftReport(f),
  },
  {
    key: "moldchange-summary",
    name: "Mold Change Summary Report",
    category: "Mould",
    description: "Overall mold change summary",
    mode: "both",
    handler: (f) => reportsModel.moldChangeSummaryReport(f),
  },
  {
    key: "machine-performance",
    name: "Machine Performance Report",
    category: "Machine",
    description: "Machine wise performance & utilization",
    mode: "both",
    handler: (f) => reportsModel.machinePerformanceReport(f),
  },
  {
    key: "operator-performance",
    name: "Operator Performance Report",
    category: "Operator",
    description: "Operator performance and productivity",
    mode: "both",
    handler: (f) => reportsModel.operatorPerformanceReport(f),
  },
  {
    key: "shift-a-summary",
    name: "Shift A Summary Report",
    category: "Shift",
    description: "Shift A production & efficiency summary",
    mode: "both",
    handler: (f) => reportsModel.shiftSummaryReport("A", f),
  },
  {
    key: "shift-b-summary",
    name: "Shift B Summary Report",
    category: "Shift",
    description: "Shift B production & efficiency summary",
    mode: "both",
    handler: (f) => reportsModel.shiftSummaryReport("B", f),
  },
  {
    key: "oee-report",
    name: "OEE Report",
    category: "OEE",
    description: "Machine wise, shift wise & daily in one report",
    mode: "both",
    handler: (f) => reportsModel.oeeReport(f),
  },
  {
    key: "daily-plan",
    name: "Daily Production Plan Report",
    category: "Planning",
    description: "Daily plan targets by machine & part",
    mode: "daily",
    handler: (f) => reportsModel.dailyPlanReport(f),
  },
  {
    key: "monthly-plan",
    name: "Monthly Production Plan Report",
    category: "Planning",
    description: "Monthly plan targets by part & priority",
    mode: "monthly",
    handler: (f) => reportsModel.monthlyPlanReport(f),
  },
];

const REPORT_MAP = new Map(REPORT_CATALOGUE.map((r) => [r.key, r]));

// GET /api/reports — catalogue only, no data (feeds the listing table)
function getCatalogue(req, res) {
  const reports = REPORT_CATALOGUE.map(({ key, name, category, description, mode }) => ({
    key,
    name,
    category,
    description,
    mode,
    format: "Excel",
    frequency: mode === "monthly" ? "Monthly" : "Daily",
  }));
  res.json({ reports });
}

// GET /api/reports/:key?date=&month=&hall= — actual report data
async function getReportData(req, res) {
  const { key } = req.params;
  const report = REPORT_MAP.get(key);

  if (!report) {
    return res.status(404).json({ error: `Unknown report key "${key}"` });
  }

  const filters = {
    date: req.query.date || null,
    month: req.query.month || null,
    hall: req.query.hall || null,
  };

  try {
    const data = await report.handler(filters);
    res.json({
      key: report.key,
      name: report.name,
      category: report.category,
      filters,
      generatedAt: new Date().toISOString(),
      data,
    });
  } catch (err) {
    console.error(`[reports] Failed to build report "${key}":`, err);
    res.status(500).json({ error: "Failed to generate report", detail: err.message });
  }
}

module.exports = { getCatalogue, getReportData, REPORT_CATALOGUE };