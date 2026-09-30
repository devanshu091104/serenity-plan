import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../api/auth.api";

export const registerService = async (data) => {
  const response = await registerUser(data);
  return response.data;
};

export const loginService = async (data) => {
  const response = await loginUser(data);
  return response.data;
};

export const getCurrentUserService = async () => {
  const response = await getCurrentUser();
  return response.data;
};