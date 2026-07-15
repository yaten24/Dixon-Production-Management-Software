const express = require("express");
const router = express.Router();
const controller = require("../controllers/mouldChangeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", controller.createMouldChange);
router.get("/plan/:planId", controller.getByPlan);
router.get("/:id/detail", controller.getMouldChangeDetail);
router.put("/:id", controller.updateMouldChange);
router.delete("/:id", controller.deleteMouldChange);

module.exports = router;