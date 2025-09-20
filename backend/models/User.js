// models/User.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    planTitle: String,
    status: { type: String, default: "pending" }, // completed, cancelled, pending
    amount: Number,
    createdAt: { type: Date, default: Date.now },
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
    name: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    phone: {
      type: String,
    },

    orders: [OrderSchema],
    savedPlans: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Plan" }, //
    ],
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
