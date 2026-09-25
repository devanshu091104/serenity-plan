const { pool } = require("../config/db");

// =========================
// CREATE TRIP - ADMIN
// =========================
const createTrip = async (req, res) => {
  try {
    const {
      category_id,
      destination_id,
      title,
      slug,
      description,
      price,
      start_date,
      end_date,
      duration,
      available_slots,
      itinerary,
      inclusions,
      exclusions,
      status,
    } = req.body;

    if (
      !title ||
      !slug ||
      price === undefined ||
      price === null ||
      available_slots === undefined ||
      available_slots === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, slug, price and available slots are required",
      });
    }

    // Check slug
    const [existing] = await pool.execute(
      "SELECT id FROM trips WHERE slug = ?",
      [slug]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Trip with this slug already exists",
      });
    }

    // Check category
    if (category_id) {
      const [category] = await pool.execute(
        "SELECT id FROM categories WHERE id = ?",
        [category_id]
      );

      if (category.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Check destination
    if (destination_id) {
      const [destination] = await pool.execute(
        "SELECT id FROM destinations WHERE id = ?",
        [destination_id]
      );

      if (destination.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Destination not found",
        });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO trips
      (
        category_id,
        destination_id,
        title,
        slug,
        description,
        price,
        start_date,
        end_date,
        duration,
        available_slots,
        itinerary,
        inclusions,
        exclusions,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null,
        destination_id || null,
        title,
        slug,
        description || null,
        price,
        start_date || null,
        end_date || null,
        duration || null,
        available_slots,
        itinerary || null,
        inclusions || null,
        exclusions || null,
        status || "draft",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip: {
        id: result.insertId,
        title,
        slug,
        price,
        status: status || "draft",
      },
    });
  } catch (error) {
    console.error("Create Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET ALL TRIPS
// =========================
const getTrips = async (req, res) => {
  try {
    const [trips] = await pool.execute(`
      SELECT
        t.id,
        t.title,
        t.slug,
        t.description,
        t.price,
        t.start_date,
        t.end_date,
        t.duration,
        t.available_slots,
        t.itinerary,
        t.inclusions,
        t.exclusions,
        t.status,
        t.created_at,
        t.updated_at,

        c.id AS category_id,
        c.name AS category_name,

        d.id AS destination_id,
        d.name AS destination_name,
        d.image_url AS destination_image

      FROM trips t

      LEFT JOIN categories c
        ON t.category_id = c.id

      LEFT JOIN destinations d
        ON t.destination_id = d.id

      ORDER BY t.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET PUBLISHED TRIPS
// =========================
const getPublishedTrips = async (req, res) => {
  try {
    const [trips] = await pool.execute(`
      SELECT
        t.id,
        t.title,
        t.slug,
        t.description,
        t.price,
        t.start_date,
        t.end_date,
        t.duration,
        t.available_slots,
        t.itinerary,
        t.inclusions,
        t.exclusions,

        c.name AS category_name,

        d.name AS destination_name,
        d.image_url AS destination_image

      FROM trips t

      LEFT JOIN categories c
        ON t.category_id = c.id

      LEFT JOIN destinations d
        ON t.destination_id = d.id

      WHERE t.status = 'published'
      ORDER BY t.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get Published Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET SINGLE TRIP
// =========================
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const [trips] = await pool.execute(
      `
      SELECT
        t.id,
        t.title,
        t.slug,
        t.description,
        t.price,
        t.start_date,
        t.end_date,
        t.duration,
        t.available_slots,
        t.itinerary,
        t.inclusions,
        t.exclusions,
        t.status,
        t.created_at,
        t.updated_at,

        c.id AS category_id,
        c.name AS category_name,

        d.id AS destination_id,
        d.name AS destination_name,
        d.description AS destination_description,
        d.image_url AS destination_image

      FROM trips t

      LEFT JOIN categories c
        ON t.category_id = c.id

      LEFT JOIN destinations d
        ON t.destination_id = d.id

      WHERE t.id = ?
      `,
      [id]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Get trip images
    const [images] = await pool.execute(
      `
      SELECT id, image_url, is_primary
      FROM trip_images
      WHERE trip_id = ?
      ORDER BY is_primary DESC, created_at DESC
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      trip: {
        ...trips[0],
        images,
      },
    });
  } catch (error) {
    console.error("Get Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE TRIP - ADMIN
// =========================
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      destination_id,
      title,
      slug,
      description,
      price,
      start_date,
      end_date,
      duration,
      available_slots,
      itinerary,
      inclusions,
      exclusions,
      status,
    } = req.body;

    if (
      !title ||
      !slug ||
      price === undefined ||
      price === null ||
      available_slots === undefined ||
      available_slots === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, slug, price and available slots are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM trips WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check duplicate slug
    const [duplicateSlug] = await pool.execute(
      "SELECT id FROM trips WHERE slug = ? AND id != ?",
      [slug, id]
    );

    if (duplicateSlug.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another trip already uses this slug",
      });
    }

    if (category_id) {
      const [category] = await pool.execute(
        "SELECT id FROM categories WHERE id = ?",
        [category_id]
      );

      if (category.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    if (destination_id) {
      const [destination] = await pool.execute(
        "SELECT id FROM destinations WHERE id = ?",
        [destination_id]
      );

      if (destination.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Destination not found",
        });
      }
    }

    await pool.execute(
      `
      UPDATE trips
      SET
        category_id = ?,
        destination_id = ?,
        title = ?,
        slug = ?,
        description = ?,
        price = ?,
        start_date = ?,
        end_date = ?,
        duration = ?,
        available_slots = ?,
        itinerary = ?,
        inclusions = ?,
        exclusions = ?,
        status = ?
      WHERE id = ?
      `,
      [
        category_id || null,
        destination_id || null,
        title,
        slug,
        description || null,
        price,
        start_date || null,
        end_date || null,
        duration || null,
        available_slots,
        itinerary || null,
        inclusions || null,
        exclusions || null,
        status || "draft",
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
    });
  } catch (error) {
    console.error("Update Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// DELETE TRIP - ADMIN
// =========================
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT id FROM trips WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    await pool.execute(
      "DELETE FROM trips WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Delete Trip Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Trip cannot be deleted because it may have existing bookings",
    });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getPublishedTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};