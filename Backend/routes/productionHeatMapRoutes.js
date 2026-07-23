// backend/routes/productionHeatmap.routes.js
const express = require("express");
const router = express.Router();
const { getHourlyHeatmap } = require("../services/productionHeatmapService");

// GET /api/production/halls/:hallId/heatmap?date=YYYY-MM-DD
router.get("/halls/:hallId/heatmap", async (req, res) => {
  try {
    const { hallId } = req.params;
    const { date } = req.query;
    const data = await getHourlyHeatmap({ hallId, date });
    res.json({ success: true, data });
  } catch (err) {
    console.error("[production-heatmap]", err);
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
  }
});

module.exports = router;

// In your main app/server file:
//   app.use("/api/production", require("./routes/productionHeatmap.routes"));
// which exposes: GET /api/production/halls/:hallId/heatmap