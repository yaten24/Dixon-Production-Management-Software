const Part = require("../models/part.model");

exports.addPart = async (req, res) => {
  try {
    const {
      part_number,
      part_name,
      product_category,
      source,
      customer,
      standard_cycle_time,
      actual_cycle_time,
      status,
    } = req.body;

    if (
      !part_number ||
      !part_name ||
      !product_category ||
      !source ||
      !customer ||
      !standard_cycle_time
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    const exist = await Part.findByPartNumber(part_number);

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Part Number Already Exists.",
      });
    }

    await Part.create({
      part_number,
      part_name,
      product_category,
      source,
      customer,
      standard_cycle_time,
      actual_cycle_time: actual_cycle_time || 0,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Part Added Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATED: getAllParts now accepts ?page=&limit=&search=&category=&customer=&source=&status=
// Filters are applied in SQL against the WHOLE table (see Part.findAll /
// Part.count), so applying a filter returns every matching part across
// all pages, not just whatever happened to be loaded already. Default
// limit stays 100 for the first-load requirement.
exports.getAllParts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 100, 1);
    const offset = (page - 1) * limit;

    const filters = {
      search: req.query.search || "",
      category: req.query.category || "All",
      customer: req.query.customer || "All",
      source: req.query.source || "All",
      status: req.query.status || "All",
    };

    const [parts, total] = await Promise.all([
      Part.findAll({ limit, offset, ...filters }),
      Part.count(filters),
    ]);

    res.json({
      success: true,
      count: parts.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data: parts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// NEW: distinct filter-dropdown values across the whole table.
exports.getFilterOptions = async (req, res) => {
  try {
    const options = await Part.getFilterOptions();

    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Part Not Found.",
      });
    }

    res.json({
      success: true,
      data: part,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Part Not Found.",
      });
    }

    const {
      part_number,
      part_name,
      product_category,
      source,
      customer,
      standard_cycle_time,
      actual_cycle_time,
      status,
    } = req.body;

    if (
      !part_number ||
      !part_name ||
      !product_category ||
      !source ||
      !customer ||
      !standard_cycle_time
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    const duplicate = await Part.findByPartNumber(part_number);
    if (duplicate && duplicate.id !== part.id) {
      return res.status(400).json({
        success: false,
        message: "Part Number Already Exists.",
      });
    }

    await Part.update(req.params.id, {
      part_number,
      part_name,
      product_category,
      source,
      customer,
      standard_cycle_time,
      actual_cycle_time: actual_cycle_time || 0,
      status: status || "Active",
    });

    res.json({
      success: true,
      message: "Part Updated Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Part Not Found.",
      });
    }

    await Part.delete(req.params.id);

    res.json({
      success: true,
      message: "Part Deleted Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.searchParts = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const data = await Part.searchParts(keyword);

    res.json({
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