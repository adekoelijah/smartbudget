import mongoose from "mongoose";

const regionalSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ["en"],
      default: "en",
    },

    currency: {
      type: String,
      default: "NGN",
    },

    timezone: {
      type: String,
      default: "Africa/Lagos",
    },

    dateFormat: {
      type: String,
      default: "DD/MM/YYYY",
    },
  },
  { _id: false }
);

const displaySchema = new mongoose.Schema(
  {
    compactMode: {
      type: Boolean,
      default: false,
    },

    animations: {
      type: Boolean,
      default: true,
    },

    highContrast: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const privacySchema = new mongoose.Schema(
  {
    analytics: {
      type: Boolean,
      default: true,
    },

    profileVisibility: {
      type: String,
      enum: ["private", "contacts", "public"],
      default: "private",
    },

    shareUsageData: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    regional: {
      type: regionalSchema,
      default: () => ({}),
    },

    display: {
      type: displaySchema,
      default: () => ({}),
    },

    privacy: {
      type: privacySchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model(
  "Preference",
  preferenceSchema
);