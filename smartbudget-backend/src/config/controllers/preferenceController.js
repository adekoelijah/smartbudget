
import Preference from "../../models/Preference.js";

/*
==================================================
DEFAULT PREFERENCES
==================================================
*/

const DEFAULT_PREFERENCES = {
  regional: {
    language: "en",
    currency: "NGN",
    timezone: "Africa/Lagos",
    dateFormat: "DD/MM/YYYY",
  },

  display: {
    compactMode: false,
    animations: true,
    highContrast: false,
  },

  privacy: {
    analytics: true,
    profileVisibility: "private",
    shareUsageData: false,
  },
};

/*
==================================================
GET OR CREATE USER PREFERENCES
==================================================
*/

const getOrCreatePreferences = async (userId) => {
  let preferences = await Preference.findOne({
    user: userId,
  });

  if (!preferences) {
    preferences = await Preference.create({
      user: userId,
      ...DEFAULT_PREFERENCES,
    });
  }

  return preferences;
};

/*
==================================================
GET PREFERENCES
==================================================
*/

export const getPreferences = async (req, res) => {
  try {
    const preferences = await getOrCreatePreferences(req.user.id);

    return res.status(200).json({
      success: true,
      settings: preferences,
    });
  } catch (error) {
    console.error("GET_PREFERENCES_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load preferences.",
    });
  }
};

/*
==================================================
UPDATE PREFERENCES
==================================================
*/

export const updatePreferences = async (req, res) => {
  try {
    const preferences = await getOrCreatePreferences(req.user.id);

    preferences.regional = {
      ...preferences.regional.toObject(),
      ...(req.body.regional || {}),
    };

    preferences.display = {
      ...preferences.display.toObject(),
      ...(req.body.display || {}),
    };

    preferences.privacy = {
      ...preferences.privacy.toObject(),
      ...(req.body.privacy || {}),
    };

    await preferences.save();

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully.",
      settings: preferences,
    });
  } catch (error) {
    console.error("UPDATE_PREFERENCES_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update preferences.",
    });
  }
};

/*
==================================================
UPDATE SINGLE PREFERENCE
==================================================
*/

export const updatePreference = async (req, res) => {
  try {
    const preferences = await getOrCreatePreferences(req.user.id);

    const updates = req.body;

    Object.entries(updates).forEach(([key, value]) => {
      if (key.includes(".")) {
        const [section, field] = key.split(".");

        if (preferences[section]) {
          preferences[section][field] = value;
        }
      }
    });

    await preferences.save();

    return res.status(200).json({
      success: true,
      settings: preferences,
    });
  } catch (error) {
    console.error("UPDATE_SINGLE_PREFERENCE_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update preference.",
    });
  }
};

/*
==================================================
RESET PREFERENCES
==================================================
*/

export const resetPreferences = async (req, res) => {
  try {
    const preferences = await getOrCreatePreferences(req.user.id);

    preferences.regional = DEFAULT_PREFERENCES.regional;
    preferences.display = DEFAULT_PREFERENCES.display;
    preferences.privacy = DEFAULT_PREFERENCES.privacy;

    await preferences.save();

    return res.status(200).json({
      success: true,
      message: "Preferences restored to default.",
      settings: preferences,
    });
  } catch (error) {
    console.error("RESET_PREFERENCES_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset preferences.",
    });
  }
};