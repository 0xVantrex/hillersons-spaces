const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🔥 Backend API is up and running");
});

const planRoutes = require("./routes/plans");
app.use("/api/plans", planRoutes);

const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);

const inquiryRoutes = require("./routes/Inquiry");
app.use("/api/inquiries", inquiryRoutes);

const favoriteRoutes = require("./routes/favoriteRoutes");
app.use("/api/plans", favoriteRoutes);

const CustomRequests = require("./routes/CustomRequests");
app.use("/api/custom-requests", CustomRequests);

const categoryRoutes = require("./routes/category");
app.use("/api/categories", categoryRoutes);

// Mongo + Server boot
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // quit if DB connection fails
  });
