
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Globe2,
  Languages,
  LockKeyhole,
  MonitorCog,
  Save,
  ShieldCheck,
  Undo2,
  Wallet,
} from "lucide-react";

import usePreferences from "../../hooks/usePreferences";

/*
|--------------------------------------------------------------------------
| FIELD COMPONENT
|--------------------------------------------------------------------------
*/

const Field = ({
  icon: Icon,
  label,
  description,
  children,
}) => {
  return (
    <div
      className="
        md:items-center grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px]
        p-4 sm:p-5
        bg-white
        border border-slate-200 rounded-2xl
        gap-4
      "
    >
      <div
        className="
          flex items-start
          min-w-0
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-700
            bg-slate-50
            border border-slate-200 rounded-xl
            shrink-0
          "
        >
          <Icon
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <h4
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            {label}
          </h4>

          <p
            className="
              max-w-xl
              mt-1
              text-slate-500 text-xs leading-relaxed
            "
          >
            {description}
          </p>
        </div>
      </div>

      <div
        className="
          w-full
        "
      >
        {children}
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SECTION CARD
|--------------------------------------------------------------------------
*/

const SettingsSection = ({
  icon: Icon,
  title,
  description,
  children,
}) => {
  return (
    <section
      className="
        overflow-hidden
        bg-slate-50/50
        border border-slate-200 rounded-3xl
      "
    >
      <div
        className="
          flex items-start
          p-4 sm:p-5
          bg-white
          border-slate-200 border-b
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-blue-600
            bg-blue-50
            border border-blue-100 rounded-xl
            shrink-0
          "
        >
          <Icon
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <h3
            className="
              font-bold text-slate-900 text-sm
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-slate-500 text-xs leading-relaxed
            "
          >
            {description}
          </p>
        </div>
      </div>

      <div
        className="
          space-y-3 p-3 sm:p-4
        "
      >
        {children}
      </div>
    </section>
  );
};

/*
|--------------------------------------------------------------------------
| SELECT
|--------------------------------------------------------------------------
*/

const Select = ({
  value = "",
  onChange,
  disabled = false,
  children,
  ariaLabel,
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className="
        w-full h-11
        px-4
        font-medium text-slate-800 text-sm
        bg-slate-50 hover:bg-white focus:bg-white
        border border-slate-200 focus:border-blue-500 rounded-2xl outline-none
        focus:ring-2 focus:ring-blue-100
        disabled:opacity-60 transition
        disabled:cursor-not-allowed
      "
    >
      {children}
    </select>
  );
};

/*
|--------------------------------------------------------------------------
| TOGGLE
|--------------------------------------------------------------------------
*/

const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative
        inline-flex
        h-7
        w-12
        shrink-0
        items-center
        rounded-full
        border
        transition
        focus:outline-none
        focus:ring-2
        focus:ring-blue-200
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${
          checked
            ? "border-blue-600 bg-blue-600"
            : "border-slate-300 bg-slate-200"
        }
      `}
    >
      <span
        className={`
          inline-block
          h-5
          w-5
          rounded-full
          bg-white
          shadow-sm
          transition-transform
          ${
            checked
              ? "translate-x-6"
              : "translate-x-1"
          }
        `}
        aria-hidden="true"
      />
    </button>
  );
};

/*
|--------------------------------------------------------------------------
| TOGGLE FIELD
|--------------------------------------------------------------------------
*/

const ToggleField = ({
  icon,
  label,
  description,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <div
      className="
        flex justify-between items-center
        p-4 sm:p-5
        bg-white
        border border-slate-200 rounded-2xl
        gap-4
      "
    >
      <div
        className="
          flex items-start
          min-w-0
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-700
            bg-slate-50
            border border-slate-200 rounded-xl
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
          <h4
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            {label}
          </h4>

          <p
            className="
              mt-1
              text-slate-500 text-xs leading-relaxed
            "
          >
            {description}
          </p>
        </div>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        label={label}
      />
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| STATUS MESSAGE
|--------------------------------------------------------------------------
*/

const StatusMessage = ({
  type,
  message,
}) => {
  if (!message) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      className={`
        flex
        items-start
        gap-2
        rounded-2xl
        border
        p-3
        text-sm
        ${
          isError
            ? "border-red-100 bg-red-50 text-red-700"
            : "border-emerald-100 bg-emerald-50 text-emerald-700"
        }
      `}
      role={isError ? "alert" : "status"}
      aria-live="polite"
    >
      {isError ? (
        <AlertCircle
          size={18}
          className="
            mt-0.5
            shrink-0
          "
          aria-hidden="true"
        /
        >
      ) : (
        <CheckCircle2
          size={18}
          className="
            mt-0.5
            shrink-0
          "
          aria-hidden="true"
        /
        >
      )}

      <span>{message}</span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| LOADING SKELETON
|--------------------------------------------------------------------------
*/

const PreferenceSkeleton = () => {
  return (
    <section
      className="
        overflow-hidden
        w-full
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
      aria-busy="true"
      aria-label="Loading preferences"
    >
      <div
        className="
          h-1
          bg-slate-200
        "
        /
      >

      <div
        className="
          p-4 sm:p-6 lg:p-7
          animate-pulse
        "
      >
        <div
          className="
            flex items-start
            gap-3
          "
        >
          <div
            className="
              w-11 h-11
              bg-slate-200
              rounded-2xl
            "
            /
          >

          <div
            className="
              flex-1
              space-y-2
            "
          >
            <div
              className="
                w-40 h-5
                bg-slate-200
                rounded-lg
              "
              /
            >
            <div
              className="
                w-full max-w-xl h-4
                bg-slate-100
                rounded-lg
              "
              /
            >
          </div>
        </div>

        <div
          className="
            h-px
            my-6
            bg-slate-100
          "
          /
        >

        <div
          className="
            space-y-3
          "
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="
                h-20
                bg-slate-100
                rounded-2xl
              "
              /
            >
          ))}
        </div>
      </div>
    </section>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

const PreferenceSettings = () => {
  const {
    preferences,
    loading,
    saving,
    resetting,
    isDirty,
    message,
    error,
    updatePreference,
    savePreferences,
    discardChanges,
    resetPreferences,
  } = usePreferences();

  /*
  |--------------------------------------------------------------------------
  | SAFE PREFERENCE VALUES
  |--------------------------------------------------------------------------
  */

  const regional = preferences?.regional ?? {};
  const display = preferences?.display ?? {};
  const privacy = preferences?.privacy ?? {};

  const language =
    regional.language ?? "en";

  const currency =
    regional.currency ?? "NGN";

  const timezone =
    regional.timezone ?? "Africa/Lagos";

  const dateFormat =
    regional.dateFormat ?? "DD/MM/YYYY";

  const compactMode =
    display.compactMode ?? false;

  const animations =
    display.animations ?? true;

  const highContrast =
    display.highContrast ?? false;

  const analytics =
    privacy.analytics ?? true;

  const profileVisibility =
    privacy.profileVisibility ?? "private";

  const shareUsageData =
    privacy.shareUsageData ?? false;

  /*
  |--------------------------------------------------------------------------
  | BUSY STATE
  |--------------------------------------------------------------------------
  */

  const isBusy =
    saving || resetting;

  /*
  |--------------------------------------------------------------------------
  | LANGUAGE HANDLER
  |--------------------------------------------------------------------------
  */

  const handleLanguageChange = (
    event
  ) => {
    const value =
      event.target.value;

    updatePreference(
      "regional.language",
      value
    );

    if (
      typeof document !== "undefined"
    ) {
      document.documentElement.lang =
        value;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    if (
      saving ||
      !isDirty
    ) {
      return;
    }

    await savePreferences();
  };

  /*
  |--------------------------------------------------------------------------
  | DISCARD
  |--------------------------------------------------------------------------
  */

  const handleDiscard = () => {
    if (!isDirty || isBusy) {
      return;
    }

    discardChanges();
  };

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const handleReset = async () => {
    if (isBusy) {
      return;
    }

    const confirmed =
      window.confirm(
        "Reset all preferences to their default values?"
      );

    if (!confirmed) {
      return;
    }

    await resetPreferences();
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return <PreferenceSkeleton />;
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <section
      className="
        relative overflow-hidden
        w-full
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >
      {/* Accent */}
      <div
        className="
          top-0 absolute inset-x-0
          h-1
          bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500
        "
        aria-hidden="true"
      /
      >

      <div
        className="
          p-4 sm:p-6 lg:p-7
        "
      >
        {/* Header */}
        <div
          className="
            flex items-start
            gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-11 h-11
              text-blue-600
              bg-blue-50
              border border-blue-100 rounded-2xl
              shrink-0
            "
          >
            <MonitorCog
              size={21}
              strokeWidth={2}
              aria-hidden="true"
            />
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
              <h2
                className="
                  font-bold text-slate-900 text-lg sm:text-xl
                "
              >
                Preferences
              </h2>

              {isDirty && (
                <span
                  className="
                    px-2.5 py-1
                    font-semibold text-[11px] text-amber-700
                    bg-amber-50
                    border border-amber-200 rounded-full
                  "
                >
                  Unsaved changes
                </span>
              )}
            </div>

            <p
              className="
                max-w-2xl
                mt-1
                text-slate-500 text-sm leading-relaxed
              "
            >
              Manage regional, display, and
              privacy settings for your
              SmartBudget account.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="
            h-px
            my-5 sm:my-6
            bg-slate-100
          "
          /
        >

        {/* Status */}
        <div
          className="
            space-y-3 mb-5
          "
        >
          <StatusMessage
            type="error"
            message={error}
          />

          <StatusMessage
            type="success"
            message={message}
          />
        </div>

        {/* Settings */}
        <div
          className="
            space-y-5
          "
        >
          {/* =========================================================
              REGIONAL
          ========================================================= */}

          <SettingsSection
            icon={Globe2}
            title="Regional"
            description="Control how SmartBudget formats language, currency, dates, and time."
          >
            <Field
              icon={Languages}
              label="Language"
              description="Choose the language used throughout the SmartBudget interface."
            >
              <Select
                value={language}
                disabled={isBusy}
                ariaLabel="Application language"
                onChange={handleLanguageChange}
              >
                <option value="en">
                  English
                </option>
              </Select>
            </Field>

            <Field
              icon={Wallet}
              label="Currency"
              description="Controls currency formatting across transactions, budgets, and reports."
            >
              <Select
                value={currency}
                disabled={isBusy}
                ariaLabel="Currency"
                onChange={(event) =>
                  updatePreference(
                    "regional.currency",
                    event.target.value
                  )
                }
              >
                <option value="NGN">
                  Nigerian Naira (₦)
                </option>

                <option value="USD">
                  US Dollar ($)
                </option>

                <option value="GBP">
                  British Pound (£)
                </option>

                <option value="EUR">
                  Euro (€)
                </option>
              </Select>
            </Field>

            <Field
              icon={Clock3}
              label="Timezone"
              description="Used for transaction timestamps, reminders, and financial reports."
            >
              <Select
                value={timezone}
                disabled={isBusy}
                ariaLabel="Timezone"
                onChange={(event) =>
                  updatePreference(
                    "regional.timezone",
                    event.target.value
                  )
                }
              >
                <option value="Africa/Lagos">
                  West Africa Time
                </option>

                <option value="Africa/Accra">
                  Ghana Time
                </option>

                <option value="Europe/London">
                  London
                </option>

                <option value="America/New_York">
                  Eastern Time
                </option>

                <option value="America/Los_Angeles">
                  Pacific Time
                </option>
              </Select>
            </Field>

            <Field
              icon={Clock3}
              label="Date Format"
              description="Choose how dates are displayed throughout the application."
            >
              <Select
                value={dateFormat}
                disabled={isBusy}
                ariaLabel="Date format"
                onChange={(event) =>
                  updatePreference(
                    "regional.dateFormat",
                    event.target.value
                  )
                }
              >
                <option value="DD/MM/YYYY">
                  DD/MM/YYYY
                </option>

                <option value="MM/DD/YYYY">
                  MM/DD/YYYY
                </option>

                <option value="YYYY-MM-DD">
                  YYYY-MM-DD
                </option>
              </Select>
            </Field>
          </SettingsSection>

          {/* =========================================================
              DISPLAY
          ========================================================= */}

          <SettingsSection
            icon={MonitorCog}
            title="Display"
            description="Customize how SmartBudget looks and behaves on your device."
          >
            <ToggleField
              icon={
                <MonitorCog
                  size={18}
                  aria-hidden="true"
                />
              }
              label="Compact Mode"
              description="Reduce spacing and visual density to display more information at once."
              checked={compactMode}
              disabled={isBusy}
              onChange={(value) =>
                updatePreference(
                  "display.compactMode",
                  value
                )
              }
            />

            <ToggleField
              icon={
                <MonitorCog
                  size={18}
                  aria-hidden="true"
                />
              }
              label="Animations"
              description="Enable interface transitions and visual animations throughout the application."
              checked={animations}
              disabled={isBusy}
              onChange={(value) =>
                updatePreference(
                  "display.animations",
                  value
                )
              }
            />

            <ToggleField
              icon={
                <ShieldCheck
                  size={18}
                  aria-hidden="true"
                />
              }
              label="High Contrast"
              description="Increase visual contrast to make interface elements easier to distinguish."
              checked={highContrast}
              disabled={isBusy}
              onChange={(value) =>
                updatePreference(
                  "display.highContrast",
                  value
                )
              }
            />
          </SettingsSection>

          {/* =========================================================
              PRIVACY
          ========================================================= */}

          <SettingsSection
            icon={LockKeyhole}
            title="Privacy"
            description="Control how your account and usage information are handled."
          >
            <ToggleField
              icon={
                <ShieldCheck
                  size={18}
                  aria-hidden="true"
                />
              }
              label="Analytics"
              description="Allow SmartBudget to use anonymous analytics to improve the application."
              checked={analytics}
              disabled={isBusy}
              onChange={(value) =>
                updatePreference(
                  "privacy.analytics",
                  value
                )
              }
            />

            <Field
              icon={LockKeyhole}
              label="Profile Visibility"
              description="Choose who can view your profile information."
            >
              <Select
                value={profileVisibility}
                disabled={isBusy}
                ariaLabel="Profile visibility"
                onChange={(event) =>
                  updatePreference(
                    "privacy.profileVisibility",
                    event.target.value
                  )
                }
              >
                <option value="private">
                  Private
                </option>

                <option value="public">
                  Public
                </option>
              </Select>
            </Field>

            <ToggleField
              icon={
                <ShieldCheck
                  size={18}
                  aria-hidden="true"
                />
              }
              label="Share Usage Data"
              description="Allow SmartBudget to use product usage information to improve features and reliability."
              checked={shareUsageData}
              disabled={isBusy}
              onChange={(value) =>
                updatePreference(
                  "privacy.shareUsageData",
                  value
                )
              }
            />
          </SettingsSection>
        </div>

        {/* ===========================================================
            FOOTER / SAVE AREA
        =========================================================== */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-6 pt-5
            border-slate-100 border-t
            gap-4
          "
        >
          <div
            className="
              flex items-start
              text-slate-500 text-xs
              gap-2
            "
          >
            <ShieldCheck
              size={16}
              className="
                mt-0.5
                text-emerald-600
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <span>
              Your preferences are securely
              synchronized with your account.
            </span>
          </div>

          <div
            className="
              flex flex-col sm:flex-row
              w-full sm:w-auto
              gap-2
            "
          >
            <button
              type="button"
              onClick={handleReset}
              disabled={isBusy}
              className="
                inline-flex justify-center items-center
                h-11
                px-5
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-2xl focus:outline-none
                focus:ring-2 focus:ring-slate-200
                disabled:opacity-60 transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <Undo2
                size={16}
                aria-hidden="true"
              />

              {resetting
                ? "Resetting..."
                : "Reset"}
            </button>

            <button
              type="button"
              onClick={handleDiscard}
              disabled={
                !isDirty ||
                isBusy
              }
              className="
                inline-flex justify-center items-center
                h-11
                px-5
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-2xl focus:outline-none
                focus:ring-2 focus:ring-slate-200
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <Undo2
                size={16}
                aria-hidden="true"
              />

              Discard
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                !isDirty ||
                isBusy
              }
              className="
                inline-flex justify-center items-center
                w-full sm:w-auto h-11
                px-6
                font-semibold text-white text-sm
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-200
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <Save
                size={17}
                aria-hidden="true"
              />

              {saving
                ? "Saving..."
                : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreferenceSettings;
