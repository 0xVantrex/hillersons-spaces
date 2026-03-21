"use strict";

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const verifyAuth = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── APPLY TO BECOME A VENDOR ──────────────────────────────────────
router.post("/apply", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent invalid state changes
    if (["approved", "pending", "banned"].includes(user.vendorStatus)) {
      const messages = {
        approved: "You are already an approved vendor.",
        pending: "Your application is already under review.",
        banned: "Your account has been banned.",
      };
      return res.status(400).json({ error: messages[user.vendorStatus] || "Cannot apply" });
    }

    const {
      role,          // "vendor" | "bnbHost" | "contractor"
      businessName,
      businessDescription,
      location,
      phone,
      website,
      specialization, // optional for contractors
    } = req.body;

    const allowedRoles = ["vendor", "bnbHost", "contractor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid vendor role." });
    }

    user.role = role;
    user.vendorStatus = "pending";
    user.vendorProfile = {
      businessName: businessName || "",
      businessDescription: businessDescription || "",
      location: location || "",
      phone: phone || user.phone,
      website: website || "",
      specialization: specialization || "",
      verified: false,
    };

    await user.save();
    res.json({ message: "Vendor application submitted. Awaiting admin approval." });
  } catch (err) {
    console.error("Vendor apply error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET OWN VENDOR PROFILE ───────────────────────────────────────
router.get("/profile", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -resetToken -resetTokenExpiry");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── UPDATE VENDOR PROFILE ────────────────────────────────────────
router.patch("/profile", verifyAuth, async (req, res) => {
  try {
    const allowed = ["businessName", "businessDescription", "location", "phone", "website", "specialization"];
    const updates = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[`vendorProfile.${field}`] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password -resetToken -resetTokenExpiry");

    res.json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN: GET ALL VENDOR APPLICATIONS ───────────────────────────
router.get("/admin/applications", verifyAdmin, async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const vendors = await User.find({
      vendorStatus: status,
      role: { $in: ["vendor", "bnbHost", "contractor"] },
    })
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN: APPROVE VENDOR ───────────────────────────────────────
router.patch("/admin/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid user ID" });

    const user = await User.findByIdAndUpdate(
      id,
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
    console.error("Approve vendor error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN: REJECT VENDOR ────────────────────────────────────────
router.patch("/admin/:id/reject", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid user ID" });

    const note = req.body.note?.trim() || "Application rejected.";

    const user = await User.findByIdAndUpdate(
      id,
      {
        vendorStatus: "rejected",
        role: "user",
        vendorStatusNote: note,
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Vendor rejected.", user });
  } catch (err) {
    console.error("Reject vendor error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN: BAN VENDOR ───────────────────────────────────────────
router.patch("/admin/:id/ban", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid user ID" });

    const note = req.body.note?.trim() || "Account banned.";

    const user = await User.findByIdAndUpdate(
      id,
      {
        vendorStatus: "banned",
        role: "user",
        vendorStatusNote: note,
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Vendor banned.", user });
  } catch (err) {
    console.error("Ban vendor error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN: GET ALL VENDORS ──────────────────────────────────────
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const vendors = await User.find({
      role: { $in: ["vendor", "bnbHost", "contractor"] },
    })
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (err) {
    console.error("Get all vendors error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;