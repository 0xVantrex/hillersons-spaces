// middleware/verifyAdmin.js
"use strict";

module.exports = function verifyAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  next();
};