// // import axios from "axios";

// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
// // });

// // // Attach token automatically
// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("token");

// //   if (token && config.headers) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }

// //   return config;
// // });

// // export default api;


// import axios from "axios";

// // ✅ API Base URL
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// // ✅ Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000, // 10 second timeout
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ✅ Request Interceptor - Add token to headers
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // ✅ Response Interceptor - Handle errors and token refresh
// api.interceptors.response.use(
//   (response) => {
//     // Return data directly for easier usage
//     return response.data;
//   },
//   (error) => {
//     // ✅ Handle 401 Unauthorized (token expired)
//     if (error.response?.status === 401) {
//       // Clear auth data
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");

//       // Redirect to login if not already there
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     }

//     // ✅ Handle 429 Too Many Requests (rate limit)
//     if (error.response?.status === 429) {
//       const retryAfter = error.response?.data?.retryAfter || 60;
//       console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
//     }

//     // ✅ Handle network errors
//     if (!error.response) {
//       console.error("Network error:", error.message);
//       return Promise.reject({
//         message: "Network error. Please check your connection.",
//         originalError: error,
//       });
//     }

//     // Return the error for component handling
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response, // KEEP FULL RESPONSE
  (error) => {
    const status = error.response?.status;

    // Only clear auth on protected route failure
    if (status === 401) {
      console.warn("Unauthorized request");
    }

    if (status === 429) {
      console.warn("Too many requests");
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