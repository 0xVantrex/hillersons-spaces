// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    // The BNB listing being booked
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    listingTitle: { type: String },
    listingImage: { type: String },

    // The guest making the booking
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String },

    // The host (vendor or admin who owns the listing)
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Dates
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true },

    // Guests
    guests: { type: Number, default: 1 },

    // Pricing
    pricePerNight: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },

    // Booking status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "pending",
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String }, // "guest" | "host" | "admin"
    cancelledAt: { type: Date },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: { type: String }, // "mpesa" | "card" | "cash"
    mpesaReceiptNumber: { type: String },
    paidAt: { type: Date },

    // Special requests from guest
    specialRequests: { type: String },

    // Admin/host notes
    notes: { type: String },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
BookingSchema.index({ listingId: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ guestId: 1 });
BookingSchema.index({ hostId: 1 });
BookingSchema.index({ status: 1 });

// ── Helper: calculate nights between two dates ─────────────────────────────────
BookingSchema.statics.calculateNights = function (checkIn, checkOut) {
  const diffMs = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// ── Helper: check if dates overlap with existing bookings ──────────────────────
BookingSchema.statics.isAvailable = async function (listingId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    listingId,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
      { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } },
      { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } },
    ],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const conflict = await this.findOne(query);
  return !conflict;
};

module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);