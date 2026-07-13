const Operator = require("../models/operatorModel");

// Get All Operators (now supports pagination + filters + performance)
// Query params: page, limit, search, shift, hall
const getOperators = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
    const { search = "", shift = "", hall = "" } = req.query;

    const { rows, total } = await Operator.getAllOperators({ page, limit, search, shift, hall });

    res.status(200).json({
      success: true,
      count: rows.length,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      data: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Operator By ID (includes performance)
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
    const { operator_name, operator_code, shift, hall } = req.body;

    if (!operator_name?.trim() || !operator_code?.trim() || !shift?.trim() || !hall?.trim()) {
      return res.status(400).json({
        success: false,
        message: "operator_name, operator_code, shift and hall are all required",
      });
    }

    const result = await Operator.createOperator(req.body);
    console.log("Operator created with ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Operator created successfully",
      insertId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "operator_code already exists",
      });
    }

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
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete this operator: production entries already reference them.",
      });
    }

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

// NEW: distinct shift/hall values for filter dropdowns
const getOperatorMeta = async (req, res) => {
  try {
    const meta = await Operator.getOperatorMeta();
    console.log("Hello there")

    res.status(200).json({
      success: true,
      shifts: meta.shifts,
      halls: meta.halls,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// NEW: best operators by target vs actual completion %
const getTopPerformers = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 50);

    const data = await Operator.getTopPerformers(limit);

    res.status(200).json({
      success: true,
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

// NEW: export operators (respects search/shift/hall filters, ignores pagination) as .xlsx
const exportOperators = async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const { search = "", shift = "", hall = "" } = req.query;

    const rows = await Operator.getOperatorsForExport({ search, shift, hall });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Operators");

    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Operator Name", key: "operator_name", width: 26 },
      { header: "Operator Code", key: "operator_code", width: 18 },
      { header: "Hall", key: "hall", width: 14 },
      { header: "Shift", key: "shift", width: 10 },
      { header: "Total Target Qty", key: "total_target", width: 16 },
      { header: "Total Actual Qty", key: "total_actual", width: 16 },
      { header: "Performance %", key: "performance", width: 14 },
      { header: "Created At", key: "created_at", width: 20 },
    ];

    sheet.getRow(1).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="operators_export_${Date.now()}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
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
  getOperatorMeta,
  getTopPerformers,
  exportOperators,
};