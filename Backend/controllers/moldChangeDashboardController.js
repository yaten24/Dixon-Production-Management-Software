const mouldChangeModel = require("../models/moldChangeDashboardModel");

function parseFilters(query) {
  const { filterType = "daily", date, month, changeType, status, reason } = query;
  return { filterType, date, month, changeType, status, reason };
}

// GET /api/mould-changes/reasons
async function getReasons(req, res) {
  try {
    const reasons = await mouldChangeModel.getDistinctReasons();
    res.json({ reasons });
  } catch (err) {
    console.error("getReasons error:", err);
    res.status(500).json({ error: "Failed to fetch mould change reasons" });
  }
}

// GET /api/mould-changes/summary
async function getSummary(req, res) {
  try {
    const data = await mouldChangeModel.getSummary(parseFilters(req.query));
    res.json(data);
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ error: "Failed to fetch mould change summary" });
  }
}

// GET /api/mould-changes/hall-wise
async function getHallWise(req, res) {
  try {
    const data = await mouldChangeModel.getHallWise(parseFilters(req.query));
    res.json(data);
  } catch (err) {
    console.error("getHallWise error:", err);
    res.status(500).json({ error: "Failed to fetch hall-wise mould changes" });
  }
}

// GET /api/mould-changes/reason-distribution
async function getReasonDistribution(req, res) {
  try {
    const data = await mouldChangeModel.getReasonDistribution(parseFilters(req.query));
    res.json(data);
  } catch (err) {
    console.error("getReasonDistribution error:", err);
    res.status(500).json({ error: "Failed to fetch reason distribution" });
  }
}

// GET /api/mould-changes/top-machines
async function getTopMachines(req, res) {
  try {
    const data = await mouldChangeModel.getTopMachines(parseFilters(req.query));
    res.json(data);
  } catch (err) {
    console.error("getTopMachines error:", err);
    res.status(500).json({ error: "Failed to fetch top machines" });
  }
}

// GET /api/mould-changes/hourly-trend
async function getHourlyTrend(req, res) {
  try {
    const data = await mouldChangeModel.getHourlyTrend(parseFilters(req.query));
    res.json(data);
  } catch (err) {
    console.error("getHourlyTrend error:", err);
    res.status(500).json({ error: "Failed to fetch hourly trend" });
  }
}

module.exports = {
  getReasons,
  getSummary,
  getHallWise,
  getReasonDistribution,
  getTopMachines,
  getHourlyTrend,
};