import api from "./axios";

export const createBooking = (data) => {
  return api.post("/bookings", data);
};

export const getMyBookings = () => {
  return api.get("/bookings/my");
};

export const getMyBookingById = (id) => {
  return api.get(`/bookings/my/${id}`);
};

export const cancelBooking = (id) => {
  return api.put(`/bookings/${id}/cancel`);
};

export const getAdminBookings = () => {
  return api.get("/admin/bookings");
};

export const getAdminBookingById = (id) => {
  return api.get(`/admin/bookings/${id}`);
};

export const updateBookingStatus = (id, status) => {
  return api.put(`/admin/bookings/${id}/status`, {
    status,
  });
};

export const updatePaymentStatus = (id, status) => {
  return api.put(
    `/admin/bookings/${id}/payment-status`,
    {
      status,
    }
  );
};