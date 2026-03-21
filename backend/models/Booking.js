// models/Booking.js
"use strict";

const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    listingId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Listing",
      required: true,
    },
    listingTitle: { type: String, maxlength: 200 },
    listingImage: { type: String, maxlength: 500 },

    guestId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    guestName:  { type: String, maxlength: 100 },
    guestEmail: { type: String, maxlength: 254 },
    guestPhone: { type: String, maxlength: 20  },

    hostId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    checkIn:  { type: Date, required: true },
    checkOut: { type: Date, required: true },

    // Derived and enforced in pre-save — never trust client-supplied value
    nights: { type: Number, required: true, min: 1 },

    guests: { type: Number, default: 1, min: 1 },

    pricePerNight: { type: Number, required: true, min: 0 },
    cleaningFee:   { type: Number, default: 0,     min: 0 },
    serviceFee:    { type: Number, default: 0,     min: 0 },

    // Enforced in pre-save — never trust client-supplied value
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "pending",
    },
    cancellationReason: { type: String, maxlength: 500 },
    cancelledBy: {
      type: String,
      enum: ["guest", "host", "admin"],
    },
    cancelledAt: { type: Date },

    paymentStatus: {
      type:    String,
      enum:    ["unpaid", "pending", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["mpesa", "card", "cash"],
    },
    mpesaReceiptNumber: { type: String, maxlength: 50 },
    paidAt: { type: Date },

    specialRequests: { type: String, maxlength: 1000 },
    notes:           { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────
BookingSchema.index({ listingId: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ guestId: 1 });
BookingSchema.index({ hostId: 1 });
BookingSchema.index({ status: 1 });

// ── Pre-save: enforce derived fields server-side ───────────────
BookingSchema.pre("save", function (next) {
  if (!this.checkIn || !this.checkOut) return next();

  const checkIn  = new Date(this.checkIn);
  const checkOut = new Date(this.checkOut);

  if (checkOut <= checkIn) {
    return next(new Error("checkOut must be after checkIn"));
  }

  // Recalculate nights — never trust the submitted value
  const diffMs = checkOut - checkIn;
  this.nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Recalculate totalAmount — never trust the submitted value
  this.totalAmount =
    this.pricePerNight * this.nights +
    (this.cleaningFee || 0) +
    (this.serviceFee  || 0);

  next();
});

// ── Static: check availability ─────────────────────────────────
BookingSchema.statics.isAvailable = async function (
  listingId,
  checkIn,
  checkOut,
  excludeBookingId = null
) {
  const start = new Date(checkIn);
  const end   = new Date(checkOut);

  // Overlap condition: existing booking overlaps if it starts before the new
  // end AND ends after the new start. Using strict inequalities allows
  // back-to-back bookings (checkout day == next checkin day).
  const query = {
    listingId,
    status: { $in: ["pending", "confirmed"] },
    checkIn:  { $lt: end   },
    checkOut: { $gt: start },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await this.findOne(query).lean();
  return !conflict;
};

// ── Static: calculate nights utility ──────────────────────────
BookingSchema.statics.calculateNights = function (checkIn, checkOut) {
  const diffMs = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);