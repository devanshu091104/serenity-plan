import {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelBooking,
} from "../api/booking.api";

export const createBookingService = async (data) => {
  const response = await createBooking(data);
  return response.data;
};

export const fetchMyBookings = async () => {
  const response = await getMyBookings();
  return response.data;
};

export const fetchMyBookingById = async (id) => {
  const response = await getMyBookingById(id);
  return response.data;
};

export const cancelBookingService = async (id) => {
  const response = await cancelBooking(id);
  return response.data;
};