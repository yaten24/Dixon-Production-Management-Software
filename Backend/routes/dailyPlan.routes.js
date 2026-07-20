const express = require("express");
const {
  generatePlanNumber,
  listHeaders,
  getHeader,
  listDetails,
  createFullPlan,
  addDetail,
  updateDetail,
  deleteDetail,
  deleteHeader,
  updateStatus,
} = require("../controllers/dailyPlan.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// static paths before dynamic /:id
router.post("/full", createFullPlan);
router.get("/next-number", generatePlanNumber);
router.get("/", listHeaders);

router.get("/:id", getHeader);
router.delete("/:id", deleteHeader);

router.get("/:id/details", listDetails);
router.post("/:id/details", addDetail);
router.put("/:id/details/:detailId", updateDetail);
router.delete("/:id/details/:detailId", deleteDetail);
router.patch('/:id/status', updateStatus);

module.exports = router;
