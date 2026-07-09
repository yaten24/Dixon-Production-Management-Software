const LossReason = require("../models/lossReasonModel");

// ======================================
// Get All Loss Reasons
// ======================================

exports.getAllLossReasons = async (req, res) => {
  try {
    const lossReasons = await LossReason.getAll();

    return res.status(200).json({
      success: true,
      message: "Loss reasons fetched successfully.",

      count: lossReasons.length,

      data: lossReasons,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to fetch loss reasons.",

      data: [],

      error: err.message,
    });
  }
};

// ======================================
// Get Loss Reason By ID
// ======================================

exports.getLossReasonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lossReason = await LossReason.getById(id);

    if (!lossReason) {
      return res.status(404).json({
        success: false,

        message: "Loss reason not found.",

        data: null,

        error: null,
      });
    }

    return res.status(200).json({
      success: true,

      message: "Loss reason fetched successfully.",

      data: lossReason,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to fetch loss reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Create Loss Reason
// ======================================

exports.createLossReason = async (req, res) => {
  try {
    const { reason_code, category, reason_name, status } = req.body;

    if (!reason_code || !category || !reason_name) {
      return res.status(400).json({
        success: false,

        message: "Required fields are missing.",

        data: null,

        error: null,
      });
    }

    const codeExists = await LossReason.findByCode(reason_code);

    if (codeExists) {
      return res.status(409).json({
        success: false,

        message: "Reason code already exists.",

        data: null,

        error: null,
      });
    }

    const nameExists = await LossReason.findByName(reason_name);

    if (nameExists) {
      return res.status(409).json({
        success: false,

        message: "Reason name already exists.",

        data: null,

        error: null,
      });
    }

    const result = await LossReason.create({
      reason_code,
      category,
      reason_name,
      status: status || "Active",
    });

    const newLossReason = await LossReason.getById(result.insertId);

    return res.status(201).json({
      success: true,

      message: "Loss reason created successfully.",

      data: newLossReason,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to create loss reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Update Loss Reason
// ======================================

exports.updateLossReason = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await LossReason.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,

        message: "Loss reason not found.",

        data: null,

        error: null,
      });
    }

    await LossReason.update(id, req.body);

    const updated = await LossReason.getById(id);

    return res.status(200).json({
      success: true,

      message: "Loss reason updated successfully.",

      data: updated,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to update loss reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Delete Loss Reason
// ======================================

exports.deleteLossReason = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await LossReason.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,

        message: "Loss reason not found.",

        data: null,

        error: null,
      });
    }

    await LossReason.delete(id);

    return res.status(200).json({
      success: true,

      message: "Loss reason deleted successfully.",

      data: null,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to delete loss reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Update Status
// ======================================

exports.updateLossReasonStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const existing = await LossReason.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,

        message: "Loss reason not found.",

        data: null,

        error: null,
      });
    }

    await LossReason.updateStatus(id, status);

    const updated = await LossReason.getById(id);

    return res.status(200).json({
      success: true,

      message: "Loss reason status updated successfully.",

      data: updated,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to update status.",

      data: null,

      error: err.message,
    });
  }
};
