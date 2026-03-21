//backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const verifyToken = require("../middleware/auth");

// ── Helper: build JWT payload from user doc ───────────────────────────────────
const buildToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role || "user",
      isAdmin: user.role === "admin",
      vendorStatus: user.vendorStatus || "none",
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ── Helper: build user response object ───────────────────────────────────────
const buildUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role || "user",
  isAdmin: user.role === "admin",
  vendorStatus: user.vendorStatus || "none",
  vendorProfile: user.vendorProfile || null,
});

// ── Google Signup / Login ─────────────────────────────────────────────────────
router.post("/google", async (req, res) => {
  console.log("Google auth request received", req.body);
  const { tokenId } = req.body;

  try {
    const tokenPayload = JSON.parse(
      Buffer.from(tokenId.split(".")[1], "base64url").toString()
    );

    const ticket = await client
      .verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID })
      .catch((err) => {
        if (err.message && err.message.includes("Token used too early")) {
          console.warn("Clock skew detected — using decoded payload. Sync your server clock!");
          if (tokenPayload.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error("Token audience mismatch");
          const now = Math.floor(Date.now() / 1000);
          if (tokenPayload.exp && now > tokenPayload.exp) throw new Error("Token has expired");
          return { getPayload: () => tokenPayload };
        }
        throw err;
      });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, password: "" });
      await user.save();
    }

    const token = buildToken(user);

    res.status(200).json({
      message: "Google signup/login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(500).json({ message: "Google authentication failed", error: error.message });
  }
});

// ── Email/Password Signup ─────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    const token = buildToken(newUser);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: buildUserResponse(newUser),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase();
    const { password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password) return res.status(400).json({ message: "Please log in with Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = buildToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Forgot Password ───────────────────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  console.log("Forgot password route hit", req.body);
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Reset Your Password - Action Required",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="font-size: 16px; margin-bottom: 25px;">We received a request to reset the password for your account. Click the button below to create a new password.</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Reset My Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              Or copy and paste this link:<br>
              <span style="word-break: break-all; color: #10b981;">${resetUrl}</span>
            </p>
            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #047857;"><strong>Security Notice:</strong> This link expires in <strong>1 hour</strong>.</p>
            </div>
            <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Get Profile ───────────────────────────────────────────────────────────────
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("savedPlans", "_id title description price image")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Delete Account ────────────────────────────────────────────────────────────
router.delete("/delete", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;