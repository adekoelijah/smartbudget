import mongoose from "mongoose";

/*
==================================================
ENUMS
==================================================
*/

export const NOTIFICATION_TYPES = [
  "transaction",
  "budget",
  "goal",
  "bill",
  "security",
  "system",
  "subscription",
  "report",
  "account",
];

export const NOTIFICATION_PRIORITIES = [
  "low",
  "normal",
  "high",
  "critical",
];

export const NOTIFICATION_CHANNELS = [
  "in_app",
  "email",
  "push",
  "sms",
];

/*
==================================================
SCHEMA
==================================================
*/

const notificationSchema = new mongoose.Schema(
  {
    /*
    ==========================================
    OWNER
    ==========================================
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    ==========================================
    CONTENT
    ==========================================
    */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    /*
    ==========================================
    TYPE
    ==========================================
    */

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },

    /*
    ==========================================
    PRIORITY
    ==========================================
    */

    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITIES,
      default: "normal",
    },

    /*
    ==========================================
    DELIVERY CHANNEL
    ==========================================
    */

    channel: {
      type: String,
      enum: NOTIFICATION_CHANNELS,
      default: "in_app",
    },

    /*
    ==========================================
    STATUS
    ==========================================
    */

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    /*
    ==========================================
    NAVIGATION
    ==========================================
    */

    actionUrl: {
      type: String,
      trim: true,
      default: null,
    },

    /*
    ==========================================
    RELATED RESOURCE
    ==========================================
    */

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    resourceModel: {
      type: String,
      default: null,
    },

    /*
    ==========================================
    EXTRA DATA
    ==========================================
    */

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /*
    ==========================================
    EXPIRATION
    ==========================================
    */

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
==================================================
INDEXES
==================================================
*/

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  isRead: 1,
});

notificationSchema.index({
  user: 1,
  type: 1,
});

notificationSchema.index({
  expiresAt: 1,
});

/*
==================================================
INSTANCE METHODS
==================================================
*/

notificationSchema.methods.markAsRead =
  async function () {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();

      await this.save();
    }

    return this;
  };

/*
==================================================
STATIC METHODS
==================================================
*/

notificationSchema.statics.markAllAsRead =
  async function (userId) {
    return this.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );
  };

notificationSchema.statics.getUnreadCount =
  async function (userId) {
    return this.countDocuments({
      user: userId,
      isRead: false,
    });
  };

/*
==================================================
MODEL
==================================================
*/

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;