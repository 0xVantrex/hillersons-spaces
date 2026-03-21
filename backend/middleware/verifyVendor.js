// middleware/verifyVendor.js
"use strict";

const User = require("../models/User");

const VENDOR_ROLES = new Set(["vendor", "bnbHost", "contractor", "admin"]);

module.exports = async function verifyVendor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  if (!VENDOR_ROLES.has(req.user.role)) {
    return res.status(403).json({ message: "Access denied. Vendor account required." });
  }

  if (req.user.role === "admin") {
    return next();
  }

  try {
    const user = await User.findById(req.user.id).select("vendorStatus").lean();

    if (!user) {
      return res.status(401).json({ message: "Access denied. Account not found." });
    }

    if (user.vendorStatus !== "approved") {
      return res.status(403).json({ message: "Your vendor account is pending approval." });
    }

    next();
  } catch {
    return res.status(500).json({ message: "Internal server error." });
  }
};