// models/Plan.js
"use strict";

const mongoose = require("mongoose");

const MAX_IMAGES = 15;

const PlanSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  true,
      maxlength: 200,
      trim:      true,
    },
    description: {
      type:      String,
      maxlength: 5000,
      trim:      true,
    },
    price: {
      type: Number,
      min:  0,
    },
    finalImageURLs: {
      type:     [String],
      validate: {
        validator: (arr) => arr.length <= MAX_IMAGES,
        message:   `finalImageURLs cannot exceed ${MAX_IMAGES} images`,
      },
    },
    planImageURLs: {
      type:     [String],
      validate: {
        validator: (arr) => arr.length <= MAX_IMAGES,
        message:   `planImageURLs cannot exceed ${MAX_IMAGES} images`,
      },
    },
    rooms:      { type: Number, min: 0 },
    floorCount: { type: Number, min: 1 },
    area:       { type: Number, min: 0 },
    featured:   { type: Boolean, default: false },
    premium:    { type: Boolean, default: false },
    newListing: { type: Boolean, default: false },
    subCategory: {
      type:      String,
      maxlength: 100,
      trim:      true,
    },
    subCategoryGroup: {
      type:      String,
      maxlength: 100,
      trim:      true,
    },
    likes_count: {
      type:    Number,
      default: 0,
      min:     0,
    },
  },
  { timestamps: true }
);

PlanSchema.index({ subCategoryGroup: 1 });
PlanSchema.index({ subCategory:      1 });
PlanSchema.index({ featured:         1 });
PlanSchema.index({ premium:          1 });
PlanSchema.index({ price:            1 });
PlanSchema.index({ createdAt:       -1 });

module.exports = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);