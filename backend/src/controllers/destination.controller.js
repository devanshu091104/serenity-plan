const { pool } = require("../config/db");

// =========================
// CREATE DESTINATION - ADMIN
// =========================
const createDestination = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image_url,
      status,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM destinations WHERE name = ? OR slug = ?",
      [name, slug]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Destination already exists",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO destinations
       (name, slug, description, image_url, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description || null,
        image_url || null,
        status || "active",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Destination created successfully",
      destination: {
        id: result.insertId,
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        status: status || "active",
      },
    });
  } catch (error) {
    console.error("Create Destination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET ALL DESTINATIONS
// =========================
const getDestinations = async (req, res) => {
  try {
    const [destinations] = await pool.execute(
      `SELECT id, name, slug, description, image_url, status, created_at
       FROM destinations
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: destinations.length,
      destinations,
    });
  } catch (error) {
    console.error("Get Destinations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET SINGLE DESTINATION
// =========================
const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [destinations] = await pool.execute(
      `SELECT id, name, slug, description, image_url, status, created_at
       FROM destinations
       WHERE id = ?`,
      [id]
    );

    if (destinations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    return res.status(200).json({
      success: true,
      destination: destinations[0],
    });
  } catch (error) {
    console.error("Get Destination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE DESTINATION - ADMIN
// =========================
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      slug,
      description,
      image_url,
      status,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM destinations WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    await pool.execute(
      `UPDATE destinations
       SET name = ?,
           slug = ?,
           description = ?,
           image_url = ?,
           status = ?
       WHERE id = ?`,
      [
        name,
        slug,
        description || null,
        image_url || null,
        status || "active",
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Destination updated successfully",
    });
  } catch (error) {
    console.error("Update Destination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// DELETE DESTINATION - ADMIN
// =========================
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT id FROM destinations WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    await pool.execute(
      "DELETE FROM destinations WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.error("Delete Destination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
};