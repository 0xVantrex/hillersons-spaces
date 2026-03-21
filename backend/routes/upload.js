// routes/upload.js
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const verifyAuth = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");
const Listing = require("../models/Listing");
const { uploadSecure, validateImageContents } = require("../middleware/Uploadsecure");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helper: upload a single buffer to Cloudinary ──────────────────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"], // Cloudinary-side enforcement too
        transformation: [{ quality: "auto", fetch_format: "auto" }], // auto-optimize
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/upload/listing/:id
// Upload images for a vendor listing
// ── Vendor can only upload to their OWN listing ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
  "/listing/:id",
  verifyAuth,
  uploadSecure.array("images", 10), // field name: "images", max 10
  validateImageContents,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      // ── Ownership check ──────────────────────────────────────────────────────
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      // Vendors can only upload to their own listings
      // Admins can upload to any listing
      if (
        listing.sellerId.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          error: "You are not authorized to upload images to this listing",
        });
      }

      // ── Isolated folder per vendor + listing ─────────────────────────────────
      // Structure: hillersons/listings/{vendorId}/{listingId}/
      // This means vendors can NEVER see or access each other's folders
      const folder = `hillersons/listings/${listing.sellerId}/${listing._id}`;

      // ── Upload all files in parallel ─────────────────────────────────────────
      const uploadedUrls = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, folder))
      );

      // ── Append new URLs to listing.images ────────────────────────────────────
      listing.images = [...(listing.images || []), ...uploadedUrls];
      await listing.save();

      res.json({
        message: `${uploadedUrls.length} image(s) uploaded successfully`,
        images: uploadedUrls,
        allImages: listing.images,
      });
    } catch (err) {
      console.error("Listing image upload error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/upload/listing/:id/image
// Remove a specific image from a listing
// ═══════════════════════════════════════════════════════════════════════════════
router.delete("/listing/:id/image", verifyAuth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl is required" });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Ownership check
    if (
      listing.sellerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Extract Cloudinary public_id from URL and delete
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
    try {
      const urlParts = imageUrl.split("/upload/");
      if (urlParts.length === 2) {
        const publicIdWithExt = urlParts[1].replace(/^v\d+\//, ""); // remove version
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudErr) {
      console.warn("Cloudinary delete failed (continuing):", cloudErr.message);
    }

    // Remove from listing
    listing.images = (listing.images || []).filter((img) => img !== imageUrl);
    await listing.save();

    res.json({ message: "Image removed", allImages: listing.images });
  } catch (err) {
    console.error("Image delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/upload/bnb/:id  (admin only — for Hillersons own BNBs)
// Same as listing upload but only admin can use this
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
  "/bnb/:id",
  verifyAdmin,
  uploadSecure.array("images", 10),
  validateImageContents,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const listing = await Listing.findOne({ _id: req.params.id, listingType: "bnb" });
      if (!listing) return res.status(404).json({ error: "BNB listing not found" });

      // Admin BNBs go in a dedicated admin folder
      const folder = `hillersons/bnb/admin/${listing._id}`;

      const uploadedUrls = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, folder))
      );

      listing.images = [...(listing.images || []), ...uploadedUrls];
      await listing.save();

      res.json({
        message: `${uploadedUrls.length} image(s) uploaded`,
        images: uploadedUrls,
        allImages: listing.images,
      });
    } catch (err) {
      console.error("BNB image upload error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;