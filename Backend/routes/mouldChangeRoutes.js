const express = require("express");
const router = express.Router();
const controller = require("../controllers/mouldChangeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", controller.createMouldChange);
router.put("/:id", controller.updateMouldChange);
router.delete("/:id", controller.deleteMouldChange);
router.get("/plan/:planId", controller.getByPlan);

module.exports = router;