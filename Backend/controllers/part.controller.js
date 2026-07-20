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

// NEW: quick-add used by the Production Entry screen's inline "+ Add Part"
// mini-forms. Only part_name + actual_cycle_time are required from the
// user — product_category/source/customer are set to "Unassigned" so they
// don't block creation (edit them properly later from the Parts module),
// and standard_cycle_time defaults to the given actual_cycle_time since
// there's no better number yet. Returns insertId + the created row so the
// frontend can immediately wire part_id into the production entry without
// a second round trip.
exports.quickAddPart = async (req, res) => {
  try {
    const { part_name, actual_cycle_time, part_number } = req.body;

    const ct = Number(actual_cycle_time);

    if (!part_name || !part_name.trim() || !ct || ct <= 0) {
      return res.status(400).json({
        success: false,
        message: "Part name and actual cycle time are required.",
      });
    }

    const finalPartNumber =
      part_number && part_number.trim()
        ? part_number.trim()
        : `QUICK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const exist = await Part.findByPartNumber(finalPartNumber);

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Part Number Already Exists.",
      });
    }

    const result = await Part.create({
      part_number: finalPartNumber,
      part_name: part_name.trim(),
      product_category: "Unassigned",
      source: "Unassigned",
      customer: "Unassigned",
      standard_cycle_time: ct,
      actual_cycle_time: ct,
      status: "Active",
    });

    res.status(201).json({
      success: true,
      message: "Part added successfully.",
      insertId: result.insertId,
      data: {
        id: result.insertId,
        part_number: finalPartNumber,
        part_name: part_name.trim(),
        standard_cycle_time: ct,
        actual_cycle_time: ct,
        status: "Active",
      },
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

// NEW: standalone actual-cycle-time update — used by the editable "Actual CT"
// field in the Production Planning table / Mould Change modal. Runs as a
// plain pooled query (no open transaction to join), so it calls
// Part.updateActualCycleTime1, NOT the transactional
// Part.updateActualCycleTime used inside production-entry saves.
exports.updateActualCycleTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_cycle_time } = req.body;

    const ct = Number(actual_cycle_time);

    if (!Number.isFinite(ct) || ct <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid actual_cycle_time is required.",
      });
    }

    const part = await Part.findById(id);
    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Part Not Found.",
      });
    }

    const updated = await Part.updateActualCycleTime1(id, ct);

    res.json({
      success: true,
      message: "Actual cycle time updated successfully.",
      data: updated,
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

exports.searchParts = async (req, res) => {
  const { q } = req.query;
  const [rows] = await pool.query(
    `SELECT id, part_name, part_number, actual_cycle_time FROM parts
     WHERE part_name LIKE ? OR part_number LIKE ? LIMIT 20`,
    [`%${q}%`, `%${q}%`]
  );
  res.json({ success: true, data: rows });
};
// route: router.get('/search', ctrl.searchParts);