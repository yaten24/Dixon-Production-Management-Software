// src/controllers/productionRejectDetail.controller.js

const productionRejectDetailModel = require("../models/productionRejectDetailModel");

// GET /production-reject-details
const getAllRejectDetails = async (req, res) => {
  try {
    const data = await productionRejectDetailModel.getAll();
    res.status(200).json(data);
  } catch (err) {
    console.error("getAllRejectDetails error:", err);
    res.status(500).json({ message: "Failed to fetch reject details" });
  }
};

// GET /production-reject-details/:id
const getRejectDetailById = async (req, res) => {
  try {
    const data = await productionRejectDetailModel.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Reject detail not found" });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error("getRejectDetailById error:", err);
    res.status(500).json({ message: "Failed to fetch reject detail" });
  }
};

// POST /production-reject-details
const createRejectDetail = async (req, res) => {
  try {
    const { production_entry_id, reject_reason_id, reject_qty } = req.body;

    if (!production_entry_id || !reject_reason_id || reject_qty == null) {
      return res.status(400).json({
        message: "production_entry_id, reject_reason_id and reject_qty are required",
      });
    }

    const created = await productionRejectDetailModel.create({
      ...req.body,
      created_by: req.user?.id || null, // adjust based on your auth middleware
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("createRejectDetail error:", err);
    res.status(500).json({ message: "Failed to create reject detail" });
  }
};

// PUT /production-reject-details/:id
const updateRejectDetail = async (req, res) => {
  try {
    const existing = await productionRejectDetailModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Reject detail not found" });
    }

    const updated = await productionRejectDetailModel.update(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error("updateRejectDetail error:", err);
    res.status(500).json({ message: "Failed to update reject detail" });
  }
};

// DELETE /production-reject-details/:id
const deleteRejectDetail = async (req, res) => {
  try {
    const deleted = await productionRejectDetailModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Reject detail not found" });
    }
    res.status(200).json({ message: "Reject detail deleted successfully" });
  } catch (err) {
    console.error("deleteRejectDetail error:", err);
    res.status(500).json({ message: "Failed to delete reject detail" });
  }
};

// GET /production-reject-details/dashboard?date=&reasonId=
const getDashboardData = async (req, res) => {
  try {
    const { date, reasonId } = req.query;
    const data = await productionRejectDetailModel.getDashboardData({ date, reasonId });
    res.status(200).json(data);
  } catch (err) {
    console.error("getDashboardData error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

// GET /production-reject-details/hourly-trend?date=
const getHourlyTrend = async (req, res) => {
  try {
    const { date } = req.query;
    const data = await productionRejectDetailModel.getHourlyTrend({ date });
    res.status(200).json(data);
  } catch (err) {
    console.error("getHourlyTrend error:", err);
    res.status(500).json({ message: "Failed to fetch hourly trend" });
  }
};

// GET /production-reject-details/recent?limit=
const getRecent = async (req, res) => {
  try {
    const { limit } = req.query;
    const data = await productionRejectDetailModel.getRecent(limit || 20);
    res.status(200).json(data);
  } catch (err) {
    console.error("getRecent error:", err);
    res.status(500).json({ message: "Failed to fetch recent rejections" });
  }
};

// GET /production-reject-details/machine-summary?date=&reasonId=
const getMachineWiseSummary = async (req, res) => {
  try {
    const { date, reasonId } = req.query;
    const data = await productionRejectDetailModel.getMachineWiseSummary({ date, reasonId });
    res.status(200).json(data);
  } catch (err) {
    console.error("getMachineWiseSummary error:", err);
    res.status(500).json({ message: "Failed to fetch machine-wise summary" });
  }
};

module.exports = {
  getAllRejectDetails,
  getRejectDetailById,
  createRejectDetail,
  updateRejectDetail,
  deleteRejectDetail,
  getDashboardData,
  getHourlyTrend,
  getMachineWiseSummary, 
  getRecent,
};