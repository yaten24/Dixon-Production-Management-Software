const express = require("express");

const router = express.Router();

const {
    addMachine,
    getMachines,
    getMachineById,
    updateMachine,
    updateMachineStatus,
    deleteMachine,
} = require("../controllers/machine.controller");

// Get All Machines
router.get("/", getMachines);

// Get Single Machine
router.get("/:id", getMachineById);

// Add Machine
router.post("/", addMachine);

// Update Complete Machine
router.put("/:id", updateMachine);

// Update Only Status
router.patch("/:id/status", updateMachineStatus);

// Delete Machine
router.delete("/:id", deleteMachine);

module.exports = router;