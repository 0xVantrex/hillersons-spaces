"use strict";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const verifyAuth = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");
const Listing = require("../models/Listing");
const { uploadSecure, validateImageContents } = require("../middleware/Uploadsecure");

// ─────────────────────────────────────────────
// CONFIG
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

// Prevent exceeding max images
const MAX_IMAGES = 15;

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// Extract safe public_id
const extractPublicId = (url) => {
  try {
    const parts = url.split("/upload/");
    if (parts.length !== 2) return null;

    const cleaned = parts[1]
      .replace(/^v\d+\//, "")
      .replace(/\.[^/.]+$/, "");

    return cleaned;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// UPLOAD TO LISTING (VENDOR)
// ─────────────────────────────────────────────
router.post(
  "/listing/:id",
  verifyAuth,
  uploadSecure.array("images", 10),
  validateImageContents,
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      // Ownership check
      if (
        listing.sellerId.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Prevent image overflow (anti-DoS)
      const currentCount = listing.images?.length || 0;
      if (currentCount + req.files.length > MAX_IMAGES) {
        return res.status(400).json({
          error: `Max ${MAX_IMAGES} images allowed`,
        });
      }

      const folder = `hillersons/listings/${listing.sellerId}/${listing._id}`;

      // Upload in parallel
      const uploadedUrls = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer, folder)
        )
      );

      // Prevent duplicates
      const uniqueNew = uploadedUrls.filter(
        (url) => !(listing.images || []).includes(url)
      );

      listing.images = [...(listing.images || []), ...uniqueNew];
      await listing.save();

      res.json({
        message: `${uniqueNew.length} image(s) uploaded`,
        images: uniqueNew,
        total: listing.images.length,
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ─────────────────────────────────────────────
// DELETE IMAGE
// ─────────────────────────────────────────────
router.delete("/listing/:id/image", verifyAuth, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({ error: "Valid imageUrl required" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (
      listing.sellerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Ensure image belongs to listing (prevents random deletion attempts)
    if (!(listing.images || []).includes(imageUrl)) {
      return res.status(400).json({ error: "Image not found in listing" });
    }

    const publicId = extractPublicId(imageUrl);

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Cloudinary delete failed:", err.message);
      }
    }

    listing.images = listing.images.filter((img) => img !== imageUrl);
    await listing.save();

    res.json({
      message: "Image removed",
      total: listing.images.length,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────
// ADMIN BNB UPLOAD
// ─────────────────────────────────────────────
router.post(
  "/bnb/:id",
  verifyAdmin,
  uploadSecure.array("images", 10),
  validateImageContents,
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const listing = await Listing.findOne({
        _id: req.params.id,
        listingType: "bnb",
      });

      if (!listing) {
        return res.status(404).json({ error: "BNB not found" });
      }

      const currentCount = listing.images?.length || 0;
      if (currentCount + req.files.length > MAX_IMAGES) {
        return res.status(400).json({
          error: `Max ${MAX_IMAGES} images allowed`,
        });
      }

      const folder = `hillersons/bnb/admin/${listing._id}`;

      const uploadedUrls = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer, folder)
        )
      );

      listing.images = [
        ...(listing.images || []),
        ...uploadedUrls,
      ];

      await listing.save();

      res.json({
        message: `${uploadedUrls.length} uploaded`,
        total: listing.images.length,
      });
    } catch (err) {
      console.error("BNB UPLOAD ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;