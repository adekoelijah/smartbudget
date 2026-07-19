
import { createContext, useEffect, useMemo, useState } from "react";
import { loginUser, signupUser, getCurrentUser } from "../services/authService";

export const AuthContext = createContext(null);

/**
 * 🧠 Normalize API response (handles ALL backend shapes)
 */
const normalizeAuthResponse = (res) => {
  const token = res?.token || res?.data?.token;
  const user = res?.user || res?.data?.user;

  return { token, user };
};

/**
 * 🧠 Safe JSON parser
 */
const safeParse = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // =========================
  // STATE
  // =========================
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() =>
    safeParse(localStorage.getItem("user"))
  );

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // SYNC (multi-tab logout)
  // =========================
  useEffect(() => {
    const syncAuth = (event) => {
      if (event.key === "token" && !event.newValue) {
        setToken(null);
        setUser(null);
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // =========================
  // HYDRATE USER (SESSION RESTORE)
  // =========================
  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const data = await getCurrentUser();

        const currentUser = data?.user || data;

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (err) {
        console.warn("Session expired or invalid token");
        console.error("Failed to fetch current user:", err);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    hydrateUser();
  }, [token]);

  // =========================
  // LOGIN
  // =========================
  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await loginUser(formData);
      const { token: authToken, user: authUser } =
        normalizeAuthResponse(res);

      if (!authToken || !authUser) {
        throw new Error(res?.message || "Invalid server response during login");
      }

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);

      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Login failed";

      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SIGNUP
  // =========================
  const signup = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await signupUser(formData);
      const { token: authToken, user: authUser } =
        normalizeAuthResponse(res);

      if (!authToken || !authUser) {
        throw new Error(res?.message || "Invalid server response during signup");
      }

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);

      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Signup failed";

      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  // =========================
  // CONTEXT VALUE
  // =========================
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initializing,
      error,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
    }),
    [user, token, loading, initializing, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};