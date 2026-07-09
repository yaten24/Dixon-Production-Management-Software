const express = require("express");

const router = express.Router();

const lossReasonController = require("../controllers/lossReasonController");

// ======================================
// GET ALL LOSS REASONS
// ======================================

router.get("/", lossReasonController.getAllLossReasons);

// ======================================
// GET LOSS REASON BY ID
// ======================================

router.get("/:id", lossReasonController.getLossReasonById);

// ======================================
// CREATE LOSS REASON
// ======================================

router.post("/", lossReasonController.createLossReason);

// ======================================
// UPDATE LOSS REASON
// ======================================

router.put("/:id", lossReasonController.updateLossReason);

// ======================================
// UPDATE STATUS
// ======================================

router.patch("/:id/status", lossReasonController.updateLossReasonStatus);

// ======================================
// DELETE LOSS REASON
// ======================================

router.delete("/:id", lossReasonController.deleteLossReason);

module.exports = router;
