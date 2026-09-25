import { useState } from "react";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState =
    location.state?.email ||
    localStorage.getItem("verification_email") ||
    "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/verify-email",
        {
          email: email.trim(),
          otp,
        }
      );

      setMessage(
        response.data?.message ||
          "Email verified successfully."
      );

      localStorage.removeItem(
        "verification_email"
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(
        "Verify Email Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to verify email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setResending(true);

      const response = await api.post(
        "/auth/resend-otp",
        {
          email: email.trim(),
        }
      );

      setMessage(
        response.data?.message ||
          "A new OTP has been sent."
      );

      setOtp("");
    } catch (error) {
      console.error(
        "Resend OTP Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">S</div>

          <div>
            <h1>Serenity Plan</h1>
            <p>Travel. Explore. Relax.</p>
          </div>
        </div>

        <div className="auth-heading">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                background: "#eef6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
              }}
            >
              <ShieldCheck size={30} />
            </div>
          </div>

          <h2>Verify Your Email</h2>

          <p>
            We've sent a 6-digit verification
            code to your email address.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              padding: "12px 14px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "#ecfdf5",
              color: "#047857",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleVerify}
          className="auth-form"
        >
          <div className="auth-field">
            <label>Email Address</label>

            <div className="auth-input-wrap">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Verification Code</label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "20px",
                letterSpacing: "8px",
                textAlign: "center",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={{
            width: "100%",
            marginTop: "16px",
            border: "none",
            background: "transparent",
            color: "#2563eb",
            fontWeight: "600",
            cursor: resending
              ? "not-allowed"
              : "pointer",
          }}
        >
          {resending
            ? "Sending..."
            : "Didn't receive the OTP? Resend"}
        </button>

        <p className="auth-switch">
          Already verified?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

        <Link
          to="/"
          className="auth-back"
        >
          ← Back to Serenity Plan
        </Link>
      </div>
    </div>
  );
}