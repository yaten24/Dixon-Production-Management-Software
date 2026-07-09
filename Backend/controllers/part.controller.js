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

exports.getAllParts = async (req, res) => {
  try {
    const parts = await Part.findAll();

    res.json({
      success: true,
      count: parts.length,
      data: parts,
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

    await Part.update(req.params.id, req.body);

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
    console.log("Search Parts API called with keyword:", req.query.keyword);

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
