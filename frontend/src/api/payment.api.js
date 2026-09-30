import api from "./axios";

export const createPayment = (data) => {
  return api.post("/payments", data);
};

export const getMyPayments = () => {
  return api.get("/payments/my");
};

export const getPaymentById = (id) => {
  return api.get(`/payments/${id}`);
};