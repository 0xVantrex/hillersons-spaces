"use strict";

const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNumber = (val) => {
  const n = Number(val);
  return isNaN(n) ? null : n;
};

// ─────────────────────────────────────────────
// GET PROJECTS (SECURE + PAGINATED)
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const {
      subCategoryGroup,
      subCategory,
      sortBy,
      minPrice,
      maxPrice,
      page,
      limit,
    } = req.query;

    const filter = {};

    // ── SAFE FILTERING (STRING SANITIZED)
    if (subCategoryGroup) {
      filter.subCategoryGroup = {
        $regex: escapeRegex(subCategoryGroup),
        $options: "i",
      };
    }

    if (subCategory) {
      filter.subCategory = {
        $regex: escapeRegex(subCategory),
        $options: "i",
      };
    }

    // ── PRICE FILTER (FIXED BUG)
    const min = toNumber(minPrice);
    const max = toNumber(maxPrice);

    if (min !== null || max !== null) {
      filter.price = {};
      if (min !== null) filter.price.$gte = min;
      if (max !== null) filter.price.$lte = max;
    }

    // ── PAGINATION (ANTI-DOS)
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // ── SORTING (STRICT WHITELIST)
    let sort = { createdAt: -1 };

    if (sortBy === "price-low") sort = { price: 1 };
    else if (sortBy === "price-high") sort = { price: -1 };

    // ── EXECUTE
    const [projects, total] = await Promise.all([
      Plan.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Plan.countDocuments(filter),
    ]);

    res.json({
      projects,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("PROJECT FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;