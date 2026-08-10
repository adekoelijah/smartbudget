
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";

/*
============================================================
HELPER FUNCTIONS
============================================================
*/

const sendError = (
  res,
  status,
  message
) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const sendSuccess = (
  res,
  data = {}
) => {
  return res.status(200).json({
    success: true,
    ...data,
  });
};

/*
============================================================
DEFAULT NOTIFICATION SETTINGS
============================================================
*/

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

/*
============================================================
BOOLEAN VALIDATION
============================================================
*/

const isBoolean = (value) => {
  return typeof value === "boolean";
};

/*
============================================================
NORMALIZE NOTIFICATION PREFERENCES
============================================================

Only accepts known notification fields.

This prevents arbitrary properties from being written
into notificationSettings.
*/

const normalizeNotificationPreferences = (
  updates = {}
) => {
  const normalized = {};

  /*
  ----------------------------------------------------------
  FINANCIAL
  ----------------------------------------------------------
  */

  if (
    updates.financial &&
    typeof updates.financial === "object"
  ) {
    normalized.financial = {};

    Object.keys(
      DEFAULT_NOTIFICATION_SETTINGS.financial
    ).forEach((key) => {
      if (
        isBoolean(
          updates.financial[key]
        )
      ) {
        normalized.financial[key] =
          updates.financial[key];
      }
    });
  }

  /*
  ----------------------------------------------------------
  SECURITY
  ----------------------------------------------------------
  */

  if (
    updates.security &&
    typeof updates.security === "object"
  ) {
    normalized.security = {};

    Object.keys(
      DEFAULT_NOTIFICATION_SETTINGS.security
    ).forEach((key) => {
      if (
        isBoolean(
          updates.security[key]
        )
      ) {
        normalized.security[key] =
          updates.security[key];
      }
    });
  }

  /*
  ----------------------------------------------------------
  COMMUNICATION
  ----------------------------------------------------------
  */

  if (
    updates.communication &&
    typeof updates.communication === "object"
  ) {
    normalized.communication = {};

    Object.keys(
      DEFAULT_NOTIFICATION_SETTINGS.communication
    ).forEach((key) => {
      if (
        isBoolean(
          updates.communication[key]
        )
      ) {
        normalized.communication[key] =
          updates.communication[key];
      }
    });
  }

  /*
  ----------------------------------------------------------
  CHANNELS
  ----------------------------------------------------------
  */

  if (
    updates.channels &&
    typeof updates.channels === "object"
  ) {
    normalized.channels = {};

    Object.keys(
      DEFAULT_NOTIFICATION_SETTINGS.channels
    ).forEach((key) => {
      if (
        isBoolean(
          updates.channels[key]
        )
      ) {
        normalized.channels[key] =
          updates.channels[key];
      }
    });
  }

  return normalized;
};

/*
============================================================
GET NOTIFICATIONS
============================================================
*/

export const getNotifications =
  async (
    req,
    res
  ) => {
    try {
      const userId = req.user.id;

      let {
        page = 1,
        limit = 20,
        type,
        isRead,
      } = req.query;

      page = Math.max(
        Number(page),
        1
      );

      limit = Math.min(
        Math.max(
          Number(limit),
          1
        ),
        50
      );

      const query = {
        user: userId,
      };

      if (type) {
        query.type = type;
      }

      if (
        isRead !== undefined
      ) {
        query.isRead =
          isRead === "true";
      }

      const skip =
        (page - 1) * limit;

      const [
        notifications,
        total,
      ] = await Promise.all([
        Notification.find(query)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Notification.countDocuments(
          query
        ),
      ]);

      return sendSuccess(
        res,
        {
          notifications,

          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(
              total / limit
            ),
          },
        }
      );
    } catch (error) {
      console.error(
        "GET_NOTIFICATIONS_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to fetch notifications"
      );
    }
  };

/*
============================================================
GET UNREAD COUNT
============================================================
*/

export const getUnreadCount =
  async (
    req,
    res
  ) => {
    try {
      const count =
        await Notification.countDocuments({
          user: req.user.id,
          isRead: false,
        });

      return sendSuccess(
        res,
        {
          count,
        }
      );
    } catch (error) {
      console.error(
        "GET_UNREAD_COUNT_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to fetch unread count"
      );
    }
  };

/*
============================================================
MARK NOTIFICATION AS READ
============================================================
*/

export const markNotificationAsRead =
  async (
    req,
    res
  ) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user.id,
        });

      if (!notification) {
        return sendError(
          res,
          404,
          "Notification not found"
        );
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt =
          new Date();

        await notification.save();
      }

      return sendSuccess(
        res,
        {
          notification,
        }
      );
    } catch (error) {
      console.error(
        "MARK_NOTIFICATION_READ_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to update notification"
      );
    }
  };

/*
============================================================
MARK ALL NOTIFICATIONS AS READ
============================================================
*/

