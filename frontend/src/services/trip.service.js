import {
  getPublishedTrips,
  getTripById,
  getAdminTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../api/trip.api";

export const fetchPublishedTrips = async () => {
  const response = await getPublishedTrips();
  return response.data;
};

export const fetchTripById = async (id) => {
  const response = await getTripById(id);
  return response.data;
};

export const fetchAdminTrips = async () => {
  const response = await getAdminTrips();
  return response.data;
};

export const createTripService = async (data) => {
  const response = await createTrip(data);
  return response.data;
};

export const updateTripService = async (id, data) => {
  const response = await updateTrip(id, data);
  return response.data;
};

export const deleteTripService = async (id) => {
  const response = await deleteTrip(id);
  return response.data;
};