const jwt = require("jsonwebtoken");

module.exports = function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded; // store id + isAdmin
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
