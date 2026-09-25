const { pool } = require("../config/db");

// =========================
// GET ALL BOOKINGS - ADMIN
// =========================
const getAllBookings = async (req, res) => {
  try {
    const [bookings] = await pool.execute(`
      SELECT
        b.id,
        b.booking_reference,
        b.travelers,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        b.booking_date,

        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,

        t.id AS trip_id,
        t.title AS trip_title,

        d.name AS destination_name

      FROM bookings b

      INNER JOIN users u
        ON b.user_id = u.id

      INNER JOIN trips t
        ON b.trip_id = t.id

      LEFT JOIN destinations d
        ON t.destination_id = d.id

      ORDER BY b.booking_date DESC
    `);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET BOOKING BY ID - ADMIN
// =========================
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await pool.execute(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.travelers,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        b.booking_date,

        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,

        t.id AS trip_id,
        t.title AS trip_title,
        t.price AS trip_price,
        t.start_date,
        t.end_date,
        t.duration,

        d.name AS destination_name

      FROM bookings b

      INNER JOIN users u
        ON b.user_id = u.id

      INNER JOIN trips t
        ON b.trip_id = t.id

      LEFT JOIN destinations d
        ON t.destination_id = d.id

      WHERE b.id = ?
      `,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking: bookings[0],
    });
  } catch (error) {
    console.error("Get Admin Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE BOOKING STATUS
// =========================
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ];

    if (!booking_status || !allowedStatuses.includes(booking_status)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid booking status is required: pending, confirmed, cancelled, completed",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM bookings WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await pool.execute(
      `
      UPDATE bookings
      SET booking_status = ?
      WHERE id = ?
      `,
      [booking_status, id]
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE PAYMENT STATUS
// =========================
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    if (!payment_status || !allowedStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid payment status is required: pending, paid, failed, refunded",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM bookings WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await pool.execute(
      `
      UPDATE bookings
      SET payment_status = ?
      WHERE id = ?
      `,
      [payment_status, id]
    );

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
};