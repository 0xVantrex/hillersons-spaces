// routes/categories.js
"use strict";

const express = require("express");
const router  = express.Router();
const Plan    = require("../models/Plan");

router.get("/", async (req, res) => {
  try {
    const categories = await Plan.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id:   { main: "$subCategoryGroup", sub: "$subCategory" },
          count: { $sum: 1 },
          image: { $first: "$planImageURLs" },
        },
      },
      {
        $group: {
          _id: "$_id.main",
          subcategories: {
            $push: {
              name:  "$_id.sub",
              count: "$count",
              image: "$image",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(categories);
  } catch (err) {
    console.error("Categories fetch error:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

module.exports = router;