import api from "./axios";

/* DASHBOARD */
export const getAdminDashboard = () => {
  return api.get("/admin/dashboard");
};


/* USERS */

export const getAdminUsers = () => {
  return api.get("/admin/users");
};

export const getAdminUserById = (id) => {
  return api.get(`/admin/users/${id}`);
};

export const updateAdminUserStatus = (id, status) => {
  return api.put(`/admin/users/${id}/status`, {
    status,
  });
};

export const deleteAdminUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};


/* CATEGORIES */

export const getCategories = () => {
  return api.get("/categories");
};

export const createCategory = (data) => {
  return api.post("/categories", data);
};

export const updateCategory = (id, data) => {
  return api.put(`/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};


/* DESTINATIONS */

export const getDestinations = () => {
  return api.get("/destinations");
};

export const createDestination = (data) => {
  return api.post("/destinations", data);
};

export const updateDestination = (id, data) => {
  return api.put(`/destinations/${id}`, data);
};

export const deleteDestination = (id) => {
  return api.delete(`/destinations/${id}`);
};


/* POSTS */

export const getAdminPosts = () => {
  return api.get("/posts/admin/all");
};

export const createPost = (data) => {
  return api.post("/posts", data);
};

export const updatePost = (id, data) => {
  return api.put(`/posts/${id}`, data);
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`);
};


/* INQUIRIES */

export const getAdminInquiries = () => {
  return api.get("/inquiries");
};

export const getAdminInquiryById = (id) => {
  return api.get(`/inquiries/${id}`);
};

export const updateInquiryStatus = (id, status) => {
  return api.put(`/inquiries/${id}/status`, {
    status,
  });
};

export const deleteInquiry = (id) => {
  return api.delete(`/inquiries/${id}`);
};