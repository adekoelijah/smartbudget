import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getCurrentUser,
} from "../services/authService";

import {
  updateUserProfile,
  updateUserAvatar,
  updateNotificationSettings,
} from "../services/userService";

import {
  useAuth,
} from "../hooks/useAuth";

/* =========================================================
   CONTEXT
========================================================= */

export const UserContext = createContext(null);

/* =========================================================
   CONSTANTS
========================================================= */

const USER_STORAGE_KEY = "user";

/* =========================================================
   STORAGE HELPERS
========================================================= */

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(
      USER_STORAGE_KEY
    );

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    return parsed && typeof parsed === "object"
      ? parsed
      : null;
  } catch (error) {
    console.error(
      "GET_STORED_USER_ERROR:",
      error
    );

    return null;
  }
};

const saveUser = (user) => {
  try {
    if (!user) {
      localStorage.removeItem(
        USER_STORAGE_KEY
      );

      return;
    }

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(user)
    );
  } catch (error) {
    console.error(
      "SAVE_USER_ERROR:",
      error
    );
  }
};

/* =========================================================
   ERROR HELPERS
========================================================= */

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   USER PROVIDER
========================================================= */

export const UserProvider = ({
  children,
}) => {
  const { token } = useAuth();

  /* =======================================================
     STATE
  ======================================================= */

  const [user, setUser] = useState(
    getStoredUser
  );

  const [loading, setLoading] = useState(
    false
  );

  const [
    updatingProfile,
    setUpdatingProfile,
  ] = useState(false);

  const [
    updatingAvatar,
    setUpdatingAvatar,
  ] = useState(false);

  const [error, setError] = useState(null);

  /* =======================================================
     REFS

     These refs are intentionally used to protect the
     authentication lifecycle from duplicate requests.
  ======================================================= */

  const mountedRef = useRef(true);

  const requestInFlightRef = useRef(false);

  const lastLoadedTokenRef = useRef(null);

  const initialLoadCompleteRef =
    useRef(false);

  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     SET USER
  ======================================================= */

  const setCurrentUser = useCallback(
    (userData) => {
      if (!mountedRef.current) {
        return;
      }

      setUser(userData);

      saveUser(userData);
    },
    []
  );

  /* =======================================================
     REFRESH CURRENT USER

     IMPORTANT:

     - Prevents concurrent requests.
     - Does not automatically log the user out on
       network failure.
     - Uses the current authentication token.
  ======================================================= */

  const refreshUser = useCallback(
  async ({ force = false } = {}) => {
    if (!token) {
      setCurrentUser(null);
      return null;
    }

    if (requestInFlightRef.current) {
      return null;
    }

    if (
      !force &&
      lastLoadedTokenRef.current === token
    ) {
      return null;
    }

    requestInFlightRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const response = await getCurrentUser();

      const currentUser =
        response?.user ||
        response?.data?.user ||
        response;

      if (
        !currentUser ||
        typeof currentUser !== "object"
      ) {
        throw new Error(
          "Invalid user response"
        );
      }

      lastLoadedTokenRef.current = token;

      setCurrentUser(currentUser);

      return currentUser;
    } catch (error) {
      const message =
        getErrorMessage(
          error,
          "Unable to load user profile"
        );

      console.error(
        "REFRESH_USER_ERROR:",
        error
      );

      setError(message);

      /*
       * IMPORTANT:
       * Do not clear the user on a network timeout.
       */

      return null;
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
    }
  },
  [
    token,
    setCurrentUser,
  ]
);

  /* =======================================================
     INITIAL USER LOAD

     This effect only reacts to an actual token value.
  ======================================================= */

  useEffect(() => {
    if (!token) {
      lastLoadedTokenRef.current = null;
      initialLoadCompleteRef.current =
        false;

      setCurrentUser(null);

      return;
    }

    /*
     * If this exact token has already been loaded,
     * do not request the user again.
     */

    if (
      lastLoadedTokenRef.current === token
    ) {
      return;
    }

    refreshUser();
  }, [
    token,
    refreshUser,
    setCurrentUser,
  ]);

  /* =======================================================
     UPDATE PROFILE
  ======================================================= */

  const updateProfile = useCallback(
    async (profileData) => {
      try {
        setUpdatingProfile(true);
        setError(null);

        const response =
          await updateUserProfile(
            profileData
          );

        const updatedUser =
          response?.user ||
          response?.data?.user ||
          response;

        if (
          !updatedUser ||
          typeof updatedUser !== "object"
        ) {
          throw new Error(
            "Invalid profile response"
          );
        }

        setCurrentUser(updatedUser);

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        const message =
          getErrorMessage(
            error,
            "Profile update failed"
          );

        console.error(
          "UPDATE_PROFILE_ERROR:",
          error
        );

        setError(message);

        return {
          success: false,
          message,
        };
      } finally {
        setUpdatingProfile(false);
      }
    },
    [setCurrentUser]
  );

  /* =======================================================
     UPDATE AVATAR
  ======================================================= */

  const updateAvatar = useCallback(
    async (file) => {
      try {
        setUpdatingAvatar(true);
        setError(null);

        const formData =
          new FormData();

        formData.append(
          "avatar",
          file
        );

        const response =
          await updateUserAvatar(
            formData
          );

        const updatedUser =
          response?.user ||
          response?.data?.user ||
          response;

        if (
          !updatedUser ||
          typeof updatedUser !== "object"
        ) {
          throw new Error(
            "Invalid avatar response"
          );
        }

        setCurrentUser(updatedUser);

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        const message =
          getErrorMessage(
            error,
            "Avatar update failed"
          );

        console.error(
          "UPDATE_AVATAR_ERROR:",
          error
        );

        setError(message);

        return {
          success: false,
          message,
        };
      } finally {
        setUpdatingAvatar(false);
      }
    },
    [setCurrentUser]
  );

  /* =======================================================
     UPDATE NOTIFICATION SETTINGS
  ======================================================= */

  const updateNotifications =
    useCallback(
      async (settings) => {
        try {
          setError(null);

          const response =
            await updateNotificationSettings(
              settings
            );

          const updatedUser =
            response?.user ||
            response?.data?.user ||
            response;

          if (
            !updatedUser ||
            typeof updatedUser !== "object"
          ) {
            throw new Error(
              "Invalid notification settings response"
            );
          }

          setCurrentUser(
            updatedUser
          );

          return {
            success: true,
            user: updatedUser,
          };
        } catch (error) {
          const message =
            getErrorMessage(
              error,
              "Notification update failed"
            );

          console.error(
            "UPDATE_NOTIFICATION_SETTINGS_ERROR:",
            error
          );

          setError(message);

          return {
            success: false,
            message,
          };
        }
      },
      [setCurrentUser]
    );

  /* =======================================================
     CLEAR USER
  ======================================================= */

  const clearUser = useCallback(() => {
    lastLoadedTokenRef.current =
      null;

    initialLoadCompleteRef.current =
      false;

    setCurrentUser(null);
  }, [setCurrentUser]);

  /* =======================================================
     MULTI-TAB SYNCHRONIZATION
  ======================================================= */

  useEffect(() => {
    const syncUser = (event) => {
      if (
        event.key !== USER_STORAGE_KEY
      ) {
        return;
      }

      try {
        const nextUser =
          event.newValue
            ? JSON.parse(
                event.newValue
              )
            : null;

        if (!mountedRef.current) {
          return;
        }

        setUser(
          nextUser &&
            typeof nextUser ===
              "object"
            ? nextUser
            : null
        );
      } catch (error) {
        console.error(
          "SYNC_USER_STORAGE_ERROR:",
          error
        );
      }
    };

    window.addEventListener(
      "storage",
      syncUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncUser
      );
    };
  }, []);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      user,
      loading,
      updatingProfile,
      updatingAvatar,
      error,

      refreshUser,

      updateProfile,
      updateAvatar,
      updateNotifications,

      clearUser,
    }),
    [
      user,
      loading,
      updatingProfile,
      updatingAvatar,
      error,
      refreshUser,
      updateProfile,
      updateAvatar,
      updateNotifications,
      clearUser,
    ]
  );

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <UserContext.Provider
      value={value}
    >
      {children}
    </UserContext.Provider>
  );
};