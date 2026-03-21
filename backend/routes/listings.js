// routes/listings.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const verifyAuth = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyVendor = require("../middleware/verifyVendor");

// ── PUBLIC: Get approved listings (with filters) ──────────────────────────────
router.get("/", async (req, res) => {
  try {
    const {
      listingType, county, town, featured,
      minPrice, maxPrice, status, page = 1, limit = 20,
    } = req.query;

    const filter = { status: "approved", active: true };

    if (listingType) filter.listingType = listingType;
    if (county) filter.county = county;
    if (town) filter.town = new RegExp(town, "i");
    if (featured === "true") filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("sellerId", "name email phone profilePicture"),
      Listing.countDocuments(filter),
    ]);

    res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUBLIC: Get single listing ─────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("sellerId", "name email phone profilePicture vendorProfile");
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Increment view count
    listing.views_count = (listing.views_count || 0) + 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── VENDOR: Create listing (goes to pending) ───────────────────────────────────
router.post("/", verifyVendor, async (req, res) => {
  try {
    const listing = new Listing({
      ...req.body,
      sellerId: req.user.id,
      sellerName: req.user.name,
      sellerEmail: req.user.email,
      status: "pending", // always pending until admin approves
    });
    await listing.save();
    res.status(201).json({ message: "Listing submitted for approval.", listing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── VENDOR: Update own listing ─────────────────────────────────────────────────
router.patch("/:id", verifyVendor, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Vendors can only edit their own listings; admins can edit any
    if (
      listing.sellerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized to edit this listing." });
    }

    // Editing a live listing re-triggers approval
    if (listing.status === "approved" && req.user.role !== "admin") {
      req.body.status = "pending";
    }

    Object.assign(listing, req.body);
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── VENDOR: Delete own listing ─────────────────────────────────────────────────
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (
      listing.sellerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized." });
    }

    await listing.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Get ALL listings including pending/rejected ────────────────────────
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const { status, listingType, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (listingType) filter.listingType = listingType;

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("sellerId", "name email role vendorProfile"),
      Listing.countDocuments(filter),
    ]);

    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Approve listing ────────────────────────────────────────────────────
router.patch("/admin/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: req.user.id,
        rejectionNote: null,
      },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing approved.", listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Reject listing ─────────────────────────────────────────────────────
router.patch("/admin/:id/reject", verifyAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionNote: note || "No reason provided." },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing rejected.", listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Toggle featured ────────────────────────────────────────────────────
router.patch("/admin/:id/featured", verifyAdmin, async (req, res) => {
  try {
    const { featured, featuredUntil } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { featured, featuredUntil: featuredUntil || null },
      { new: true }
    );
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── AUTH: Like a listing ──────────────────────────────────────────────────────
router.patch("/:id/like", verifyAuth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes_count: 1 } },
      { new: true }
    );
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── AUTH: Add review ──────────────────────────────────────────────────────────
router.post("/:id/review", verifyAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // One review per user
    const existing = listing.reviews.find(
      (r) => r.userId.toString() === req.user.id
    );
    if (existing) {
      return res.status(400).json({ error: "You have already reviewed this listing." });
    }

    listing.reviews.push({
      userId: req.user.id,
      userName: req.user.name,
      rating,
      comment,
    });
    listing.updateAverageRating();
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── VENDOR: Get own listings ──────────────────────────────────────────────────
router.get("/vendor/mine", verifyVendor, async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;