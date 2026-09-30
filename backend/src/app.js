const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const destinationRoutes = require("./routes/destination.routes");
const tripRoutes = require("./routes/trip.routes");

const bookingRoutes = require("./routes/booking.routes");
const adminBookingRoutes = require("./routes/admin.booking.routes");

const paymentRoutes = require("./routes/payment.routes");
const tripImageRoutes = require("./routes/tripImage.routes");

const postRoutes = require("./routes/post.routes");
const inquiryRoutes = require("./routes/inquiry.routes");

const adminDashboardRoutes = require("./routes/admin.dashboard.routes");
const adminUserRoutes = require("./routes/admin.user.routes");

dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* CORS */
const allowedOrigins = [
  "http://localhost:5173",
  "https://serenity-plan.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin, such as Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api/auth", authLimiter);

/* AUTH */
app.use("/api/auth", authRoutes);

/* PUBLIC / USER */
app.use("/api/categories", categoryRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/trip-images", tripImageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/inquiries", inquiryRoutes);

/* ADMIN */
app.use(
  "/api/admin/bookings",
  adminBookingRoutes
);

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);

app.use(
  "/api/admin/users",
  adminUserRoutes
);

/* HEALTH */
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Serenity Plan API is running",
  });
});

/* 404 */
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  return res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

module.exports = app;