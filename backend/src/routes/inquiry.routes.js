const express = require("express");

const {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiry.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Public
router.post("/", createInquiry);

// Admin
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllInquiries
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getInquiryById
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateInquiryStatus
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteInquiry
);

module.exports = router;