
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";

import SectionCard from "./components/SectionCard";
import ConfirmDialog from "./components/ConfirmDialog";

/*
============================================================
SECURITY SETTINGS
============================================================

Responsibilities:

- Display security score
- Manage password UI
- Manage 2FA UI
- Display active sessions
- Revoke individual sessions
- Logout all devices

Business logic/API calls remain in the parent/hook.
This component manages presentation and local interaction state.
============================================================
*/

const INITIAL_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const SecuritySettings = ({
  user = null,
  sessions = [],

  loading = {},
  message = "",
  error = "",

  onChangePassword,
  passwordForm = INITIAL_PASSWORD_FORM,
  updatePasswordField,

  onEnable2FA,
  onDisable2FA,
  onVerify2FA,

  twoFactorEnabled = false,
  twoFactorSecret = "",

  onRevokeSession,
  onLogoutAll,
}) => {
  /*
  ============================================================
  LOCAL UI STATE
  ============================================================
  */

  const [showPassword, setShowPassword] = useState(false);

  const [showEnable2FA, setShowEnable2FA] =
    useState(false);

  const [twoFactorCode, setTwoFactorCode] =
    useState("");

  const [localTwoFactorSecret, setLocalTwoFactorSecret] =
    useState(twoFactorSecret || "");

  const [showDisableDialog, setShowDisableDialog] =
    useState(false);

  const [showLogoutDialog, setShowLogoutDialog] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [twoFactorError, setTwoFactorError] =
    useState("");

  /*
  ============================================================
  SYNC 2FA SECRET
  ============================================================
  */

  useEffect(() => {
    if (twoFactorSecret) {
      setLocalTwoFactorSecret(twoFactorSecret);
    }
  }, [twoFactorSecret]);

  /*
  ============================================================
  SAFE VALUES
  ============================================================
  */

  const currentPassword =
    passwordForm?.currentPassword ?? "";

  const newPassword =
    passwordForm?.newPassword ?? "";

  const confirmPassword =
    passwordForm?.confirmPassword ?? "";

  const passwordLoading =
    Boolean(loading?.password);

  const twoFactorLoading =
    Boolean(loading?.twoFactor);

  const sessionLoading =
    Boolean(loading?.sessions);

  /*
  ============================================================
  SECURITY SCORE
  ============================================================
  */

  const securityScore = useMemo(
    () => calculateSecurityScore(user),
    [user]
  );

  /*
  ============================================================
  PASSWORD VALIDATION
  ============================================================
  */

  const validatePassword = () => {
    if (!currentPassword.trim()) {
      return "Enter your current password.";
    }

    if (!newPassword.trim()) {
      return "Enter a new password.";
    }

    if (newPassword.length < 8) {
      return "Your new password must contain at least 8 characters.";
    }

    if (newPassword === currentPassword) {
      return "Your new password must be different from your current password.";
    }

    if (!confirmPassword.trim()) {
      return "Confirm your new password.";
    }

    if (newPassword !== confirmPassword) {
      return "Your new passwords do not match.";
    }

    return "";
  };

  /*
  ============================================================
  PASSWORD FIELD HANDLER
  ============================================================
  */

  const handlePasswordFieldChange = (
    field,
    value
  ) => {
    setPasswordError("");

    if (
      typeof updatePasswordField !== "function"
    ) {
      return;
    }

    updatePasswordField(field, value);
  };

  /*
  ============================================================
  TOGGLE PASSWORD FORM
  ============================================================
  */

  const handleTogglePasswordForm = () => {
    if (passwordLoading) {
      return;
    }

    setPasswordError("");

    setShowPassword(
      (previous) => !previous
    );
  };

  /*
  ============================================================
  CHANGE PASSWORD
  ============================================================
  */

  const handleChangePassword = async () => {
    if (passwordLoading) {
      return;
    }

    setPasswordError("");

    if (
      typeof onChangePassword !== "function"
    ) {
      setPasswordError(
        "Password update is currently unavailable."
      );

      return;
    }

    const validationError =
      validatePassword();

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      await onChangePassword();

      setShowPassword(false);
    } catch (err) {
      console.error(
        "SECURITY_SETTINGS_PASSWORD_ERROR:",
        err
      );

      setPasswordError(
        getErrorMessage(
          err,
          "Unable to change your password. Please try again."
        )
      );
    }
  };

  /*
  ============================================================
  ENABLE 2FA
  ============================================================
  */

  const handleEnable2FA = async () => {
    if (twoFactorLoading) {
      return;
    }

    setTwoFactorError("");

    if (
      typeof onEnable2FA !== "function"
    ) {
      setTwoFactorError(
        "Two-factor authentication is currently unavailable."
      );

      return;
    }

    try {
      const result =
        await onEnable2FA();

      /*
      --------------------------------------------
      Support hooks that return:
      { secret }
      --------------------------------------------
      */

      const returnedSecret =
        result?.secret ||
        result?.twoFactorSecret ||
        result?.data?.secret ||
        result?.data?.twoFactorSecret ||
        "";

      if (returnedSecret) {
        setLocalTwoFactorSecret(
          returnedSecret
        );
      }

      setShowEnable2FA(true);
    } catch (err) {
      console.error(
        "SECURITY_SETTINGS_ENABLE_2FA_ERROR:",
        err
      );

      setTwoFactorError(
        getErrorMessage(
          err,
          "Unable to enable two-factor authentication. Please try again."
        )
      );
    }
  };

  /*
  ============================================================
  2FA CODE HANDLER
  ============================================================
  */

  const handleTwoFactorCodeChange = (
    event
  ) => {
    setTwoFactorError("");

    const sanitizedValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setTwoFactorCode(
      sanitizedValue
    );
  };

  /*
  ============================================================
  VERIFY 2FA
  ============================================================
  */

  const handleVerify2FA = async () => {
    if (twoFactorLoading) {
      return;
    }

    setTwoFactorError("");

    if (
      typeof onVerify2FA !== "function"
    ) {
      setTwoFactorError(
        "Two-factor verification is currently unavailable."
      );

      return;
    }

    if (twoFactorCode.length !== 6) {
      setTwoFactorError(
        "Enter the six-digit authentication code."
      );

      return;
    }

    try {
      await onVerify2FA(
        twoFactorCode
      );

      setTwoFactorCode("");
      setShowEnable2FA(false);
    } catch (err) {
      console.error(
        "SECURITY_SETTINGS_VERIFY_2FA_ERROR:",
        err
      );

      setTwoFactorError(
        getErrorMessage(
          err,
          "The verification code is invalid or has expired."
        )
      );
    }
  };

  /*
  ============================================================
  DISABLE 2FA
  ============================================================
  */

  const handleDisable2FA = async () => {
    if (twoFactorLoading) {
      return;
    }

    setTwoFactorError("");

    if (
      typeof onDisable2FA !== "function"
    ) {
      setTwoFactorError(
        "Two-factor authentication is currently unavailable."
      );

      setShowDisableDialog(false);

      return;
    }

    try {
      await onDisable2FA();

      setShowDisableDialog(false);
      setShowEnable2FA(false);
      setTwoFactorCode("");
      setLocalTwoFactorSecret("");
    } catch (err) {
      console.error(
        "SECURITY_SETTINGS_DISABLE_2FA_ERROR:",
        err
      );

      setShowDisableDialog(false);

      setTwoFactorError(
        getErrorMessage(
          err,
          "Unable to disable two-factor authentication. Please try again."
        )
      );
    }
  };

  /*
  ============================================================
  REVOKE SESSION
  ============================================================
  */

  const handleRevokeSession = async (
    sessionId
  ) => {
    if (
      sessionLoading ||
      !sessionId ||
      typeof onRevokeSession !== "function"
    ) {
      return;
    }

    try {
      await onRevokeSession(
        sessionId
      );
    } catch (err) {
      console.error(
        "SECURITY_SETTINGS_REVOKE_SESSION_ERROR:",
        err
      );
    }
  };

  /*
  ============================================================
  LOGOUT ALL
  ============================================================
  */

  const handleLogoutAll = async () => {
    if (sessionLoading) {
      return;
    }

    if (
      typeof onLogoutAll !== "function"
    ) {
      setShowLogoutDialog(false);
      return;
    }

    try {
      await onLogoutAll();

      setShowLogoutDialog(false);
    } catch (err) {
      console.error(
        "SECURITY_SETTINGS_LOGOUT_ALL_ERROR:",
        err
      );

      setShowLogoutDialog(false);
    }
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <SectionCard
      icon={<ShieldCheck size={22} />}
      title="Security Settings"
      description="Protect your SmartBudget account and manage your account security."
    >
      <div
        className="space-y-6"
      >
        {/* ==================================================
            STATUS MESSAGES
        ================================================== */}

        {error && (
          <StatusMessage
            type="error"
            message={error}
          />
        )}

        {message && (
          <StatusMessage
            type="success"
            message={message}
          />
        )}

        {passwordError && (
          <StatusMessage
            type="error"
            message={passwordError}
          />
        )}

        {twoFactorError && (
          <StatusMessage
            type="error"
            message={twoFactorError}
          />
        )}

        {/* ==================================================
            SECURITY SCORE
        ================================================== */}

        <section
          className="bg-slate-50 p-4 sm:p-5 border border-slate-200 rounded-2xl"
        >
          <div
            className="flex justify-between items-center gap-4"
          >
            <div
              className="min-w-0"
            >
              <p
                className="text-slate-500 text-sm"
              >
                Security Score
              </p>

              <h2
                className="mt-1 font-bold text-slate-900 text-2xl sm:text-3xl"
              >
                {securityScore}%
              </h2>
            </div>

            <div
              className="flex justify-center items-center bg-blue-50 rounded-xl w-11 sm:w-12 h-11 sm:h-12 text-blue-600 shrink-0"
            >
              <ShieldCheck
                size={26}
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            className="bg-slate-200 mt-4 rounded-full h-2 overflow-hidden"
            aria-label={`Security score ${securityScore}%`}
          >
            <div
              className="bg-blue-600 rounded-full h-full transition-all duration-500"
              style={{
                width: `${securityScore}%`,
              }}
            /
            >
          </div>
        </section>

        {/* ==================================================
            PASSWORD
        ================================================== */}

        <SecurityCard
          icon={<Lock size={20} />}
          title="Password"
          description="Update your password regularly to keep your account secure."
          action={
            <button
              type="button"
              disabled={passwordLoading}
              onClick={
                handleTogglePasswordForm
              }
              className="w-full sm:w-auto security-button"
            >
              {passwordLoading
                ? "Updating..."
                : showPassword
                  ? "Cancel"
                  : "Change Password"}
            </button>
          }
        />

        {showPassword && (
          <div
            className="space-y-4 bg-slate-50 p-4 sm:p-5 border border-slate-200 rounded-xl"
          >
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={(event) =>
                handlePasswordFieldChange(
                  "currentPassword",
                  event.target.value
                )
              }
              autoComplete="current-password"
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(event) =>
                handlePasswordFieldChange(
                  "newPassword",
                  event.target.value
                )
              }
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(event) =>
                handlePasswordFieldChange(
                  "confirmPassword",
                  event.target.value
                )
              }
              autoComplete="new-password"
            />

            <div
              className="flex sm:flex-row flex-col justify-end gap-3"
            >
              <button
                type="button"
                disabled={passwordLoading}
                onClick={() =>
                  setShowPassword(false)
                }
                className="bg-white hover:bg-slate-50 disabled:opacity-50 px-5 py-3 border border-slate-200 rounded-xl w-full sm:w-auto font-medium text-slate-700 text-sm transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  passwordLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                onClick={
                  handleChangePassword
                }
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 px-5 py-3 rounded-xl w-full sm:w-auto font-semibold text-white text-sm transition disabled:cursor-not-allowed"
              >
                {passwordLoading
                  ? "Saving..."
                  : "Save Password"}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            TWO FACTOR AUTHENTICATION
        ================================================== */}

        <SecurityCard
          icon={<Smartphone size={20} />}
          title="Two-Factor Authentication"
          description={
            twoFactorEnabled
              ? "Your account is protected with two-factor authentication."
              : "Add an extra layer of protection to your account."
          }
          badge={
            twoFactorEnabled ? (
              <Badge>
                Enabled
              </Badge>
            ) : (
              <Badge warning>
                Disabled
              </Badge>
            )
          }
          action={
            twoFactorEnabled ? (
              <button
                type="button"
                disabled={
                  twoFactorLoading
                }
                onClick={() =>
                  setShowDisableDialog(true)
                }
                className="w-full sm:w-auto security-button-danger"
              >
                {twoFactorLoading
                  ? "Disabling..."
                  : "Disable"}
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  twoFactorLoading
                }
                onClick={
                  handleEnable2FA
                }
                className="w-full sm:w-auto security-button"
              >
                {twoFactorLoading
                  ? "Enabling..."
                  : "Enable"}
              </button>
            )
          }
        />

        {/* ==================================================
            2FA VERIFICATION
        ================================================== */}

        {showEnable2FA &&
          !twoFactorEnabled && (
            <div
              className="space-y-4 bg-slate-50 p-4 sm:p-5 border border-slate-200 rounded-xl"
            >
              <div>
                <p
                  className="font-semibold text-slate-900 text-sm"
                >
                  Verify your authentication app
                </p>

                <p
                  className="mt-1 text-slate-500 text-sm leading-relaxed"
                >
                  Open your authenticator app and
                  enter the six-digit verification
                  code to complete setup.
                </p>
              </div>

              {localTwoFactorSecret && (
                <div
                  className="bg-white p-3 border border-slate-200 rounded-xl overflow-x-auto"
                >
                  <p
                    className="text-slate-500 text-xs"
                  >
                    Setup secret
                  </p>

                  <code
                    className="block mt-1 font-mono text-slate-900 text-sm break-all"
                  >
                    {localTwoFactorSecret}
                  </code>
                </div>
              )}

              <div>
                <label
                  htmlFor="two-factor-code"
                  className="block font-medium text-slate-700 text-sm"
                >
                  Authentication code
                </label>

                <input
                  id="two-factor-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={
                    handleTwoFactorCodeChange
                  }
                  placeholder="123456"
                  aria-label="Six digit authentication code"
                  className="block bg-white mt-1.5 px-4 py-3 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full font-semibold text-slate-900 text-center tracking-[0.35em] transition"
                  /
                >
              </div>

              <div
                className="flex sm:flex-row flex-col gap-3"
              >
                <button
                  type="button"
                  disabled={
                    twoFactorLoading
                  }
                  onClick={() => {
                    setShowEnable2FA(false);
                    setTwoFactorCode("");
                    setTwoFactorError("");
                  }}
                  className="bg-white hover:bg-slate-50 disabled:opacity-50 px-5 py-3 border border-slate-200 rounded-xl w-full sm:w-auto font-medium text-slate-700 text-sm transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    twoFactorLoading ||
                    twoFactorCode.length !== 6
                  }
                  onClick={
                    handleVerify2FA
                  }
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 px-5 py-3 rounded-xl w-full sm:w-auto font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                >
                  {twoFactorLoading
                    ? "Verifying..."
                    : "Verify & Enable"}
                </button>
              </div>
            </div>
          )}

        {/* ==================================================
            ACTIVE SESSIONS
        ================================================== */}

        <section>
          <div
            className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 mb-3"
          >
            <div
              className="min-w-0"
            >
              <h3
                className="font-semibold text-slate-900"
              >
                Active Devices
              </h3>

              <p
                className="mt-1 text-slate-500 text-xs leading-relaxed"
              >
                Manage devices currently signed
                into your account.
              </p>
            </div>

            {sessions.length > 0 && (
              <button
                type="button"
                disabled={
                  sessionLoading
                }
                onClick={() =>
                  setShowLogoutDialog(true)
                }
                className="self-start sm:self-auto disabled:opacity-50 font-medium text-red-600 hover:text-red-700 text-sm transition disabled:cursor-not-allowed"
              >
                Logout all
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div
              className="p-5 border border-slate-200 border-dashed rounded-xl text-center"
            >
              <Monitor
                size={24}
                className="mx-auto text-slate-400"
                aria-hidden="true"
              /
              >

              <p
                className="mt-2 text-slate-500 text-sm"
              >
                No active sessions.
              </p>
            </div>
          ) : (
            <div
              className="space-y-3"
            >
              {sessions.map(
                (session) => (
                  <DeviceCard
                    key={
                      session?._id ||
                      session?.id
                    }
                    session={session}
                    disabled={
                      sessionLoading
                    }
                    onRemove={
                      handleRevokeSession
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* ==================================================
            DISABLE 2FA CONFIRMATION
        ================================================== */}

        <ConfirmDialog
          isOpen={
            showDisableDialog
          }
          title="Disable Two-Factor Authentication?"
          description="Your account will have reduced protection. You can enable two-factor authentication again later."
          confirmText={
            twoFactorLoading
              ? "Disabling..."
              : "Disable"
          }
          variant="warning"
          onConfirm={
            handleDisable2FA
          }
          onCancel={() => {
            if (!twoFactorLoading) {
              setShowDisableDialog(false);
            }
          }}
        />

        {/* ==================================================
            LOGOUT ALL CONFIRMATION
        ================================================== */}

        <ConfirmDialog
          isOpen={
            showLogoutDialog
          }
          title="Logout all devices?"
          description="All other active sessions will be terminated."
          confirmText={
            sessionLoading
              ? "Logging out..."
              : "Logout Devices"
          }
          variant="danger"
          onConfirm={
            handleLogoutAll
          }
          onCancel={() => {
            if (!sessionLoading) {
              setShowLogoutDialog(false);
            }
          }}
        />
      </div>
    </SectionCard>
  );
};

/*
============================================================
SECURITY CARD
============================================================
*/

function SecurityCard({
  icon,
  title,
  description,
  badge,
  action,
}) {
  return (
    <div
      className="flex sm:flex-row flex-col sm:items-center gap-4 bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl"
    >
      <div
        className="flex flex-1 items-start gap-3 min-w-0"
      >
        <div
          className="flex justify-center items-center bg-slate-100 rounded-xl w-10 h-10 text-slate-700 shrink-0"
        >
          {icon}
        </div>

        <div
          className="flex-1 min-w-0"
        >
          <div
            className="flex flex-wrap items-center gap-2"
          >
            <h4
              className="font-semibold text-slate-900 text-sm sm:text-base break-words"
            >
              {title}
            </h4>

            {badge}
          </div>

          <p
            className="mt-1 text-slate-500 text-sm leading-relaxed"
          >
            {description}
          </p>
        </div>
      </div>

      {action && (
        <div
          className="w-full sm:w-auto shrink-0"
        >
          {action}
        </div>
      )}
    </div>
  );
}

/*
============================================================
DEVICE CARD
============================================================
*/

function DeviceCard({
  session,
  onRemove,
  disabled = false,
}) {
  const sessionId =
    session?._id ||
    session?.id;

  return (
    <div
      className="flex sm:flex-row flex-col sm:items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl"
    >
      <div
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <div
          className="flex justify-center items-center bg-slate-100 rounded-xl w-10 h-10 text-slate-600 shrink-0"
        >
          <Monitor
            size={19}
            aria-hidden="true"
          />
        </div>

        <div
          className="flex-1 min-w-0"
        >
          <p
            className="font-medium text-slate-900 text-sm truncate"
            title={
              session?.device ||
              "Unknown Device"
            }
          >
            {session?.device ||
              "Unknown Device"}
          </p>

          <p
            className="mt-1 text-slate-500 text-xs truncate"
            title={
              session?.ipAddress ||
              "No IP available"
            }
          >
            {session?.ipAddress ||
              "No IP available"}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={
          disabled ||
          !sessionId
        }
        onClick={() =>
          onRemove?.(sessionId)
        }
        className="hover:bg-red-50 disabled:opacity-50 px-4 py-2.5 rounded-lg w-full sm:w-auto font-medium text-red-600 hover:text-red-700 text-sm transition disabled:cursor-not-allowed"
      >
        Remove
      </button>
    </div>
  );
}

/*
============================================================
PASSWORD INPUT
============================================================
*/

function PasswordInput({
  label,
  value = "",
  onChange,
  autoComplete = "new-password",
}) {
  return (
    <div>
      <label
        className="block font-medium text-slate-700 text-sm"
      >
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        spellCheck={false}
        className="block bg-white mt-1.5 px-4 py-3 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 text-sm transition"
        /
      >
    </div>
  );
}

/*
============================================================
BADGE
============================================================
*/

function Badge({
  children,
  warning = false,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5 py-1
        text-xs
        font-medium
        whitespace-nowrap

        ${
          warning
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
        }
      `}
    >
      {children}
    </span>
  );
}

/*
============================================================
STATUS MESSAGE
============================================================
*/

function StatusMessage({
  type,
  message,
}) {
  const isError =
    type === "error";

  return (
    <div
      className={`
        flex
        items-start
        gap-2
        rounded-xl
        p-3
        text-sm
        leading-relaxed

        ${
          isError
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-600"
        }
      `}
      role={
        isError
          ? "alert"
          : "status"
      }
    >
      {isError ? (
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        /
        >
      ) : (
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        /
        >
      )}

      <span
        className="min-w-0 break-words"
      >
        {message}
      </span>
    </div>
  );
}

/*
============================================================
SECURITY SCORE
============================================================
*/

function calculateSecurityScore(
  user
) {
  let score = 40;

  if (user?.isEmailVerified) {
    score += 20;
  }

  if (
    user?.twoFactorEnabled ||
    user?.twoFactor?.enabled
  ) {
    score += 30;
  }

  if (user?.phoneVerified) {
    score += 10;
  }

  return Math.min(
    score,
    100
  );
}

/*
============================================================
ERROR MESSAGE NORMALIZER
============================================================
*/

function getErrorMessage(
  error,
  fallback
) {
  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

/*
============================================================
PROP TYPES
============================================================
*/

SecuritySettings.propTypes = {
  user: PropTypes.object,

  sessions: PropTypes.arrayOf(
    PropTypes.object
  ),

  loading: PropTypes.shape({
    password: PropTypes.bool,
    twoFactor: PropTypes.bool,
    sessions: PropTypes.bool,
  }),

  message: PropTypes.string,

  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),

  onChangePassword:
    PropTypes.func,

  passwordForm:
    PropTypes.shape({
      currentPassword:
        PropTypes.string,
      newPassword:
        PropTypes.string,
      confirmPassword:
        PropTypes.string,
    }),

  updatePasswordField:
    PropTypes.func,

  onEnable2FA:
    PropTypes.func,

  onDisable2FA:
    PropTypes.func,

  onVerify2FA:
    PropTypes.func,

  twoFactorEnabled:
    PropTypes.bool,

  twoFactorSecret:
    PropTypes.string,

  onRevokeSession:
    PropTypes.func,

  onLogoutAll:
    PropTypes.func,
};

SecurityCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  badge: PropTypes.node,
  action: PropTypes.node,
};

DeviceCard.propTypes = {
  session: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  disabled: PropTypes.bool,
};

PasswordInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  autoComplete: PropTypes.string,
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  warning: PropTypes.bool,
};

StatusMessage.propTypes = {
  type: PropTypes.oneOf([
    "error",
    "success",
  ]).isRequired,
  message: PropTypes.string.isRequired,
};

export default SecuritySettings;