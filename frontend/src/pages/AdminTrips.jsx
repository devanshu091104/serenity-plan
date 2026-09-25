
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
  CalendarDays,
  IndianRupee,
  Users,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

import api from "../api/axios";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  category_id: "",
  destination_id: "",
  price: "",
  start_date: "",
  end_date: "",
  duration: "",
  available_slots: "",
  itinerary: "",
  inclusions: "",
  exclusions: "",
  status: "draft",
};

const AdminTrips = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tripsResponse, categoriesResponse, destinationsResponse] =
        await Promise.all([
          api.get("/trips/admin/all"),
          api.get("/categories"),
          api.get("/destinations"),
        ]);

      setTrips(tripsResponse.data?.trips || []);
      setCategories(categoriesResponse.data?.categories || []);
      setDestinations(destinationsResponse.data?.destinations || []);
    } catch (err) {
      console.error("Admin trips error:", err);

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
          "Unable to load trips."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("serenity_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadData();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (event) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      title: value,
      slug: editingId
        ? previous.slug
        : generateSlug(value),
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setSuccess("");
    setError("");
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (trip) => {
    setSuccess("");
    setError("");

    setEditingId(trip.id);

    setForm({
      title: trip.title || "",
      slug: trip.slug || "",
      description: trip.description || "",
      category_id: trip.category_id || "",
      destination_id: trip.destination_id || "",
      price: trip.price || "",
      start_date: trip.start_date
        ? trip.start_date.split("T")[0]
        : "",
      end_date: trip.end_date
        ? trip.end_date.split("T")[0]
        : "",
      duration: trip.duration || "",
      available_slots: trip.available_slots || "",
      itinerary: trip.itinerary || "",
      inclusions: trip.inclusions || "",
      exclusions: trip.exclusions || "",
      status: trip.status || "draft",
    });

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
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        category_id: form.category_id
          ? Number(form.category_id)
          : null,
        destination_id: form.destination_id
          ? Number(form.destination_id)
          : null,
        price: Number(form.price),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        duration: form.duration.trim(),
        available_slots: Number(form.available_slots),
        itinerary: form.itinerary.trim(),
        inclusions: form.inclusions.trim(),
        exclusions: form.exclusions.trim(),
        status: form.status,
      };

      if (!payload.title) {
        throw new Error("Trip title is required.");
      }

      if (!payload.slug) {
        throw new Error("Trip slug is required.");
      }

      if (Number.isNaN(payload.price)) {
        throw new Error("Please enter a valid price.");
      }

      if (Number.isNaN(payload.available_slots)) {
        throw new Error(
          "Please enter valid available slots."
        );
      }

      if (editingId) {
        await api.put(
          `/trips/${editingId}`,
          payload
        );

        setSuccess("Trip updated successfully.");
      } else {
        await api.post("/trips", payload);

        setSuccess("Trip created successfully.");
      }

      resetForm();
      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Save trip error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save trip."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(`/trips/${id}`);

      setSuccess("Trip deleted successfully.");

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Delete trip error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete trip."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (trip) => {
    try {
      setError("");
      setSuccess("");

      const nextStatus =
        trip.status === "published"
          ? "unpublished"
          : "published";

      await api.put(`/trips/${trip.id}`, {
        title: trip.title,
        slug: trip.slug,
        description: trip.description || "",
        category_id: trip.category_id || null,
        destination_id: trip.destination_id || null,
        price: Number(trip.price),
        start_date: trip.start_date
          ? trip.start_date.split("T")[0]
          : null,
        end_date: trip.end_date
          ? trip.end_date.split("T")[0]
          : null,
        duration: trip.duration || "",
        available_slots: Number(
          trip.available_slots || 0
        ),
        itinerary: trip.itinerary || "",
        inclusions: trip.inclusions || "",
        exclusions: trip.exclusions || "",
        status: nextStatus,
      });

      setSuccess(
        nextStatus === "published"
          ? "Trip published successfully."
          : "Trip unpublished successfully."
      );

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Publish trip error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update trip status."
      );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

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
        <p>Loading trips...</p>
      </div>
    );
  }

  return (
    <div className="admin-trips-page">
      <div className="admin-trips-topbar">
        <div>
          <button
            className="admin-back-button"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <h1>Trips Management</h1>

          <p>
            Create and manage travel packages from your
            admin panel.
          </p>
        </div>

        <button
          className="admin-primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add New Trip
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
        <section className="admin-trip-form-panel">
          <div className="admin-trip-form-header">
            <div>
              <span>
                {editingId
                  ? "UPDATE PACKAGE"
                  : "NEW PACKAGE"}
              </span>

              <h2>
                {editingId
                  ? "Edit Trip"
                  : "Create New Trip"}
              </h2>
            </div>

            <button
              className="admin-icon-button"
              onClick={resetForm}
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-field admin-form-full">
                <label>Trip Title *</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="Example: Manali Adventure Trip"
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
                  placeholder="manali-adventure-trip"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>Category</label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-field">
                <label>Destination</label>

                <select
                  name="destination_id"
                  value={form.destination_id}
                  onChange={handleChange}
                >
                  <option value="">
                    Select destination
                  </option>

                  {destinations.map(
                    (destination) => (
                      <option
                        key={destination.id}
                        value={destination.id}
                      >
                        {destination.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="admin-form-field">
                <label>Price (INR) *</label>

                <div className="admin-input-icon-wrapper">
                  <IndianRupee size={16} />

                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="15999"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label>Available Slots *</label>

                <div className="admin-input-icon-wrapper">
                  <Users size={16} />

                  <input
                    type="number"
                    name="available_slots"
                    min="0"
                    value={form.available_slots}
                    onChange={handleChange}
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label>Start Date</label>

                <div className="admin-input-icon-wrapper">
                  <CalendarDays size={16} />

                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label>End Date</label>

                <div className="admin-input-icon-wrapper">
                  <CalendarDays size={16} />

                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label>Duration</label>

                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="5 Nights / 6 Days"
                />
              </div>

              <div className="admin-form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">
                    Published
                  </option>
                  <option value="unpublished">
                    Unpublished
                  </option>
                </select>
              </div>

              <div className="admin-form-field admin-form-full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this travel package..."
                  rows="4"
                />
              </div>

              <div className="admin-form-field admin-form-full">
                <label>Itinerary</label>

                <textarea
                  name="itinerary"
                  value={form.itinerary}
                  onChange={handleChange}
                  placeholder={
                    "Day 1: Arrival\nDay 2: Local Sightseeing\nDay 3: Adventure Activities"
                  }
                  rows="6"
                />
              </div>

              <div className="admin-form-field">
                <label>Inclusions</label>

                <textarea
                  name="inclusions"
                  value={form.inclusions}
                  onChange={handleChange}
                  placeholder="Hotel, Breakfast, Transportation"
                  rows="4"
                />
              </div>

              <div className="admin-form-field">
                <label>Exclusions</label>

                <textarea
                  name="exclusions"
                  value={form.exclusions}
                  onChange={handleChange}
                  placeholder="Personal expenses"
                  rows="4"
                />
              </div>
            </div>

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
                      ? "Update Trip"
                      : "Create Trip"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-trip-list-panel">
        <div className="admin-trip-list-header">
          <div>
            <h2>All Trips</h2>
            <p>{trips.length} packages available</p>
          </div>

          <button
            className="admin-refresh-small"
            onClick={loadData}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="admin-trip-empty">
            <MapPin size={35} />
            <h3>No trips available</h3>
            <p>Create your first travel package.</p>

            <button
              className="admin-primary-button"
              onClick={openAddForm}
            >
              <Plus size={17} />
              Add Trip
            </button>
          </div>
        ) : (
          <div className="admin-trip-cards">
            {trips.map((trip) => (
              <article
                className="admin-trip-card"
                key={trip.id}
              >
                <div className="admin-trip-card-top">
                  <div className="admin-trip-card-icon">
                    <MapPin size={22} />
                  </div>

                  <span
                    className={`admin-trip-status ${
                      trip.status
                    }`}
                  >
                    {trip.status === "published" ? (
                      <>
                        <CheckCircle2 size={12} />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} />
                        {trip.status}
                      </>
                    )}
                  </span>
                </div>

                <div className="admin-trip-card-content">
                  <h3>{trip.title}</h3>

                  <p className="admin-trip-destination">
                    <MapPin size={14} />
                    {trip.destination_name ||
                      "No destination"}
                  </p>

                  <p className="admin-trip-description">
                    {trip.description ||
                      "No description available."}
                  </p>

                  <div className="admin-trip-meta">
                    <div>
                      <IndianRupee size={14} />
                      <strong>
                        {formatCurrency(trip.price)}
                      </strong>
                    </div>

                    <div>
                      <Users size={14} />
                      {trip.available_slots} slots
                    </div>

                    <div>
                      <CalendarDays size={14} />
                      {formatDate(trip.start_date)}
                    </div>
                  </div>
                </div>

                <div className="admin-trip-card-actions">
                  <button
                    className="admin-trip-edit-button"
                    onClick={() =>
                      openEditForm(trip)
                    }
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    className="admin-trip-publish-button"
                    onClick={() =>
                      handleTogglePublish(trip)
                    }
                  >
                    {trip.status === "published" ? (
                      <>
                        <EyeOff size={15} />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={15} />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    className="admin-trip-delete-button"
                    onClick={() =>
                      handleDelete(trip.id)
                    }
                    disabled={
                      deletingId === trip.id
                    }
                  >
                    {deletingId === trip.id ? (
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminTrips;
