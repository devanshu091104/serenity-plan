const { pool } = require("../config/db");

// =========================
// CREATE POST - ADMIN
// =========================
const createPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, slug and content are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM posts WHERE slug = ?",
      [slug]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Post with this slug already exists",
      });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO posts
      (
        author_id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        title,
        slug,
        excerpt || null,
        content,
        featured_image || null,
        status || "draft",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: {
        id: result.insertId,
        title,
        slug,
        status: status || "draft",
      },
    });
  } catch (error) {
    console.error("Create Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET PUBLISHED POSTS
// =========================
const getPosts = async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.content,
        p.featured_image,
        p.created_at,
        p.updated_at,
        u.name AS author_name
      FROM posts p
      LEFT JOIN users u
        ON p.author_id = u.id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET ALL POSTS - ADMIN
// =========================
const getAllPosts = async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.content,
        p.featured_image,
        p.status,
        p.created_at,
        p.updated_at,
        u.name AS author_name
      FROM posts p
      LEFT JOIN users u
        ON p.author_id = u.id
      ORDER BY p.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get All Posts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET POST BY ID
// =========================
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await pool.execute(
      `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.content,
        p.featured_image,
        p.status,
        p.created_at,
        p.updated_at,
        u.name AS author_name
      FROM posts p
      LEFT JOIN users u
        ON p.author_id = u.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post: posts[0],
    });
  } catch (error) {
    console.error("Get Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE POST - ADMIN
// =========================
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, slug and content are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM posts WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const [duplicate] = await pool.execute(
      "SELECT id FROM posts WHERE slug = ? AND id != ?",
      [slug, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another post already uses this slug",
      });
    }

    await pool.execute(
      `
      UPDATE posts
      SET
        title = ?,
        slug = ?,
        excerpt = ?,
        content = ?,
        featured_image = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title,
        slug,
        excerpt || null,
        content,
        featured_image || null,
        status || "draft",
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("Update Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// DELETE POST - ADMIN
// =========================
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT id FROM posts WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await pool.execute(
      "DELETE FROM posts WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};