const express = require("express");

const router = express.Router();

const rejectionReasonController = require("../controllers/rejectionReasonController");

// ======================================
// GET ALL REJECTION REASONS
// ======================================

router.get("/", rejectionReasonController.getAllRejectionReasons);

// ======================================
// GET REJECTION REASON BY ID
// ======================================

router.get("/:id", rejectionReasonController.getRejectionReasonById);

// ======================================
// CREATE REJECTION REASON
// ======================================

router.post("/", rejectionReasonController.createRejectionReason);

// ======================================
// UPDATE REJECTION REASON
// ======================================

router.put("/:id", rejectionReasonController.updateRejectionReason);

// ======================================
// UPDATE REJECTION REASON STATUS
// ======================================

router.patch(
  "/:id/status",
  rejectionReasonController.updateRejectionReasonStatus,
);

// ======================================
// DELETE REJECTION REASON
// ======================================

router.delete("/:id", rejectionReasonController.deleteRejectionReason);

module.exports = router;
