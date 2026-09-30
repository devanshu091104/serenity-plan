const express = require("express");

const {
  createPost,
  getPosts,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Public
router.get("/", getPosts);
router.get("/:id", getPostById);

// Admin
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllPosts
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createPost
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updatePost
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deletePost
);

module.exports = router;