const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../config/db");
const {
  sendVerificationOTPEmail,
} = require("../services/email.service");

// =========================
// GENERATE OTP
// =========================
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// =========================
// REGISTER USER
// =========================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = generateOTP();

    console.log(
  `🔐 Verification OTP for ${normalizedEmail}: ${otp}`
);
    // OTP valid for 10 minutes
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const [result] = await pool.execute(
      `INSERT INTO users
      (
        name,
        email,
        password,
        role,
        status,
        email_verified,
        verification_otp,
        verification_otp_expires
      )
      VALUES (?, ?, ?, 'user', 'active', FALSE, ?, ?)`,
      [
        name.trim(),
        normalizedEmail,
        hashedPassword,
        otp,
        otpExpires,
      ]
    );

    // Send verification email
    try {
      await sendVerificationOTPEmail({
        name: name.trim(),
        email: normalizedEmail,
        otp,
      });
    } catch (emailError) {
      console.error(
        "Verification Email Error:",
        emailError
      );

      // Remove user if email could not be sent
      await pool.execute(
        "DELETE FROM users WHERE id = ?",
        [result.insertId]
      );

      return res.status(500).json({
        success: false,
        message:
          "Registration failed because verification email could not be sent.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email using the OTP sent to your email address.",
      requiresVerification: true,
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role: "user",
        email_verified: false,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// VERIFY EMAIL
// =========================
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      `SELECT
        id,
        name,
        email,
        role,
        email_verified,
        verification_otp,
        verification_otp_expires
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!user.verification_otp) {
      return res.status(400).json({
        success: false,
        message:
          "No verification OTP found. Please request a new OTP.",
      });
    }

    if (
      !user.verification_otp_expires ||
      new Date(user.verification_otp_expires) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    if (
      String(otp).trim() !==
      String(user.verification_otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await pool.execute(
      `UPDATE users
       SET
         email_verified = TRUE,
         verification_otp = NULL,
         verification_otp_expires = NULL
       WHERE id = ?`,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// RESEND VERIFICATION OTP
// =========================
const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      `SELECT
        id,
        name,
        email,
        email_verified
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = generateOTP();

    console.log(
  `🔐 Verification OTP for ${normalizedEmail}: ${otp}`
);
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await pool.execute(
      `UPDATE users
       SET
         verification_otp = ?,
         verification_otp_expires = ?
       WHERE id = ?`,
      [otp, otpExpires, user.id]
    );

    await sendVerificationOTPEmail({
      name: user.name,
      email: user.email,
      otp,
    });

    return res.status(200).json({
      success: true,
      message:
        "A new verification OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to resend OTP. Please try again.",
    });
  }
};

// =========================
// LOGIN USER
// =========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      `SELECT
        id,
        name,
        email,
        password,
        role,
        status,
        email_verified
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Normal users must verify email.
    // Admin can login directly.
    if (
      user.role !== "admin" &&
      !user.email_verified
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET CURRENT USER PROFILE
// =========================
const getProfile = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT
        id,
        name,
        email,
        role,
        status,
        email_verified,
        created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error(
      "Get Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  register,
  verifyEmail,
  resendVerificationOTP,
  login,
  getProfile,
};