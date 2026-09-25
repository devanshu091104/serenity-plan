const express = require("express");

const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
} = require("../controllers/admin.booking.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getAllBookings);

router.get("/:id", getBookingById);

router.put("/:id/status", updateBookingStatus);

router.put("/:id/payment-status", updatePaymentStatus);

module.exports = router;