const express = require("express");

const router = express.Router();

const productionEntryController = require("../controllers/productionEntryController");
const authMiddleware = require("../middlewares/authMiddleware");

// FIX: none of these routes were protected — anyone with the URL (no
// login required at all) could read, create, update, or delete
// production entries. Every route below now requires a valid session
// (cookie or bearer token) via authMiddleware before it runs.
router.use(authMiddleware);

// ===========================================
// GET ALL PRODUCTION ENTRIES
// ===========================================

router.get("/", productionEntryController.getAllProductionEntries);

// ===========================================
// GET PRODUCTION ENTRY BY ID
// ===========================================

router.get("/:id", productionEntryController.getProductionEntryById);

// ===========================================
// CREATE PRODUCTION ENTRY
// ===========================================

router.post("/", productionEntryController.createProductionEntry);

// ===========================================
// UPDATE PRODUCTION ENTRY
// ===========================================

router.put("/:id", productionEntryController.updateProductionEntry);

// ===========================================
// DELETE PRODUCTION ENTRY
// ===========================================

router.delete("/:id", productionEntryController.deleteProductionEntry);

module.exports = router;
