import axios from "axios";
import toast from 'react-hot-toast';

/*
const api = axios.create({
  baseURL: "https://ss6vpl-8000.csb.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});
*/

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Request Config:", {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: config.headers,
  });
  return config;
});

// Combine logging with your 401 handling
api.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export default api;
