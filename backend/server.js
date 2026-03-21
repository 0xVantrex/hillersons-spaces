const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


// frontend URLs
const allowedOrigins = [
  "http://localhost:5173",  //Testing
  "https://hillersonsspaces.vercel.app",       // Production
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);

      
      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// JSON body parsing
app.use(express.json());

// Routes

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

// Test route
app.get("/", (req, res) => {
  res.send("🔥 Backend API is up and running");
});

// MongoDB + Server

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
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