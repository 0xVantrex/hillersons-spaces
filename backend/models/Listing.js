"use strict";

const mongoose = require("mongoose");

// ── Review Schema (LIMITED + OPTIMIZED) ────────────────────────
const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: { type: String, maxlength: 100, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000, trim: true },
  },
  { timestamps: true }
);

// ── Booking Schema (SEPARATE-READY DESIGN) ─────────────────────
const BookingSchema = new mongoose.Schema(
  {
    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ── MAIN BNB LISTING ───────────────────────────────────────────
const ListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 3000,
      trim: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String],
      validate: [
        (v) => v.length <= 15,
        "Max 15 images",
      ],
    },

    location: {
      type: String,
      maxlength: 200,
      trim: true,
    },

    county: {
      type: String,
      maxlength: 100,
      trim: true,
      lowercase: true,
      index: true,
    },

    town: {
      type: String,
      maxlength: 100,
      trim: true,
      lowercase: true,
      index: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔥 REMOVE email duplication → safer
    // sellerEmail REMOVED

    maxGuests: { type: Number, min: 1, required: true },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },

    amenities: {
      type: [String],
      validate: [(v) => v.length <= 30, "Max 30 amenities"],
    },

    checkInTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "HH:MM format"],
    },

    checkOutTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "HH:MM format"],
    },

    minimumStay: {
      type: Number,
      default: 1,
      min: 1,
    },

    instantBook: {
      type: Boolean,
      default: false,
    },

    rules: {
      type: [String],
      validate: [(v) => v.length <= 20, "Max 20 rules"],
    },

    // ── STATUS CONTROL ─────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ── STATS (ATOMIC SAFE) ────────────
    likes_count: { type: Number, default: 0, min: 0 },
    views_count: { type: Number, default: 0, min: 0 },

    // ── LIMITED REVIEWS (ANTI-DOS) ─────
    reviews: {
      type: [ReviewSchema],
      validate: [(v) => v.length <= 200, "Max 200 reviews"],
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // ── BOOKINGS (TEMP — move later) ───
    bookings: {
      type: [BookingSchema],
      validate: [(v) => v.length <= 300, "Max 300 bookings"],
    },
  },
  { timestamps: true }
);


// ── INDEXES (ANTI-DOS + PERFORMANCE) ───────────────────────────
ListingSchema.index({ county: 1, town: 1 });
ListingSchema.index({ pricePerNight: 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ status: 1, active: 1 });
ListingSchema.index({ "reviews.userId": 1 });


// ── PRE-SAVE: AVG RATING SAFE ──────────────────────────────────
ListingSchema.pre("save", function (next) {
  if (!this.isModified("reviews")) return next();

  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = +(total / this.reviews.length).toFixed(1);
  }

  next();
});


// ── STATIC: SAFE BOOKING CHECK (ANTI-DOUBLE BOOK) ──────────────
ListingSchema.methods.isAvailable = function (newStart, newEnd) {
  return !this.bookings.some((b) => {
    return newStart < b.checkOut && newEnd > b.checkIn;
  });
};


module.exports =
  mongoose.models.Listing || mongoose.model("Listing", ListingSchema);