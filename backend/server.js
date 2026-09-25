const app = require("./src/app");
const { testConnection } = require("./src/config/db");
const {
  verifyEmailConnection,
} = require("./src/services/email.service");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Test email/SMTP connection
    await verifyEmailConnection();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Server startup error:",
      error
    );

    process.exit(1);
  }
};

startServer();
