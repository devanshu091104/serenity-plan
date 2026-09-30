const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/admin.dashboard.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

module.exports = router;