import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  getPreferencesRequest,
  updatePreferencesRequest,
  resetPreferencesRequest,
} from "../../../services/preferencesService";

/*
============================================================
DEFAULT PREFERENCES
============================================================
*/

const DEFAULT_PREFERENCES = {
  currency: "NGN",
  language: "en",
  timezone: "Africa/Lagos",
  density: "comfortable",
};

const STORAGE_KEY = "smartbudget_preferences";

/*
============================================================
NORMALIZE PREFERENCES
============================================================
*/

const normalizePreferences = (value = {}) => {
  if (!value || typeof value !== "object") {
    return {
      ...DEFAULT_PREFERENCES,
    };
  }

  return {
    ...DEFAULT_PREFERENCES,
    ...value,
  };
};

/*
============================================================
HOOK
============================================================
*/

const usePreferences = () => {
  const [preferences, setPreferences] = useState(
    DEFAULT_PREFERENCES
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /*
  ============================================================
  CLEAR STATUS
  ============================================================
  */

  const clearStatus = useCallback(() => {
    setMessage("");
    setError("");
  }, []);

  /*
  ============================================================
  SAVE LOCAL CACHE
  ============================================================
  */

  const saveLocal = useCallback((data) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          normalizePreferences(data)
        )
      );
    } catch (storageError) {
      console.warn(
        "PREFERENCES_LOCAL_SAVE_ERROR:",
        storageError
      );
    }
  }, []);

  /*
  ============================================================
  LOAD LOCAL CACHE
  ============================================================
  */

  const loadLocal = useCallback(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return {
          ...DEFAULT_PREFERENCES,
        };
      }

      return normalizePreferences(
        JSON.parse(stored)
      );
    } catch (error) {
      console.warn(
        "PREFERENCES_LOCAL_LOAD_ERROR:",
        error
      );

      return {
        ...DEFAULT_PREFERENCES,
      };
    }
  }, []);

  /*
  ============================================================
  FETCH PREFERENCES
  ============================================================
  */

  const fetchPreferences =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getPreferencesRequest();

        const data =
          response?.preferences ??
          response?.data?.preferences ??
          response?.data ??
          DEFAULT_PREFERENCES;

        const normalized =
          normalizePreferences(data);

        setPreferences(normalized);

        saveLocal(normalized);

        return {
          success: true,
          preferences: normalized,
        };
      } catch (err) {
        console.error(
          "FETCH_PREFERENCES_ERROR:",
          err
        );

        /*
        --------------------------------------------------------
        FALLBACK TO LOCAL CACHE
        --------------------------------------------------------
        */

        const cached = loadLocal();

        setPreferences(cached);

        setError(
          err?.response?.status === 404
            ? "Preferences service is unavailable."
            : "Unable to load preferences. Using saved settings."
        );

        return {
          success: false,
          preferences: cached,
        };
      } finally {
        setLoading(false);
      }
    }, [
      loadLocal,
      saveLocal,
    ]);

  /*
  ============================================================
  INITIAL LOAD
  ============================================================
  */

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  /*
  ============================================================
  UPDATE ONE PREFERENCE
  ============================================================
  */

  const updatePreference =
    useCallback(
      (key, value) => {
        setPreferences((previous) => {
          const updated = {
            ...previous,
            [key]: value,
          };

          saveLocal(updated);

          return updated;
        });

        setMessage("");
        setError("");
      },
      [saveLocal]
    );

  /*
  ============================================================
  UPDATE MULTIPLE PREFERENCES
  ============================================================
  */

  const updateMany =
    useCallback(
      (updates = {}) => {
        setPreferences((previous) => {
          const updated = {
            ...previous,
            ...updates,
          };

          saveLocal(updated);

          return updated;
        });

        setMessage("");
        setError("");
      },
      [saveLocal]
    );

  /*
  ============================================================
  SAVE PREFERENCES
  ============================================================
  */

  const savePreferences =
    useCallback(async () => {
      try {
        setSaving(true);
        setError("");
        setMessage("");

        const payload =
          normalizePreferences(
            preferences
          );

        const response =
          await updatePreferencesRequest(
            payload
          );

        const data =
          response?.preferences ??
          response?.data?.preferences ??
          response?.data ??
          payload;

        const normalized =
          normalizePreferences(data);

        setPreferences(normalized);

        saveLocal(normalized);

        setMessage(
          "Preferences updated successfully."
        );

        return {
          success: true,
          preferences: normalized,
        };
      } catch (err) {
        console.error(
          "SAVE_PREFERENCES_ERROR:",
          err
        );

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
      saveLocal,
    ]);

  /*
  ============================================================
  RESET PREFERENCES
  ============================================================
  */

  const resetPreferences =
    useCallback(async () => {
      try {
        setSaving(true);
        setError("");
        setMessage("");

        const response =
          await resetPreferencesRequest();

        const data =
          response?.preferences ??
          response?.data?.preferences ??
          response?.data ??
          DEFAULT_PREFERENCES;

        const normalized =
          normalizePreferences(data);

        setPreferences(normalized);

        saveLocal(normalized);

        setMessage(
          "Preferences restored successfully."
        );

        return {
          success: true,
          preferences: normalized,
        };
      } catch (err) {
        console.error(
          "RESET_PREFERENCES_ERROR:",
          err
        );

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
    }, [saveLocal]);

  /*
  ============================================================
  AUTO CLEAR STATUS
  ============================================================
  */

  useEffect(() => {
    if (!message && !error) {
      return undefined;
    }

    const timer = setTimeout(() => {
      clearStatus();
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    message,
    error,
    clearStatus,
  ]);

  /*
  ============================================================
  RETURN API
  ============================================================
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

export default usePreferences;