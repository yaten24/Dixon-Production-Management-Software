const express = require("express");

const router = express.Router();

const {
  addPart,
  getAllParts,
  getPartById,
  updatePart,
  deletePart,
  searchParts,
} = require("../controllers/part.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.post("/", addPart);

router.get("/", getAllParts);

router.get("/search", searchParts);

router.get("/:id", getPartById);

router.put("/:id", updatePart);

router.delete("/:id", deletePart);

module.exports = router;
