// backend/middleware/auth.js
"use strict";

const jwt = require("jsonwebtoken");


if (!process.env.JWT_SECRET) {
  throw new Error("[auth] JWT_SECRET environment variable is not set. Refusing to start.");
}


const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  //  Trim whitespace — some clients pad the token accidentally
  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err) {
      
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    // Whitelist only known-safe fields — never blindly spread the full decoded
    // payload onto req.user (prevents leaking internal claims downstream)
    req.user = {
      id:         decoded.id,
      email:      decoded.email,
      role:       decoded.role,
      membership: decoded.membership,
    };

    // Convenience alias used in some route handlers
    req.userId = decoded.id;

    next();
  });
};

module.exports = verifyToken;