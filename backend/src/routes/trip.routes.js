const express = require("express");

const {
  createTrip,
  getTrips,
  getPublishedTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../controllers/trip.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Public routes
router.get("/published", getPublishedTrips);

// Admin routes
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getTrips
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createTrip
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateTrip
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteTrip
);

// Public trip details
router.get("/:id", getTripById);

module.exports = router;