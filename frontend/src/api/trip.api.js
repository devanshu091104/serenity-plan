import api from "./axios";

export const getPublishedTrips = () => {
  return api.get("/trips/published");
};

export const getTripById = (id) => {
  return api.get(`/trips/${id}`);
};

export const getAdminTrips = () => {
  return api.get("/trips/admin/all");
};

export const createTrip = (data) => {
  return api.post("/trips", data);
};

export const updateTrip = (id, data) => {
  return api.put(`/trips/${id}`, data);
};

export const deleteTrip = (id) => {
  return api.delete(`/trips/${id}`);
};