// models/Listing.js
const mongoose = require("mongoose");

// ── Shared review sub-schema ──────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── BNB availability block ────────────────────────────────────────────────────
const BookingBlockSchema = new mongoose.Schema(
  {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { _id: true }
);

// ── Main Listing schema ───────────────────────────────────────────────────────
const ListingSchema = new mongoose.Schema(
  {
    // ── Common fields (all listing types) ──
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    images: [String],          // main display images
    documents: [String],       // PDFs, title deeds, etc.
    location: { type: String },
    county: { type: String },  // Kenyan county
    town: { type: String },

    // Listing type — drives which type-specific fields are used
    listingType: {
      type: String,
      required: true,
      enum: [
        "housePlan",
        "land",
        "house",
        "bnb",
        "book",
        "service",
      ],
    },

    // Owner (vendor/admin who posted it)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: String,
    sellerEmail: String,
    sellerPhone: String,

    // Admin approval
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "archived"],
      default: "pending",
    },
    rejectionNote: { type: String },  // admin fills this on rejection
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Visibility
    featured: { type: Boolean, default: false },
    featuredUntil: { type: Date },    // expiry for paid featured slots
    premium: { type: Boolean, default: false },
    active: { type: Boolean, default: true },

    // Engagement
    likes_count: { type: Number, default: 0 },
    views_count: { type: Number, default: 0 },
    reviews: [ReviewSchema],
    averageRating: { type: Number, default: 0 },

    // ── House Plan fields ──
    housePlan: {
      rooms: String,
      floorCount: String,
      area: String,
      subCategory: String,
      subCategoryGroup: String,
      planImageURLs: [String],   // blueprint images
      finalImageURLs: [String],  // finished project images
      style: String,             // e.g. "modern", "bungalow", "maisonette"
    },

    // ── Land fields ──
    land: {
      sizeAcres: Number,
      sizeSqft: Number,
      titleDeedStatus: {
        type: String,
        enum: ["freehold", "leasehold", "allotment", "none"],
      },
      zoning: String,       // e.g. "residential", "commercial", "agricultural"
      roadAccess: Boolean,
      waterAccess: Boolean,
      electricityAccess: Boolean,
    },

    // ── House/Property fields ──
    house: {
      bedrooms: Number,
      bathrooms: Number,
      parkingSpaces: Number,
      amenities: [String],   // e.g. ["pool", "gym", "borehole"]
      furnished: Boolean,
      propertyType: {
        type: String,
        enum: ["apartment", "bungalow", "maisonette", "villa", "townhouse", "commercial"],
      },
      saleOrRent: {
        type: String,
        enum: ["sale", "rent"],
        default: "sale",
      },
      monthlyRent: Number,   // if rent
    },

    // ── BNB fields ──
    bnb: {
      maxGuests: Number,
      bedrooms: Number,
      bathrooms: Number,
      amenities: [String],
      checkInTime: String,   // e.g. "14:00"
      checkOutTime: String,  // e.g. "11:00"
      pricePerNight: Number,
      minimumStay: { type: Number, default: 1 },
      bookings: [BookingBlockSchema],
      rules: [String],       // e.g. ["No smoking", "No pets"]
      instantBook: { type: Boolean, default: false },
    },

    // ── Book fields ──
    book: {
      author: String,
      genre: String,
      isbn: String,
      pages: Number,
      publishedYear: Number,
      fileUrl: String,       // for digital downloads
      physicalCopy: Boolean, // true if sold as physical
      language: { type: String, default: "English" },
    },

    // ── Service/Contractor fields ──
    service: {
      serviceType: {
        type: String,
        enum: [
          "construction",
          "roofing",
          "plumbing",
          "electrical",
          "interior",
          "landscaping",
          "surveying",
          "architecture",
          "other",
        ],
      },
      packages: [
        {
          name: String,
          description: String,
          price: Number,
          deliveryDays: Number,
        },
      ],
      portfolio: [String],       // image URLs of past work
      yearsExperience: Number,
      licenseNumber: String,
      operatingCounties: [String],
    },
  },
  { timestamps: true }
);

// ── Indexes for fast filtering ─────────────────────────────────────────────────
ListingSchema.index({ listingType: 1, status: 1 });
ListingSchema.index({ sellerId: 1 });
ListingSchema.index({ featured: 1 });
ListingSchema.index({ county: 1, town: 1 });
ListingSchema.index({ createdAt: -1 });

// ── Auto-update averageRating when reviews change ─────────────────────────────
ListingSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = +(total / this.reviews.length).toFixed(1);
  }
};

module.exports =
  mongoose.models.Listing || mongoose.model("Listing", ListingSchema);