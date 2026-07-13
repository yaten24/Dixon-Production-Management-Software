const express = require("express");

const router = express.Router();

const {
  addPart,
  quickAddPart,
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

// IMPORTANT: these must come BEFORE router.get("/:id", ...) — otherwise
// Express matches "/quick-add" / "/filter-options" as :id and they never
// reach the right handler.
router.get("/filter-options", getFilterOptions);
router.post("/quick-add", quickAddPart);

router.get("/:id", getPartById);
router.put("/:id", updatePart);
router.delete("/:id", deletePart);

module.exports = router;