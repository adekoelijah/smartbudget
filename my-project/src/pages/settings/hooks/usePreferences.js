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

const DEFAULT_PREFERENCES = {
  currency: "NGN",
  language: "en",
  timezone: "Africa/Lagos",
  density: "comfortable",
};


const STORAGE_KEY = "smartbudget_preferences";


const usePreferences = () => {

  const [preferences, setPreferences] =
    useState(DEFAULT_PREFERENCES);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  const clearStatus = useCallback(() => {
    setMessage("");
    setError("");
  }, []);


  const saveLocal = useCallback((data) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (storageError) {
      console.warn(
        "Unable to save preferences locally:",
        storageError
      );
    }
  }, []);


  const loadLocal = useCallback(() => {

    try {

      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return DEFAULT_PREFERENCES;
      }

      return {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(stored),
      };

    } catch {

      return DEFAULT_PREFERENCES;

    }

  }, []);


  const fetchPreferences =
    useCallback(async () => {

      try {

        setLoading(true);
        clearStatus();

        const response =
          await getPreferencesRequest();

        const data =
          response?.preferences ??
          response?.data?.preferences ??
          DEFAULT_PREFERENCES;

        setPreferences(data);

        saveLocal(data);

      } catch (err) {

        console.error(
          "FETCH_PREFERENCES_ERROR:",
          err
        );

        const cached =
          loadLocal();

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


  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);


  const updatePreference =
    useCallback((key, value) => {

      setPreferences((previous) => {

        const updated = {
          ...previous,
          [key]: value,
        };

        saveLocal(updated);

        return updated;

      });

    }, [saveLocal]);


  const updateMany =
    useCallback((updates) => {

      setPreferences((previous) => {

        const updated = {
          ...previous,
          ...updates,
        };

        saveLocal(updated);

        return updated;

      });

    }, [saveLocal]);


  const savePreferences =
    useCallback(async () => {

      try {

        setSaving(true);
        clearStatus();

        const response =
          await updatePreferencesRequest(
            preferences
          );

        const data =
          response?.preferences ??
          response?.data?.preferences ??
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
      clearStatus,
      saveLocal,
    ]);


  const resetPreferences =
    useCallback(async () => {

      try {

        setSaving(true);
        clearStatus();

        const response =
          await resetPreferencesRequest();

        const data =
          response?.preferences ??
          response?.data?.preferences ??
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

    }, [
      clearStatus,
      saveLocal,
    ]);


  useEffect(() => {

    if (!message && !error) {
      return undefined;
    }

    const timer =
      setTimeout(() => {
        clearStatus();
      }, 4000);

    return () => clearTimeout(timer);

  }, [
    message,
    error,
    clearStatus,
  ]);


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