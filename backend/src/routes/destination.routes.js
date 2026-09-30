const express = require("express");

const {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require("../controllers/destination.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Public routes
router.get("/", getDestinations);
router.get("/:id", getDestinationById);

// Admin routes
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDestination
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateDestination
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteDestination
);

module.exports = router;