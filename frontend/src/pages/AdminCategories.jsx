
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Tag,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import api from "../api/axios";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
};

const AdminCategories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(
        response.data?.categories || []
      );
    } catch (err) {
      console.error(
        "Category loading error:",
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
          "Unable to load categories."
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

    loadCategories();
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

  const openEditForm = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description:
        category.description || "",
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
      };

      if (!payload.name) {
        throw new Error(
          "Category name is required."
        );
      }

      if (!payload.slug) {
        throw new Error(
          "Category slug is required."
        );
      }

      if (editingId) {
        await api.put(
          `/categories/${editingId}`,
          payload
        );

        setSuccess(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/categories",
          payload
        );

        setSuccess(
          "Category created successfully."
        );
      }

      resetForm();

      await loadCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Category save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(
        `/categories/${id}`
      );

      setSuccess(
        "Category deleted successfully."
      );

      await loadCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Category delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw
          size={30}
          className="admin-loading-spinner"
        />

        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-topbar">
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

          <h1>Categories Management</h1>

          <p>
            Manage trip categories used
            across Serenity Plan.
          </p>
        </div>

        <button
          className="admin-primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Category
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
        <section className="admin-category-form-panel">
          <div className="admin-category-form-header">
            <div>
              <span>
                {editingId
                  ? "UPDATE CATEGORY"
                  : "NEW CATEGORY"}
              </span>

              <h2>
                {editingId
                  ? "Edit Category"
                  : "Add New Category"}
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
            <div className="admin-category-form-grid">
              <div className="admin-form-field">
                <label>
                  Category Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="Example: Honeymoon"
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
                  placeholder="honeymoon"
                  required
                />
              </div>

              <div className="admin-form-field admin-form-full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this trip category..."
                  rows="5"
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
                      ? "Update Category"
                      : "Create Category"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-category-list-panel">
        <div className="admin-category-list-header">
          <div>
            <h2>All Categories</h2>

            <p>
              {categories.length} categories
              available
            </p>
          </div>

          <button
            className="admin-refresh-small"
            onClick={loadCategories}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="admin-category-empty">
            <Tag size={38} />

            <h3>
              No categories available
            </h3>

            <p>
              Add your first trip category.
            </p>

            <button
              className="admin-primary-button"
              onClick={openAddForm}
            >
              <Plus size={17} />
              Add Category
            </button>
          </div>
        ) : (
          <div className="admin-category-cards">
            {categories.map((category) => (
              <article
                className="admin-category-card"
                key={category.id}
              >
                <div className="admin-category-icon">
                  <Tag size={23} />
                </div>

                <div className="admin-category-content">
                  <h3>
                    {category.name}
                  </h3>

                  <p className="admin-category-slug">
                    /{category.slug}
                  </p>

                  <p className="admin-category-description">
                    {category.description ||
                      "No description available."}
                  </p>
                </div>

                <div className="admin-category-actions">
                  <button
                    className="admin-trip-edit-button"
                    onClick={() =>
                      openEditForm(category)
                    }
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    className="admin-trip-delete-button"
                    onClick={() =>
                      handleDelete(
                        category.id
                      )
                    }
                    disabled={
                      deletingId ===
                      category.id
                    }
                  >
                    {deletingId ===
                    category.id ? (
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

export default AdminCategories;
