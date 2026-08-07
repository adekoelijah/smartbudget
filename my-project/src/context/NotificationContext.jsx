import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../services/notificationService";

import { useAuth } from "../hooks/useAuth";

const NotificationContext = createContext(null);

/* =========================================================
   DEFAULT NOTIFICATION PREFERENCES
========================================================= */

const DEFAULT_NOTIFICATION_SETTINGS = {
  financial: {
    spendingAlerts: true,
    budgetWarnings: true,
    billReminders: true,
    goalMilestones: true,
    weeklySummary: true,
  },

  security: {
    newLogin: true,
    passwordChanges: true,
    profileChanges: true,
    suspiciousActivity: true,
  },

  communication: {
    productUpdates: false,
    promotions: false,
  },

  channels: {
    email: true,
    push: true,
    sms: false,
  },
};

/* =========================================================
   PROVIDER
========================================================= */

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const mountedRef = useRef(false);
  const notificationsLoadingRef = useRef(false);
  const preferencesLoadingRef = useRef(false);

  /* =======================================================
     NOTIFICATIONS STATE
  ======================================================= */

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     PREFERENCES STATE
  ======================================================= */

  const [notificationSettings, setNotificationSettings] = useState(
    DEFAULT_NOTIFICATION_SETTINGS
  );

  const [preferencesLoading, setPreferencesLoading] = useState(false);

  /* =======================================================
     ERROR STATE
  ======================================================= */

  const [error, setError] = useState(null);

  /* =======================================================
     MOUNT CHECK
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     SAFE STATE UPDATE
  ======================================================= */

  const safeSetState = useCallback((callback) => {
    if (mountedRef.current) {
      callback();
    }
  }, []);

  /* =======================================================
     ERROR HANDLER
  ======================================================= */

  const handleError = useCallback(
    (err, fallbackMessage = "Something went wrong.") => {
      if (
        err?.code === "ERR_CANCELED" ||
        err?.message === "Request aborted"
      ) {
        return;
      }

      if (err?.response?.status === 401) {
        return;
      }

      console.error("NOTIFICATION_ERROR:", err);

      safeSetState(() => {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            fallbackMessage
        );
      });
    },
    [safeSetState]
  );

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================= */

  const fetchNotifications = useCallback(
    async (params = {}, showLoader = true) => {
      if (!isAuthenticated) {
        return null;
      }

      if (notificationsLoadingRef.current) {
        return null;
      }

      notificationsLoadingRef.current = true;

      if (showLoader) {
        safeSetState(() => {
          setLoading(true);
          setError(null);
        });
      }

      try {
        const data = await getNotifications(params);

        safeSetState(() => {
          setNotifications(data?.notifications ?? []);
        });

        return data;
      } catch (err) {
        handleError(err, "Unable to load notifications.");
        return null;
      } finally {
        notificationsLoadingRef.current = false;

        if (showLoader) {
          safeSetState(() => {
            setLoading(false);
          });
        }
      }
    },
    [handleError, isAuthenticated, safeSetState]
  );

  /* =========================================================
     FETCH UNREAD COUNT
  ========================================================= */

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const data = await getUnreadCount();

      safeSetState(() => {
        setUnreadCount(Number(data?.count ?? 0));
      });
    } catch (err) {
      handleError(err, "Unable to load notification count.");
    }
  }, [handleError, isAuthenticated, safeSetState]);

  /* =========================================================
     FETCH NOTIFICATION PREFERENCES
  ========================================================= */

  const fetchNotificationPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    if (preferencesLoadingRef.current) {
      return;
    }

    preferencesLoadingRef.current = true;

    safeSetState(() => {
      setPreferencesLoading(true);
    });

    try {
      const data = await getNotificationPreferences();

      const preferences =
        data?.preferences ||
        data?.notificationPreferences ||
        data;

      if (preferences) {
        safeSetState(() => {
          setNotificationSettings({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...preferences,
            financial: {
              ...DEFAULT_NOTIFICATION_SETTINGS.financial,
              ...(preferences.financial || {}),
            },
            security: {
              ...DEFAULT_NOTIFICATION_SETTINGS.security,
              ...(preferences.security || {}),
            },
            communication: {
              ...DEFAULT_NOTIFICATION_SETTINGS.communication,
              ...(preferences.communication || {}),
            },
            channels: {
              ...DEFAULT_NOTIFICATION_SETTINGS.channels,
              ...(preferences.channels || {}),
            },
          });
        });
      }
    } catch (err) {
      handleError(
        err,
        "Unable to load notification preferences."
      );
    } finally {
      preferencesLoadingRef.current = false;

      safeSetState(() => {
        setPreferencesLoading(false);
      });
    }
  }, [handleError, isAuthenticated, safeSetState]);

  /* =========================================================
     UPDATE NOTIFICATION PREFERENCES
  ========================================================= */

  const updateNotificationSettings = useCallback(
    async (settings) => {
      if (!isAuthenticated) {
        return null;
      }

      try {
        setError(null);

        const data = await updateNotificationPreferences(
          settings
        );

        const updatedPreferences =
          data?.preferences ||
          data?.notificationPreferences ||
          settings;

        safeSetState(() => {
          setNotificationSettings({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...updatedPreferences,
            financial: {
              ...DEFAULT_NOTIFICATION_SETTINGS.financial,
              ...(updatedPreferences.financial || {}),
            },
            security: {
              ...DEFAULT_NOTIFICATION_SETTINGS.security,
              ...(updatedPreferences.security || {}),
            },
            communication: {
              ...DEFAULT_NOTIFICATION_SETTINGS.communication,
              ...(updatedPreferences.communication || {}),
            },
            channels: {
              ...DEFAULT_NOTIFICATION_SETTINGS.channels,
              ...(updatedPreferences.channels || {}),
            },
          });
        });

        return data;
      } catch (err) {
        handleError(
          err,
          "Unable to update notification preferences."
        );

        throw err;
      }
    },
    [handleError, isAuthenticated, safeSetState]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationSettings(
        DEFAULT_NOTIFICATION_SETTINGS
      );

      return;
    }

    fetchNotifications();
    fetchUnreadCount();
    fetchNotificationPreferences();
  }, [
    isAuthenticated,
    fetchNotifications,
    fetchUnreadCount,
    fetchNotificationPreferences,
  ]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      safeSetState(() => {
        setRefreshing(true);
        setError(null);
      });

      await Promise.all([
        fetchNotifications({}, false),
        fetchUnreadCount(),
      ]);
    } finally {
      safeSetState(() => {
        setRefreshing(false);
      });
    }
  }, [
    fetchNotifications,
    fetchUnreadCount,
    isAuthenticated,
    safeSetState,
  ]);

  /* =========================================================
     MARK SINGLE NOTIFICATION AS READ
  ========================================================= */

  const readNotification = useCallback(
    async (id) => {
      if (!id) return;

      try {
        await markAsRead(id);

        safeSetState(() => {
          setNotifications((prev) =>
            prev.map((item) =>
              item._id === id
                ? {
                    ...item,
                    isRead: true,
                    readAt: new Date(),
                  }
                : item
            )
          );

          setUnreadCount((prev) =>
            Math.max(prev - 1, 0)
          );
        });
      } catch (err) {
        handleError(
          err,
          "Unable to mark notification as read."
        );
      }
    },
    [handleError, safeSetState]
  );

  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

  const readAllNotifications = useCallback(async () => {
    try {
      await markAllAsRead();

      safeSetState(() => {
        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            isRead: true,
            readAt: new Date(),
          }))
        );

        setUnreadCount(0);
      });
    } catch (err) {
      handleError(
        err,
        "Unable to mark notifications as read."
      );
    }
  }, [handleError, safeSetState]);

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================= */

  const removeNotification = useCallback(
    async (id) => {
      if (!id) return;

      try {
        await deleteNotification(id);

        safeSetState(() => {
          setNotifications((prev) =>
            prev.filter((item) => item._id !== id)
          );
        });

        await fetchUnreadCount();
      } catch (err) {
        handleError(
          err,
          "Unable to delete notification."
        );
      }
    },
    [fetchUnreadCount, handleError, safeSetState]
  );

  /* =========================================================
     CLEAR ALL
  ========================================================= */

  const clearAllNotifications = useCallback(async () => {
    try {
      await clearNotifications();

      safeSetState(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
    } catch (err) {
      handleError(
        err,
        "Unable to clear notifications."
      );
    }
  }, [handleError, safeSetState]);

  /* =========================================================
     AUTO REFRESH UNREAD COUNT
  ========================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const timer = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [fetchUnreadCount, isAuthenticated]);

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value = useMemo(
    () => ({
      /* Notifications */
      notifications,
      unreadCount,

      loading,
      refreshing,
      error,

      fetchNotifications,
      refreshNotifications,

      readNotification,
      readAllNotifications,

      removeNotification,
      clearAllNotifications,

      /* Notification preferences */
      notificationSettings,
      preferencesLoading,
      fetchNotificationPreferences,
      updateNotificationSettings,
    }),
    [
      notifications,
      unreadCount,
      loading,
      refreshing,
      error,

      fetchNotifications,
      refreshNotifications,

      readNotification,
      readAllNotifications,

      removeNotification,
      clearAllNotifications,

      notificationSettings,
      preferencesLoading,
      fetchNotificationPreferences,
      updateNotificationSettings,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider."
    );
  }

  return context;
};

export default NotificationContext;