import api from "../api/api";

/* =========================================
   API ENDPOINTS
========================================= */

const PREFERENCE_ENDPOINTS = {
  preferences: "/users/preferences",
};

/* =========================================
   GET USER PREFERENCES
========================================= */

export const getPreferencesRequest = async () => {
  const response = await api.get(
    PREFERENCE_ENDPOINTS.preferences
  );

  return response.data;
};

/* =========================================
   UPDATE USER PREFERENCES
========================================= */

export const updatePreferencesRequest = async (
  preferences
) => {
  const response = await api.put(
    PREFERENCE_ENDPOINTS.preferences,
    preferences
  );

  return response.data;
};

/* =========================================
   RESET USER PREFERENCES
========================================= */

export const resetPreferencesRequest = async () => {
  const response = await api.post(
    `${PREFERENCE_ENDPOINTS.preferences}/reset`
  );

  return response.data;
};

/* =========================================
   UPDATE SINGLE PREFERENCE
========================================= */

export const updatePreferenceRequest = async (
  key,
  value
) => {
  const response = await api.patch(
    PREFERENCE_ENDPOINTS.preferences,
    {
      [key]: value,
    }
  );

  return response.data;
};

/* =========================================
   ERROR NORMALIZER
========================================= */

export const getPreferenceError = (
  error
) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to update preferences."
  );
};