const Machine = require("../models/machine.model");

// Add Machine
exports.addMachine = async (req, res) => {
    try {

        const {
            machine_code,
            machine_name,
            hall,
            status,
        } = req.body;

        if (!machine_code || !machine_name || !hall) {
            return res.status(400).json({
                success: false,
                message: "Machine Code, Machine Name and Hall are required",
            });
        }

        await Machine.create({
            machine_code,
            machine_name,
            hall,
            status: status || "Running",
        });

        res.status(201).json({
            success: true,
            message: "Machine Added Successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// Get All Machines
exports.getMachines = async (req, res) => {

    try {

        const machines = await Machine.getAll();

        res.status(200).json({
            success: true,
            data: machines,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// Get Machine By ID
exports.getMachineById = async (req, res) => {

    try {

        const { id } = req.params;

        const machine = await Machine.getById(id);

        if (!machine) {
            return res.status(404).json({
                success: false,
                message: "Machine Not Found",
            });
        }

        res.status(200).json({
            success: true,
            data: machine,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// Update Complete Machine
exports.updateMachine = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            machine_code,
            machine_name,
            hall,
            status,
        } = req.body;

        const result = await Machine.update(id, {
            machine_code,
            machine_name,
            hall,
            status,
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Machine Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Machine Updated Successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// Update Only Machine Status
exports.updateMachineStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            });
        }

        const result = await Machine.updateStatus(id, status);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Machine Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Machine Status Updated Successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// Delete Machine
exports.deleteMachine = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await Machine.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Machine Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Machine Deleted Successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};