const { pool } = require("../config/db");

// =========================
// ADD TRIP IMAGE - ADMIN
// =========================
const addTripImage = async (req, res) => {
  try {
    const { trip_id, image_url, is_primary } = req.body;

    if (!trip_id || !image_url) {
      return res.status(400).json({
        success: false,
        message: "Trip ID and image URL are required",
      });
    }

    const [trip] = await pool.execute(
      "SELECT id FROM trips WHERE id = ?",
      [trip_id]
    );

    if (trip.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // If primary, remove previous primary
    if (is_primary) {
      await pool.execute(
        "UPDATE trip_images SET is_primary = FALSE WHERE trip_id = ?",
        [trip_id]
      );
    }

    const [result] = await pool.execute(
      `
      INSERT INTO trip_images
      (trip_id, image_url, is_primary)
      VALUES (?, ?, ?)
      `,
      [trip_id, image_url, Boolean(is_primary)]
    );

    return res.status(201).json({
      success: true,
      message: "Trip image added successfully",
      image: {
        id: result.insertId,
        trip_id,
        image_url,
        is_primary: Boolean(is_primary),
      },
    });
  } catch (error) {
    console.error("Add Trip Image Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET TRIP IMAGES
// =========================
const getTripImages = async (req, res) => {
  try {
    const { trip_id } = req.params;

    const [images] = await pool.execute(
      `
      SELECT id, trip_id, image_url, is_primary, created_at
      FROM trip_images
      WHERE trip_id = ?
      ORDER BY is_primary DESC, created_at DESC
      `,
      [trip_id]
    );

    return res.status(200).json({
      success: true,
      count: images.length,
      images,
    });
  } catch (error) {
    console.error("Get Trip Images Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// DELETE TRIP IMAGE - ADMIN
// =========================
const deleteTripImage = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT id FROM trip_images WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip image not found",
      });
    }

    await pool.execute(
      "DELETE FROM trip_images WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Trip image deleted successfully",
    });
  } catch (error) {
    console.error("Delete Trip Image Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  addTripImage,
  getTripImages,
  deleteTripImage,
};