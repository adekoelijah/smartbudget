import api from "./api";

/*
|--------------------------------------------------------------------------
| PREFERENCE API ENDPOINTS
|--------------------------------------------------------------------------
*/

const PREFERENCE_ENDPOINTS = Object.freeze({
  preferences: "/preferences",
  reset: "/preferences/reset",
});

/*
|--------------------------------------------------------------------------
| RESPONSE HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Extract preferences from a standardized API response.
 *
 * Expected backend response:
 *
 * {
 *   success: true,
 *   preferences: {...}
 * }
 */
const extractPreferences = (response) => {
  return response?.preferences ?? null;
};

/**
 * Validate that a preference payload is an object.
 */
const validatePreferencesPayload = (preferences) => {
  if (
    !preferences ||
    typeof preferences !== "object" ||
    Array.isArray(preferences)
  ) {
    throw new Error(
      "A valid preferences object is required."
    );
  }
};

/**
 * Validate a dotted preference key.
 *
 * Examples:
 *
 * regional.currency
 * regional.language
 * display.compactMode
 * privacy.analytics
 */
const validatePreferenceKey = (key) => {
  if (
    typeof key !== "string" ||
    !key.trim()
  ) {
    throw new Error(
      "Preference key is required."
    );
  }

  if (!key.includes(".")) {
    throw new Error(
      "Preference key must use section.field format."
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET USER PREFERENCES
|--------------------------------------------------------------------------
*/

export const getPreferencesRequest = async () => {
  const response = await api.get(
    PREFERENCE_ENDPOINTS.preferences
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE ALL USER PREFERENCES
|--------------------------------------------------------------------------
|
| PUT /preferences
|
| Expected payload:
|
| {
|   regional: {...},
|   display: {...},
|   privacy: {...}
| }
|
*/

export const updatePreferencesRequest = async (
  preferences
) => {
  validatePreferencesPayload(preferences);

  const response = await api.put(
    PREFERENCE_ENDPOINTS.preferences,
    preferences
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| RESET USER PREFERENCES
|--------------------------------------------------------------------------
|
| POST /preferences/reset
|
*/

export const resetPreferencesRequest = async () => {
  const response = await api.post(
    PREFERENCE_ENDPOINTS.reset
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE SINGLE PREFERENCE
|--------------------------------------------------------------------------
|
| PATCH /preferences
|
| Examples:
|
| updatePreferenceRequest(
|   "regional.currency",
|   "USD"
| );
|
| updatePreferenceRequest(
|   "display.compactMode",
|   true
| );
|
| updatePreferenceRequest(
|   "privacy.analytics",
|   false
| );
|
*/

export const updatePreferenceRequest = async (
  key,
  value
) => {
  validatePreferenceKey(key);

  const response = await api.patch(
    PREFERENCE_ENDPOINTS.preferences,
    {
      [key]: value,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET PREFERENCES ONLY
|--------------------------------------------------------------------------
|
| Convenience helper.
|
| Instead of:
|
| const response = await getPreferencesRequest();
| const preferences = response.preferences;
|
| You can use:
|
| const preferences = await getPreferences();
|
*/

export const getPreferences = async () => {
  const response =
    await getPreferencesRequest();

  return extractPreferences(response);
};

/*
|--------------------------------------------------------------------------
| UPDATE PREFERENCES ONLY
|--------------------------------------------------------------------------
*/

export const updatePreferences = async (
  preferences
) => {
  const response =
    await updatePreferencesRequest(
      preferences
    );

  return extractPreferences(response);
};

/*
|--------------------------------------------------------------------------
| RESET PREFERENCES ONLY
|--------------------------------------------------------------------------
*/

export const resetPreferences = async () => {
  const response =
    await resetPreferencesRequest();

  return extractPreferences(response);
};

/*
|--------------------------------------------------------------------------
| PREFERENCE ERROR NORMALIZER
|--------------------------------------------------------------------------
*/

export const getPreferenceError = (
  error,
  fallbackMessage = "Unable to update preferences."
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
|
| Optional service object for consumers that prefer:
|
| preferencesService.getPreferences()
|
*/

const preferencesService = {
  getPreferencesRequest,
  updatePreferencesRequest,
  resetPreferencesRequest,
  updatePreferenceRequest,

  getPreferences,
  updatePreferences,
  resetPreferences,

  getPreferenceError,
};

export default preferencesService;