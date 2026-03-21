"use strict";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

const verifyAdmin = require("../middleware/verifyAdmin");
const Plan = require("../models/Plan");
const upload = require("../middleware/upload");

// ─────────────────────────────────────────────
// CONFIG (move to separate config file ideally)
// ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const toBoolean = (val) => val === "true" || val === true;

const sanitize = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, ""); // basic XSS strip
};

// Validate image mimetype
const isValidImage = (file) =>
  ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);

// Upload helper (parallel safe)
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

// ─────────────────────────────────────────────
// UPLOAD PLAN (SECURE)
// ─────────────────────────────────────────────
router.post(
  "/upload",
  verifyAdmin,
  upload.fields([
    { name: "planImages", maxCount: 10 },
    { name: "finalImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        area,
        rooms,
        floorCount,
        subCategory,
        subCategoryGroup,
        premium,
        featured,
        newListing,
      } = req.body;

      // ── BASIC VALIDATION
      if (!title || !price) {
        return res.status(400).json({ error: "Title and price required" });
      }

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      // ── VALIDATE FILE TYPES
      const allFiles = [
        ...(req.files.planImages || []),
        ...(req.files.finalImages || []),
      ];

      for (const file of allFiles) {
        if (!isValidImage(file)) {
          return res.status(400).json({ error: "Invalid file type" });
        }
      }

      // ── PARALLEL UPLOADS (FASTER + SAFER)
      const planUploads = (req.files.planImages || []).map((file) =>
        uploadToCloudinary(file, `hillersons/plan/${uuidv4()}`)
      );

      const finalUploads = (req.files.finalImages || []).map((file) =>
        uploadToCloudinary(file, `hillersons/final/${uuidv4()}`)
      );

      const [planImages, finalImages] = await Promise.all([
        Promise.all(planUploads),
        Promise.all(finalUploads),
      ]);

      // ── CREATE PLAN
      const newPlan = new Plan({
        title: sanitize(title),
        description: sanitize(description),
        price: Number(price),
        area: Number(area) || 0,
        rooms: Number(rooms) || 0,
        floorCount: Number(floorCount) || 1,

        planImageURLs: planImages,
        finalImageURLs: finalImages,

        image: finalImages[0] || planImages[0] || "",

        subCategory: sanitize(subCategory),
        subCategoryGroup: sanitize(subCategoryGroup),

        premium: toBoolean(premium),
        featured: toBoolean(featured),
        newListing: toBoolean(newListing),
      });

      await newPlan.save();

      res.status(201).json({
        message: "Plan uploaded successfully",
        plan: newPlan,
      });
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ─────────────────────────────────────────────
// GET ALL PLANS (FILTERED + SAFE)
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.featured === "true") filter.featured = true;
    if (req.query.newListing === "true") filter.newListing = true;
    if (req.query.premium === "true") filter.premium = true;

    const plans = await Plan.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = plans.map((p) => {
      const finalImages = p.finalImageURLs || [];
      const planImages = p.planImageURLs || [];

      const mainImage =
        p.image || finalImages[0] || planImages[0] || "";

      return {
        ...p,
        image: mainImage,
        images:
          finalImages.length
            ? finalImages
            : planImages.length
            ? planImages
            : mainImage
            ? [mainImage]
            : [],
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// VIEW COUNT (ATOMIC)
// ─────────────────────────────────────────────
router.patch("/:id/view", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { $inc: { views_count: 1 } },
      { new: true }
    );

    if (!plan) return res.status(404).json({ error: "Not found" });

    res.json(plan);
  } catch (err) {
    console.error("VIEW ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;