import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getPreferencesRequest,
  updatePreferencesRequest,
  resetPreferencesRequest,
  getPreferenceError,
} from "../../../services/preferencesService";

/*
|--------------------------------------------------------------------------
| DEFAULT PREFERENCES
|--------------------------------------------------------------------------
|
| Keep this structure synchronized with the backend Preference model.
|
*/

export const DEFAULT_PREFERENCES = Object.freeze({
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
});

/*
|--------------------------------------------------------------------------
| LOCAL STORAGE
|--------------------------------------------------------------------------
*/

const STORAGE_KEY = "smartbudget_preferences";

/*
|--------------------------------------------------------------------------
| UTILITY FUNCTIONS
|--------------------------------------------------------------------------
*/

/**
 * Create a fresh default preferences object.
 *
 * We avoid returning DEFAULT_PREFERENCES directly because
 * nested objects should never be mutated by React state.
 */
const createDefaultPreferences = () => ({
  regional: {
    ...DEFAULT_PREFERENCES.regional,
  },

  display: {
    ...DEFAULT_PREFERENCES.display,
  },

  privacy: {
    ...DEFAULT_PREFERENCES.privacy,
  },
});

/**
 * Check whether a value is a plain object.
 */
const isObject = (value) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};

/**
 * Deep clone preferences.
 */
const clonePreferences = (value) => {
  if (!isObject(value)) {
    return createDefaultPreferences();
  }

  return {
    regional: {
      ...value.regional,
    },

    display: {
      ...value.display,
    },

    privacy: {
      ...value.privacy,
    },
  };
};

/**
 * Normalize preferences coming from the API or localStorage.
 *
 * This performs a DEEP merge so that a partial API response
 * does not accidentally remove an entire preference section.
 */
const normalizePreferences = (value = {}) => {
  if (!isObject(value)) {
    return createDefaultPreferences();
  }

  return {
    regional: {
      ...DEFAULT_PREFERENCES.regional,
      ...(isObject(value.regional)
        ? value.regional
        : {}),
    },

    display: {
      ...DEFAULT_PREFERENCES.display,
      ...(isObject(value.display)
        ? value.display
        : {}),
    },

    privacy: {
      ...DEFAULT_PREFERENCES.privacy,
      ...(isObject(value.privacy)
        ? value.privacy
        : {}),
    },
  };
};

/**
 * Extract preferences from the backend response.
 *
 * The preferred production response is:
 *
 * {
 *   success: true,
 *   preferences: {...}
 * }
 *
 * Your current controller returns:
 *
 * {
 *   success: true,
 *   settings: {...}
 * }
 *
 * We temporarily support BOTH so the frontend does not break
 * while the backend response naming is being standardized.
 */
const extractPreferences = (response) => {
  if (!response) {
    return null;
  }

  if (isObject(response.preferences)) {
    return response.preferences;
  }

  if (isObject(response.settings)) {
    return response.settings;
  }

  if (
    isObject(response.data) &&
    isObject(response.data.preferences)
  ) {
    return response.data.preferences;
  }

  if (
    isObject(response.data) &&
    isObject(response.data.settings)
  ) {
    return response.data.settings;
  }

  return null;
};

/**
 * Compare two preference objects.
 */
const arePreferencesEqual = (
  first,
  second
) => {
  return (
    JSON.stringify(first) ===
    JSON.stringify(second)
  );
};

/*
|--------------------------------------------------------------------------
| LOCAL STORAGE HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Save preferences to localStorage.
 *
 * localStorage is only a cache/fallback.
 * The backend remains the source of truth.
 */
const saveLocalPreferences = (
  preferences
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalizePreferences(preferences)
      )
    );

    return true;
  } catch (error) {
    console.warn(
      "PREFERENCES_LOCAL_SAVE_ERROR:",
      error
    );

    return false;
  }
};

/**
 * Load preferences from localStorage.
 */
