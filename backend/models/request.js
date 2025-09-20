const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  projectType: String,
  rooms: String,
  budget: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", requestSchema);
