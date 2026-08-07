
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useState } from "react";

import SectionCard from "./components/SectionCard";
import ConfirmDialog from "./components/ConfirmDialog";

/**
 * ============================================================
 * SECURITY SETTINGS
 * ============================================================
 *
 * Responsibilities:
 * - Display security score
 * - Manage password UI
 * - Manage 2FA UI
 * - Display active sessions
 * - Revoke individual sessions
 * - Logout all devices
 *
 * Business logic remains in the parent/hook.
 * This component is presentation + interaction only.
 */

const SecuritySettings = ({
  user = null,
  sessions = [],

  loading = {},
  message = "",
  error = "",

  onChangePassword,
  passwordForm = {},
  updatePasswordField,

  onEnable2FA,
  onDisable2FA,
  onVerify2FA,

  twoFactorEnabled = false,
  twoFactorSecret = "",

  onRevokeSession,
  onLogoutAll,
}) => {
  /* ==========================================================
     LOCAL UI STATE
  ========================================================== */

  const [showPassword, setShowPassword] = useState(false);
  const [showEnable2FA, setShowEnable2FA] = useState(false);

  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [showDisableDialog, setShowDisableDialog] =
    useState(false);

  const [showLogoutDialog, setShowLogoutDialog] =
    useState(false);

  /* ==========================================================
     SAFE VALUES
  ========================================================== */

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

  const securityScore =
    calculateSecurityScore(user);

  /* ==========================================================
     SAFE HANDLERS
  ========================================================== */

  const handlePasswordFieldChange = (
    field,
    value
  ) => {
    if (
      typeof updatePasswordField !== "function"
    ) {
      return;
    }

    updatePasswordField(field, value);
  };

  const handleChangePassword = async () => {
    if (
      typeof onChangePassword !== "function"
    ) {
      console.warn(
        "SecuritySettings: onChangePassword is not configured."
      );

      return;
    }

    await onChangePassword();
  };

  const handleEnable2FA = async () => {
    if (
      typeof onEnable2FA !== "function"
    ) {
      console.warn(
        "SecuritySettings: onEnable2FA is not configured."
      );

      return;
    }

    try {
      await onEnable2FA();

      setShowEnable2FA(true);
    } catch (err) {
      console.error(
        "ENABLE_2FA_ERROR:",
        err
      );
    }
  };

  const handleVerify2FA = async () => {
    if (
      typeof onVerify2FA !== "function"
    ) {
      console.warn(
        "SecuritySettings: onVerify2FA is not configured."
      );

      return;
    }

    if (!twoFactorCode.trim()) {
      return;
    }

    await onVerify2FA(
      twoFactorCode.trim()
    );
  };

  const handleDisable2FA = async () => {
    if (
      typeof onDisable2FA !== "function"
    ) {
      console.warn(
        "SecuritySettings: onDisable2FA is not configured."
      );

      setShowDisableDialog(false);

      return;
    }

    try {
      await onDisable2FA();

      setShowDisableDialog(false);
      setShowEnable2FA(false);
      setTwoFactorCode("");
    } catch (err) {
      console.error(
        "DISABLE_2FA_ERROR:",
        err
      );
    }
  };

  const handleRevokeSession = async (
    sessionId
  ) => {
    if (
      typeof onRevokeSession !== "function"
    ) {
      console.warn(
        "SecuritySettings: onRevokeSession is not configured."
      );

      return;
    }

    if (!sessionId) {
      return;
    }

    await onRevokeSession(sessionId);
  };

  const handleLogoutAll = async () => {
    if (
      typeof onLogoutAll !== "function"
    ) {
      console.warn(
        "SecuritySettings: onLogoutAll is not configured."
      );

      setShowLogoutDialog(false);

      return;
    }

    try {
      await onLogoutAll();

      setShowLogoutDialog(false);
    } catch (err) {
      console.error(
        "LOGOUT_ALL_ERROR:",
        err
      );
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SectionCard
      icon={<ShieldCheck size={22} />}
      title="Security Settings"
      description="Protect your SmartBudget account and manage your account security."
    >
      <div
        className="
          space-y-6
        "
      >

        {/* ====================================================
            STATUS MESSAGES
        ==================================================== */}

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

        {/* ====================================================
            SECURITY SCORE
        ==================================================== */}

        <div
          className="
            p-5
            bg-slate-50
            border border-slate-200 rounded-2xl
          "
        >
          <div
            className="
              flex justify-between items-center
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-slate-500 text-sm
                "
              >
                Security Score
              </p>

              <h2
                className="
                  font-bold text-slate-900 text-3xl
                "
              >
                {securityScore}%
              </h2>
            </div>

            <ShieldCheck
              size={40}
              className="
                text-blue-600
              "
              /
            >
          </div>

          <div
            className="
              overflow-hidden
              h-2
              mt-4
              bg-slate-200
              rounded-full
            "
          >
            <div
              className="
                h-full
                bg-blue-600
                rounded-full
                transition-all duration-500
              "
              style={{
                width: `${securityScore}%`,
              }}
            /
            >
          </div>
        </div>

        {/* ====================================================
            PASSWORD
        ==================================================== */}

        <SecurityCard
          icon={<Lock size={20} />}
          title="Password"
          description="Update your password regularly to keep your account secure."
          action={
            <button
              type="button"
              disabled={passwordLoading}
              onClick={() =>
                setShowPassword(
                  (previous) => !previous
                )
              }
              className="security-button"
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
            className="
              space-y-4 p-4
              border border-slate-200 rounded-xl
            "
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
            />

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(event) =>
                handlePasswordFieldChange(
                  "confirmPassword",
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="
                security-button
              "
            >
              {passwordLoading
                ? "Saving..."
                : "Save Password"}
            </button>
          </div>
        )}

        {/* ====================================================
            TWO FACTOR AUTHENTICATION
        ==================================================== */}

        <SecurityCard
          icon={<Smartphone size={20} />}
          title="Two Factor Authentication"
          description={
            twoFactorEnabled
              ? "Your account is protected with 2FA."
              : "Add an extra security layer."
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
                disabled={twoFactorLoading}
                onClick={() =>
                  setShowDisableDialog(true)
                }
                className="security-button-danger"
              >
                Disable
              </button>
            ) : (
              <button
                type="button"
                disabled={twoFactorLoading}
                onClick={handleEnable2FA}
                className="
                  security-button
                "
              >
                {twoFactorLoading
                  ? "Enabling..."
                  : "Enable"}
              </button>
            )
          }
        />

        {showEnable2FA &&
          twoFactorSecret && (
            <div
              className="
                space-y-4 p-4
                border border-slate-200 rounded-xl
              "
            >
              <div>
                <p
                  className="
                    font-medium text-slate-900 text-sm
                  "
                >
                  Verify your authentication app
                </p>

                <p
                  className="
                    mt-1
                    text-slate-500 text-sm
                  "
                >
                  Enter the six-digit authentication
                  code to complete setup.
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={twoFactorCode}
                onChange={(event) =>
                  setTwoFactorCode(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="123456"
                className="px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full transition"
              />

              <button
                type="button"
                disabled={
                  twoFactorLoading ||
                  twoFactorCode.length !== 6
                }
                onClick={handleVerify2FA}
                className="
                  security-button
                "
              >
                {twoFactorLoading
                  ? "Verifying..."
                  : "Verify"}
              </button>
            </div>
          )}

        {/* ====================================================
            ACTIVE SESSIONS
        ==================================================== */}

        <div>
          <div
            className="
              flex justify-between items-center
              mb-3
              gap-4
            "
          >
            <div>
              <h3
                className="
                  font-semibold text-slate-900
                "
              >
                Active Devices
              </h3>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs
                "
              >
                Manage devices currently signed
                into your account.
              </p>
            </div>

            {sessions.length > 0 && (
              <button
                type="button"
                disabled={sessionLoading}
                onClick={() =>
                  setShowLogoutDialog(true)
                }
                className="disabled:opacity-50 font-medium text-red-600 hover:text-red-700 text-sm transition disabled:cursor-not-allowed"
              >
                Logout all
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div
              className="
                p-5
                text-center
                border border-slate-200 border-dashed rounded-xl
              "
            >
              <Monitor
                size={24}
                className="
                  mx-auto
                  text-slate-400
                "
                /
              >

              <p
                className="
                  mt-2
                  text-slate-500 text-sm
                "
              >
                No active sessions.
              </p>
            </div>
          ) : (
            <div
              className="
                space-y-3
              "
            >
              {sessions.map((session) => (
                <DeviceCard
                  key={session?._id}
                  session={session}
                  disabled={sessionLoading}
                  onRemove={
                    handleRevokeSession
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* ====================================================
            DISABLE 2FA CONFIRMATION
        ==================================================== */}

        <ConfirmDialog
          isOpen={showDisableDialog}
          title="Disable Two-Factor Authentication?"
          description="Your account will have reduced protection."
          confirmText="Disable"
          variant="warning"
          onConfirm={handleDisable2FA}
          onCancel={() =>
            setShowDisableDialog(false)
          }
        />

        {/* ====================================================
            LOGOUT ALL CONFIRMATION
        ==================================================== */}

        <ConfirmDialog
          isOpen={showLogoutDialog}
          title="Logout all devices?"
          description="All other active sessions will be terminated."
          confirmText="Logout Devices"
          variant="danger"
          onConfirm={handleLogoutAll}
          onCancel={() =>
            setShowLogoutDialog(false)
          }
        />
      </div>
    </SectionCard>
  );
};

/* ============================================================
   SECURITY CARD
============================================================ */

function SecurityCard({
  icon,
  title,
  description,
  badge,
  action,
}) {
  return (
    <div
      className="
        flex justify-between items-center
        p-4
        border border-slate-200 rounded-2xl
        gap-4
      "
    >
      <div
        className="
          flex items-center
          min-w-0
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-blue-600
            bg-blue-50
            rounded-xl
            shrink-0
          "
        >
          {icon}
        </div>

        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex flex-wrap items-center
              gap-2
            "
          >
            <h4
              className="
                font-semibold text-slate-900
              "
            >
              {title}
            </h4>

            {badge}
          </div>

          <p
            className="
              mt-1
              text-slate-500 text-sm
            "
          >
            {description}
          </p>
        </div>
      </div>

      {action && (
        <div
          className="
            shrink-0
          "
        >
          {action}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   DEVICE CARD
============================================================ */

function DeviceCard({
  session,
  onRemove,
  disabled = false,
}) {
  const sessionId = session?._id;

  return (
    <div
      className="
        flex justify-between items-center
        p-4
        border border-slate-200 rounded-xl
        gap-4
      "
    >
      <div
        className="
          flex items-center
          min-w-0
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-600
            bg-slate-100
            rounded-xl
            shrink-0
          "
        >
          <Monitor size={20} />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              font-medium text-slate-900 truncate
            "
          >
            {session?.device ||
              "Unknown Device"}
          </p>

          <p
            className="
              mt-1
              text-slate-500 text-xs truncate
            "
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
        className="disabled:opacity-50 font-medium text-red-600 hover:text-red-700 text-sm transition disabled:cursor-not-allowed shrink-0"
      >
        Remove
      </button>
    </div>
  );
}

/* ============================================================
   PASSWORD INPUT
============================================================ */

function PasswordInput({
  label,
  value = "",
  onChange,
}) {
  return (
    <div>
      <label
        className="
          font-medium text-slate-900 text-sm
        "
      >
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={onChange}
        autoComplete="current-password"
        className="
          w-full
          mt-1 px-3 py-2
          border border-slate-200 focus:border-blue-500 rounded-xl outline-none
          focus:ring-2 focus:ring-blue-100
          transition
        "
        /
      >
    </div>
  );
}

/* ============================================================
   BADGE
============================================================ */

function Badge({
  children,
  warning = false,
}) {
  return (
    <span
      className={`
        rounded-full
        px-2
        py-1
        text-xs
        font-medium

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

/* ============================================================
   STATUS MESSAGE
============================================================ */

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
        items-center
        gap-2
        rounded-xl
        p-3
        text-sm

        ${
          isError
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-600"
        }
      `}
      role="status"
    >
      {isError ? (
        <AlertTriangle
          size={18}
          className="
            shrink-0
          "
          /
        >
      ) : (
        <CheckCircle2
          size={18}
          className="
            shrink-0
          "
          /
        >
      )}

      <span>{message}</span>
    </div>
  );
}

/* ============================================================
   SECURITY SCORE
============================================================ */

function calculateSecurityScore(user) {
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

  return Math.min(score, 100);
}

export default SecuritySettings;