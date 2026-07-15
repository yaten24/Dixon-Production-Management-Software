const model = require("../models/mouldChangeModel");
const planModel = require("../models/productionPlanModel");

exports.createMouldChange = async (req, res) => {
  try {
    const {
      plan_id,
      detail_id,
      machine_code,
      old_part_id,
      new_part_id,
      planned_date,
      planned_shift,
      time_slot,
      standard_cycle_time,
      actual_cycle_time,
      target_qty,
      reason,
      remarks,
    } = req.body;

    if (!machine_code) {
      return res.status(400).json({ message: "machine_code is required" });
    }

    const id = await model.createMouldChange({
      change_type: "Planned",
      plan_id,
      detail_id,
      machine_code,
      old_part_id,
      new_part_id,
      planned_date,
      planned_shift,
      time_slot,
      standard_cycle_time,
      actual_cycle_time,
      target_qty,
      reason,
      remarks,
      created_by: req.user.id,
    });

    const plan = plan_id ? await planModel.getPlanById(plan_id) : null;
    res.status(201).json({ mould_change_id: id, plan });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create mould change" });
  }
};

exports.updateMouldChange = async (req, res) => {
  try {
    await model.updateMouldChange(req.params.id, req.body);
    const mc = await model.getMouldChangeById(req.params.id);
    const plan = mc?.plan_id ? await planModel.getPlanById(mc.plan_id) : null;
    res.json({ mould_change: mc, plan });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update mould change" });
  }
};

exports.deleteMouldChange = async (req, res) => {
  try {
    const mc = await model.getMouldChangeById(req.params.id);
    await model.deleteMouldChange(req.params.id);
    const plan = mc?.plan_id ? await planModel.getPlanById(mc.plan_id) : null;
    res.json({ plan });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete mould change" });
  }
};

exports.getByPlan = async (req, res) => {
  try {
    res.json(await model.getMouldChangesByPlan(req.params.planId));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch mould changes" });
  }
};
