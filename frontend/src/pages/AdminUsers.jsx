
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  RefreshCw,
  UserRound,
  ShieldCheck,
  ShieldOff,
  Trash2,
  X,
  CheckCircle2,
  Mail,
  CalendarDays,
} from "lucide-react";

import api from "../api/axios";

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      setUsers(response.data?.users || []);
    } catch (err) {
      console.error("Users loading error:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem("serenity_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(
      "serenity_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    loadUsers();
  }, [navigate]);

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return (
        String(user.name || "")
          .toLowerCase()
          .includes(query) ||
        String(user.email || "")
          .toLowerCase()
          .includes(query) ||
        String(user.role || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [users, search]);

  const showMessage = (
    message,
    type = "success"
  ) => {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }

    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);
  };

  const updateStatus = async (user) => {
    const nextStatus =
      user.status === "active"
        ? "blocked"
        : "active";

    const actionText =
      nextStatus === "blocked"
        ? "block"
        : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setActionId(user.id);

      await api.put(
        `/admin/users/${user.id}/status`,
        {
          status: nextStatus,
        }
      );

      showMessage(
        nextStatus === "blocked"
          ? "User blocked successfully."
          : "User unblocked successfully."
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "User status update error:",
        err
      );

      showMessage(
        err.response?.data?.message ||
          "Unable to update user status.",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setActionId(user.id);

      await api.delete(
        `/admin/users/${user.id}`
      );

      showMessage(
        "User deleted successfully."
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "User delete error:",
        err
      );

      showMessage(
        err.response?.data?.message ||
          "Unable to delete user.",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw
          size={30}
          className="admin-loading-spinner"
        />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-topbar">
        <div>
          <button
            className="admin-back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <h1>Users Management</h1>

          <p>
            Manage registered Serenity Plan
            users and account status.
          </p>
        </div>

        <button
          className="admin-refresh-small"
          onClick={loadUsers}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-form-error">
          <X size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="admin-form-success">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <section className="admin-users-panel">
        <div className="admin-users-toolbar">
          <div>
            <h2>All Users</h2>
            <p>
              {filteredUsers.length} of{" "}
              {users.length} users
            </p>
          </div>

          <div className="admin-users-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="admin-users-empty">
            <UserRound size={40} />

            <h3>
              {search
                ? "No matching users"
                : "No users found"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "There are no registered users yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="admin-users-desktop">
              <div className="admin-users-table">
                <div className="admin-users-table-head">
                  <span>User</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Joined</span>
                  <span>Actions</span>
                </div>

                {filteredUsers.map(
                  (user) => (
                    <div
                      className="admin-users-table-row"
                      key={user.id}
                    >
                      <div className="admin-user-info">
                        <div className="admin-user-avatar">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>
                            {user.name}
                          </strong>

                          <small>
                            <Mail size={12} />
                            {user.email}
                          </small>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`admin-role-badge ${user.role}`}
                        >
                          {user.role ===
                          "admin" ? (
                            <ShieldCheck
                              size={13}
                            />
                          ) : (
                            <UserRound
                              size={13}
                            />
                          )}

                          {user.role}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`admin-user-status ${user.status}`}
                        >
                          <span />
                          {user.status}
                        </span>
                      </div>

                      <div className="admin-user-date">
                        <CalendarDays
                          size={13}
                        />
                        {formatDate(
                          user.created_at
                        )}
                      </div>

                      <div className="admin-user-actions">
                        {user.role !==
                          "admin" && (
                          <>
                            <button
                              className={
                                user.status ===
                                "active"
                                  ? "admin-user-block-button"
                                  : "admin-user-unblock-button"
                              }
                              onClick={() =>
                                updateStatus(
                                  user
                                )
                              }
                              disabled={
                                actionId ===
                                user.id
                              }
                            >
                              {actionId ===
                              user.id ? (
                                <RefreshCw
                                  size={14}
                                  className="admin-loading-spinner"
                                />
                              ) : user.status ===
                                "active" ? (
                                <>
                                  <ShieldOff
                                    size={14}
                                  />
                                  Block
                                </>
                              ) : (
                                <>
                                  <ShieldCheck
                                    size={14}
                                  />
                                  Unblock
                                </>
                              )}
                            </button>

                            <button
                              className="admin-user-delete-button"
                              onClick={() =>
                                deleteUser(
                                  user
                                )
                              }
                              disabled={
                                actionId ===
                                user.id
                              }
                            >
                              <Trash2
                                size={14}
                              />
                              Delete
                            </button>
                          </>
                        )}

                        {user.role ===
                          "admin" && (
                          <span className="admin-protected-label">
                            <ShieldCheck
                              size={14}
                            />
                            Protected
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="admin-users-mobile">
              {filteredUsers.map(
                (user) => (
                  <article
                    className="admin-user-card"
                    key={user.id}
                  >
                    <div className="admin-user-card-top">
                      <div className="admin-user-info">
                        <div className="admin-user-avatar">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>
                            {user.name}
                          </strong>

                          <small>
                            <Mail size={12} />
                            {user.email}
                          </small>
                        </div>
                      </div>

                      <span
                        className={`admin-user-status ${user.status}`}
                      >
                        <span />
                        {user.status}
                      </span>
                    </div>

                    <div className="admin-user-card-details">
                      <div>
                        <span>Role</span>

                        <strong>
                          {user.role}
                        </strong>
                      </div>

                      <div>
                        <span>Joined</span>

                        <strong>
                          {formatDate(
                            user.created_at
                          )}
                        </strong>
                      </div>
                    </div>

                    {user.role !==
                      "admin" && (
                      <div className="admin-user-card-actions">
                        <button
                          className={
                            user.status ===
                            "active"
                              ? "admin-user-block-button"
                              : "admin-user-unblock-button"
                          }
                          onClick={() =>
                            updateStatus(
                              user
                            )
                          }
                          disabled={
                            actionId ===
                            user.id
                          }
                        >
                          {user.status ===
                          "active" ? (
                            <>
                              <ShieldOff
                                size={14}
                              />
                              Block User
                            </>
                          ) : (
                            <>
                              <ShieldCheck
                                size={14}
                              />
                              Unblock User
                            </>
                          )}
                        </button>

                        <button
                          className="admin-user-delete-button"
                          onClick={() =>
                            deleteUser(
                              user
                            )
                          }
                          disabled={
                            actionId ===
                            user.id
                          }
                        >
                          <Trash2
                            size={14}
                          />
                          Delete
                        </button>
                      </div>
                    )}

                    {user.role ===
                      "admin" && (
                      <div className="admin-protected-card">
                        <ShieldCheck
                          size={15}
                        />
                        Admin account is protected
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminUsers;
