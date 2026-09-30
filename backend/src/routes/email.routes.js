const express = require("express");
const { sendEmail } = require("../services/email.service");

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await sendEmail({
      to: email,
      subject: "Serenity Plan Email Test",
      html: `
        <h2>Serenity Plan</h2>
        <p>Email service is working successfully.</p>
        <p>This is a test email.</p>
      `,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email test failed",
      error: error.message,
    });
  }
});

module.exports = router;