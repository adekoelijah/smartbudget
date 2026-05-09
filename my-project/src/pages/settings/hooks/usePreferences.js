import { useState } from "react";

const defaultPrefs = {
  currency: "NGN",
  language: "en",
  timezone: "Africa/Lagos",
  density: "comfortable",
};

/**
 * Safe loader (runs once only via useState lazy init)
 */
const loadPrefs = () => {
  try {
    const stored = localStorage.getItem("user_preferences");
    return stored ? JSON.parse(stored) : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
};

/**
 * SaaS-style Preferences Hook
 * - no useEffect
 * - no render loops
 * - instant persistence
 */
export const usePreferences = () => {
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /**
   * Update single field (Stripe-style immutable update)
   */
  const updatePref = (key, value) => {
    setPrefs((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      // 💾 persist immediately (no effect needed)
      localStorage.setItem(
        "user_preferences",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  /**
   * Bulk update (useful for forms / reset / API sync)
   */
  const updateMany = (updates) => {
    setPrefs((prev) => {
      const updated = {
        ...prev,
        ...updates,
      };

      localStorage.setItem(
        "user_preferences",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  /**
   * Save (API-ready placeholder for backend sync)
   */
  const savePreferences = async () => {
    setMessage("");

    try {
      setLoading(true);

      // simulate backend request (Stripe-style persistence layer)
      await new Promise((res) => setTimeout(res, 700));

      // future:
      // await api.post("/user/preferences", prefs)

      setMessage("Preferences saved successfully");
    } catch (err) {
      setMessage("Failed to save preferences");
      console.error("Preferences save error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset to defaults (SaaS restore pattern)
   */
  const resetPreferences = () => {
    setPrefs(defaultPrefs);
    localStorage.setItem(
      "user_preferences",
      JSON.stringify(defaultPrefs)
    );
  };

  return {
    prefs,
    loading,
    message,
    updatePref,
    updateMany,
    savePreferences,
    resetPreferences,
  };
};