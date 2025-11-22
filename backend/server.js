const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


// Middleware

const allowedOrigins = [
  "https://hillersons-architecture-site-huwi3jqd9-0xvantrexs-projects.vercel.app/", 

];


app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Routes

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const planRoutes = require("./routes/plans");
app.use("/api/plans", planRoutes);

const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);

const inquiryRoutes = require("./routes/Inquiry");
app.use("/api/inquiries", inquiryRoutes);

const favoriteRoutes = require("./routes/favoriteRoutes");
app.use("/api/favorites", favoriteRoutes);

const CustomRequests = require("./routes/customRequests");
app.use("/api/custom-requests", CustomRequests);

const categoryRoutes = require("./routes/category");
app.use("/api/categories", categoryRoutes);

const projects = require("./routes/projects");
app.use("/api/projects", projects);


// Test route

app.get("/", (req, res) => {
  res.send("🔥 Backend API is up and running");
});

// Mongo + Server boot

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // Listen on all network interfaces
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Backend running on http://0.0.0.0:${PORT}`);
      console.log(`🌐 Access via LAN: http://192.168.8.113:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

