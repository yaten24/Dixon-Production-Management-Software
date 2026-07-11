const express = require("express");

const router = express.Router();

const {
  addPart,
  getAllParts,
  getPartById,
  updatePart,
  deletePart,
  searchParts,
  getFilterOptions,
} = require("../controllers/part.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", addPart);
router.get("/", getAllParts);

router.get("/search", searchParts);

// IMPORTANT: this must come BEFORE router.get("/:id", ...) — otherwise
// Express matches "/filter-options" as :id="filter-options" and it never
// reaches this handler.
router.get("/filter-options", getFilterOptions);

router.get("/:id", getPartById);
router.put("/:id", updatePart);
router.delete("/:id", deletePart);

module.exports = router;