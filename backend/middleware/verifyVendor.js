// middleware/verifyVendor.js
// Allows approved vendors, BNB hosts, contractors, and admins
const jwt = require("jsonwebtoken");

const VENDOR_ROLES = ["vendor", "bnbHost", "contractor", "admin"];

module.exports = function verifyVendor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!VENDOR_ROLES.includes(decoded.role)) {
      return res.status(403).json({
        message: "Access denied. Vendor account required.",
      });
    }

    // Non-admin vendors must be approved
    if (decoded.role !== "admin" && decoded.vendorStatus !== "approved") {
      return res.status(403).json({
        message: "Your vendor account is pending approval.",
        vendorStatus: decoded.vendorStatus,
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};