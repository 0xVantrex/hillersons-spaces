// models/Cart.js
"use strict";

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    itemId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Listing",
      required: true,
    },
    name:     { type: String, required: true, maxlength: 200 },
    price:    { type: Number, required: true, min: 0         },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    sessionId: {
      type:     String,
      maxlength: 128,
    },
    items: {
      type:    [cartItemSchema],
      default: [],
    },
    // Used to expire guest carts — TTL index below acts on this field
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// At least one of userId or sessionId must be present
cartSchema.pre("save", function (next) {
  if (!this.userId && !this.sessionId) {
    return next(new Error("Cart must belong to a user or a session."));
  }
  next();
});

cartSchema.index({ userId: 1    }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

// Guest carts expire automatically — only applies when expiresAt is set
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);