const express = require("express");

const {
  addTripImage,
  getTripImages,
  deleteTripImage,
} = require("../controllers/tripImage.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/:trip_id", getTripImages);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  addTripImage
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteTripImage
);

module.exports = router;