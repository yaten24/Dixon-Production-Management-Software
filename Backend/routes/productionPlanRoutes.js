const express = require("express");
const router = express.Router();
const controller = require("../controllers/productionPlanController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/check", controller.checkPlan);

router.post("/", controller.createPlan);
router.get("/:planId", controller.getPlan);
router.put("/detail/:detailId", controller.updateDetail);
router.put("/:planId/publish", controller.publishPlan);
// ^ was commented out — enabled so the frontend Publish button works.
// If you want role-gating (e.g. supervisor/admin only), wrap with your
// existing requireRole() factory the same way other routes use it:
// router.put("/:planId/publish", requireRole("supervisor", "admin"), controller.publishPlan);

module.exports = router;