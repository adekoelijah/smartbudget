
import api from "./api";

/*
==================================================
PREFERENCE API ENDPOINTS
==================================================
*/

const PREFERENCE_ENDPOINTS = {
  preferences: "/preferences",
  reset: "/preferences/reset",
};

/*
==================================================
GET USER PREFERENCES
==================================================
*/
export const getPreferencesRequest = async () => {
  const response = await api.get(
    PREFERENCE_ENDPOINTS.preferences
  );

  return response.data;
};

/*
==================================================
UPDATE USER PREFERENCES
==================================================
*/
export const updatePreferencesRequest = async (
  preferences
) => {
  const response = await api.put(
    PREFERENCE_ENDPOINTS.preferences,
    preferences
  );

  return response.data;
};

/*
==================================================
RESET USER PREFERENCES
==================================================
*/
export const resetPreferencesRequest = async () => {
  const response = await api.post(
    PREFERENCE_ENDPOINTS.reset
  );

  return response.data;
};

/*
==================================================
UPDATE SINGLE PREFERENCE
==================================================
*/
export const updatePreferenceRequest = async (
  key,
  value
) => {
  if (!key) {
    throw new Error("Preference key is required.");
  }

  const response = await api.patch(
    PREFERENCE_ENDPOINTS.preferences,
    {
      [key]: value,
    }
  );

  return response.data;
};

/*
==================================================
PREFERENCE ERROR NORMALIZER
==================================================
*/
export const getPreferenceError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to update preferences."
  );
};

