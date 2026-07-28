import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  getUser,
  updateProfile,
  uploadAvatar,
} from "../services/profileService";

/* =========================================
   CONTEXT
========================================= */
export const UserContext = createContext(null);

/* =========================================
   NORMALIZE USER
========================================= */
const normalizeUser = (response) => {
  return response?.user || response || null;
};

/* =========================================
   PROVIDER
========================================= */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("loading");
  const [error, setError] = useState(null);

  const initialized = useRef(false);

  /* =========================================
     TOKEN
  ========================================= */
  const getToken = () => localStorage.getItem("token");

  /* =========================================
     LOAD USER
  ========================================= */
  const loadUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setAuthStatus("unauthenticated");
      return;
    }

    try {
      setError(null);

      const response = await getUser();
      const normalized = normalizeUser(response);

      setUser(normalized);
      setAuthStatus("authenticated");
    } catch (err) {
      console.error("LOAD_USER_ERROR:", err);

      setUser(null);
      setAuthStatus("unauthenticated");

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Session expired. Please login again."
      );
    }
  }, []);

  /* =========================================
     UPDATE PROFILE
  ========================================= */
  const saveProfile = useCallback(async (payload) => {
    try {
      setError(null);

      const response = await updateProfile(payload);
      const updated = normalizeUser(response);

      if (!updated) {
        throw new Error("Invalid server response.");
      }

      setUser((prev) => ({
        ...prev,
        ...updated,
      }));

      return updated;
    } catch (err) {
      console.error("SAVE_PROFILE_ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Profile update failed.";

      setError(message);

      throw err;
    }
  }, []);

  /* =========================================
     CHANGE AVATAR
  ========================================= */
  const changeAvatar = useCallback(async (file) => {
    if (!file) return null;

    try {
      setError(null);

      const preview = URL.createObjectURL(file);

      setUser((prev) => ({
        ...prev,
        avatar: preview,
      }));

      const uploadResponse = await uploadAvatar(file);

      const avatarUrl =
        uploadResponse?.url ||
        uploadResponse?.avatar ||
        uploadResponse?.data?.url;

      if (!avatarUrl) {
        throw new Error("Avatar upload failed.");
      }

      const updated = await updateProfile({
        avatar: avatarUrl,
      });

      const normalized = normalizeUser(updated);

      setUser((prev) => ({
        ...prev,
        ...normalized,
        avatar: avatarUrl,
      }));

      return avatarUrl;
    } catch (err) {
      console.error("AVATAR_ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Avatar upload failed."
      );

      throw err;
    }
  }, []);

  /* =========================================
     INITIALIZE
  ========================================= */
  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    loadUser();
  }, [loadUser]);

  /* =========================================
     CONTEXT VALUE
  ========================================= */
  const value = useMemo(
    () => ({
      user,
      authStatus,
      error,
      setUser,
      loadUser,
      saveProfile,
      changeAvatar,
    }),
    [
      user,
      authStatus,
      error,
      loadUser,
      saveProfile,
      changeAvatar,
    ]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/* =========================================
   CUSTOM HOOK
========================================= */
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider.");
  }

  return context;
};