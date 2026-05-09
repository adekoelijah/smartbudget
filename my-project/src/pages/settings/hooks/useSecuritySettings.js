import { useState } from "react";

const defaultSecurity = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFA: false,
};

/**
 * Safe localStorage loader (runs once during init)
 */
const loadSecurity = () => {
  try {
    const stored = localStorage.getItem("user_security");
    return stored ? JSON.parse(stored) : defaultSecurity;
  } catch {
    return defaultSecurity;
  }
};

/**
 * SaaS-grade Security Hook
 * - no effect-based hydration needed
 * - avoids cascading renders
 */
export const useSecuritySettings = () => {
  const [security, setSecurity] = useState(() => loadSecurity());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Generic field update
   */
  const updateField = (key, value) => {
    setSecurity((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Toggle 2FA
   */
  const toggle2FA = () => {
    setSecurity((prev) => ({
      ...prev,
      twoFA: !prev.twoFA,
    }));
  };

  /**
   * Validation layer
   */
  const validatePasswordChange = () => {
    if (!security.currentPassword) return "Current password is required";
    if (!security.newPassword) return "New password is required";
    if (security.newPassword.length < 6)
      return "Password must be at least 6 characters";
    if (security.newPassword !== security.confirmPassword)
      return "Passwords do not match";

    return null;
  };

  /**
   * Change password (API-ready)
   */
  const changePassword = async () => {
    setMessage("");
    setError("");

    const validationError = validatePasswordChange();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await new Promise((res) => setTimeout(res, 1000));

      setSecurity((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setMessage("Password updated successfully");
    } catch {
      setError("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save 2FA state
   */
  const save2FA = async () => {
    try {
      setLoading(true);

      await new Promise((res) => setTimeout(res, 600));

      localStorage.setItem(
        "user_security",
        JSON.stringify({
          ...security,
          twoFA: security.twoFA,
        })
      );

      setMessage(
        security.twoFA
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled"
      );
    } catch {
      setError("Failed to update 2FA settings");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout all devices (SaaS auth control)
   */
  const logoutAllDevices = async () => {
    try {
      setLoading(true);

      await new Promise((res) => setTimeout(res, 900));

      setMessage("Logged out from all devices");
    } catch {
      setError("Failed to logout sessions");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset security
   */
  const resetSecurity = () => {
    setSecurity(defaultSecurity);
    localStorage.removeItem("user_security");
  };

  return {
    security,
    loading,
    message,
    error,
    updateField,
    toggle2FA,
    changePassword,
    save2FA,
    logoutAllDevices,
    resetSecurity,
  };
};