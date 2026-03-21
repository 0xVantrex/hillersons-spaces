// routes/cart.js
"use strict";

const express     = require("express");
const router      = express.Router();
const Cart        = require("../models/Cart");
const verifyToken = require("../middleware/auth");

const MAX_CART_ITEMS = 100;
const SESSION_ID_RE  = /^[a-zA-Z0-9_-]{8,128}$/;

const internalError = (res) =>
  res.status(500).json({ error: "An unexpected error occurred." });

// ── Get authenticated user's cart ──────────────────────────────
router.get("/", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).lean();
    res.json(cart || { userId: req.user.id, items: [] });
  } catch {
    internalError(res);
  }
});

// ── Replace authenticated user's cart ─────────────────────────
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items must be an array." });
    }
    if (items.length > MAX_CART_ITEMS) {
      return res.status(400).json({ error: `Cart cannot exceed ${MAX_CART_ITEMS} items.` });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items },
      { new: true, upsert: true }
    );

    res.json(cart);
  } catch {
    internalError(res);
  }
});

// ── Save guest cart ────────────────────────────────────────────
router.post("/guest", async (req, res) => {
  try {
    const { items, sessionId } = req.body;

    if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
      return res.status(400).json({ error: "A valid sessionId is required." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, message: "Empty cart ignored." });
    }
    if (items.length > MAX_CART_ITEMS) {
      return res.status(400).json({ error: `Cart cannot exceed ${MAX_CART_ITEMS} items.` });
    }

    // Only match guest documents — do not overwrite carts that belong to a user
    const cart = await Cart.findOneAndUpdate(
      { sessionId, userId: null },
      { items, sessionId },
      { new: true, upsert: true }
    );

    res.json({ success: true, cart });
  } catch {
    internalError(res);
  }
});

// ── Get guest cart ─────────────────────────────────────────────
router.get("/guest", async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
      return res.status(400).json({ error: "A valid sessionId is required." });
    }

    const cart = await Cart.findOne({ sessionId, userId: null }).lean();
    res.json({ items: cart?.items || [] });
  } catch {
    internalError(res);
  }
});

// ── Clear authenticated user's cart ───────────────────────────
router.delete("/", verifyToken, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ success: true });
  } catch {
    internalError(res);
  }
});

module.exports = router;