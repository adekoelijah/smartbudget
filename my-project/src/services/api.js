

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "";
// const API_BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================
   TOKEN RESOLVER (ROBUST)
========================================= */
const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

/* =========================================
   REQUEST INTERCEPTOR
========================================= */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================
   RESPONSE INTERCEPTOR (SMART AUTH HANDLING)
========================================= */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("SESSION INVALID OR EXPIRED");

      // optional but recommended in production
      // localStorage.removeItem("token");
    }

    if (status === 429) {
      console.warn("RATE LIMIT EXCEEDED");
    }

    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check connection.",
      });
    }

    return Promise.reject(error);
  }
);

export default api;