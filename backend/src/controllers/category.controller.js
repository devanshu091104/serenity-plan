const { pool } = require("../config/db");

// CREATE CATEGORY - Admin
const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM categories WHERE name = ? OR slug = ?",
      [name, slug]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO categories (name, slug, description)
       VALUES (?, ?, ?)`,
      [name, slug, description || null]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: {
        id: result.insertId,
        name,
        slug,
        description: description || null,
      },
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL CATEGORIES - Public
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT id, name, slug, description, created_at
       FROM categories
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET SINGLE CATEGORY - Public
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(
      `SELECT id, name, slug, description, created_at
       FROM categories
       WHERE id = ?`,
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category: categories[0],
    });
  } catch (error) {
    console.error("Get Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE CATEGORY - Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM categories WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await pool.execute(
      `UPDATE categories
       SET name = ?, slug = ?, description = ?
       WHERE id = ?`,
      [name, slug, description || null, id]
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE CATEGORY - Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT id FROM categories WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await pool.execute(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};