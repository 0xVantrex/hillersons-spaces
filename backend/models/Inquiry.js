// models/Inquiry.js
"use strict";

const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  true,
      maxlength: 100,
      trim:      true,
    },
    email: {
      type:      String,
      required:  true,
      maxlength: 254,
      trim:      true,
      lowercase: true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    phone: {
      type:      String,
      maxlength: 20,
      trim:      true,
    },
    projectType: {
      type: String,
      enum: [
        "residential",
        "commercial",
        "social",
        "interior",
        "renovation",
        "other",
      ],
    },
    rooms: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6+"],
    },
    budget: {
      type: String,
      enum: [
        "under-1m",
        "1m-5m",
        "5m-10m",
        "10m-20m",
        "above-20m",
      ],
    },
    description: {
      type:      String,
      required:  true,
      maxlength: 2000,
      trim:      true,
    },
    status: {
      type:    String,
      enum:    ["new", "in-progress", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

inquirySchema.index({ status:    1 });
inquirySchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);