const { pool } = require("../config/db");

// =========================
// CREATE INQUIRY - PUBLIC
// =========================
const createInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO inquiries
      (
        name,
        email,
        phone,
        subject,
        message,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'new')
      `,
      [
        name,
        email,
        phone || null,
        subject || null,
        message,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiry: {
        id: result.insertId,
        name,
        email,
        subject: subject || null,
        status: "new",
      },
    });
  } catch (error) {
    console.error("Create Inquiry Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET ALL INQUIRIES - ADMIN
// =========================
const getAllInquiries = async (req, res) => {
  try {
    const [inquiries] = await pool.execute(`
      SELECT
        id,
        name,
        email,
        phone,
        subject,
        message,
        status,
        created_at
      FROM inquiries
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error("Get Inquiries Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET INQUIRY BY ID - ADMIN
// =========================
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [inquiries] = await pool.execute(
      `
      SELECT
        id,
        name,
        email,
        phone,
        subject,
        message,
        status,
        created_at
      FROM inquiries
      WHERE id = ?
      `,
      [id]
    );

    if (inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      inquiry: inquiries[0],
    });
  } catch (error) {
    console.error("Get Inquiry Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// UPDATE INQUIRY STATUS - ADMIN
// =========================
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "read",
      "replied",
      "closed",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required: new, read, replied, closed",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM inquiries WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    await pool.execute(
      `
      UPDATE inquiries
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
    });
  } catch (error) {
    console.error("Update Inquiry Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// DELETE INQUIRY - ADMIN
// =========================
const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT id FROM inquiries WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    await pool.execute(
      "DELETE FROM inquiries WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete Inquiry Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
};