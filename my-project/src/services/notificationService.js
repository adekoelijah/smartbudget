import api from "./api";

/*
==================================================
RESPONSE HANDLER
==================================================
*/

// const unwrap = (response) => {
//   if (!response?.data) {
//     throw new Error("Invalid server response.");
//   }

//   return response.data;
// };

const unwrap = (response) => {
  if (!response) {
    throw new Error("No response received from the server.");
  }

  if (!response.data) {
    throw new Error("Invalid server response.");
  }

  return response.data;
};

const handleError = (error, label) => {
  // Ignore intentionally cancelled requests
  if (
    error.code === "ERR_CANCELED" ||
    error.name === "CanceledError"
) {
    console.warn(`${label}: Request cancelled.`);
    return {
        notifications: [],
        count: 0
    };
}

  console.error(
    `${label}:`,
    error.response?.data || error.message || error
  );

  throw error;
};

/*
==================================================
GET NOTIFICATIONS
==================================================
*/

export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get(
      "/notifications",
      {
        params,
      }
    );

    return unwrap(response);
  } catch (error) {
    console.error(
      "GET_NOTIFICATIONS_ERROR:",
      error
    );

    throw error;
  }
};

/*
==================================================
GET UNREAD COUNT
==================================================
*/

export const getUnreadCount = async () => {
  try {
    const response = await api.get(
      "/notifications/unread-count"
    );

    return unwrap(response);
  } catch (error) {
    console.error(
      "GET_UNREAD_COUNT_ERROR:",
      error
    );

    throw error;
  }
};

/*
==================================================
MARK AS READ
==================================================
*/

export const markAsRead = async (
  notificationId
) => {
  try {
    const response = await api.patch(
      `/notifications/${notificationId}/read`
    );

    return unwrap(response);
  } catch (error) {
    console.error(
      "MARK_AS_READ_ERROR:",
      error
    );

    throw error;
  }
};

/*
==================================================
MARK ALL AS READ
==================================================
*/

export const markAllAsRead = async () => {
  try {
    const response = await api.patch(
      "/notifications/read-all"
    );

    return unwrap(response);
  } catch (error) {
    console.error(
      "MARK_ALL_AS_READ_ERROR:",
      error
    );

    throw error;
  }
};

/*
==================================================
DELETE NOTIFICATION
==================================================
*/

export const deleteNotification =
  async (notificationId) => {
    try {
      const response = await api.delete(
        `/notifications/${notificationId}`
      );

      return unwrap(response);
    } catch (error) {
      console.error(
        "DELETE_NOTIFICATION_ERROR:",
        error
      );

      throw error;
    }
  };

/*
==================================================
CLEAR ALL NOTIFICATIONS
==================================================
*/

export const clearNotifications =
  async () => {
    try {
      const response = await api.delete(
        "/notifications"
      );

      return unwrap(response);
    } catch (error) {
      console.error(
        "CLEAR_NOTIFICATIONS_ERROR:",
        error
      );

      throw error;
    }
  };

/*
==================================================
GET NOTIFICATION SETTINGS
==================================================
*/

export const getNotificationPreferences =
  async () => {
    try {
      const response = await api.get(
        "/notifications/preferences"
      );

      return unwrap(response);
    } catch (error) {
      console.error(
        "GET_NOTIFICATION_SETTINGS_ERROR:",
        error
      );

      throw error;
    }
  };

/*
==================================================
UPDATE NOTIFICATION SETTINGS
==================================================
*/

export const updateNotificationPreferences  =
  async (settings) => {
    try {
      const response = await api.put(
        "/notifications/preferences",
        settings
      );

      return unwrap(response);
    } catch (error) {
      console.error(
        "UPDATE_NOTIFICATION_SETTINGS_ERROR:",
        error
      );

      throw error;
    }
  };

/*
==================================================
EXPORT
==================================================
*/

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