const loadLocalPreferences = () => {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return createDefaultPreferences();
    }

    const parsed = JSON.parse(stored);

    return normalizePreferences(parsed);
  } catch (error) {
    console.warn(
      "PREFERENCES_LOCAL_LOAD_ERROR:",
      error
    );

    return createDefaultPreferences();
  }
};

/**
 * Remove the local preference cache.
 */
const clearLocalPreferences = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn(
      "PREFERENCES_LOCAL_CLEAR_ERROR:",
      error
    );
  }
};

/*
|--------------------------------------------------------------------------
| HOOK
|--------------------------------------------------------------------------
*/

const usePreferences = () => {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  /**
   * Current editable preference state.
   */
  const [preferences, setPreferences] =
    useState(
      createDefaultPreferences()
    );

  /**
   * Last successfully persisted state.
   *
   * Used for:
   * - isDirty
   * - discardChanges
   * - rollback
   */
  const [savedPreferences, setSavedPreferences] =
    useState(
      createDefaultPreferences()
    );

  /**
   * Initial/fetch loading state.
   */
  const [loading, setLoading] =
    useState(true);

  /**
   * Save request state.
   */
  const [saving, setSaving] =
    useState(false);

  /**
   * Reset request state.
   */
  const [resetting, setResetting] =
    useState(false);

  /**
   * User-facing success message.
   */
  const [message, setMessage] =
    useState("");

  /**
   * User-facing error message.
   */
  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | REFS
  |--------------------------------------------------------------------------
  */

  /**
   * Prevent state updates after unmount.
   */
  const isMountedRef =
    useRef(true);

  /**
   * Prevent duplicate save requests.
   */
  const saveRequestRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | LIFECYCLE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const clearStatus = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    setMessage("");
    setError("");
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FETCH PREFERENCES
  |--------------------------------------------------------------------------
  */

  const fetchPreferences =
    useCallback(
      async ({
        useCacheOnError = true,
        silent = false,
      } = {}) => {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        try {
          const response =
            await getPreferencesRequest();

          const serverPreferences =
            extractPreferences(response);

          const normalized =
            normalizePreferences(
              serverPreferences
            );

          if (isMountedRef.current) {
            setPreferences(normalized);

            setSavedPreferences(
              clonePreferences(normalized)
            );

            setError("");
          }

          /*
          | Cache only successfully fetched
          | server preferences.
          */
          saveLocalPreferences(
            normalized
          );

          return {
            success: true,
            preferences: normalized,
          };
        } catch (requestError) {
          console.error(
            "FETCH_PREFERENCES_ERROR:",
            requestError
          );

          const cached =
            loadLocalPreferences();

          if (
            useCacheOnError &&
            isMountedRef.current
          ) {
            setPreferences(cached);

            setSavedPreferences(
              clonePreferences(cached)
            );
          }

          const errorMessage =
            getPreferenceError(
              requestError,
              "Unable to load preferences. Using saved settings."
            );

          if (isMountedRef.current) {
            setError(errorMessage);
          }

          return {
            success: false,
            preferences: useCacheOnError
              ? cached
              : createDefaultPreferences(),
            error: requestError,
          };
        } finally {
          if (
            !silent &&
            isMountedRef.current
          ) {
            setLoading(false);
          }
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE SINGLE PREFERENCE
  |--------------------------------------------------------------------------
  |
  | Supports BOTH:
  |
  | updatePreference(
  |   "regional.currency",
  |   "USD"
  | );
  |
  | AND:
  |
  | updatePreference(
  |   "regional",
  |   "currency",
  |   "USD"
  | );
  |
  */

  const updatePreference =
    useCallback(
      (
        sectionOrPath,
        keyOrValue,
        possibleValue
      ) => {
        let section;
        let key;
        let value;

        /*
        | Dotted path:
        |
        | updatePreference(
        |   "regional.currency",
        |   "USD"
        | );
        */
        if (
          typeof sectionOrPath ===
            "string" &&
          sectionOrPath.includes(".")
        ) {
          [
            section,
            key,
          ] = sectionOrPath.split(".");

          value = keyOrValue;
        }

        /*
        | Section/key/value:
        |
        | updatePreference(
        |   "regional",
        |   "currency",
        |   "USD"
        | );
        */
        else {
          section =
            sectionOrPath;

          key =
            keyOrValue;

          value =
            possibleValue;
        }

        if (
          !section ||
          !key
        ) {
          console.warn(
            "UPDATE_PREFERENCE_WARNING: Section and key are required."
          );

          return;
        }

        if (
          !Object.prototype.hasOwnProperty.call(
            DEFAULT_PREFERENCES,
            section
          )
        ) {
          console.warn(
            `UPDATE_PREFERENCE_WARNING: Unknown preference section "${section}".`
          );

          return;
        }

        if (
          !Object.prototype.hasOwnProperty.call(
            DEFAULT_PREFERENCES[section],
            key
          )
        ) {
          console.warn(
            `UPDATE_PREFERENCE_WARNING: Unknown preference key "${section}.${key}".`
          );

          return;
        }

        setPreferences(
          (previous) => ({
            ...previous,

            [section]: {
              ...previous[section],
              [key]: value,
            },
          })
        );

        clearStatus();
      },
      [clearStatus]
    );

  /*
  |--------------------------------------------------------------------------
  | UPDATE MULTIPLE PREFERENCES
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | updateMany({
  |   regional: {
  |     currency: "USD",
  |     language: "en"
  |   },
  |
  |   display: {
  |     compactMode: true
  |   }
  | });
  |
  */

  const updateMany =
    useCallback(
      (updates = {}) => {
        if (!isObject(updates)) {
          console.warn(
            "UPDATE_MANY_PREFERENCES_WARNING: Updates must be an object."
          );

          return;
        }

        setPreferences(
          (previous) =>
            normalizePreferences({
              ...previous,

              regional: {
                ...previous.regional,
                ...(isObject(updates.regional)
                  ? updates.regional
                  : {}),
              },

              display: {
                ...previous.display,
                ...(isObject(updates.display)
                  ? updates.display
                  : {}),
              },

              privacy: {
                ...previous.privacy,
                ...(isObject(updates.privacy)
                  ? updates.privacy
                  : {}),
              },
            })
        );

        clearStatus();
      },
      [clearStatus]
    );

  /*
  |--------------------------------------------------------------------------
  | DISCARD UNSAVED CHANGES
  |--------------------------------------------------------------------------
  */

  const discardChanges =
    useCallback(() => {
      if (!isMountedRef.current) {
        return;
      }

      setPreferences(
        clonePreferences(
          savedPreferences
        )
      );

      clearStatus();
    }, [
      savedPreferences,
      clearStatus,
    ]);

  /*
  |--------------------------------------------------------------------------
  | SAVE PREFERENCES
  |--------------------------------------------------------------------------
  */

  const savePreferences =
    useCallback(async () => {
      /*
      | Prevent duplicate PUT requests.
      */
      if (saveRequestRef.current) {
        return saveRequestRef.current;
      }

      if (isMountedRef.current) {
        setSaving(true);
        setError("");
        setMessage("");
      }

      const payload =
        normalizePreferences(
          preferences
        );

      const request =
        updatePreferencesRequest(
          payload
        )
          .then((response) => {
            /*
            | Backend should eventually return:
            |
            | {
            |   success: true,
            |   preferences: {...}
            | }
            |
            | We also support the current
            | `settings` response temporarily.
            */
            const serverPreferences =
              extractPreferences(
                response
              );

            const normalized =
              serverPreferences
                ? normalizePreferences(
                    serverPreferences
                  )
                : payload;

            if (
              isMountedRef.current
            ) {
              setPreferences(
                normalized
              );

              setSavedPreferences(
                clonePreferences(
                  normalized
                )
              );

              setMessage(
                "Preferences updated successfully."
              );

              setError("");
            }

            /*
            | Cache only after successful
            | server persistence.
            */
            saveLocalPreferences(
              normalized
            );

            return {
              success: true,
              preferences: normalized,
            };
          })
          .catch((requestError) => {
            console.error(
              "SAVE_PREFERENCES_ERROR:",
              requestError
            );

            const errorMessage =
              getPreferenceError(
                requestError,
                "Unable to save preferences."
              );

            if (
              isMountedRef.current
            ) {
              setError(
                errorMessage
              );

              setMessage("");
            }

            return {
              success: false,
              error: requestError,
            };
          })
          .finally(() => {
            saveRequestRef.current =
              null;

            if (
              isMountedRef.current
            ) {
              setSaving(false);
            }
          });

      saveRequestRef.current =
        request;

      return request;
    }, [preferences]);

  /*
  |--------------------------------------------------------------------------
  | RESET PREFERENCES
  |--------------------------------------------------------------------------
  */

  const resetPreferences =
    useCallback(async () => {
      if (resetting) {
        return {
          success: false,
        };
      }

      if (isMountedRef.current) {
        setResetting(true);
        setError("");
        setMessage("");
      }

      try {
        const response =
          await resetPreferencesRequest();

        const serverPreferences =
          extractPreferences(
            response
          );

        const normalized =
          normalizePreferences(
            serverPreferences
          );

        if (
          isMountedRef.current
        ) {
          setPreferences(
            normalized
          );

          setSavedPreferences(
            clonePreferences(
              normalized
            )
          );

          setMessage(
            "Preferences restored successfully."
          );

          setError("");
        }

        /*
        | Replace cache with the newly
        | confirmed server state.
        */
        saveLocalPreferences(
          normalized
        );

        return {
          success: true,
          preferences: normalized,
        };
      } catch (requestError) {
        console.error(
          "RESET_PREFERENCES_ERROR:",
          requestError
        );

        const errorMessage =
          getPreferenceError(
            requestError,
            "Unable to reset preferences."
          );

        if (
          isMountedRef.current
        ) {
          setError(
            errorMessage
          );

          setMessage("");
        }

        return {
          success: false,
          error: requestError,
        };
      } finally {
        if (
          isMountedRef.current
        ) {
          setResetting(false);
        }
      }
    }, [resetting]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH FROM SERVER
  |--------------------------------------------------------------------------
  */

  const refreshPreferences =
    useCallback(async () => {
      clearStatus();

      return fetchPreferences({
        useCacheOnError: false,
      });
    }, [
      clearStatus,
      fetchPreferences,
    ]);

  /*
  |--------------------------------------------------------------------------
  | CLEAR CACHE
  |--------------------------------------------------------------------------
  */

  const clearCache =
    useCallback(() => {
      clearLocalPreferences();
    }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTO-CLEAR STATUS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!message && !error) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (
        isMountedRef.current
      ) {
        setMessage("");
        setError("");
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [message, error]);

  /*
  |--------------------------------------------------------------------------
  | DERIVED STATE
  |--------------------------------------------------------------------------
  */

  const isDirty =
    !arePreferencesEqual(
      preferences,
      savedPreferences
    );

  const hasError =
    Boolean(error);

  const hasMessage =
    Boolean(message);

  /*
  |--------------------------------------------------------------------------
  | RETURN API
  |--------------------------------------------------------------------------
  */

  return {
    /*
    |----------------------------------------------------------------------
    | Preferences
    |----------------------------------------------------------------------
    */

    preferences,

    savedPreferences,

    /*
    |----------------------------------------------------------------------
    | State
    |----------------------------------------------------------------------
    */

    loading,

    saving,

    resetting,

    isDirty,

    message,

    error,

    hasError,

    hasMessage,

    /*
    |----------------------------------------------------------------------
    | Actions
    |----------------------------------------------------------------------
    */

    fetchPreferences,

    refreshPreferences,

    updatePreference,

    updateMany,

    savePreferences,

    discardChanges,

    resetPreferences,

    clearStatus,

    clearCache,
  };
};

export default usePreferences;