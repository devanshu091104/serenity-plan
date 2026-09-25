import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  status: "draft",
};

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts/admin/all");
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && !editingId
        ? { slug: generateSlug(value) }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/posts/${editingId}`, form);
      } else {
        await api.post("/posts", form);
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (post) => {
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featured_image: post.featured_image || "",
      status: post.status || "draft",
    });

    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete post");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const filteredPosts = posts.filter((post) =>
    `${post.title} ${post.slug} ${post.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Posts & Blog</h1>
          <p>Manage blog posts, news and website content.</p>
        </div>

        <button
          className="admin-primary-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add Post
        </button>
      </div>

      <div className="admin-search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-empty-state">Loading posts...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="admin-empty-state">
          No posts found.
        </div>
      ) : (
        <div className="admin-post-grid">
          {filteredPosts.map((post) => (
            <div className="admin-post-card" key={post.id}>
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="admin-post-image"
                />
              ) : (
                <div className="admin-post-image-placeholder">
                  No Image
                </div>
              )}

              <div className="admin-post-content">
                <div className="admin-post-top">
                  <span className={`status-badge ${post.status}`}>
                    {post.status}
                  </span>
                </div>

                <h3>{post.title}</h3>

                <p>
                  {post.excerpt ||
                    "No excerpt available for this post."}
                </p>

                <div className="admin-post-actions">
                  <button
                    className="admin-edit-btn"
                    onClick={() => handleEdit(post)}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    className="admin-delete-btn"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <h2>{editingId ? "Edit Post" : "Add Post"}</h2>
                <p>Create or update website content.</p>
              </div>

              <button
                className="admin-close-btn"
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Slug</label>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="post-slug"
                    required
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label>Featured Image URL</label>
                  <input
                    name="featured_image"
                    value={form.featured_image}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label>Excerpt</label>
                  <textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Short description..."
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label>Content</label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows="8"
                    placeholder="Write post content..."
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="unpublished">
                      Unpublished
                    </option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-btn"
                >
                  {editingId ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;