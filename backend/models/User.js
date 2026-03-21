// models/User.js
"use strict";

const mongoose = require("mongoose");

// Orders kept as embedded subdocuments for now but capped to prevent
// unbounded document growth. High-volume order history should be migrated
// to a standalone Order collection with userId reference.
const OrderSchema = new mongoose.Schema(
  {
    planId:       { type: mongoose.Schema.Types.ObjectId, ref: "Plan"    },
    planTitle:    { type: String, maxlength: 200 },
    listingId:    { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    listingTitle: { type: String, maxlength: 200 },
    status: {
      type:    String,
      enum:    ["pending", "completed", "cancelled"],
      default: "pending",
    },
    amount: { type: Number, min: 0 },
  },
  { _id: false, timestamps: true }
);

const VendorProfileSchema = new mongoose.Schema(
  {
    businessName: {
      type:      String,
      maxlength: 150,
      trim:      true,
    },
    businessDescription: {
      type:      String,
      maxlength: 1000,
      trim:      true,
    },
    location: { type: String, maxlength: 200, trim: true },
    phone:    { type: String, maxlength: 20,  trim: true },
    website:  { type: String, maxlength: 300, trim: true },

    verified:   { type: Boolean, default: false },
    verifiedAt: { type: Date },

    specialization: { type: String, maxlength: 100, trim: true },
    propertyCount:  { type: Number, default: 0, min: 0 },

    subscriptionPlan: {
      type:    String,
      enum:    ["free", "basic", "pro"],
      default: "free",
    },
    subscriptionExpiresAt: { type: Date },

    // Derived analytics — treat as cached counters only.
    // Source of truth is the Listing and Order collections.
    totalListings: { type: Number, default: 0, min: 0 },
    totalSales:    { type: Number, default: 0, min: 0 },
    totalRevenue:  { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type:      String,
      required:  true,
      unique:    true,
      maxlength: 254,
      trim:      true,
      lowercase: true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },

    // select: false — never returned in queries unless explicitly requested.
    // Google OAuth users will have no password; that is expected.
    password: {
      type:   String,
      select: false,
    },

    name: {
      type:      String,
      maxlength: 100,
      trim:      true,
    },
    profilePicture: { type: String, maxlength: 500 },
    phone:          { type: String, maxlength: 20, trim: true },

    role: {
      type:    String,
      enum:    ["admin", "vendor", "bnbHost", "contractor", "user"],
      default: "user",
    },

    vendorProfile: VendorProfileSchema,

    vendorStatus: {
      type:    String,
      enum:    ["none", "pending", "approved", "rejected", "banned"],
      default: "none",
    },
    vendorStatusNote: { type: String, maxlength: 500 },

    orders: {
      type:    [OrderSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 500,
        message:   "Order history limit reached on user document.",
      },
    },

    savedPlans: {
      type:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 200,
        message:   "Saved plans limit reached.",
      },
    },
    savedListings: {
      type:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 200,
        message:   "Saved listings limit reached.",
      },
    },

    // Store only a SHA-256 hash of the reset token.
    // The raw token is emailed to the user and never persisted.
    resetTokenHash:   { type: String, select: false },
    resetTokenExpiry: { type: Date,   select: false },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────
UserSchema.index({ role:         1 });
UserSchema.index({ vendorStatus: 1 });
// Sparse because only users with an active reset have this field set
UserSchema.index({ resetTokenHash: 1 }, { sparse: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);