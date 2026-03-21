// routes/inquiries.js
"use strict";

const express     = require("express");
const router      = express.Router();
const Inquiry     = require("../models/Inquiry");
const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");

const VALID_STATUSES = new Set(["new", "in-progress", "resolved"]);
const MAX_LIMIT      = 50;

const internalError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "An unexpected error occurred." });
};

// Public — submit an inquiry
router.post("/", async (req, res) => {
  try {
    const {
      name, email, phone,
      projectType, rooms, budget, description,
    } = req.body;

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      projectType,
      rooms,
      budget,
      description,
    });

    res.status(201).json({ success: true, message: "Inquiry submitted successfully." });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    internalError(res, err);
  }
});

// Admin — get all inquiries with pagination
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      if (!VALID_STATUSES.has(req.query.status)) {
        return res.status(400).json({ error: "Invalid status value." });
      }
      filter.status = req.query.status;
    }

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Inquiry.countDocuments(filter),
    ]);

    res.json({ inquiries, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    internalError(res, err);
  }
});

// Admin — update status only
router.patch("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required." });
    }
    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Inquiry not found." });

    res.json(updated);
  } catch (err) {
    internalError(res, err);
  }
});

// Admin — delete an inquiry
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Inquiry.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: "Inquiry not found." });
    res.json({ success: true });
  } catch (err) {
    internalError(res, err);
  }
});

module.exports = router;