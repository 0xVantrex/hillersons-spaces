// routes/bnb.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const verifyAuth = require("../middleware/auth");
const verifyAdmin = require("../middleware/verifyAdmin");

// ── Helper: get auth headers ───────────────────────────────────────────────────
const getUser = (req) => req.user || null;

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Get all approved BNB listings ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const {
      county,
      town,
      guests,
      minPrice,
      maxPrice,
      checkIn,
      checkOut,
      featured,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      listingType: "bnb",
      status: "approved",
      active: true,
    };

    if (county) filter.county = new RegExp(county, "i");
    if (town) filter.town = new RegExp(town, "i");
    if (featured === "true") filter.featured = true;
    if (guests) filter["bnb.maxGuests"] = { $gte: Number(guests) };
    if (minPrice || maxPrice) {
      filter["bnb.pricePerNight"] = {};
      if (minPrice) filter["bnb.pricePerNight"].$gte = Number(minPrice);
      if (maxPrice) filter["bnb.pricePerNight"].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    let listings = await Listing.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("sellerId", "name email profilePicture vendorProfile");

    // If checkIn and checkOut provided, filter out unavailable listings
    if (checkIn && checkOut) {
      const bookedListingIds = await Booking.find({
        status: { $in: ["pending", "confirmed"] },
        $or: [
          { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
          { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } },
          { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } },
        ],
      }).distinct("listingId");

      listings = listings.filter(
        (l) => !bookedListingIds.some((id) => id.toString() === l._id.toString())
      );
    }

    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("BNB fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get single BNB listing ─────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      listingType: "bnb",
    }).populate("sellerId", "name email profilePicture vendorProfile");

    if (!listing) return res.status(404).json({ error: "BNB listing not found" });

    // Increment views
    listing.views_count = (listing.views_count || 0) + 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Check availability for a listing ──────────────────────────────────────────
router.get("/:id/availability", async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "checkIn and checkOut are required" });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    if (new Date(checkIn) < new Date()) {
      return res.status(400).json({ error: "checkIn cannot be in the past" });
    }

    const isAvailable = await Booking.isAvailable(req.params.id, checkIn, checkOut);

    // Also get all booked date ranges for this listing (for calendar display)
    const bookedRanges = await Booking.find({
      listingId: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    }).select("checkIn checkOut status");

    res.json({ available: isAvailable, bookedRanges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES (logged in users)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Create a booking ───────────────────────────────────────────────────────────
router.post("/:id/book", verifyAuth, async (req, res) => {
  try {
    const { checkIn, checkOut, guests, specialRequests, guestPhone } = req.body;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "checkIn and checkOut are required" });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    if (new Date(checkIn) < new Date()) {
      return res.status(400).json({ error: "Cannot book dates in the past" });
    }

    const listing = await Listing.findOne({
      _id: req.params.id,
      listingType: "bnb",
      status: "approved",
    });

    if (!listing) return res.status(404).json({ error: "BNB listing not found" });

    // Check guest count
    if (guests && listing.bnb?.maxGuests && guests > listing.bnb.maxGuests) {
      return res.status(400).json({
        error: `This property allows a maximum of ${listing.bnb.maxGuests} guests`,
      });
    }

    // Check availability
    const isAvailable = await Booking.isAvailable(req.params.id, checkIn, checkOut);
    if (!isAvailable) {
      return res.status(409).json({ error: "These dates are not available" });
    }

    const nights = Booking.calculateNights(checkIn, checkOut);
    const pricePerNight = listing.bnb?.pricePerNight || listing.price || 0;
    const cleaningFee = 0; // can be added to listing model later
    const serviceFee = Math.round(pricePerNight * nights * 0.05); // 5% service fee
    const totalAmount = pricePerNight * nights + cleaningFee + serviceFee;

    const booking = new Booking({
      listingId: listing._id,
      listingTitle: listing.title,
      listingImage: listing.images?.[0] || "",
      guestId: req.user.id,
      guestName: req.user.name,
      guestEmail: req.user.email,
      guestPhone: guestPhone || "",
      hostId: listing.sellerId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights,
      guests: guests || 1,
      pricePerNight,
      cleaningFee,
      serviceFee,
      totalAmount,
      specialRequests,
      status: "pending",
      paymentStatus: "unpaid",
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully. Complete payment to confirm.",
      booking,
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get my bookings (as guest) ─────────────────────────────────────────────────
router.get("/user/my-bookings", verifyAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("listingId", "title images location county town bnb");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Cancel a booking (guest) ───────────────────────────────────────────────────
router.patch("/:bookingId/cancel", verifyAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Only guest or host can cancel
    if (
      booking.guestId.toString() !== req.user.id &&
      booking.hostId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({ error: `Booking is already ${booking.status}` });
    }

    const cancelledBy = booking.guestId.toString() === req.user.id ? "guest" : "host";

    booking.status = "cancelled";
    booking.cancelledBy = cancelledBy;
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || "No reason provided";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// HOST ROUTES (vendor/admin who owns the listing)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Get bookings for host's listings ──────────────────────────────────────────
router.get("/host/bookings", verifyAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { hostId: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate("listingId", "title images")
      .populate("guestId", "name email phone");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Confirm a booking (host) ───────────────────────────────────────────────────
router.patch("/host/:bookingId/confirm", verifyAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.hostId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Reject a booking (host) ────────────────────────────────────────────────────
router.patch("/host/:bookingId/reject", verifyAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.hostId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    booking.status = "rejected";
    booking.cancellationReason = req.body.reason || "Host unavailable";
    booking.cancelledBy = "host";
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({ message: "Booking rejected", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mark booking as completed (host) ──────────────────────────────────────────
router.patch("/host/:bookingId/complete", verifyAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.hostId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking marked as completed", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Get all bookings (admin) ───────────────────────────────────────────────────
router.get("/admin/all-bookings", verifyAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("listingId", "title images location")
        .populate("guestId", "name email phone")
        .populate("hostId", "name email"),
      Booking.countDocuments(filter),
    ]);

    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin create BNB listing (Hillersons own BNBs) ────────────────────────────
router.post("/admin/create", verifyAdmin, async (req, res) => {
  try {
    const listing = new Listing({
      ...req.body,
      listingType: "bnb",
      sellerId: req.user.id,
      sellerName: req.user.name,
      sellerEmail: req.user.email,
      status: "approved", // admin listings go live immediately
    });
    await listing.save();
    res.status(201).json({ message: "BNB listing created", listing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Update payment status (after M-Pesa confirmation) ─────────────────────────
router.patch("/:bookingId/payment", verifyAuth, async (req, res) => {
  try {
    const { mpesaReceiptNumber, paymentMethod } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.guestId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    booking.paymentStatus = "paid";
    booking.paymentMethod = paymentMethod || "mpesa";
    booking.mpesaReceiptNumber = mpesaReceiptNumber;
    booking.paidAt = new Date();
    booking.status = "confirmed"; // auto-confirm on payment
    await booking.save();

    res.json({ message: "Payment recorded. Booking confirmed!", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;