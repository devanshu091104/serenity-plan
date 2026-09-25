import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import api from "../api/axios";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("serenity_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data?.user);
      } catch (error) {
        localStorage.removeItem("serenity_token");

        setError(
          error.response?.data?.message ||
            "Session expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("serenity_token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          {error || "Unable to load profile."}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button
          className="profile-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h1>{user.name}</h1>
              <p>Serenity Plan Member</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <div className="profile-detail-icon">
                <User size={20} />
              </div>

              <div>
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            <div className="profile-detail">
              <div className="profile-detail-icon">
                <Mail size={20} />
              </div>

              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
            </div>

            <div className="profile-detail">
              <div className="profile-detail-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <span>Account Role</span>
                <strong>
                  {user.role === "admin" ? "Administrator" : "User"}
                </strong>
              </div>
            </div>
          </div>

          <button
            className="profile-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}