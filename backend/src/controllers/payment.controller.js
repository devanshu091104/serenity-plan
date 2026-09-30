const Razorpay = require("razorpay");
const crypto = require("crypto");

const { pool } = require("../config/db");

const {
  sendPaymentConfirmationEmail,
} = require("../services/email.service");

// =========================
// RAZORPAY INSTANCE
// =========================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =========================
// CREATE RAZORPAY ORDER
// =========================

const createPayment = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { booking_id } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // =========================
    // GET BOOKING
    // =========================

    const [bookings] = await pool.execute(
      `
      SELECT
        b.id,
        b.user_id,
        b.booking_reference,
        b.total_amount,
        b.booking_status,
        b.payment_status,

        t.title AS trip_title

      FROM bookings b

      INNER JOIN trips t
        ON b.trip_id = t.id

      WHERE b.id = ?
      `,
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // =========================
    // OWNERSHIP CHECK
    // =========================

    if (
      Number(booking.user_id) !==
      Number(user_id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot pay for this booking",
      });
    }

    // =========================
    // CANCELLED CHECK
    // =========================

    if (
      booking.booking_status ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled booking cannot be paid",
      });
    }

    // =========================
    // ALREADY PAID CHECK
    // =========================

    if (
      booking.payment_status ===
      "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already paid",
      });
    }

    // =========================
    // CHECK SUCCESSFUL PAYMENT
    // =========================

    const [existingPayment] =
      await pool.execute(
        `
        SELECT
          id,
          status,
          razorpay_order_id

        FROM payments

        WHERE booking_id = ?
        AND status = 'success'

        ORDER BY id DESC

        LIMIT 1
        `,
        [booking_id]
      );

    if (
      existingPayment.length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment already completed",
      });
    }

    // =========================
    // AMOUNT
    // =========================

    const amountInPaise =
      Math.round(
        Number(
          booking.total_amount
        ) * 100
      );

    if (
      !amountInPaise ||
      amountInPaise <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking amount",
      });
    }

    // =========================
    // RAZORPAY ORDER
    // =========================

    const receipt =
      `SP-${booking.id}-${Date.now()}`;

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,

        currency: "INR",

        receipt,

        notes: {
          booking_id:
            String(booking.id),

          booking_reference:
            booking.booking_reference,

          user_id:
            String(user_id),
        },
      });

    // =========================
    // LOCAL TRANSACTION ID
    // =========================

    const transaction_id =
      `SP-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

    // =========================
    // INSERT PAYMENT
    // =========================

    const [result] =
      await pool.execute(
        `
        INSERT INTO payments
        (
          booking_id,
          razorpay_order_id,
          user_id,
          transaction_id,
          payment_gateway,
          amount,
          currency,
          status
        )

        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          'Razorpay',
          ?,
          'INR',
          'pending'
        )
        `,
        [
          booking_id,
          razorpayOrder.id,
          user_id,
          transaction_id,
          booking.total_amount,
        ]
      );

    // =========================
    // RESPONSE
    // =========================

    return res.status(201).json({
      success: true,

      message:
        "Razorpay order created successfully",

      payment: {
        id: result.insertId,

        booking_id:
          booking.id,

        booking_reference:
          booking.booking_reference,

        razorpay_order_id:
          razorpayOrder.id,

        amount:
          Number(
            booking.total_amount
          ),

        amount_in_paise:
          amountInPaise,

        currency: "INR",

        transaction_id,

        status: "pending",

        payment_gateway:
          "Razorpay",
      },

      razorpay: {
        key_id:
          process.env.RAZORPAY_KEY_ID,

        order_id:
          razorpayOrder.id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name:
          "Serenity Plan",

        description:
          booking.trip_title,

        prefill: {
          name:
            req.user.name || "",

          email:
            req.user.email || "",
        },
      },
    });
  } catch (error) {
    console.error(
      "Create Razorpay Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create Razorpay payment order",
    });
  }
};

// =========================
// VERIFY RAZORPAY PAYMENT
// =========================

const verifyPayment = async (
  req,
  res
) => {
  try {
    const user_id = req.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment details are required",
      });
    }

    // =========================
    // GET PAYMENT + BOOKING + USER
    // =========================

    const [payments] =
      await pool.execute(
        `
        SELECT

          p.id AS payment_id,
          p.booking_id,
          p.user_id,
          p.razorpay_order_id,
          p.status,

          b.booking_reference,
          b.travelers,
          b.total_amount,

          t.title AS trip_title,

          u.name AS user_name,
          u.email AS user_email

        FROM payments p

        INNER JOIN bookings b
          ON p.booking_id = b.id

        INNER JOIN trips t
          ON b.trip_id = t.id

        INNER JOIN users u
          ON b.user_id = u.id

        WHERE p.razorpay_order_id = ?

        AND p.user_id = ?

        LIMIT 1
        `,
        [
          razorpay_order_id,
          user_id,
        ]
      );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Payment order not found",
      });
    }

    const payment =
      payments[0];

    // =========================
    // ALREADY SUCCESSFUL
    // =========================

    if (
      payment.status ===
      "success"
    ) {
      return res.status(200).json({
        success: true,

        message:
          "Payment already verified",

        payment: {
          id:
            payment.payment_id,

          booking_id:
            payment.booking_id,

          booking_reference:
            payment.booking_reference,

          razorpay_order_id,

          razorpay_payment_id,

          status:
            "success",
        },
      });
    }

    // =========================
    // GENERATE SIGNATURE
    // =========================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    // =========================
    // SIGNATURE VALIDATION
    // =========================

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpay_signature,
        "utf8"
      );

    let isSignatureValid = false;

    if (
      generatedBuffer.length ===
      receivedBuffer.length
    ) {
      isSignatureValid =
        crypto.timingSafeEqual(
          generatedBuffer,
          receivedBuffer
        );
    }

    // =========================
    // INVALID SIGNATURE
    // =========================

    if (!isSignatureValid) {
      await pool.execute(
        `
        UPDATE payments

        SET
          status = 'failed',
          razorpay_payment_id = ?,
          razorpay_signature = ?

        WHERE id = ?
        `,
        [
          razorpay_payment_id,
          razorpay_signature,
          payment.payment_id,
        ]
      );

      return res.status(400).json({
        success: false,
        message:
          "Payment signature verification failed",
      });
    }

    // =========================
    // DATABASE TRANSACTION
    // =========================

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      // =========================
      // UPDATE PAYMENT
      // =========================

      await connection.execute(
        `
        UPDATE payments

        SET
          razorpay_payment_id = ?,
          razorpay_signature = ?,
          transaction_id = ?,
          status = 'success',
          paid_at = NOW()

        WHERE id = ?
        `,
        [
          razorpay_payment_id,
          razorpay_signature,
          razorpay_payment_id,
          payment.payment_id,
        ]
      );

      // =========================
      // UPDATE BOOKING
      // =========================

      await connection.execute(
        `
        UPDATE bookings

        SET
          payment_status = 'paid',
          booking_status = 'confirmed'

        WHERE id = ?
        `,
        [payment.booking_id]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }

    // =========================
    // SEND PAYMENT SUCCESS EMAIL
    // =========================

    let emailSent = true;

    try {
      await sendPaymentConfirmationEmail({
        email:
          payment.user_email,

        name:
          payment.user_name,

        bookingReference:
          payment.booking_reference,

        tripTitle:
          payment.trip_title,

        travelers:
          payment.travelers,

        totalAmount:
          payment.total_amount,

        paymentId:
          razorpay_payment_id,
      });
    } catch (emailError) {
      emailSent = false;

      console.error(
        "Payment confirmation email failed:",
        emailError
      );
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      emailSent,

      payment: {
        id:
          payment.payment_id,

        booking_id:
          payment.booking_id,

        booking_reference:
          payment.booking_reference,

        razorpay_order_id,

        razorpay_payment_id,

        status:
          "success",
      },
    });
  } catch (error) {
    console.error(
      "Verify Razorpay Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify payment",
    });
  }
};

// =========================
// GET MY PAYMENTS
// =========================

const getMyPayments = async (
  req,
  res
) => {
  try {
    const user_id =
      req.user.id;

    const [payments] =
      await pool.execute(
        `
        SELECT

          p.id,
          p.booking_id,

          p.razorpay_order_id,
          p.razorpay_payment_id,

          p.transaction_id,
          p.payment_gateway,

          p.amount,
          p.currency,

          p.status,
          p.paid_at,
          p.created_at,

          b.booking_reference

        FROM payments p

        INNER JOIN bookings b
          ON p.booking_id = b.id

        WHERE p.user_id = ?

        ORDER BY
          p.created_at DESC
        `,
        [user_id]
      );

    return res.status(200).json({
      success: true,

      count:
        payments.length,

      payments,
    });
  } catch (error) {
    console.error(
      "Get My Payments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

// =========================
// GET PAYMENT BY ID
// =========================

const getPaymentById = async (
  req,
  res
) => {
  try {
    const user_id =
      req.user.id;

    const { id } =
      req.params;

    const [payments] =
      await pool.execute(
        `
        SELECT

          p.id,
          p.booking_id,

          p.razorpay_order_id,
          p.razorpay_payment_id,

          p.transaction_id,
          p.payment_gateway,

          p.amount,
          p.currency,

          p.status,
          p.paid_at,
          p.created_at,

          b.booking_reference

        FROM payments p

        INNER JOIN bookings b
          ON p.booking_id = b.id

        WHERE p.id = ?

        AND p.user_id = ?
        `,
        [
          id,
          user_id,
        ]
      );

    if (
      payments.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,

      payment:
        payments[0],
    });
  } catch (error) {
    console.error(
      "Get Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};
const getAllPayments = async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT
        p.id,
        p.booking_id,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.transaction_id,
        p.payment_gateway,
        p.amount,
        p.currency,
        p.status,
        p.paid_at,
        p.created_at,

        b.booking_reference,
        b.booking_status,
        b.payment_status,

        u.name AS user_name,
        u.email AS user_email,

        t.title AS trip_title

      FROM payments p

      INNER JOIN bookings b
        ON p.booking_id = b.id

      INNER JOIN users u
        ON p.user_id = u.id

      INNER JOIN trips t
        ON b.trip_id = t.id

      ORDER BY p.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch payments",
    });
  }
};

// =========================
// EXPORTS
// =========================

module.exports = {
  createPayment,
  verifyPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
};