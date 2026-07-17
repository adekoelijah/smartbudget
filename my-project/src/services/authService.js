import api from "./api";
import axios from "axios";

// export const loginUser = async (data) => {
//   const res = await api.post("/auth/login", data);
//   return res.data;
// };
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
};

//google 

export const googleLogin = () => {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Redirect to backend OAuth flow
  window.location.href = `${API_URL}/auth/google`;
};

export const signupUser = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};


export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const res = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.user || res.data;
  } catch (error) {
    console.log("CURRENT USER ERROR:", error?.response?.data);

    // Only clear auth if backend says unauthorized
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    throw error;
  }
};