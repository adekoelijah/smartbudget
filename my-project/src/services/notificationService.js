
import api from "./api";

/* =========================================================
   RESPONSE HANDLER
========================================================= */

/**
 * Safely unwrap Axios responses.
 *
 * Axios response:
 *
 * {
 *   data: {...},
 *   status: 200,
 *   ...
 * }
 *
 * The notification service only exposes
 * response.data to the context.
 */
const unwrap = (response) => {
  if (!response) {
    throw new Error(
      "No response received from the server."
    );
  }

  if (typeof response.data === "undefined") {
    throw new Error(
      "Invalid server response."
    );
  }

  return response.data;
};

/* =========================================================
   ERROR HANDLER
========================================================= */

/**
 * Centralized notification API error handler.
 *
 * We intentionally rethrow the original error so that
 * NotificationContext can decide how the UI should react.
 */
const handleError = (error, label) => {
  if (
    error?.code === "ERR_CANCELED" ||
    error?.name === "CanceledError"
  ) {
    console.warn(
      `${label}: Request cancelled.`
    );

    return null;
  }

  console.error(
    `${label}:`,
    error?.response?.data ||
      error?.message ||
      error
  );

  throw error;
};

/* =========================================================
   GET NOTIFICATIONS
========================================================= */

/**
 * Fetch notifications for the authenticated user.
 *
 * Supported params can include things such as:
 *
 * {
 *   page: 1,
 *   limit: 20,
 *   unreadOnly: true
 * }
 */
export const getNotifications = async (
  params = {}
) => {
  try {
    const response = await api.get(
      "/notifications",
      {
        params,
      }
    );

    return unwrap(response);
  } catch (error) {
    return handleError(
      error,
      "GET_NOTIFICATIONS_ERROR"
    );
  }
};

/* =========================================================
   GET UNREAD COUNT
========================================================= */

/**
 * Fetch the backend unread notification count.
 *
 * Example response:
 *
 * {
 *   count: 4
 * }
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get(
      "/notifications/unread-count"
    );

    return unwrap(response);
  } catch (error) {
    return handleError(
      error,
      "GET_UNREAD_COUNT_ERROR"
    );
  }
};

/* =========================================================
   MARK ONE NOTIFICATION AS READ
========================================================= */

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (
  notificationId
) => {
  if (!notificationId) {
    throw new Error(
      "Notification ID is required."
    );
  }

  try {
    const response = await api.patch(
      `/notifications/${notificationId}/read`
    );

    return unwrap(response);
  } catch (error) {
    return handleError(
      error,
      "MARK_AS_READ_ERROR"
    );
  }
};

/* =========================================================
   MARK ALL NOTIFICATIONS AS READ
========================================================= */

/**
 * Mark every notification belonging to the
 * authenticated user as read.
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.patch(
      "/notifications/read-all"
    );

    return unwrap(response);
  } catch (error) {
    return handleError(
      error,
      "MARK_ALL_AS_READ_ERROR"
    );
  }
};

/* =========================================================
   DELETE ONE NOTIFICATION
========================================================= */

/**
 * Delete a single notification.
 */
export const deleteNotification = async (
  notificationId
) => {
  if (!notificationId) {
    throw new Error(
      "Notification ID is required."
    );
  }

  try {
    const response = await api.delete(
      `/notifications/${notificationId}`
    );

    return unwrap(response);
  } catch (error) {
    return handleError(
      error,
      "DELETE_NOTIFICATION_ERROR"
    );
  }
};

/* =========================================================
   CLEAR ALL NOTIFICATIONS
========================================================= */

/**
 * Delete all notifications belonging to
 * the authenticated user.
 */
export const clearNotifications =
  async () => {
    try {
      const response = await api.delete(
        "/notifications"
      );

      return unwrap(response);
    } catch (error) {
      return handleError(
        error,
        "CLEAR_NOTIFICATIONS_ERROR"
      );
    }
  };

/* =========================================================
   GET NOTIFICATION PREFERENCES
========================================================= */

/**
 * Fetch notification preferences.
 */
export const getNotificationPreferences =
  async () => {
    try {
      const response = await api.get(
        "/notifications/preferences"
      );

      return unwrap(response);
    } catch (error) {
      return handleError(
        error,
        "GET_NOTIFICATION_PREFERENCES_ERROR"
      );
    }
  };

/* =========================================================
   UPDATE NOTIFICATION PREFERENCES
========================================================= */

/**
 * Update notification preferences.
 *
 * IMPORTANT:
 * This intentionally uses PUT because the current
 * API contract uses:
 *
 * PUT /notifications/preferences
 */
export const updateNotificationPreferences =
  async (settings) => {
    if (!settings) {
      throw new Error(
        "Notification settings are required."
      );
    }

    try {
      const response = await api.put(
        "/notifications/preferences",
        settings
      );

      return unwrap(response);
    } catch (error) {
      return handleError(
        error,
        "UPDATE_NOTIFICATION_PREFERENCES_ERROR"
      );
    }
  };

/* =========================================================
   SERVICE EXPORT
========================================================= */

const notificationService = {
  getNotifications,
  getUnreadCount,

  markAsRead,
  markAllAsRead,

  deleteNotification,
  clearNotifications,

  getNotificationPreferences,
  updateNotificationPreferences,
};

export default notificationService;