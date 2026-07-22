const HallDashboardModel = require("../models/hallDashboardModel");
const { calculateOEE } = require("../utils/oeeCalculator");

const parseCommonFilters = (req) => {
  const { hall, from, to, machine, shift } = req.query;
  const { businessDate } = HallDashboardModel.getShiftContext();
  return {
    hall,
    from: from || businessDate,
    to: to || businessDate,
    machineCode: machine,
    shift: shift || "All",
  };
};

const validateHall = (hall, res) => {
  if (!hall) {
    res.status(400).json({ success: false, message: "hall query parameter is required.", data: null, error: null });
    return false;
  }
  return true;
};

exports.getStats = async (req, res) => {
  try {
    const filters = parseCommonFilters(req);
    if (!validateHall(filters.hall, res)) return;

    const stats = await HallDashboardModel.getStats(filters);

    const target = Number(stats.total_target) || 0;
    const actual = Number(stats.total_actual) || 0;
    const reject = Number(stats.total_reject) || 0;
    const good = Number(stats.total_good) || 0;
    const lossMinutes = Number(stats.total_loss_minutes) || 0;
    const idealRunSeconds = Number(stats.ideal_run_seconds) || 0;
    const machinesReporting = Number(stats.machines_reporting) || 0;

    const oee = calculateOEE({
      actual, good, reject, lossMinutes, idealRunSeconds,
      machineCount: machinesReporting,
      shift: filters.shift,
      from: filters.from,
      to: filters.to,
    });

    return res.status(200).json({
      success: true,
      message: "Hall stats fetched successfully.",
      data: {
        target, actual, reject, lossMinutes,
        achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
        machinesReporting,
        oee: oee.oee, // flat % for the KPI card
        oeeBreakdown: oee, // { availability, performance, quality, oee }
      },
      error: null,
    });
  } catch (err) {
    console.error("getStats (hall) failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch hall stats.", data: null, error: err.message });
  }
};

exports.getMachineWise = async (req, res) => {
  try {
    const filters = parseCommonFilters(req);
    if (!validateHall(filters.hall, res)) return;

    const data = await HallDashboardModel.getMachineWise(filters);

    const withOee = data.map((m) => {
      const oee = calculateOEE({
        actual: m.actual, good: m.good, reject: m.rejection,
        lossMinutes: m.lossMinutes, idealRunSeconds: m.idealRunSeconds,
        machineCount: 1, shift: filters.shift, from: filters.from, to: filters.to,
      });
      return { ...m, oee: oee.oee, oeeBreakdown: oee };
    });

    return res.status(200).json({ success: true, message: "Machine-wise data fetched successfully.", data: withOee, error: null });
  } catch (err) {
    console.error("getMachineWise (hall) failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch machine-wise data.", data: null, error: err.message });
  }
};

exports.getHourlyTrend = async (req, res) => {
  try {
    const { hall, date, machine, shift } = req.query;
    if (!validateHall(hall, res)) return;

    const { businessDate } = HallDashboardModel.getShiftContext();
    const entryDate = date || businessDate;

    const data = await HallDashboardModel.getHourlyTrend({ hall, date: entryDate, machineCode: machine, shift });

    return res.status(200).json({ success: true, message: "Hourly trend fetched successfully.", data: { date: entryDate, trend: data }, error: null });
  } catch (err) {
    console.error("getHourlyTrend (hall) failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch hourly trend.", data: null, error: err.message });
  }
};

exports.getShiftSummary = async (req, res) => {
  try {
    const filters = parseCommonFilters(req);
    if (!validateHall(filters.hall, res)) return;
    const data = await HallDashboardModel.getShiftSummary(filters);
    return res.status(200).json({ success: true, message: "Shift summary fetched successfully.", data, error: null });
  } catch (err) {
    console.error("getShiftSummary (hall) failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch shift summary.", data: null, error: err.message });
  }
};

exports.getTopRejects = async (req, res) => {
  try {
    const filters = parseCommonFilters(req);
    if (!validateHall(filters.hall, res)) return;
    const limit = Number(req.query.limit) || 5;
    const data = await HallDashboardModel.getTopRejects(filters, limit);
    return res.status(200).json({ success: true, message: "Top rejects fetched successfully.", data, error: null });
  } catch (err) {
    console.error("getTopRejects (hall) failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch top rejects.", data: null, error: err.message });
  }
};

exports.getMachinesForHall = async (req, res) => {
  try {
    const { hall } = req.query;
    if (!validateHall(hall, res)) return;
    const machines = await HallDashboardModel.getMachinesForHall(hall);
    return res.status(200).json({ success: true, message: "Machines fetched successfully.", data: machines, error: null });
  } catch (err) {
    console.error("getMachinesForHall failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch machines.", data: null, error: err.message });
  }
};

// NEW — powers the heatmap page
exports.getMachineHourlyTrend = async (req, res) => {
  try {
    const { hall, date, shift } = req.query;
    if (!validateHall(hall, res)) return;
    const { businessDate } = HallDashboardModel.getShiftContext();
    const entryDate = date || businessDate;
    const data = await HallDashboardModel.getMachineHourlyTrend({ hall, date: entryDate, shift });
    return res.status(200).json({ success: true, message: "Machine hourly trend fetched successfully.", data: { date: entryDate, trend: data }, error: null });
  } catch (err) {
    console.error("getMachineHourlyTrend failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch machine hourly trend.", data: null, error: err.message });
  }
};