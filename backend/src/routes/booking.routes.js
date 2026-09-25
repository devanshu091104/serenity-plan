const express = require("express");

const {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelBooking,
} = require("../controllers/booking.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createBooking);

router.get("/my", protect, getMyBookings);

router.get("/my/:id", protect, getMyBookingById);

router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;