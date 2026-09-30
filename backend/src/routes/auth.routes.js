const express = require("express");

const {
  register,
  verifyEmail,
  resendVerificationOTP,
  login,
  getProfile,
} = require("../controllers/auth.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// =========================
// AUTH ROUTES
// =========================

// Register
router.post(
  "/register",
  register
);

// Verify email OTP
router.post(
  "/verify-email",
  verifyEmail
);

// Resend verification OTP
router.post(
  "/resend-otp",
  resendVerificationOTP
);

// Login
router.post(
  "/login",
  login
);

// Current logged-in user
router.get(
  "/me",
  protect,
  getProfile
);

// =========================
// ADMIN TEST ROUTE
// =========================

router.get(
  "/admin-test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  }
);

module.exports = router;