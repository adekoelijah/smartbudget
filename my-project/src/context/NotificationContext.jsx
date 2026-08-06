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
  
} from "../services/notificationService";

import { useAuth } from "../hooks/useAuth";


/*
==================================================
CONTEXT
==================================================
*/

// const NotificationContext = createContext(null);

const NotificationContext = createContext(null);



/*
==================================================
PROVIDER
==================================================
*/

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const mountedRef = useRef(false);
  const loadingRef = useRef(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /*
  ==================================================
  SAFE STATE HELPERS
  ==================================================
  */

  const safeSetState = useCallback((callback) => {
    if (mountedRef.current) {
      callback();
    }
  }, []);

  /*
  ==================================================
  ERROR HANDLER
  ==================================================
  */

  const handleError = useCallback(
    (err) => {
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
            "Unable to load notifications."
        );
      });
    },
    [safeSetState]
  );

  /*
  ==================================================
  FETCH NOTIFICATIONS
  ==================================================
  */

  const fetchNotifications = useCallback(
    async (params = {}, showLoader = true) => {
      if (!isAuthenticated) return null;

      if (loadingRef.current) return null;

      loadingRef.current = true;

      if (showLoader) {
        safeSetState(() => {
          setLoading(true);
          setError(null);
        });
      }

      try {
        const data = await getNotifications(params);

        safeSetState(() => {
          setNotifications(data.notifications ?? []);
        });

        return data;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        loadingRef.current = false;

        if (showLoader) {
          safeSetState(() => {
            setLoading(false);
          });
        }
      }
    },
    [handleError, isAuthenticated, safeSetState]
  );

  /*
  ==================================================
  FETCH UNREAD COUNT
  ==================================================
  */

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await getUnreadCount();

      safeSetState(() => {
        setUnreadCount(data.count ?? 0);
      });
    } catch (err) {
      handleError(err);
    }
  }, [handleError, isAuthenticated, safeSetState]);

  /*
  ==================================================
  INITIAL LOAD
  ==================================================
  */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();
  }, [
    isAuthenticated,
    fetchNotifications,
    fetchUnreadCount,
  ]);

  /*
  ==================================================
  REFRESH
  ==================================================
  */

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setRefreshing(true);

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

  /*
  ==================================================
  MARK READ
  ==================================================
  */

  const readNotification = useCallback(
    async (id) => {
      try {
        await markAsRead(id);

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

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  /*
  ==================================================
  MARK ALL READ
  ==================================================
  */

  const readAllNotifications = useCallback(async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  /*
  ==================================================
  DELETE
  ==================================================
  */

  const removeNotification = useCallback(
    async (id) => {
      try {
        await deleteNotification(id);

        setNotifications((prev) =>
          prev.filter((item) => item._id !== id)
        );

        fetchUnreadCount();
      } catch (err) {
        handleError(err);
      }
    },
    [fetchUnreadCount, handleError]
  );

  /*
  ==================================================
  CLEAR
  ==================================================
  */

  const clearAllNotifications = useCallback(async () => {
    try {
      await clearNotifications();

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  /*
  ==================================================
  AUTO REFRESH
  ==================================================
  */

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchUnreadCount, isAuthenticated]);

  /*
  ==================================================
  CONTEXT VALUE
  ==================================================
  */

  const value = useMemo(
    () => ({
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
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/*
==================================================
HOOK
==================================================
*/

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider."
    );
  }

  return context;
};