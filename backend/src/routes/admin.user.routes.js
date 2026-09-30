const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} = require("../controllers/admin.user.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

module.exports = router;