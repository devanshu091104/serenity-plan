import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  loginService,
  getCurrentUserService,
} from "../services/auth.service";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
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

    if (!form.email || !form.password) {
      setError(
        "Please enter email and password."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // LOGIN
      // =========================
      const response = await loginService(form);

      const token = response?.token;

      if (!token) {
        throw new Error(
          "Login token was not received."
        );
      }

      // =========================
      // GET USER DETAILS
      // =========================
      let user = response?.user || null;

      if (!user) {
        // Temporarily store token so axios
        // interceptor can send it to /auth/me
        localStorage.setItem(
          "serenity_token",
          token
        );

        try {
          const userResponse =
            await getCurrentUserService();

          user = userResponse?.user || null;
        } catch (userError) {
          console.error(
            "Get Current User Error:",
            userError
          );
        }
      }

      // =========================
      // SAVE AUTH STATE
      // =========================
      login(token, user);

      // =========================
      // REDIRECT BY ROLE
      // =========================

      // ADMIN ALWAYS GOES TO ADMIN DASHBOARD
      if (user?.role === "admin") {
        navigate("/admin", {
          replace: true,
        });

        return;
      }

      // NORMAL USER
      const redirectTo =
        location.state?.redirectTo || "/";

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* ========================= */}
        {/* BRAND */}
        {/* ========================= */}

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

        {/* ========================= */}
        {/* HEADING */}
        {/* ========================= */}

        <div className="auth-heading">
          <h2>Welcome Back</h2>

          <p>
            Login to continue your journey.
          </p>
        </div>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* ========================= */}
        {/* LOGIN FORM */}
        {/* ========================= */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

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
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>
        </form>

        {/* ========================= */}
        {/* REGISTER */}
        {/* ========================= */}

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create Account
          </Link>
        </p>

        {/* ========================= */}
        {/* BACK */}
        {/* ========================= */}

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