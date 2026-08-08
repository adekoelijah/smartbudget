import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import notificationService from "../../../services/notificationService";

import {
  DEFAULT_NOTIFICATION_SETTINGS,
} from "../notificationConfig";

/*
==================================================
UTILITY
==================================================
*/

const clone = (value) => {
  return JSON.parse(JSON.stringify(value));
};

const areEqual = (first, second) => {
  return JSON.stringify(first) === JSON.stringify(second);
};

/*
==================================================
USE NOTIFICATION SETTINGS
==================================================
*/

const useNotificationSettings = () => {
  /*
  -----------------------------------------------
  STATE
  -----------------------------------------------
  */

  const [settings, setSettings] = useState(() =>
    clone(DEFAULT_NOTIFICATION_SETTINGS)
  );

  const [baseline, setBaseline] = useState(() =>
    clone(DEFAULT_NOTIFICATION_SETTINGS)
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(false);

  /*
  -----------------------------------------------
  LOAD SETTINGS
  -----------------------------------------------
  */

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await notificationService.getNotificationPreferences();

      const preferences =
        response?.settings ??
        DEFAULT_NOTIFICATION_SETTINGS;

      const clonedPreferences =
        clone(preferences);

      setSettings(clonedPreferences);

      setBaseline(
        clone(clonedPreferences)
      );
    } catch (error) {
      console.error(
        "LOAD_NOTIFICATION_SETTINGS_ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load notification settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  -----------------------------------------------
  INITIAL LOAD
  -----------------------------------------------
  */

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /*
  -----------------------------------------------
  CHANGE DETECTION
  -----------------------------------------------
  */

  const hasChanges = useMemo(() => {
    return !areEqual(
      settings,
      baseline
    );
  }, [settings, baseline]);

  /*
  -----------------------------------------------
  TOGGLE SETTING
  -----------------------------------------------
  */

  const toggleSetting = useCallback(
    (section, key) => {
      setSettings((previous) => {
        const currentSection =
          previous?.[section] ?? {};

        const currentValue =
          Boolean(currentSection?.[key]);

        return {
          ...previous,

          [section]: {
            ...currentSection,

            [key]: !currentValue,
          },
        };
      });

      setSuccess(false);
      setError(null);
    },
    []
  );

  /*
  -----------------------------------------------
  UPDATE SINGLE SETTING
  -----------------------------------------------
  */

  const updateSetting = useCallback(
    (section, key, value) => {
      setSettings((previous) => {
        const currentSection =
          previous?.[section] ?? {};

        return {
          ...previous,

          [section]: {
            ...currentSection,

            [key]: value,
          },
        };
      });

      setSuccess(false);
      setError(null);
    },
    []
  );

  /*
  -----------------------------------------------
  RESET UNSAVED CHANGES
  -----------------------------------------------
  */

  const resetSettings = useCallback(() => {
    setSettings(
      clone(baseline)
    );

    setSuccess(false);
    setError(null);
  }, [baseline]);

  /*
  -----------------------------------------------
  SAVE SETTINGS
  -----------------------------------------------
  */

  const saveSettings = useCallback(async () => {
    if (saving) {
      return {
        success: false,
        message: "Save already in progress.",
      };
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response =
        await notificationService.updateNotificationPreferences(
          settings
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to save notification settings."
        );
      }

      const savedSettings =
        response?.settings ??
        settings;

      const clonedSettings =
        clone(savedSettings);

      setSettings(
        clonedSettings
      );

      setBaseline(
        clone(clonedSettings)
      );

      setSuccess(true);

      return {
        ...response,
        success: true,
      };
    } catch (error) {
      console.error(
        "SAVE_NOTIFICATION_SETTINGS_ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save notification settings.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setSaving(false);
    }
  }, [settings, saving]);

  /*
  -----------------------------------------------
  PUBLIC API
  -----------------------------------------------
  */

  return {
    settings,

    loading,

    saving,

    error,

    success,

    hasChanges,

    toggleSetting,

    updateSetting,

    resetSettings,

    saveSettings,

    reloadSettings: loadSettings,
  };
};

export default useNotificationSettings;