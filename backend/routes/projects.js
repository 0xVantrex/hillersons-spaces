//routes/projects.js
const express = require("express");
const Plan = require("../models/Plan");
const router = express.Router();

//GET projects with filters
router.get("/", async (req, res) => {
  try {
    const { subCategoryGroup, subCategory, sortBy, minPrice, maxPrice } =
      req.query;

    const filter = {};
    if (subCategoryGroup) filter.subCategoryGroup = subCategoryGroup;
    if (subCategory) filter.subCategory = subCategory;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $gte: Number(maxPrice) };

    let query = Plan.find(filter);

    if (sortBy === " price-low") query = query.sort({ price: 1 });
    else if (sortBy === "price-high") query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const projects = await query.exec();
    res.json(projects);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
