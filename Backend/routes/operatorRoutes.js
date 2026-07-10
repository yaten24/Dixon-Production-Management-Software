const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getOperators,
  getOperator,
  addOperator,
  editOperator,
  removeOperator,
  getOperatorByCode,
} = require("../controllers/operatorController");

const router = express.Router();

// FIX: these routes had no auth check at all — anyone could hit them.
router.use(authMiddleware);

router.get("/", getOperators);
router.get("/code/:operatorCode", getOperatorByCode); // more specific route BEFORE /:id
router.get("/:id", getOperator);
router.post("/", addOperator);
router.put("/:id", editOperator);
router.delete("/:id", removeOperator);

module.exports = router;