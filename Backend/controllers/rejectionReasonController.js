const RejectionReason = require("../models/rejectionReasonModel");

// ======================================
// Get All Rejection Reasons
// ======================================

exports.getAllRejectionReasons = async (req, res) => {
  try {
    const rejectionReasons = await RejectionReason.getAll();

    return res.status(200).json({
      success: true,

      message: "Rejection reasons fetched successfully.",

      count: rejectionReasons.length,

      data: rejectionReasons,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to fetch rejection reasons.",

      count: 0,

      data: [],

      error: err.message,
    });
  }
};

// ======================================
// Get Rejection Reason By ID
// ======================================

exports.getRejectionReasonById = async (req, res) => {
  try {
    const { id } = req.params;

    const rejectionReason = await RejectionReason.getById(id);

    if (!rejectionReason) {
      return res.status(404).json({
        success: false,

        message: "Rejection reason not found.",

        data: null,

        error: null,
      });
    }

    return res.status(200).json({
      success: true,

      message: "Rejection reason fetched successfully.",

      data: rejectionReason,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to fetch rejection reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Create Rejection Reason
// ======================================

exports.createRejectionReason = async (req, res) => {
  try {
    const {
      reason_code,

      reason_name,

      status,
    } = req.body;

    if (!reason_code || !reason_name) {
      return res.status(400).json({
        success: false,

        message: "Reason code and reason name are required.",

        data: null,

        error: null,
      });
    }

    const codeExists = await RejectionReason.findByCode(reason_code);

    if (codeExists) {
      return res.status(409).json({
        success: false,

        message: "Reason code already exists.",

        data: null,

        error: null,
      });
    }

    const nameExists = await RejectionReason.findByName(reason_name);

    if (nameExists) {
      return res.status(409).json({
        success: false,

        message: "Reason name already exists.",

        data: null,

        error: null,
      });
    }

    const result = await RejectionReason.create({
      reason_code,

      reason_name,

      status: status || "Active",
    });

    const newReason = await RejectionReason.getById(result.insertId);

    return res.status(201).json({
      success: true,

      message: "Rejection reason created successfully.",

      data: newReason,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to create rejection reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Update Rejection Reason
// ======================================

exports.updateRejectionReason = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await RejectionReason.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,

        message: "Rejection reason not found.",

        data: null,

        error: null,
      });
    }

    await RejectionReason.update(id, req.body);

    const updated = await RejectionReason.getById(id);

    return res.status(200).json({
      success: true,

      message: "Rejection reason updated successfully.",

      data: updated,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to update rejection reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Delete Rejection Reason
// ======================================

exports.deleteRejectionReason = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await RejectionReason.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,

        message: "Rejection reason not found.",

        data: null,

        error: null,
      });
    }

    await RejectionReason.delete(id);

    return res.status(200).json({
      success: true,

      message: "Rejection reason deleted successfully.",

      data: null,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to delete rejection reason.",

      data: null,

      error: err.message,
    });
  }
};

// ======================================
// Update Status
// ======================================

exports.updateRejectionReasonStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const existing = await RejectionReason.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,

        message: "Rejection reason not found.",

        data: null,

        error: null,
      });
    }

    await RejectionReason.updateStatus(id, status);

    const updated = await RejectionReason.getById(id);

    return res.status(200).json({
      success: true,

      message: "Rejection reason status updated successfully.",

      data: updated,

      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Failed to update rejection reason status.",

      data: null,

      error: err.message,
    });
  }
};
