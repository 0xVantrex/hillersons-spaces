// models/User.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    planTitle: String,
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    listingTitle: String,
    status: { type: String, default: "pending" }, // pending, completed, cancelled
    amount: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Vendor-specific profile info
const VendorProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String },
    businessDescription: { type: String },
    location: { type: String },
    phone: { type: String },
    website: { type: String },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    // For contractors
    specialization: { type: String }, // e.g. "roofing", "plumbing", "full construction"
    // For BNB hosts
    propertyCount: { type: Number, default: 0 },
    // Subscription/plan
    subscriptionPlan: {
      type: String,
      enum: ["free", "basic", "pro"],
      default: "free",
    },
    subscriptionExpiresAt: { type: Date },
    // Analytics
    totalListings: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    name: { type: String },
    profilePicture: { type: String },
    phone: { type: String },

    // Roles: admin > vendor subtypes > user
    role: {
      type: String,
      enum: ["admin", "vendor", "bnbHost", "contractor", "user"],
      default: "user",
    },

    // Vendor profile — only populated if role !== "user"
    vendorProfile: VendorProfileSchema,

    // Vendor approval status
    vendorStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected", "banned"],
      default: "none",
    },
    vendorStatusNote: { type: String }, // admin note on rejection/ban

    orders: [OrderSchema],
    savedPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],

    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);