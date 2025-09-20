const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const verifyAdmin = require("../middleware/verifyAdmin");
const Plan = require("../models/plan");
const upload = require("../middleware/upload");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload & save plan
router.post(
  "/upload",
  verifyAdmin,
  upload.fields([
    { name: "planImages", maxCount: 10 }, // blueprint images
    { name: "finalImages", maxCount: 10 }, // finished project images
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        rooms,
        premium,
        featured,
        newListing,
      } = req.body;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      // Upload each file to Cloudinary
      const planImages = [];
      const finalImages = [];

      // Upload plan images
      if (req.files?.planImages) {
        for (const file of req.files.planImages) {
          const uploadedUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `hillersons/planImages/${uuidv4()}` },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          });
          planImages.push(uploadedUrl);
        }
      }

      // Upload final images
      if (req.files?.finalImages) {
        for (const file of req.files.finalImages) {
          const uploadedUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `hillersons/finalImages/${uuidv4()}` },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          });
          finalImages.push(uploadedUrl);
        }
      }

      // Save new plan
      const newPlan = new Plan({
        title,
        description,
        price,
        rooms,
        planImageURLs: planImages, // only blueprints
        finalImageURLs: finalImages, // only finished project pics
        image: finalImages[0] || "", // main preview image
        subCategory: req.body.subCategory || "",
        subCategoryGroup: req.body.subCategoryGroup || "",
        premium: premium === "true",
        featured: featured === "true",
        newListing: newListing === "true",
        createdAt: new Date().toISOString(),
      });

      await newPlan.save();

      res.json({
        message: "Plan uploaded successfully",
        plan: newPlan,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });

    const formattedPlans = plans.map((plan) => {
      const planObj = plan.toObject();

      const finalImages = Array.isArray(planObj.finalImageURLs)
        ? planObj.finalImageURLs
        : [];
      const planImages = Array.isArray(planObj.planImageURLs)
        ? planObj.planImageURLs
        : [];

      const mainImage = planObj.image || finalImages[0] || planImages[0] || "";

      return {
        ...planObj,
        image: mainImage,
        images: finalImages.length
          ? finalImages
          : planImages.length
          ? planImages
          : mainImage
          ? [mainImage]
          : [],
      };
    });

    res.json(formattedPlans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch("/:id/view", async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { $inc: { views_count: 1 } },
      { new: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
