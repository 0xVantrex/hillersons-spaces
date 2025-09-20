const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String },
    sessionId: { type: String },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
