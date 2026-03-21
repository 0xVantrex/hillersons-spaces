"use strict";

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// ── Security headers
app.use(helmet());

// ── Logging
app.use(morgan("dev"));

// ── JSON body parsing
app.use(express.json({ limit: "10mb" }));

// ── CORS configuration
const allowedOrigins = [
  "http://localhost:5173",  
  "https://hillersonsspaces.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps, curl, postman

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ── Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/plans", require("./routes/plans"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/inquiries", require("./routes/Inquiry"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/custom-requests", require("./routes/customRequests"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/vendor", require("./routes/vendor"));
app.use("/api/bnb", require("./routes/bnb"));
app.use("/api/upload", require("./routes/upload"));

// ── Test route
app.get("/", (req, res) => {
  res.send("🔥 Backend API is up and running");
});

// ── Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ── Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ error: "Server error" });
});

// ── MongoDB + Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Backend running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });