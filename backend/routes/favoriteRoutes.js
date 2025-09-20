const express = require("express");
const Plan = require("../models/plan");

const router = express.Router();

router.patch("/:id/favorite", async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    plan.favorites_count = (plan.favorites_count || 0) + 1;
    await plan.save();

    res.json({
      message: "Plan favorited",
      favorites_count: plan.favorites_count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
