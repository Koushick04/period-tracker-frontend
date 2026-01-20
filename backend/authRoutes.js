const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db"); // your postgres connection

const router = express.Router();

const JWT_SECRET = "supersecretkey"; // ok for local dev

// Middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const displayName = req.body.name || "User"; // Default if not provided

    const result = await pool.query(
      "INSERT INTO users (email, password, display_name) VALUES ($1,$2,$3) RETURNING id",
      [email, hashed, displayName]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PROFILE ROUTES
router.get("/profile", auth, async (req, res) => {
  const result = await pool.query("SELECT display_name, avatar FROM users WHERE id=$1", [req.userId]);
  res.json(result.rows[0]);
});

router.put("/profile", auth, async (req, res) => {
  const { display_name, avatar } = req.body;
  await pool.query(
    "UPDATE users SET display_name=$1, avatar=$2 WHERE id=$3",
    [display_name, avatar, req.userId]
  );
  res.json({ success: true });
});

// SETTINGS ROUTES
router.get("/settings", auth, async (req, res) => {
  const result = await pool.query("SELECT cycle_override, notify_days FROM users WHERE id=$1", [req.userId]);
  res.json(result.rows[0]);
});

router.put("/settings", auth, async (req, res) => {
  const { cycle_override, notify_days } = req.body;
  await pool.query(
    "UPDATE users SET cycle_override=$1, notify_days=$2 WHERE id=$3",
    [cycle_override, notify_days, req.userId]
  );
  res.json({ success: true });
});

const nodemailer = require("nodemailer");
require("dotenv").config();

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await pool.query(
      "UPDATE users SET otp_code=$1, otp_expires=$2 WHERE email=$3",
      [otp, expires, email]
    );

    // EMAIL SENDING LOGIC
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // REAL EMAIL
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Period Tracker - Password Reset OTP",
        text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: `OTP sent to ${email} (Check Inbox)` });

    } else {
      // MOCK EMAIL (Fallback)
      console.log(`\n=== [MOCK EMAIL SERVICE] ===\nTo: ${email}\nSubject: Password Reset OTP\nYour verification code is: ${otp}\n============================\n`);
      res.json({ success: true, message: "OTP sent (Check Server Console for Mock Code)" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error or Email failed" });
  }
});

// RESET PASSWORD (Verify OTP & Update)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = userRes.rows[0];

    // Verify OTP
    if (user.otp_code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > parseInt(user.otp_expires)) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await pool.query(
      "UPDATE users SET password=$1, otp_code=NULL, otp_expires=NULL WHERE email=$2",
      [hashed, email]
    );

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
