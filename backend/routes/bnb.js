// routes/bnb.js
"use strict";

const express    = require("express");
const router     = express.Router();
const Listing    = require("../models/Listing");
const Booking    = require("../models/Booking");
const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");

const BOOKING_STATUSES = new Set(["pending", "confirmed", "cancelled", "completed", "rejected"]);
const MAX_LIMIT        = 50;

// Escape user input before using in a RegExp to prevent ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseSafeDate = (str) => {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const internalError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "An unexpected error occurred." });
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

router.get("/", async (req, res) => {
  try {
    const {
      county, town, guests, minPrice, maxPrice,
      checkIn, checkOut, featured,
    } = req.query;

    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip  = (page - 1) * limit;

    const filter = { listingType: "bnb", status: "approved", active: true };

    // Use escaped regex — never pass raw user input to new RegExp()
    if (county) filter.county = { $regex: escapeRegex(county), $options: "i" };
    if (town)   filter.town   = { $regex: escapeRegex(town),   $options: "i" };

    if (featured === "true") filter.featured = true;
    if (guests) {
      const g = parseInt(guests, 10);
      if (!isNaN(g)) filter["bnb.maxGuests"] = { $gte: g };
    }

    if (minPrice || maxPrice) {
      filter["bnb.pricePerNight"] = {};
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min)) filter["bnb.pricePerNight"].$gte = min;
      if (!isNaN(max)) filter["bnb.pricePerNight"].$lte = max;
    }

    let listings = await Listing.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sellerId", "name profilePicture vendorProfile");

    if (checkIn && checkOut) {
      const start = parseSafeDate(checkIn);
      const end   = parseSafeDate(checkOut);

      if (start && end && end > start) {
        const bookedIds = await Booking.find({
          status:   { $in: ["pending", "confirmed"] },
          checkIn:  { $lt: end   },
          checkOut: { $gt: start },
        }).distinct("listingId");

        const bookedSet = new Set(bookedIds.map((id) => id.toString()));
        listings = listings.filter((l) => !bookedSet.has(l._id.toString()));
      }
    }

    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    internalError(res, err);
  }
});

// ── Single listing — must come AFTER all fixed-path GET routes ─
router.get("/:id/availability", async (req, res) => {
  try {
    const checkIn  = parseSafeDate(req.query.checkIn);
    const checkOut = parseSafeDate(req.query.checkOut);

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "Valid checkIn and checkOut dates are required." });
    }
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: "checkOut must be after checkIn." });
    }
    if (checkIn < new Date()) {
      return res.status(400).json({ error: "checkIn cannot be in the past." });
    }

    const [isAvailable, bookedRanges] = await Promise.all([
      Booking.isAvailable(req.params.id, checkIn, checkOut),
      Booking.find({
        listingId: req.params.id,
        status:    { $in: ["pending", "confirmed"] },
      }).select("checkIn checkOut status").lean(),
    ]);

    res.json({ available: isAvailable, bookedRanges });
  } catch (err) {
    internalError(res, err);
  }
});

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES — must be registered BEFORE /:id to avoid shadowing
// ═══════════════════════════════════════════════════════════════

// ── Get guest's own bookings ───────────────────────────────────
// Registered before /:id so "user" is not captured as an id param
router.get("/user/my-bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("listingId", "title images location county town bnb")
      .lean();
    res.json(bookings);
  } catch (err) {
    internalError(res, err);
  }
});

// ═══════════════════════════════════════════════════════════════
// HOST ROUTES — registered before /:id for same reason
// ═══════════════════════════════════════════════════════════════

router.get("/host/bookings", verifyToken, async (req, res) => {
  try {
    const filter = { hostId: req.user.id };

    // Validate status before using in query
    if (req.query.status) {
      if (!BOOKING_STATUSES.has(req.query.status)) {
        return res.status(400).json({ error: "Invalid status value." });
      }
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate("listingId", "title images")
      .populate("guestId",   "name email phone")
      .lean();

    res.json(bookings);
  } catch (err) {
    internalError(res, err);
  }
});

router.patch("/host/:bookingId/confirm", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    if (booking.hostId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "Booking confirmed.", booking });
  } catch (err) {
    internalError(res, err);
  }
});

router.patch("/host/:bookingId/reject", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    if (booking.hostId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }

    booking.status             = "rejected";
    booking.cancellationReason = req.body.reason || "Host unavailable";
    booking.cancelledBy        = req.user.role === "admin" ? "admin" : "host";
    booking.cancelledAt        = new Date();
    await booking.save();

    res.json({ message: "Booking rejected.", booking });
  } catch (err) {
    internalError(res, err);
  }
});

router.patch("/host/:bookingId/complete", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    if (booking.hostId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: "Only confirmed bookings can be marked complete." });
    }

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking marked as completed.", booking });
  } catch (err) {
    internalError(res, err);
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════

// verifyToken must come before verifyAdmin — verifyAdmin reads req.user
router.get("/admin/all-bookings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip  = (page - 1) * limit;
    const filter = {};

    if (req.query.status) {
      if (!BOOKING_STATUSES.has(req.query.status)) {
        return res.status(400).json({ error: "Invalid status value." });
      }
      filter.status = req.query.status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("listingId", "title images location")
        .populate("guestId",   "name email phone")
        .populate("hostId",    "name email")
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    internalError(res, err);
  }
});

