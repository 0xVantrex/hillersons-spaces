// routes/vendor.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyAuth = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");

// ── Apply to become a vendor ──────────────────────────────────────────────────
router.post("/apply", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.vendorStatus === "approved") {
      return res.status(400).json({ error: "You are already an approved vendor." });
    }
    if (user.vendorStatus === "pending") {
      return res.status(400).json({ error: "Your application is already under review." });
    }
    if (user.vendorStatus === "banned") {
      return res.status(403).json({ error: "Your account has been banned." });
    }

    const {
      role,          // "vendor" | "bnbHost" | "contractor"
      businessName,
      businessDescription,
      location,
      phone,
      website,
      specialization, // for contractors
    } = req.body;

    const allowedRoles = ["vendor", "bnbHost", "contractor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid vendor role." });
    }

    user.role = role;
    user.vendorStatus = "pending";
    user.vendorProfile = {
      businessName,
      businessDescription,
      location,
      phone: phone || user.phone,
      website,
      specialization,
      verified: false,
    };

    await user.save();
    res.json({ message: "Vendor application submitted. Awaiting admin approval." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get own vendor profile ────────────────────────────────────────────────────
router.get("/profile", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -resetToken -resetTokenExpiry");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update vendor profile ─────────────────────────────────────────────────────
router.patch("/profile", verifyAuth, async (req, res) => {
  try {
    const allowed = ["businessName", "businessDescription", "location", "phone", "website", "specialization"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[`vendorProfile.${field}`] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true })
      .select("-password -resetToken -resetTokenExpiry");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Get all vendor applications ───────────────────────────────────────
router.get("/admin/applications", verifyAdmin, async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const vendors = await User.find({
      vendorStatus: status,
      role: { $in: ["vendor", "bnbHost", "contractor"] },
    }).select("-password -resetToken -resetTokenExpiry").sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Approve vendor ─────────────────────────────────────────────────────
router.patch("/admin/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        vendorStatus: "approved",
        "vendorProfile.verified": true,
        "vendorProfile.verifiedAt": new Date(),
        vendorStatusNote: null,
      },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Vendor approved.", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Reject vendor ──────────────────────────────────────────────────────
router.patch("/admin/:id/reject", verifyAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        vendorStatus: "rejected",
        role: "user",
        vendorStatusNote: note || "Application rejected.",
      },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Vendor rejected.", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Ban vendor ─────────────────────────────────────────────────────────
router.patch("/admin/:id/ban", verifyAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        vendorStatus: "banned",
        role: "user",
        vendorStatusNote: note || "Account banned.",
      },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Vendor banned.", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: Get all vendors ────────────────────────────────────────────────────
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const vendors = await User.find({
      role: { $in: ["vendor", "bnbHost", "contractor"] },
    }).select("-password -resetToken -resetTokenExpiry").sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;