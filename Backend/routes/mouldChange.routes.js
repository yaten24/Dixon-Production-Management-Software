const express = require("express");
const {
  createMouldChange,
  startMouldChange,
  completeMouldChange,
  cancelMouldChange,
  updateMouldChange,
  deleteMouldChange,
  listMouldChanges,
  getMouldChange,
} = require("../controllers/mouldChange.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/", createMouldChange);
router.get("/", listMouldChanges);
router.get("/:id", getMouldChange);
router.put("/:id", updateMouldChange);
router.delete("/:id", deleteMouldChange);

router.patch("/:id/start", startMouldChange);
router.patch("/:id/complete", completeMouldChange);
router.patch("/:id/cancel", cancelMouldChange);

module.exports = router;
