import axios from "axios";

const API_URL = "http://localhost:8000/api/auth";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async (token: string) => {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
