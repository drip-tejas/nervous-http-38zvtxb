import axios from "axios";
import toast from 'react-hot-toast';

/*
  baseURL: "https://ss6vpl-8000.csb.app/api",  
*/

interface RefreshResponse {
  token: string;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
// Store pending requests
let failedQueue: any[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Debug logging in development only
  if (process.env.NODE_ENV === 'development') {
    console.log("Request Config:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
    });
  }
  return config;
},
  (error) => {
    return Promise.reject(error);
  }
);

// Combine logging with your 401 handling
api.interceptors.response.use(
  (response) => {
    // Debug logging in development only
    if (process.env.NODE_ENV === 'development') {
      console.log("Response:", {
        url: response.config.url,
        status: response.status,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Debug logging in development only
    if (process.env.NODE_ENV === 'development') {
      console.error("API Error:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }
// Handle different error scenarios
    if (error.response?.status === 401) {
      // Don't try to refresh if this is the refresh token request itself
      if (originalRequest?.url?.includes('/auth/refresh')) {
        handleLogout('Session expired. Please login again.');
        return Promise.reject(error);
      }

      // Handle token refresh
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await api.post<RefreshResponse>('/auth/refresh', {
            refreshToken
          });

          const { token } = response.data;
          localStorage.setItem('authToken', token);

          isRefreshing = false;

          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          processQueue(null, token);
          return api(originalRequest!);

        } catch (refreshError) {
          processQueue(refreshError, null);
          handleLogout('Session expired. Please login again.');
          return Promise.reject(refreshError);
        }
      }

      // Queue failed requests
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    // Handle other error status codes
    handleErrorResponse(error);
    return Promise.reject(error);
  }
);

// Helper functions
const handleLogout = (message: string) => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  toast.error(message);
  window.location.href = "/login";
};

const handleErrorResponse = (error: AxiosError) => {
  const status = error.response?.status;
  const message = (error.response?.data as any)?.message || error.message;

  switch (status) {
    case 400:
      toast.error(message || 'Invalid request');
      break;
    case 403:
      toast.error('Access denied');
      break;
    case 404:
      toast.error(message || 'Resource not found');
      break;
    case 422:
      toast.error(message || 'Validation error');
      break;
    case 429:
      toast.error('Too many requests. Please try again later');
      break;
    case 500:
      toast.error('Server error. Please try again later');
      break;
    default:
      if (!navigator.onLine) {
        toast.error('No internet connection');
      } else {
        toast.error('An unexpected error occurred');
      }
  }
};

export default api;