const express = require("express");

const {
  createPayment,
  verifyPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
} = require("../controllers/payment.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// User payment routes
router.post("/", protect, createPayment);

router.post(
  "/verify",
  protect,
  verifyPayment
);

router.get(
  "/my",
  protect,
  getMyPayments
);

// Admin payment routes
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllPayments
);

router.get(
  "/:id",
  protect,
  getPaymentById
);

module.exports = router;