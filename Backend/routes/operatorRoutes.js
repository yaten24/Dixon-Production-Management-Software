const express = require("express");

const {
  getOperators,
  getOperator,
  addOperator,
  editOperator,
  removeOperator,
  getOperatorByCode,
} = require("../controllers/operatorController");

const router = express.Router();

router.get("/", getOperators);

router.get("/:id", getOperator);

router.post("/", addOperator);

router.put("/:id", editOperator);

router.delete("/:id", removeOperator);

router.get("/code/:operatorCode", getOperatorByCode);

module.exports = router;