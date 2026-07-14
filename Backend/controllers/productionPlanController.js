const model = require("../models/productionPlanModel");

exports.checkPlan = async (req, res) => {
  try {
    const { date, hall, shift } = req.query;
    if (!date || !hall || !shift) {
      return res
        .status(400)
        .json({ message: "date, hall, shift are required" });
    }
    const existing = await model.checkExistingPlan(date, hall, shift);
    res.json({ exists: !!existing, plan_id: existing?.plan_id || null });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to check plan" });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { planning_date, hall, shift, machines } = req.body;
    if (!planning_date || !hall || !shift) {
      return res
        .status(400)
        .json({ message: "planning_date, hall, shift are required" });
    }
    if (!machines || machines.length === 0) {
      return res.status(400).json({ message: "machines array is required" });
    }

    const existing = await model.checkExistingPlan(planning_date, hall, shift);
    if (existing) {
      const plan = await model.getPlanById(existing.plan_id);
      return res.status(200).json(plan);
    }

    const planId = await model.createPlan({
      planning_date,
      hall,
      shift,
      machines,
      created_by: req.user.id,
    });

    const plan = await model.getPlanById(planId);
    res.status(201).json(plan);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message || "Failed to create plan" });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await model.getPlanById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch plan" });
  }
};

exports.updateDetail = async (req, res) => {
  try {
    const planId = await model.updateDetail(req.params.detailId, req.body);
    const plan = await model.getPlanById(planId);
    res.json(plan);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update row" });
  }
};

exports.publishPlan = async (req, res) => {
  try {
    await model.publishPlan(req.params.planId, req.user.id);
    const plan = await model.getPlanById(req.params.planId);
    res.json(plan);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to publish plan" });
  }
};