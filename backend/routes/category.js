const express = require("express");
const Plan = require("../models/Plan");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Plan.aggregate([
      {
        $group: {
          _id: "$subCategoryGroup",
          count: { $sum: 1 },
          image: { $first: "$planImageURLs" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
