// routes/customDesign.js
"use strict";

const express     = require("express");
const router      = express.Router();
const Request     = require("../models/request");
const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");

const VALID_STATUSES = new Set(["new", "contacted", "in-progress", "completed"]);
const MAX_LIMIT      = 50;

const internalError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "An unexpected error occurred." });
};

// Public — submit a custom design request
router.post("/custom-design", async (req, res) => {
  try {
    const {
      name, email, phone,
      projectType, rooms, budget, description,
    } = req.body;

    const newRequest = new Request({
      name,
      email,
      phone,
      projectType,
      rooms,
      budget,
      description,
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Request submitted successfully." });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    internalError(res, err);
  }
});

// Admin — get all requests with pagination
router.get("/custom-design", verifyToken, verifyAdmin, async (req, res) => {
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

    const [requests, total] = await Promise.all([
      Request.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Request.countDocuments(filter),
    ]);

    res.json({ requests, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    internalError(res, err);
  }
});

// Admin — update status only
router.patch("/custom-design/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required." });
    }
    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Request not found." });

    res.json(updated);
  } catch (err) {
    internalError(res, err);
  }
});

// Admin — delete a request
router.delete("/custom-design/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: "Request not found." });
    res.json({ success: true });
  } catch (err) {
    internalError(res, err);
  }
});

module.exports = router;