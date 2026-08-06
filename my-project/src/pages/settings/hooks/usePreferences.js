import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  getPreferences,
  updatePreferences,
  resetPreferences as resetPreferencesRequest,
} from "../services/preferencesService";

const DEFAULT_PREFERENCES = {
  currency: "NGN",
  language: "en",
  timezone: "Africa/Lagos",
  density: "comfortable",
};

const STORAGE_KEY = "smartbudget_preferences";

export const usePreferences = () => {
  /*
  =====================================
  STATE
  =====================================
  */

  const [preferences, setPreferences] = useState(
    DEFAULT_PREFERENCES
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
  =====================================
  HELPERS
  =====================================
  */

  const clearStatus = useCallback(() => {
    setMessage("");
    setError("");
  }, []);

  const saveLocal = useCallback((data) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }, []);

  const loadLocal = useCallback(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return DEFAULT_PREFERENCES;
      }

      return JSON.parse(stored);
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }, []);

  /*
  =====================================
  LOAD PREFERENCES
  =====================================
  */

  const fetchPreferences =
    useCallback(async () => {
      try {
        setLoading(true);
        clearStatus();

        const response =
          await getPreferences();

        const data =
          response?.preferences ??
          DEFAULT_PREFERENCES;

        setPreferences(data);

        saveLocal(data);
      } catch (err) {
        console.error(err);

        const cached = loadLocal();

        setPreferences(cached);

        setError(
          "Unable to load preferences. Using saved settings."
        );
      } finally {
        setLoading(false);
      }
    }, [
      clearStatus,
      loadLocal,
      saveLocal,
    ]);

  /*
  =====================================
  INITIAL LOAD
  =====================================
  */

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  /*
  =====================================
  UPDATE SINGLE FIELD
  =====================================
  */

  const updatePreference =
    useCallback((key, value) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          [key]: value,
        };

        saveLocal(updated);

        return updated;
      });
    }, [saveLocal]);

  /*
  =====================================
  UPDATE MULTIPLE
  =====================================
  */

  const updateMany =
    useCallback((updates) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          ...updates,
        };

        saveLocal(updated);

        return updated;
      });
    }, [saveLocal]);

  /*
  =====================================
  SAVE TO SERVER
  =====================================
  */

  const savePreferences =
    useCallback(async () => {
      try {
        setSaving(true);
        clearStatus();

        const response =
          await updatePreferences(
            preferences
          );

        const data =
          response?.preferences ??
          preferences;

        setPreferences(data);

        saveLocal(data);

        setMessage(
          "Preferences updated successfully."
        );

        return {
          success: true,
        };
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Unable to save preferences."
        );

        return {
          success: false,
        };
      } finally {
        setSaving(false);
      }
    }, [
      preferences,
      clearStatus,
      saveLocal,
    ]);

  /*
  =====================================
  RESET
  =====================================
  */

  const resetPreferences =
    useCallback(async () => {
      try {
        setSaving(true);
        clearStatus();

        const response =
          await resetPreferencesRequest();

        const data =
          response?.preferences ??
          DEFAULT_PREFERENCES;

        setPreferences(data);

        saveLocal(data);

        setMessage(
          "Preferences restored successfully."
        );

        return {
          success: true,
        };
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Unable to reset preferences."
        );

        return {
          success: false,
        };
      } finally {
        setSaving(false);
      }
    }, [
      clearStatus,
      saveLocal,
    ]);

  /*
  =====================================
  AUTO CLEAR MESSAGE
  =====================================
  */

  useEffect(() => {
    if (!message && !error) {
      return;
    }

    const timer = setTimeout(() => {
      clearStatus();
    }, 4000);

    return () => clearTimeout(timer);
  }, [
    message,
    error,
    clearStatus,
  ]);

  /*
  =====================================
  EXPORT
  =====================================
  */

  return {
    preferences,

    loading,

    saving,

    message,

    error,

    fetchPreferences,

    updatePreference,

    updateMany,

    savePreferences,

    resetPreferences,
  };
};