export const markAllNotificationsAsRead =
  async (
    req,
    res
  ) => {
    try {
      await Notification.updateMany(
        {
          user: req.user.id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return sendSuccess(
        res,
        {
          message:
            "All notifications marked as read",
        }
      );
    } catch (error) {
      console.error(
        "MARK_ALL_NOTIFICATIONS_READ_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to update notifications"
      );
    }
  };

/*
============================================================
DELETE NOTIFICATION
============================================================
*/

export const deleteNotification =
  async (
    req,
    res
  ) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user.id,
        });

      if (!notification) {
        return sendError(
          res,
          404,
          "Notification not found"
        );
      }

      await notification.deleteOne();

      return sendSuccess(
        res,
        {
          message:
            "Notification deleted successfully",
        }
      );
    } catch (error) {
      console.error(
        "DELETE_NOTIFICATION_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to delete notification"
      );
    }
  };

/*
============================================================
CLEAR ALL NOTIFICATIONS
============================================================
*/

export const clearNotifications =
  async (
    req,
    res
  ) => {
    try {
      await Notification.deleteMany({
        user: req.user.id,
      });

      return sendSuccess(
        res,
        {
          message:
            "Notifications cleared successfully",
        }
      );
    } catch (error) {
      console.error(
        "CLEAR_NOTIFICATIONS_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to clear notifications"
      );
    }
  };

/*
============================================================
GET NOTIFICATION PREFERENCES
============================================================
*/

export const getNotificationPreferences =
  async (
    req,
    res
  ) => {
    try {
      const user =
        await User.findById(
          req.user.id
        )
          .select(
            "notificationSettings"
          )
          .lean();

      if (!user) {
        return sendError(
          res,
          404,
          "User not found"
        );
      }

      const stored =
        user.notificationSettings ||
        {};

      /*
      --------------------------------------------------------
      Return a complete normalized object.
      --------------------------------------------------------
      */

      const settings = {
        financial: {
          ...DEFAULT_NOTIFICATION_SETTINGS.financial,
          ...(stored.financial || {}),
        },

        security: {
          ...DEFAULT_NOTIFICATION_SETTINGS.security,
          ...(stored.security || {}),
        },

        communication: {
          ...DEFAULT_NOTIFICATION_SETTINGS.communication,
          ...(stored.communication || {}),
        },

        channels: {
          ...DEFAULT_NOTIFICATION_SETTINGS.channels,
          ...(stored.channels || {}),
        },
      };

      return sendSuccess(
        res,
        {
          settings,
        }
      );
    } catch (error) {
      console.error(
        "GET_NOTIFICATION_PREFERENCES_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to fetch notification preferences"
      );
    }
  };

/*
============================================================
UPDATE NOTIFICATION PREFERENCES
============================================================
*/

export const updateNotificationPreferences =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user.id;

      /*
      --------------------------------------------------------
      Validate incoming payload
      --------------------------------------------------------
      */

      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return sendError(
          res,
          400,
          "Invalid notification preferences payload"
        );
      }

      /*
      --------------------------------------------------------
      Normalize only supported fields
      --------------------------------------------------------
      */

      const updates =
        normalizeNotificationPreferences(
          req.body
        );

      if (
        Object.keys(updates).length === 0
      ) {
        return sendError(
          res,
          400,
          "No valid notification preferences were provided"
        );
      }

      /*
      --------------------------------------------------------
      BUILD ATOMIC UPDATE
      --------------------------------------------------------

      IMPORTANT:

      Do NOT use:

        user.save()

      here.

      Saving the complete User document triggers validation
      for unrelated required fields such as firstName/lastName.

      Instead, update only notificationSettings.
      --------------------------------------------------------
      */

      const updateOperations = {};

      Object.entries(
        updates
      ).forEach(
        ([section, values]) => {
          Object.entries(
            values
          ).forEach(
            ([key, value]) => {
              updateOperations[
                `notificationSettings.${section}.${key}`
              ] = value;
            }
          );
        }
      );

      /*
      --------------------------------------------------------
      ATOMIC DATABASE UPDATE
      --------------------------------------------------------
      */

      const updatedUser =
        await User.findByIdAndUpdate(
          userId,

          {
            $set:
              updateOperations,
          },

          {
            new: true,
            projection:
              "notificationSettings",
          }
        ).lean();

      if (!updatedUser) {
        return sendError(
          res,
          404,
          "User not found"
        );
      }

      /*
      --------------------------------------------------------
      NORMALIZED RESPONSE
      --------------------------------------------------------
      */

      const stored =
        updatedUser.notificationSettings ||
        {};

      const settings = {
        financial: {
          ...DEFAULT_NOTIFICATION_SETTINGS.financial,
          ...(stored.financial || {}),
        },

        security: {
          ...DEFAULT_NOTIFICATION_SETTINGS.security,
          ...(stored.security || {}),
        },

        communication: {
          ...DEFAULT_NOTIFICATION_SETTINGS.communication,
          ...(stored.communication || {}),
        },

        channels: {
          ...DEFAULT_NOTIFICATION_SETTINGS.channels,
          ...(stored.channels || {}),
        },
      };

      return sendSuccess(
        res,
        {
          message:
            "Notification preferences updated successfully",

          settings,
        }
      );
    } catch (error) {
      console.error(
        "UPDATE_NOTIFICATION_PREFERENCES_ERROR:",
        error
      );

      return sendError(
        res,
        500,
        "Unable to update notification preferences"
      );
    }
  };
