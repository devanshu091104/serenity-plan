const nodemailer = require("nodemailer");

require("dotenv").config();

// =========================
// EMAIL TRANSPORTER
// =========================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// =========================
// VERIFY EMAIL CONNECTION
// =========================

const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log(
      "Email service connected successfully"
    );
  } catch (error) {
    console.error(
      "Email service connection failed:",
      error.message
    );
  }
};

// =========================
// GENERIC SEND EMAIL
// =========================

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const info =
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });

    console.log(
      "Email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Send Email Error:",
      error
    );

    throw error;
  }
};

// =========================
// VERIFICATION OTP EMAIL
// =========================

const sendVerificationOTPEmail = async ({
  name,
  email,
  otp,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,

      to: email,

      subject:
        "Verify Your Serenity Plan Account",

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Email Verification</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background: #f5f7fb;
              font-family: Arial, sans-serif;
            "
          >

            <div
              style="
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 14px;
                padding: 35px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              "
            >

              <h1
                style="
                  margin: 0 0 10px;
                  color: #111827;
                "
              >
                Serenity Plan
              </h1>

              <p
                style="
                  color: #6b7280;
                  font-size: 15px;
                "
              >
                Travel. Explore. Relax.
              </p>

              <hr
                style="
                  border: none;
                  border-top: 1px solid #e5e7eb;
                  margin: 25px 0;
                "
              />

              <h2 style="color: #111827;">
                Verify your email
              </h2>

              <p
                style="
                  color: #374151;
                  font-size: 15px;
                  line-height: 1.6;
                "
              >
                Hi ${name},
              </p>

              <p
                style="
                  color: #374151;
                  font-size: 15px;
                  line-height: 1.6;
                "
              >
                Thank you for creating your
                Serenity Plan account.
                Please use the OTP below
                to verify your email address.
              </p>

              <div
                style="
                  margin: 30px 0;
                  padding: 22px;
                  background: #f3f4f6;
                  border-radius: 12px;
                  text-align: center;
                "
              >

                <p
                  style="
                    margin: 0 0 10px;
                    color: #6b7280;
                    font-size: 13px;
                  "
                >
                  YOUR VERIFICATION CODE
                </p>

                <div
                  style="
                    font-size: 34px;
                    font-weight: bold;
                    letter-spacing: 10px;
                    color: #111827;
                  "
                >
                  ${otp}
                </div>

              </div>

              <p
                style="
                  color: #374151;
                  font-size: 14px;
                "
              >
                This OTP is valid for
                <strong>10 minutes</strong>.
              </p>

              <p
                style="
                  color: #6b7280;
                  font-size: 13px;
                  line-height: 1.6;
                "
              >
                If you did not create this account,
                you can safely ignore this email.
              </p>

              <p
                style="
                  margin-top: 30px;
                  color: #374151;
                  font-size: 14px;
                "
              >
                Regards,<br />

                <strong>
                  Serenity Plan Team
                </strong>
              </p>

            </div>

          </body>
        </html>
      `,
    };

    console.log(
      "OTP EMAIL RECIPIENT:",
      email
    );

    console.log(
      "EMAIL FROM:",
      process.env.EMAIL_FROM
    );

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Verification OTP email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Verification OTP Email Error:",
      error
    );

    throw error;
  }
};

// =========================
// BOOKING CONFIRMATION EMAIL
// =========================

const sendBookingConfirmationEmail = async ({
  email,
  name,
  bookingReference,
  tripTitle,
  travelers,
  totalAmount,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,

      to: email,

      subject:
        `Booking Confirmation - ${bookingReference}`,

      html: `
        <!DOCTYPE html>
        <html>

          <body
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              color: #1f2937;
            "
          >

            <h2>
              Booking Received
            </h2>

            <p>
              Hi ${name},
            </p>

            <p>
              Your booking request has been
              successfully received.
            </p>

            <div
              style="
                background: #f3f4f6;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
              "
            >

              <p>
                <strong>
                  Booking Reference:
                </strong>

                ${bookingReference}
              </p>

              <p>
                <strong>
                  Trip:
                </strong>

                ${tripTitle}
              </p>

              <p>
                <strong>
                  Travelers:
                </strong>

                ${travelers}
              </p>

              <p>
                <strong>
                  Total Amount:
                </strong>

                ₹${totalAmount}
              </p>

            </div>

            <p>
              Your booking is currently
              pending payment confirmation.
            </p>

            <p>
              Please complete the payment
              to confirm your booking.
            </p>

            <p>
              Regards,<br />

              <strong>
                Serenity Plan Team
              </strong>
            </p>

          </body>

        </html>
      `,
    };

    console.log(
      "BOOKING EMAIL RECIPIENT:",
      email
    );

    console.log(
      "EMAIL FROM:",
      process.env.EMAIL_FROM
    );

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Booking email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Booking Email Error:",
      error
    );

    throw error;
  }
};

// =========================
// PAYMENT CONFIRMATION EMAIL
// =========================

const sendPaymentConfirmationEmail = async ({
  email,
  name,
  bookingReference,
  tripTitle,
  travelers,
  totalAmount,
  paymentId,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,

      to: email,

      subject:
        `Payment Successful - ${bookingReference}`,

      html: `
        <!DOCTYPE html>

        <html>

          <head>

            <meta charset="UTF-8" />

            <title>
              Payment Successful
            </title>

          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background: #f5f7fb;
              font-family: Arial, sans-serif;
              color: #1f2937;
            "
          >

            <div
              style="
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 14px;
                padding: 35px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              "
            >

              <div
                style="
                  text-align: center;
                  margin-bottom: 25px;
                "
              >

                <div
                  style="
                    width: 60px;
                    height: 60px;
                    margin: auto;
                    border-radius: 50%;
                    background: #dcfce7;
                    color: #059669;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                    font-weight: bold;
                  "
                >
                  ✓
                </div>

              </div>

              <h1
                style="
                  text-align: center;
                  color: #059669;
                  margin-bottom: 10px;
                "
              >
                Payment Successful
              </h1>

              <p
                style="
                  text-align: center;
                  color: #6b7280;
                  font-size: 15px;
                "
              >
                Your payment has been
                successfully verified.
              </p>

              <p
                style="
                  color: #374151;
                  font-size: 15px;
                  line-height: 1.6;
                "
              >
                Hi ${name},
              </p>

              <p
                style="
                  color: #374151;
                  font-size: 15px;
                  line-height: 1.6;
                "
              >
                Your payment has been
                successfully processed and
                your booking is now
                <strong>confirmed</strong>.
              </p>

              <div
                style="
                  background: #f0fdf4;
                  border: 1px solid #bbf7d0;
                  padding: 20px;
                  border-radius: 12px;
                  margin: 25px 0;
                "
              >

                <p>
                  <strong>
                    Booking Reference:
                  </strong>

                  ${bookingReference}
                </p>

                <p>
                  <strong>
                    Trip:
                  </strong>

                  ${tripTitle}
                </p>

                <p>
                  <strong>
                    Travelers:
                  </strong>

                  ${travelers}
                </p>

                <p>
                  <strong>
                    Amount Paid:
                  </strong>

                  ₹${Number(
                    totalAmount
                  ).toLocaleString("en-IN")}
                </p>

                <p>
                  <strong>
                    Payment ID:
                  </strong>

                  ${paymentId}
                </p>

                <p>
                  <strong>
                    Payment Status:
                  </strong>

                  <span
                    style="
                      color: #059669;
                      font-weight: bold;
                    "
                  >
                    Successful
                  </span>
                </p>

              </div>

              <p
                style="
                  color: #374151;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                Thank you for booking with
                Serenity Plan.
                We look forward to making
                your journey memorable.
              </p>

              <p
                style="
                  margin-top: 30px;
                  color: #374151;
                  font-size: 14px;
                "
              >
                Regards,<br />

                <strong>
                  Serenity Plan Team
                </strong>
              </p>

            </div>

          </body>

        </html>
      `,
    };

    // =========================
    // TEMPORARY DEBUG LOGS
    // =========================

    console.log(
      "PAYMENT EMAIL RECIPIENT:",
      email
    );

    console.log(
      "EMAIL FROM:",
      process.env.EMAIL_FROM
    );

    console.log(
      "PAYMENT EMAIL SUBJECT:",
      mailOptions.subject
    );

    // =========================
    // SEND EMAIL
    // =========================

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Payment confirmation email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Payment Confirmation Email Error:",
      error
    );

    throw error;
  }
};

// =========================
// EXPORTS
// =========================

module.exports = {
  transporter,

  verifyEmailConnection,

  sendEmail,

  sendVerificationOTPEmail,

  sendBookingConfirmationEmail,

  sendPaymentConfirmationEmail,
};