// Explicit field whitelist — never spread req.body into a model constructor
router.post("/admin/create", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      title, description, location, county, town,
      price, images, bnb,
    } = req.body;

    const listing = new Listing({
      title,
      description,
      location,
      county,
      town,
      price,
      images,
      bnb,
      listingType:  "bnb",
      sellerId:     req.user.id,
      sellerName:   req.user.name,
      sellerEmail:  req.user.email,
      status:       "approved",
    });

    await listing.save();
    res.status(201).json({ message: "BNB listing created.", listing });
  } catch (err) {
    internalError(res, err);
  }
});

// ═══════════════════════════════════════════════════════════════
// PARAMETERISED ROUTES — registered last to avoid shadowing
// ═══════════════════════════════════════════════════════════════

router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id:         req.params.id,
      listingType: "bnb",
    }).populate("sellerId", "name profilePicture vendorProfile");

    if (!listing) return res.status(404).json({ error: "BNB listing not found." });

    listing.views_count = (listing.views_count || 0) + 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    internalError(res, err);
  }
});

router.post("/:id/book", verifyToken, async (req, res) => {
  try {
    const { guests, specialRequests, guestPhone } = req.body;

    const checkIn  = parseSafeDate(req.body.checkIn);
    const checkOut = parseSafeDate(req.body.checkOut);

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "Valid checkIn and checkOut dates are required." });
    }
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: "checkOut must be after checkIn." });
    }
    if (checkIn < new Date()) {
      return res.status(400).json({ error: "Cannot book dates in the past." });
    }

    const listing = await Listing.findOne({
      _id:         req.params.id,
      listingType: "bnb",
      status:      "approved",
    });

    if (!listing) return res.status(404).json({ error: "BNB listing not found." });

    const guestCount = parseInt(guests, 10) || 1;
    if (listing.bnb?.maxGuests && guestCount > listing.bnb.maxGuests) {
      return res.status(400).json({
        error: `This property allows a maximum of ${listing.bnb.maxGuests} guests.`,
      });
    }

    const isAvailable = await Booking.isAvailable(req.params.id, checkIn, checkOut);
    if (!isAvailable) {
      return res.status(409).json({ error: "These dates are not available." });
    }

    const nights        = Booking.calculateNights(checkIn, checkOut);
    const pricePerNight = listing.bnb?.pricePerNight || listing.price || 0;
    const cleaningFee   = 0;
    const serviceFee    = Math.round(pricePerNight * nights * 0.05);

    const booking = new Booking({
      listingId:     listing._id,
      listingTitle:  listing.title,
      listingImage:  listing.images?.[0] || "",
      guestId:       req.user.id,
      guestName:     req.user.name,
      guestEmail:    req.user.email,
      guestPhone:    guestPhone || "",
      hostId:        listing.sellerId,
      checkIn,
      checkOut,
      nights,
      guests:        guestCount,
      pricePerNight,
      cleaningFee,
      serviceFee,
      totalAmount:   pricePerNight * nights + cleaningFee + serviceFee,
      specialRequests,
      status:        "pending",
      paymentStatus: "unpaid",
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully. Complete payment to confirm.",
      booking,
    });
  } catch (err) {
    internalError(res, err);
  }
});

router.patch("/:bookingId/cancel", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    if (
      booking.guestId.toString() !== req.user.id &&
      booking.hostId.toString()  !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized." });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({ error: `Booking is already ${booking.status}.` });
    }

    let cancelledBy = "admin";
    if (booking.guestId.toString() === req.user.id) cancelledBy = "guest";
    else if (booking.hostId.toString() === req.user.id) cancelledBy = "host";

    booking.status             = "cancelled";
    booking.cancelledBy        = cancelledBy;
    booking.cancelledAt        = new Date();
    booking.cancellationReason = req.body.reason || "No reason provided";
    await booking.save();

    res.json({ message: "Booking cancelled successfully.", booking });
  } catch (err) {
    internalError(res, err);
  }
});

// Payment recording — does NOT auto-confirm; host confirms after verifying receipt
router.patch("/:bookingId/payment", verifyToken, async (req, res) => {
  try {
    const { mpesaReceiptNumber, paymentMethod } = req.body;

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    if (booking.guestId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ error: "Payment already recorded for this booking." });
    }

    booking.paymentStatus      = "pending";
    booking.paymentMethod      = paymentMethod || "mpesa";
    booking.mpesaReceiptNumber = mpesaReceiptNumber || "";
    booking.paidAt             = new Date();
    await booking.save();

    res.json({
      message: "Payment details recorded. Awaiting host confirmation.",
      booking,
    });
  } catch (err) {
    internalError(res, err);
  }
});

module.exports = router;