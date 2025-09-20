const express = require("express");
const verifyToken = require("../middleware/auth"); 
const Cart = require("../models/Cart");

const router = express.Router();

// Get logged-in user's cart
router.get("/", verifyToken, async (req, res) => {
  console.log("Cart request hit! userId:", req.user.id);
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Update and/or replace cart
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("Incoming cart body:", req.body);
    const { items } = req.body;
    let cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items },
      { new: true, upsert: true }
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to save cart" });
  }
});

// Guest cart endpoint - SAVE
router.post("/guest", async (req, res) => {
  try {
    console.log("Guest cart save: ", req.body);
    const { items, sessionId } = req.body;

    if (!items || items.length === 0) {
      return res.json({ success: true, message: "Empty cart ignored" });
    }

    let guestCart = await Cart.findOneAndUpdate(
      { sessionId }, // Use sessionId for guests
      {
        items,
        sessionId,
        userId: null, // Explicitly set userId to null for guests
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Guest cart saved", cart: guestCart });
  } catch (err) {
    console.error("Guest cart save error:", err);
    res.status(500).json({ error: "Failed to save guest cart" });
  }
});

// Get guest cart - RETRIEVE
router.get("/guest", async (req, res) => {
  try {
    const { sessionId } = req.query;

    // Find guest cart by sessionId
    const guestCart = await Cart.findOne({ sessionId });

    if (guestCart) {
      res.json({ items: guestCart.items || [] });
    } else {
      res.json({ items: [] }); // Return empty if no cart found
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch guest cart" });
  }
});

// Clear cart
router.delete("/", verifyToken, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id }, { items: [] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// Change this line from ES modules to CommonJS:
module.exports = router;
