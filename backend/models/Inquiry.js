const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  projectType: String,
  rooms: String,
  budget: String,
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["new", "in-progress", "resolved"],
    default: "new",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inquiry", inquirySchema);
