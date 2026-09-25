import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register",
        form
      );

      if (response.data?.requiresVerification) {
        // Store email temporarily so VerifyEmail page
        // can use it automatically.
        localStorage.setItem(
          "verification_email",
          form.email.trim().toLowerCase()
        );

        // Redirect directly to OTP verification page
        navigate("/verify-email", {
          replace: true,
          state: {
            email: form.email.trim().toLowerCase(),
          },
        });

        return;
      }

      // Fallback in case backend doesn't request verification
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">

        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-logo">
            S
          </div>

          <div>
            <h1>Serenity Plan</h1>
            <p>
              Travel. Explore. Relax.
            </p>
          </div>
        </div>

        {/* HEADING */}
        <div className="auth-heading">
          <h2>Create Account</h2>

          <p>
            Start planning your next
            unforgettable trip.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          {/* NAME */}
          <div className="auth-field">
            <label>
              Full Name
            </label>

            <div className="auth-input-wrap">
              <User size={18} />

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="auth-field">
            <label>
              Email Address
            </label>

            <div className="auth-input-wrap">
              <Mail size={18} />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="auth-field">
            <label>
              Password
            </label>

            <div className="auth-input-wrap">
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-field">
            <label>
              Confirm Password
            </label>

            <div className="auth-input-wrap">
              <Lock size={18} />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>
        </form>

        {/* LOGIN */}
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

        {/* BACK */}
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