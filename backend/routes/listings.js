"use strict";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/Listing");

const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyVendor = require("../middleware/verifyVendor");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pick = (obj, allowed) =>
  Object.fromEntries(
    Object.entries(obj).filter(([k]) => allowed.includes(k))
  );

const ALLOWED_FIELDS = [
  "title",
  "description",
  "pricePerNight",
  "images",
  "location",
  "county",
  "town",
  "maxGuests",
  "bedrooms",
  "bathrooms",
  "amenities",
  "checkInTime",
  "checkOutTime",
  "minimumStay",
  "instantBook",
  "rules",
];

// ─────────────────────────────────────────────
// PUBLIC: GET ALL (FILTERED)
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { status: "approved", active: true };

    if (req.query.county) {
      filter.county = { $regex: escapeRegex(req.query.county), $options: "i" };
    }

    if (req.query.town) {
      filter.town = { $regex: escapeRegex(req.query.town), $options: "i" };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerNight = {};
      if (req.query.minPrice)
        filter.pricePerNight.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        filter.pricePerNight.$lte = Number(req.query.maxPrice);
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sellerId", "name profilePicture"),
      Listing.countDocuments(filter),
    ]);

    res.json({ listings, total, page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// PUBLIC: GET ONE + ATOMIC VIEW INCREMENT
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid ID" });

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views_count: 1 } },
      { new: true }
    ).populate("sellerId", "name profilePicture");

    if (!listing) return res.status(404).json({ error: "Not found" });

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// VENDOR: CREATE
// ─────────────────────────────────────────────
router.post("/", verifyToken, verifyVendor, async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_FIELDS);

    if (!data.title || !data.pricePerNight || !data.maxGuests) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const listing = new Listing({
      ...data,
      sellerId: req.user.id,
      status: "pending",
    });

    await listing.save();

    res.status(201).json({ message: "Submitted", listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// VENDOR: UPDATE
// ─────────────────────────────────────────────
router.patch("/:id", verifyToken, verifyVendor, async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid ID" });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Not found" });

    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updates = pick(req.body, ALLOWED_FIELDS);

    if (listing.status === "approved") {
      updates.status = "pending";
    }

    Object.assign(listing, updates);
    await listing.save();

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid ID" });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Not found" });

    if (
      listing.sellerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await listing.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// LIKE (ATOMIC)
// ─────────────────────────────────────────────
router.patch("/:id/like", verifyToken, async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ error: "Invalid ID" });

    const result = await Listing.updateOne(
      { _id: req.params.id, likedBy: { $ne: req.user.id } },
      {
        $inc: { likes_count: 1 },
        $addToSet: { likedBy: req.user.id },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Already liked" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// REVIEW (ATOMIC, NO DUPLICATES)
// ─────────────────────────────────────────────
router.post("/:id/review", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    const result = await Listing.updateOne(
      { _id: req.params.id, "reviews.userId": { $ne: req.user.id } },
      {
        $push: {
          reviews: {
            userId: req.user.id,
            userName: req.user.name,
            rating,
            comment,
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Already reviewed" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// BOOKING (ANTI-OVERLAP)
// ─────────────────────────────────────────────
router.post("/:id/book", verifyToken, async (req, res) => {
  try {
    const { checkIn, checkOut } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ error: "Invalid dates" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Not found" });

    const overlap = listing.bookings.some(
      (b) => start < b.checkOut && end > b.checkIn
    );

    if (overlap) {
      return res.status(400).json({ error: "Dates unavailable" });
    }

    listing.bookings.push({
      checkIn: start,
      checkOut: end,
      bookedBy: req.user.id,
      status: "pending",
    });

    await listing.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;