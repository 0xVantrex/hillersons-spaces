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

//  Google Signup / login
router.post("/google", async (req, res) => {
  console.log("Google auth request received", req.body);
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name,
        password: "",
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Google signup/login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    console.error("Error details:", error);
    res
      .status(500)
      .json({ message: "Google authentication failed", error: error.message });
  }
});

// 📌 Email/Password Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase();
    const { password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password) {
      return res.status(400).json({ message: "Please log in with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT with isAdmin from DB
    const token = jwt.sign(
      { id: user._id, isAdmin: !!user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: !!user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  console.log("Forgot password route hit", req.body);
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("SMTP config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      subject: "Reset Your Password - Action Required",
      html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
            </div>
      
            <!-- Main Content -->
            <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
        
              <p style="font-size: 16px; margin-bottom: 25px;">
                We received a request to reset the password for your account. If you made this request, click the button below to create a new password.
              </p>
        
              <!-- Reset Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s ease; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.3);">
                  Reset My Password
               </a>
              </div>
        
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                Or copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #10b981;">${resetUrl}</span>
              </p>
        
              <!-- Security Notice -->
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #047857;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in <strong>1 hour</strong> for your security.
                </p>
              </div>
        
              <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
        
              <!-- Footer -->
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
              <p style="font-size: 12px; color: #999; margin-bottom: 5px;">
                This is an automated message, please do not reply to this email.
              </p>
        
              <p style="font-size: 12px; color: #999; margin: 0;">
                If you're having trouble with the button above, copy and paste the URL into your web browser.
              </p>
            </div>
          </div>
        `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    console.log("Reset password request received", { token });
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    console.log("User found:", user ? user.email : "No user found");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    //clear reset token fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/user/profile
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
