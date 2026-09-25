
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";

import api from "../api/axios";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  status: "active",
};

const AdminDestinations = () => {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDestinations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/destinations");

      setDestinations(
        response.data?.destinations || []
      );
    } catch (err) {
      console.error(
        "Destination loading error:",
        err
      );

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
          "Unable to load destinations."
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

    loadDestinations();
  }, [navigate]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (event) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      name: value,
      slug: editingId
        ? previous.slug
        : generateSlug(value),
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (destination) => {
    setEditingId(destination.id);

    setForm({
      name: destination.name || "",
      slug: destination.slug || "",
      description:
        destination.description || "",
      image_url:
        destination.image_url || "",
      status: destination.status || "active",
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description:
          form.description.trim(),
        image_url: form.image_url.trim(),
        status: form.status,
      };

      if (!payload.name) {
        throw new Error(
          "Destination name is required."
        );
      }

      if (!payload.slug) {
        throw new Error(
          "Destination slug is required."
        );
      }

      if (editingId) {
        await api.put(
          `/destinations/${editingId}`,
          payload
        );

        setSuccess(
          "Destination updated successfully."
        );
      } else {
        await api.post(
          "/destinations",
          payload
        );

        setSuccess(
          "Destination created successfully."
        );
      }

      resetForm();
      await loadDestinations();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Destination save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save destination."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this destination?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(
        `/destinations/${id}`
      );

      setSuccess(
        "Destination deleted successfully."
      );

      await loadDestinations();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Destination delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete destination."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (
    destination
  ) => {
    try {
      setError("");
      setSuccess("");

      const nextStatus =
        destination.status === "active"
          ? "inactive"
          : "active";

      await api.put(
        `/destinations/${destination.id}`,
        {
          name: destination.name,
          slug: destination.slug,
          description:
            destination.description || "",
          image_url:
            destination.image_url || "",
          status: nextStatus,
        }
      );

      setSuccess(
        nextStatus === "active"
          ? "Destination activated."
          : "Destination deactivated."
      );

      await loadDestinations();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Destination status error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update destination."
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw
          size={30}
          className="admin-loading-spinner"
        />
        <p>Loading destinations...</p>
      </div>
    );
  }

  return (
    <div className="admin-destinations-page">
      <div className="admin-destinations-topbar">
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

          <h1>Destinations Management</h1>

          <p>
            Manage travel destinations used
            across Serenity Plan.
          </p>
        </div>

        <button
          className="admin-primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Destination
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

      {showForm && (
        <section className="admin-destination-form-panel">
          <div className="admin-destination-form-header">
            <div>
              <span>
                {editingId
                  ? "UPDATE DESTINATION"
                  : "NEW DESTINATION"}
              </span>

              <h2>
                {editingId
                  ? "Edit Destination"
                  : "Add New Destination"}
              </h2>
            </div>

            <button
              type="button"
              className="admin-icon-button"
              onClick={resetForm}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-destination-form-grid">
              <div className="admin-form-field">
                <label>
                  Destination Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="Example: Dubai"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>Slug *</label>

                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="dubai"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="admin-form-field">
                <label>Image URL</label>

                <div className="admin-input-icon-wrapper">
                  <ImageIcon size={16} />

                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="admin-form-field admin-form-full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this destination..."
                  rows="5"
                />
              </div>
            </div>

            {form.image_url && (
              <div className="admin-destination-preview">
                <span>Image Preview</span>

                <img
                  src={form.image_url}
                  alt="Destination preview"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )}

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="admin-loading-spinner"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    {editingId
                      ? "Update Destination"
                      : "Create Destination"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-destination-list-panel">
        <div className="admin-destination-list-header">
          <div>
            <h2>All Destinations</h2>
            <p>
              {destinations.length} destinations
              available
            </p>
          </div>

          <button
            className="admin-refresh-small"
            onClick={loadDestinations}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {destinations.length === 0 ? (
          <div className="admin-destination-empty">
            <MapPin size={38} />

            <h3>
              No destinations available
            </h3>

            <p>
              Add your first travel destination.
            </p>

            <button
              className="admin-primary-button"
              onClick={openAddForm}
            >
              <Plus size={17} />
              Add Destination
            </button>
          </div>
        ) : (
          <div className="admin-destination-cards">
            {destinations.map(
              (destination) => (
                <article
                  className="admin-destination-card"
                  key={destination.id}
                >
                  <div className="admin-destination-image">
                    {destination.image_url ? (
                      <img
                        src={
                          destination.image_url
                        }
                        alt={destination.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";

                          event.currentTarget.parentElement.classList.add(
                            "image-error"
                          );
                        }}
                      />
                    ) : (
                      <div className="admin-no-image">
                        <MapPin size={32} />
                        <span>
                          No Image
                        </span>
                      </div>
                    )}

                    <span
                      className={`admin-destination-status ${
                        destination.status
                      }`}
                    >
                      {destination.status ===
                      "active" ? (
                        <>
                          <CheckCircle2
                            size={12}
                          />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>

                  <div className="admin-destination-content">
                    <h3>
                      {destination.name}
                    </h3>

                    <p className="admin-destination-slug">
                      /{destination.slug}
                    </p>

                    <p className="admin-destination-description">
                      {destination.description ||
                        "No description available."}
                    </p>
                  </div>

                  <div className="admin-destination-actions">
                    <button
                      className="admin-trip-edit-button"
                      onClick={() =>
                        openEditForm(
                          destination
                        )
                      }
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      className="admin-trip-publish-button"
                      onClick={() =>
                        handleToggleStatus(
                          destination
                        )
                      }
                    >
                      {destination.status ===
                      "active" ? (
                        <>
                          <EyeOff size={15} />
                          Disable
                        </>
                      ) : (
                        <>
                          <Eye size={15} />
                          Activate
                        </>
                      )}
                    </button>

                    <button
                      className="admin-trip-delete-button"
                      onClick={() =>
                        handleDelete(
                          destination.id
                        )
                      }
                      disabled={
                        deletingId ===
                        destination.id
                      }
                    >
                      {deletingId ===
                      destination.id ? (
                        <RefreshCw
                          size={15}
                          className="admin-loading-spinner"
                        />
                      ) : (
                        <Trash2 size={15} />
                      )}

                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDestinations;
