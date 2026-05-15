


// import {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";

// import {
//   getUser,
//   updateProfile,
//   uploadAvatar,
// } from "../services/profileService";

// /* =========================================
//    CONTEXT
// ========================================= */
// const UserContext = createContext(null);

// /* =========================================
//    NORMALIZER (STRICT + SAFE)
// ========================================= */
// const normalizeUser = (response) => {
//   if (!response) return null;

//   return (
//     response?.user ||
//     response?.data?.user ||
//     response?.data ||
//     response ||
//     null
//   );
// };

// /* =========================================
//    PROVIDER
// ========================================= */
// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const initialized = useRef(false);
//   const requestLock = useRef(false);



//   const loadUser = useCallback(async () => {
//   if (requestLock.current) return;

//   requestLock.current = true;

//   try {
//     setError(null);

//     const res = await getUser();
//     const normalized = normalizeUser(res);

//     setUser(normalized || null);
//   } catch (err) {
//     console.error("LOAD_USER_ERROR:", err);

//     setUser(null);

//     // IMPORTANT: only set error if token exists
//     const token = localStorage.getItem("token");
//     if (token) {
//       setError("Session expired. Please login again.");
//     }
//   } finally {
//     setLoading(false);
//     requestLock.current = false;
//   }
// }, []);

//   /* =========================================
//      SAVE PROFILE (ATOMIC UPDATE)
//   ========================================= */
//   const saveProfile = useCallback(async (payload) => {
//     try {
//       setError(null);

//       const res = await updateProfile(payload);
//       const updated = normalizeUser(res);

//       if (!updated) {
//         throw new Error("Invalid profile response");
//       }

//       setUser((prev) => ({
//         ...prev,
//         ...updated,
//       }));

//       return updated;
//     } catch (err) {
//       console.error("SAVE_PROFILE_ERROR:", err);

//       setError(
//         err?.response?.data?.message ||
//         "Profile update failed"
//       );

//       throw err;
//     }
//   }, []);

//   /* =========================================
//      CHANGE AVATAR (FINTECH-GRADE SYNC)
//   ========================================= */
// const changeAvatar = useCallback(async (file) => {
//   if (!file) return;

//   try {
//     setError(null);

//     // 1. Optimistic UI preview
//     const previewUrl = URL.createObjectURL(file);

//     setUser((prev) => ({
//       ...prev,
//       avatar: previewUrl,
//     }));

//     // 2. Upload avatar
//     const res = await uploadAvatar(file);
//     const avatarUrl =
//   res?.data?.url ||
//   res?.data?.avatar ||
//   res?.url ||
//   res?.avatar ||
//   res?.data?.data?.url;

//     if (!avatarUrl) {
//       throw new Error("Avatar upload failed: no URL returned");
//     }

//     // 3. IMPORTANT: persist avatar in backend AND GET FULL UPDATED USER BACK
//     const updatedRes = await updateProfile({
//       avatar: avatarUrl,
//     });

//     const updatedUser = normalizeUser(updatedRes);

//     // 4. FINAL STATE SYNC (THIS IS THE FIX)
//     setUser((prev) => ({
//       ...prev,
//       ...(updatedUser || {}),
//       avatar: avatarUrl, // force correct final value
//     }));

//     return avatarUrl;

//   } catch (err) {
//     console.error("AVATAR_UPLOAD_ERROR:", err);

//     setError(
//       err?.response?.data?.message ||
//       "Avatar upload failed"
//     );

//     throw err;
//   }
// }, []);

//   /* =========================================
//      INIT
//   ========================================= */
//   // useEffect(() => {
//   //   if (initialized.current) return;

//   //   initialized.current = true;
//   //   loadUser();
//   // }, [loadUser]);
//   useEffect(() => {
//   if (initialized.current) return;

//   initialized.current = true;

//   const token = localStorage.getItem("token");

//   if (!token) {
//     setUser(null);
//     setLoading(false);
//     return;
//   }

//   // Delay execution to prevent synchronous state chain
//   setTimeout(() => {
//     loadUser();
//   }, 0);
// }, [loadUser]);




//   /* =========================================
//      CONTEXT VALUE (STABLE)
//   ========================================= */
//   const value = useMemo(() => ({
//     user,
//     loading,
//     error,

//     setUser,

//     loadUser,
//     saveProfile,
//     changeAvatar,
//   }), [user, loading, error, loadUser, saveProfile, changeAvatar]);

//   return (
//     <UserContext.Provider value={value}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// /* =========================================
//    HOOK
// ========================================= */
// export const useUser = () => {
//   const context = useContext(UserContext);

//   if (!context) {
//     throw new Error("useUser must be used within UserProvider");
//   }

//   return context;
// };

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
const UserContext = createContext(null);

/* =========================================
   NORMALIZE USER (STRICT CONTRACT)
========================================= */
const normalizeUser = (res) => {
  return res?.user || res || null;
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
     GET TOKEN (SINGLE SOURCE OF TRUTH)
  ========================================= */
  const getToken = () => {
    return localStorage.getItem("token");
  };

  /* =========================================
     LOAD USER
  ========================================= */
  const loadUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setAuthStatus("unauthenticated");
      setUser(null);
      return;
    }

    try {
      setError(null);

      const res = await getUser();
      const normalized = normalizeUser(res);

      setUser(normalized);
      setAuthStatus("authenticated");
    } catch (err) {
      console.error("LOAD_USER_ERROR:", err);

      setUser(null);
      setAuthStatus("unauthenticated");

      setError(
        err?.message || "Session expired. Please login again."
      );
    }
  }, []);

  /* =========================================
     UPDATE PROFILE
  ========================================= */
  const saveProfile = useCallback(async (payload) => {
    try {
      setError(null);

      const res = await updateProfile(payload);
      const updated = normalizeUser(res);

      if (!updated) {
        throw new Error("Invalid server response");
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
        "Profile update failed";

      setError(message);
      throw err;
    }
  }, []);

  /* =========================================
     CHANGE AVATAR
  ========================================= */
  const changeAvatar = useCallback(async (file) => {
    if (!file) return;

    try {
      setError(null);

      const previewUrl = URL.createObjectURL(file);

      setUser((prev) => ({
        ...prev,
        avatar: previewUrl,
      }));

      const uploadRes = await uploadAvatar(file);

      const avatarUrl =
        uploadRes?.url ||
        uploadRes?.avatar ||
        uploadRes?.data?.url;

      if (!avatarUrl) {
        throw new Error("Avatar upload failed");
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
        "Avatar upload failed"
      );

      throw err;
    }
  }, []);

  /* =========================================
     INIT
  ========================================= */
  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    loadUser();
  }, [loadUser]);

  /* =========================================
     VALUE
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
    [user, authStatus, error, loadUser, saveProfile, changeAvatar]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/* =========================================
   HOOK
========================================= */
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
};