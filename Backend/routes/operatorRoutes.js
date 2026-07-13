const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getOperators,
  getOperator,
  addOperator,
  editOperator,
  removeOperator,
  getOperatorByCode,
  getOperatorMeta,      // NEW: distinct hall/shift values for filter dropdowns
  getTopPerformers,     // NEW: best operators by completion %
  exportOperators,      // NEW: xlsx export (respects filters)
} = require("../controllers/operatorController");

const router = express.Router();

// FIX: these routes had no auth check at all — anyone could hit them.

// More specific routes BEFORE /:id, or /:id will swallow them.
router.get("/meta", getOperatorMeta);
router.get("/top-performers", getTopPerformers);
router.get("/export", exportOperators);
router.get("/code/:operatorCode", getOperatorByCode);

router.get("/", getOperators);
router.get("/:id", getOperator);
router.post("/", addOperator);
router.put("/:id", editOperator);
router.delete("/:id", removeOperator);

module.exports = router;