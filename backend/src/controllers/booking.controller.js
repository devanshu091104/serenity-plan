const { pool } = require("../config/db");
const {
  sendBookingConfirmationEmail,
} = require("../services/email.service");

// =========================
// CREATE BOOKING - USER
// =========================
const createBooking = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { trip_id, travelers } = req.body;
    const user_id = req.user.id;

    // =========================
    // ADMIN BOOKING BLOCK
    // =========================
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot create customer bookings.",
      });
    }

    if (!trip_id || !travelers) {
      return res.status(400).json({
        success: false,
        message: "Trip ID and travelers are required",
      });
    }

    if (Number(travelers) < 1) {
      return res.status(400).json({
        success: false,
        message: "Travelers must be at least 1",
      });
    }

    await connection.beginTransaction();

    // =========================
    // GET TRIP
    // =========================
    const [trips] = await connection.execute(
      `
      SELECT
        id,
        title,
        price,
        available_slots,
        status
      FROM trips
      WHERE id = ?
      FOR UPDATE
      `,
      [trip_id]
    );

    if (trips.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const trip = trips[0];

    // =========================
    // CHECK TRIP STATUS
    // =========================
    if (trip.status !== "published") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This trip is not available for booking",
      });
    }

    // =========================
    // CHECK AVAILABLE SLOTS
    // =========================
    if (trip.available_slots < Number(travelers)) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: `Only ${trip.available_slots} slots are available`,
      });
    }

    // =========================
    // CALCULATE TOTAL
    // =========================
    const total_amount =
      Number(trip.price) * Number(travelers);

    // =========================
    // GENERATE BOOKING REFERENCE
    // =========================
    const booking_reference =
      `SP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // =========================
    // CREATE BOOKING
    // =========================
    const [result] = await connection.execute(
      `
      INSERT INTO bookings
      (
        booking_reference,
        user_id,
        trip_id,
        travelers,
        total_amount,
        booking_status,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, 'pending', 'pending')
      `,
      [
        booking_reference,
        user_id,
        trip_id,
        travelers,
        total_amount,
      ]
    );

    // =========================
    // REDUCE AVAILABLE SLOTS
    // =========================
    await connection.execute(
      `
      UPDATE trips
      SET available_slots = available_slots - ?
      WHERE id = ?
      `,
      [travelers, trip_id]
    );

    // =========================
    // COMMIT TRANSACTION
    // =========================
    await connection.commit();

    // =========================
    // SEND BOOKING EMAIL
    // =========================
    // Email failure should not make
    // the booking itself fail.
    try {
      const [users] = await pool.execute(
        `
        SELECT name, email
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [user_id]
      );

      if (users.length > 0) {
        await sendBookingConfirmationEmail({
          name: users[0].name,
          email: users[0].email,
          bookingReference: booking_reference,
          tripTitle: trip.title,
          travelers: Number(travelers),
          totalAmount: total_amount,
        });
      }
    } catch (emailError) {
      console.error(
        "Booking Email Error:",
        emailError.message
      );
    }

    // =========================
    // RESPONSE
    // =========================
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: {
        id: result.insertId,
        booking_reference,
        user_id,
        trip_id,
        trip_title: trip.title,
        travelers: Number(travelers),
        total_amount,
        booking_status: "pending",
        payment_status: "pending",
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "Rollback Error:",
        rollbackError.message
      );
    }

    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    connection.release();
  }
};

// =========================
// GET MY BOOKINGS - USER
// =========================
const getMyBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

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

        t.id AS trip_id,
        t.title AS trip_title,
        t.slug AS trip_slug,
        t.start_date,
        t.end_date,
        t.duration,

        d.name AS destination_name,
        d.image_url AS destination_image

      FROM bookings b

      INNER JOIN trips t
        ON b.trip_id = t.id

      LEFT JOIN destinations d
        ON t.destination_id = d.id

      WHERE b.user_id = ?

      ORDER BY b.booking_date DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET SINGLE MY BOOKING
// =========================
const getMyBookingById = async (req, res) => {
  try {
    const user_id = req.user.id;
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

        t.id AS trip_id,
        t.title AS trip_title,
        t.description,
        t.price,
        t.start_date,
        t.end_date,
        t.duration,
        t.itinerary,
        t.inclusions,
        t.exclusions,

        d.name AS destination_name,
        d.image_url AS destination_image

      FROM bookings b

      INNER JOIN trips t
        ON b.trip_id = t.id

      LEFT JOIN destinations d
        ON t.destination_id = d.id

      WHERE b.id = ?
      AND b.user_id = ?
      `,
      [id, user_id]
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
    console.error("Get Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// CANCEL BOOKING - USER
// =========================
const cancelBooking = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const user_id = req.user.id;
    const { id } = req.params;

    await connection.beginTransaction();

    // =========================
    // GET BOOKING
    // =========================
    const [bookings] = await connection.execute(
      `
      SELECT
        id,
        trip_id,
        travelers,
        booking_status
      FROM bookings
      WHERE id = ?
      AND user_id = ?
      FOR UPDATE
      `,
      [id, user_id]
    );

    if (bookings.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // =========================
    // CHECK BOOKING STATUS
    // =========================
    if (
      booking.booking_status === "cancelled" ||
      booking.booking_status === "completed"
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled",
      });
    }

    // =========================
    // CANCEL BOOKING
    // =========================
    await connection.execute(
      `
      UPDATE bookings
      SET booking_status = 'cancelled'
      WHERE id = ?
      `,
      [id]
    );

    // =========================
    // RESTORE SLOTS
    // =========================
    await connection.execute(
      `
      UPDATE trips
      SET available_slots = available_slots + ?
      WHERE id = ?
      `,
      [booking.travelers, booking.trip_id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "Rollback Error:",
        rollbackError.message
      );
    }

    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    connection.release();
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelBooking,
};