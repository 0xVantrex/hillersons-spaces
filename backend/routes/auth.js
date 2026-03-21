// backend/routes/auth.js
"use strict";

const express      = require("express");
const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const crypto       = require("crypto");
const nodemailer   = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const User        = require("../models/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Nodemailer transporter — created once at module load ───────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Minimal JWT payload ────────────────────────────────────────
const buildToken = (user) =>
  jwt.sign(
    {
      id:         user._id,
      email:      user.email,
      role:       user.role       || "user",
      membership: user.membership || "free",
    },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: "7d" }
  );

const buildUserResponse = (user) => ({
  id:            user._id,
  email:         user.email,
  name:          user.name,
  role:          user.role          || "user",
  vendorStatus:  user.vendorStatus  || "none",
  vendorProfile: user.vendorProfile || null,
});

// ── Input helpers ──────────────────────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const isStrongPassword = (v) =>
  typeof v === "string" &&
  v.length >= 8 &&
  v.length <= 128 &&
  /[A-Z]/.test(v) &&
  /[a-z]/.test(v) &&
  /\d/.test(v);

// ── Google Signup / Login ──────────────────────────────────────
router.post("/google", async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId || typeof tokenId !== "string") {
    return res.status(400).json({ message: "Token is required." });
  }

  try {
    // No clock-skew fallback — if you see "Token used too early" errors,
    // sync your server clock (ntpd / chronyc).
    const ticket = await client.verifyIdToken({
      idToken:  tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email   = payload.email?.toLowerCase().trim();
    const name    = payload.name;

    if (!email) {
      return res.status(400).json({ message: "Google account has no email." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name });
      await user.save();
    }

    const token = buildToken(user);
    return res.status(200).json({ token, user: buildUserResponse(user) });
  } catch {
    return res.status(401).json({ message: "Google authentication failed." });
  }
});

// ── Signup ─────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const email    = (req.body.email    || "").toLowerCase().trim();
    const name     = (req.body.name     || "").trim().slice(0, 100);
    const password =  req.body.password || "";

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required." });
    }
    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8–128 characters and include uppercase, lowercase, and a number.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const hashed  = await bcrypt.hash(password, 12);
    const newUser = new User({ email, name, password: hashed });
    await newUser.save();

    const token = buildToken(newUser);
    return res.status(201).json({ token, user: buildUserResponse(newUser) });
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── Login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const email    = (req.body.email    || "").toLowerCase().trim();
    const password =  req.body.password || "";

    if (!email)    return res.status(400).json({ message: "Email is required." });
    if (!password) return res.status(400).json({ message: "Password is required." });

    // password has select:false on the model — must opt in explicitly here
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = buildToken(user);
    return res.status(200).json({ token, user: buildUserResponse(user) });
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── Forgot Password ────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required." });
  }

  // Uniform response regardless of whether the email exists — prevents enumeration
  const SUCCESS_MSG = "If that email is registered, a reset link has been sent.";

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: SUCCESS_MSG });

    const rawToken  = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetTokenHash   = tokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    await transporter.sendMail({
      to:      user.email,
      subject: "Reset Your Password",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333">
          <div style="background:#059669;padding:24px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;margin:0;font-size:22px">Password Reset Request</h1>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px">
            <p>We received a request to reset your password. Click the button below to set a new one.</p>
            <div style="text-align:center;margin:28px 0">
              <a href="${resetUrl}"
                style="background:#059669;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600">
                Reset My Password
              </a>
            </div>
            <p style="font-size:13px;color:#555">
              Or copy and paste this link:<br>
              <span style="word-break:break-all;color:#059669">${resetUrl}</span>
            </p>
            <p style="font-size:13px;color:#666;background:#ecfdf5;padding:12px;border-left:4px solid #059669;border-radius:4px">
              This link expires in <strong>1 hour</strong>.
            </p>
            <p style="font-size:13px;color:#999">If you did not request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ message: SUCCESS_MSG });
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── Reset Password ─────────────────────────────────────────────
router.post("/reset-password/:token", async (req, res) => {
  const rawToken = req.params.token;
  const password = req.body.password || "";

  if (!rawToken || typeof rawToken !== "string") {
    return res.status(400).json({ message: "Invalid reset link." });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: "Password must be 8–128 characters and include uppercase, lowercase, and a number.",
    });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      resetTokenHash:   tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    user.password         = await bcrypt.hash(password, 12);
    user.resetTokenHash   = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful." });
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── Get Profile ────────────────────────────────────────────────
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name email role vendorStatus vendorProfile phone profilePicture orders savedPlans createdAt")
      .populate("savedPlans", "_id title description price image")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json(user);
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── Delete Account ─────────────────────────────────────────────
router.delete("/delete", verifyToken, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user.id);
    if (!deleted) return res.status(404).json({ message: "User not found." });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;