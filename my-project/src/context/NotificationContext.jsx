
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

/* =========================================================
   CONTEXT
========================================================= */

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
   HELPERS
========================================================= */

/**
 * Normalize notification responses from the API.
 *
 * Supports responses such as:
 *
 * {
 *   notifications: []
 * }
 *
 * or
 *
 * {
 *   data: []
 * }
 *
 * or directly:
 *
 * []
 */
const normalizeNotifications = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
};

/**
 * Normalize notification preferences.
 */
const normalizePreferences = (preferences = {}) => ({
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

/**
 * Get notification ID safely.
 */
const getNotificationId = (notification) =>
  notification?._id || notification?.id;

/**
 * Check whether notification is unread.
 */
const isUnread = (notification) =>
  Boolean(notification && !notification.isRead);

/* =========================================================
   PROVIDER
========================================================= */

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  /* =======================================================
     LIFECYCLE
  ======================================================= */

  const mountedRef = useRef(false);

  const notificationsLoadingRef = useRef(false);
  const preferencesLoadingRef = useRef(false);

  /* =======================================================
     NOTIFICATION STATE
  ======================================================= */

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     PREFERENCE STATE
  ======================================================= */

  const [notificationSettings, setNotificationSettings] =
    useState(DEFAULT_NOTIFICATION_SETTINGS);

  const [preferencesLoading, setPreferencesLoading] =
    useState(false);

  /* =======================================================
     ERROR STATE
  ======================================================= */

  const [error, setError] = useState(null);

  /* =======================================================
     MOUNT
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

      /*
       * Authentication errors are normally handled
       * by the auth layer.
       */
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

  /* =======================================================
     RESET NOTIFICATION STATE
  ======================================================= */

  const resetNotifications = useCallback(() => {
    safeSetState(() => {
      setNotifications([]);
      setError(null);
    });
  }, [safeSetState]);

  /* =======================================================
     FETCH NOTIFICATIONS
  ======================================================= */

  const fetchNotifications = useCallback(
    async (params = {}, showLoader = true) => {
      if (!isAuthenticated) {
        return null;
      }

      /*
       * Prevent duplicate requests.
       */
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
        const response = await getNotifications(params);

        const incomingNotifications =
          normalizeNotifications(response);

        safeSetState(() => {
          setNotifications(incomingNotifications);
        });

        return response;
      } catch (err) {
        handleError(
          err,
          "Unable to load notifications."
        );

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
    [
      handleError,
      isAuthenticated,
      safeSetState,
    ]
  );

  /* =======================================================
     FETCH UNREAD COUNT
     
     Used to synchronize with the backend.
  ======================================================= */

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      return 0;
    }

    try {
      const response = await getUnreadCount();

      const count = Number(
        response?.count ??
          response?.unreadCount ??
          response?.data?.count ??
          0
      );

      return Math.max(count, 0);
    } catch (err) {
      handleError(
        err,
        "Unable to load notification count."
      );

      return 0;
    }
  }, [
    handleError,
    isAuthenticated,
  ]);

  /* =======================================================
     DERIVED UNREAD NOTIFICATIONS
     
     The notification list is the local source of truth
     for UI-level unread state.
  ======================================================= */

  const unreadNotifications = useMemo(() => {
    return notifications.filter(isUnread);
  }, [notifications]);

  /* =======================================================
     DERIVED UNREAD COUNT
  ======================================================= */

  const unreadCount = unreadNotifications.length;

  /* =======================================================
     FETCH PREFERENCES
  ======================================================= */

  const fetchNotificationPreferences =
    useCallback(async () => {
      if (!isAuthenticated) {
        return null;
      }

      if (preferencesLoadingRef.current) {
        return null;
      }

      preferencesLoadingRef.current = true;

      safeSetState(() => {
        setPreferencesLoading(true);
      });

      try {
        const response =
          await getNotificationPreferences();

        const preferences =
          response?.preferences ||
          response?.notificationPreferences ||
          response?.data?.preferences ||
          response?.data ||
          response;

        if (preferences) {
          safeSetState(() => {
            setNotificationSettings(
              normalizePreferences(preferences)
            );
          });
        }

        return response;
      } catch (err) {
        handleError(
          err,
          "Unable to load notification preferences."
        );

        return null;
      } finally {
        preferencesLoadingRef.current = false;

        safeSetState(() => {
          setPreferencesLoading(false);
        });
      }
    }, [
      handleError,
      isAuthenticated,
      safeSetState,
    ]);

  /* =======================================================
     UPDATE PREFERENCES
  ======================================================= */

  const updateNotificationSettings =
    useCallback(
      async (settings) => {
        if (!isAuthenticated) {
          return null;
        }

        try {
          safeSetState(() => {
            setError(null);
          });

          const response =
            await updateNotificationPreferences(
              settings
            );

          const updatedPreferences =
            response?.preferences ||
            response?.notificationPreferences ||
            response?.data?.preferences ||
            settings;

          safeSetState(() => {
            setNotificationSettings(
              normalizePreferences(
                updatedPreferences
              )
            );
          });

          return response;
        } catch (err) {
          handleError(
            err,
            "Unable to update notification preferences."
          );

          throw err;
        }
      },
      [
        handleError,
        isAuthenticated,
        safeSetState,
      ]
    );

  /* =======================================================
     REFRESH ALL NOTIFICATION DATA
  ======================================================= */

  const refreshNotifications =
    useCallback(async () => {
      if (!isAuthenticated) {
        return;
      }

      safeSetState(() => {
        setRefreshing(true);
        setError(null);
      });

      try {
        /*
         * We deliberately fetch the notification list
         * and backend unread count separately.
         *
         * The list updates the UI.
         * The count confirms backend synchronization.
         */
        await Promise.all([
          fetchNotifications({}, false),
          fetchUnreadCount(),
        ]);
      } catch (err) {
        handleError(
          err,
          "Unable to refresh notifications."
        );
      } finally {
        safeSetState(() => {
          setRefreshing(false);
        });
      }
    }, [
      fetchNotifications,
      fetchUnreadCount,
      handleError,
      isAuthenticated,
      safeSetState,
    ]);

  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const readNotification = useCallback(
    async (id) => {
      if (!id) {
        return false;
      }

      const existingNotification =
        notifications.find(
          (item) =>
            getNotificationId(item) === id
        );

      /*
       * Already read.
       * Nothing should happen.
       */
      if (
        !existingNotification ||
        existingNotification.isRead
      ) {
        return true;
      }

      try {
        await markAsRead(id);

        safeSetState(() => {
          setNotifications((previous) =>
            previous.map((notification) => {
              const notificationId =
                getNotificationId(
                  notification
                );

              if (notificationId !== id) {
                return notification;
              }

              return {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              };
            })
          );
        });

        return true;
      } catch (err) {
        handleError(
          err,
          "Unable to mark notification as read."
        );

        return false;
      }
    },
    [
      handleError,
      notifications,
      safeSetState,
    ]
  );

  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const readAllNotifications =
    useCallback(async () => {
      try {
        await markAllAsRead();

        safeSetState(() => {
          setNotifications((previous) =>
            previous.map((notification) => ({
              ...notification,
              isRead: true,
              readAt:
                notification.readAt ||
                new Date().toISOString(),
            }))
          );
        });

        return true;
      } catch (err) {
        handleError(
          err,
          "Unable to mark notifications as read."
        );

        return false;
      }
    }, [
      handleError,
      safeSetState,
    ]);

  /* =======================================================
     DELETE ONE NOTIFICATION
  ======================================================= */

  const removeNotification =
    useCallback(
      async (id) => {
        if (!id) {
          return false;
        }

        try {
          await deleteNotification(id);

          safeSetState(() => {
            setNotifications((previous) =>
              previous.filter(
                (notification) =>
                  getNotificationId(
                    notification
                  ) !== id
              )
            );
          });

          return true;
        } catch (err) {
          handleError(
            err,
            "Unable to delete notification."
          );

          return false;
        }
      },
      [
        handleError,
        safeSetState,
      ]
    );

  /* =======================================================
     CLEAR ALL NOTIFICATIONS
  ======================================================= */

  const clearAllNotifications =
    useCallback(async () => {
      try {
        await clearNotifications();

        safeSetState(() => {
          setNotifications([]);
        });

        return true;
      } catch (err) {
        handleError(
          err,
          "Unable to clear notifications."
        );

        return false;
      }
    }, [
      handleError,
      safeSetState,
    ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      resetNotifications();

      safeSetState(() => {
        setNotificationSettings(
          DEFAULT_NOTIFICATION_SETTINGS
        );
      });

      return;
    }

    fetchNotifications();
    fetchNotificationPreferences();
  }, [
    fetchNotificationPreferences,
    fetchNotifications,
    isAuthenticated,
    resetNotifications,
    safeSetState,
  ]);

  /* =======================================================
     BACKEND SYNCHRONIZATION
     
     Refresh the actual notification list periodically.
     
     This is more useful than refreshing only the unread
     count because a new notification must appear in the
     dropdown as well.
  ======================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      fetchNotifications({}, false);
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [
    fetchNotifications,
    isAuthenticated,
  ]);

  /* =======================================================
     VISIBILITY SYNCHRONIZATION
     
     When the user returns to the tab, immediately
     synchronize notifications.
  ======================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        fetchNotifications({}, false);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    fetchNotifications,
    isAuthenticated,
  ]);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      /* -----------------------------------------------
         Notifications
      ----------------------------------------------- */

      notifications,

      unreadNotifications,

      unreadCount,

      loading,

      refreshing,

      error,

      /* -----------------------------------------------
         Notification operations
      ----------------------------------------------- */

      fetchNotifications,

      refreshNotifications,

      readNotification,

      readAllNotifications,

      removeNotification,

      clearAllNotifications,

      /* -----------------------------------------------
         Preferences
      ----------------------------------------------- */

      notificationSettings,

      preferencesLoading,

      fetchNotificationPreferences,

      updateNotificationSettings,
    }),
    [
      notifications,
      unreadNotifications,
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

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useNotifications = () => {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider."
    );
  }

  return context;
};

export default NotificationContext;
