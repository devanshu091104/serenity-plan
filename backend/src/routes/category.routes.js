const express = require("express");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Public
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin only
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createCategory
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteCategory
);

module.exports = router;