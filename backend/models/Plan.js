// models/Plan.js
const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    finalImageURLs: [String], // optional: array of final images
    planImageURLs: [String], // optional: array of blueprint images
    rooms: { type: String },
    featured: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    newListing: { type: Boolean, default: false },
    subCategory: { type: String },
    subCategoryGroup: { type: String },
    createdAt: { type: Date, default: Date.now },
    views_count: { type: Number, default: 0 },
    inquiries_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
