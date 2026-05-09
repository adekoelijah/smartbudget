import { useState } from "react";

/**
 * Default profile shape (source of truth)
 */
const defaultProfile = {
  name: "",
  email: "",
  avatar: "",
};

/**
 * Safe loader (runs once via lazy init)
 */
const loadProfile = () => {
  try {
    const stored = localStorage.getItem("user_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

/**
 * SaaS Profile Hook (Stripe-style architecture)
 */
export const useProfileSettings = () => {
  // ✅ FIX: lazy initialization replaces useEffect
  const [profile, setProfile] = useState(() => loadProfile());
  const [preview, setPreview] = useState(() => {
    const stored = loadProfile();
    return stored.avatar || "";
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /**
   * Update single field (immutable update pattern)
   */
  const updateField = (key, value) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      // 💾 persist immediately (no effects needed)
      localStorage.setItem("user_profile", JSON.stringify(updated));

      return updated;
    });
  };

  /**
   * Avatar handler (SaaS abstraction)
   */
  const setAvatar = (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);

    setPreview(url);

    setProfile((prev) => {
      const updated = {
        ...prev,
        avatar: url,
      };

      localStorage.setItem("user_profile", JSON.stringify(updated));

      return updated;
    });
  };

  /**
   * Validation layer (light SaaS guard)
   */
  const validate = () => {
    if (!profile.name?.trim()) return "Name is required";
    if (!profile.email?.includes("@")) return "Invalid email";
    return null;
  };

  /**
   * Save profile (API-ready)
   */
  const saveProfile = async () => {
    setMessage("");

    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    try {
      setLoading(true);

      // simulate API request (replace later with backend)
      await new Promise((res) => setTimeout(res, 900));

      localStorage.setItem("user_profile", JSON.stringify(profile));

      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage("Failed to update profile");
      console.error("Profile save error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset profile (restore SaaS defaults)
   */
  const resetProfile = () => {
    setProfile(defaultProfile);
    setPreview("");

    localStorage.removeItem("user_profile");
  };

  return {
    profile,
    preview,
    loading,
    message,
    updateField,
    setAvatar,
    saveProfile,
    resetProfile,
  };
};