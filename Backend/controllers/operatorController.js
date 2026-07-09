const Operator = require("../models/operatorModel");

// Get All Operators
const getOperators = async (req, res) => {
  try {
    const data = await Operator.getAllOperators();

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Operator By ID
const getOperator = async (req, res) => {
  try {
    const data = await Operator.getOperatorById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Operator not found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Operator
const addOperator = async (req, res) => {
  try {
    const result = await Operator.createOperator(req.body);

    res.status(201).json({
      success: true,
      message: "Operator created successfully",
      insertId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Operator
const editOperator = async (req, res) => {
  try {
    await Operator.updateOperator(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Operator updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Operator
const removeOperator = async (req, res) => {
  try {
    await Operator.deleteOperator(req.params.id);

    res.status(200).json({
      success: true,
      message: "Operator deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOperatorByCode = async (req, res) => {
  try {
    const { operatorCode } = req.params;

    const operator = await Operator.getOperatorByCode(operatorCode);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Operator not found",
      });
    }

    res.status(200).json({
      success: true,
      data: operator,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  getOperators,
  getOperator,
  addOperator,
  editOperator,
  removeOperator,
  getOperatorByCode,
};

