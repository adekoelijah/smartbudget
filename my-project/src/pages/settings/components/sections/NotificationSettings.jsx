
import {
  Bell,
  ShieldCheck,
  WalletCards,
  MessageSquare,
  Smartphone,
  Mail,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import SectionCard from "./components/SectionCard";
import NotificationGroup from "./components/NotificationGroup";

import {
  useNotifications,
} from "../../../../context/NotificationContext";


/*
==================================================
DEFAULT NOTIFICATION SETTINGS
==================================================
*/

const DEFAULT_NOTIFICATION_SETTINGS = {
  financial: {
    spendingAlerts: true,
    budgetWarnings: true,
    billReminders: true,
    goalMilestones: true,
    weeklySummary: true,
  },

  security: {
    newLogin: true,
    passwordChanges: true,
    profileChanges: true,
    suspiciousActivity: true,
  },

  communication: {
    productUpdates: false,
    promotions: false,
  },

  channels: {
    email: true,
    push: true,
    sms: false,
  },
};


/*
==================================================
UTILITY
==================================================
*/

const cloneSettings = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};


/*
==================================================
COMPONENT
==================================================
*/

const NotificationSettings = () => {
  /*
  ==================================================
  NOTIFICATION CONTEXT
  ==================================================
  */

  const {
    notificationSettings,
    updateNotificationSettings,
    loading,
    error,
  } = useNotifications();


  /*
  ==================================================
  NORMALIZE SETTINGS
  ==================================================
  */

  const initialSettings = useMemo(() => {
    if (!notificationSettings) {
      return cloneSettings(
        DEFAULT_NOTIFICATION_SETTINGS
      );
    }

    return {
      ...cloneSettings(
        DEFAULT_NOTIFICATION_SETTINGS
      ),

      ...cloneSettings(
        notificationSettings
      ),

      financial: {
        ...DEFAULT_NOTIFICATION_SETTINGS.financial,
        ...(notificationSettings.financial || {}),
      },

      security: {
        ...DEFAULT_NOTIFICATION_SETTINGS.security,
        ...(notificationSettings.security || {}),
      },

      communication: {
        ...DEFAULT_NOTIFICATION_SETTINGS.communication,
        ...(notificationSettings.communication || {}),
      },

      channels: {
        ...DEFAULT_NOTIFICATION_SETTINGS.channels,
        ...(notificationSettings.channels || {}),
      },
    };
  }, [
    notificationSettings,
  ]);


  /*
  ==================================================
  LOCAL SETTINGS
  ==================================================
  */

  const [
    settings,
    setSettings,
  ] = useState(
    () =>
      cloneSettings(
        initialSettings
      )
  );


  /*
  ==================================================
  SAVE STATE
  ==================================================
  */

  const [
    saving,
    setSaving,
  ] = useState(false);


  /*
  ==================================================
  SUCCESS STATE
  ==================================================
  */

  const [
    success,
    setSuccess,
  ] = useState(false);


  /*
  ==================================================
  SYNC CONTEXT → LOCAL STATE
  ==================================================
  */

  useEffect(() => {
    setSettings(
      cloneSettings(
        initialSettings
      )
    );

    setSuccess(false);
  }, [
    initialSettings,
  ]);


  /*
  ==================================================
  CHANGE DETECTION
  ==================================================
  */

  const hasChanges =
    JSON.stringify(settings) !==
    JSON.stringify(initialSettings);


  /*
  ==================================================
  UPDATE SETTING
  ==================================================
  */

  const updateSetting = (
    section,
    key,
    value
  ) => {
    setSuccess(false);

    setSettings((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],

        [key]:
          typeof value === "boolean"
            ? value
            : !previous[section]?.[key],
      },
    }));
  };


  /*
  ==================================================
  SAVE SETTINGS
  ==================================================
  */

  const handleSave = async () => {
    if (!hasChanges || saving) {
      return;
    }

    try {
      setSaving(true);
      setSuccess(false);

      await updateNotificationSettings(
        cloneSettings(settings)
      );

      setSuccess(true);
    } catch (saveError) {
      console.error(
        "NOTIFICATION_SETTINGS_SAVE_ERROR:",
        saveError
      );
    } finally {
      setSaving(false);
    }
  };


  /*
  ==================================================
  RESET SETTINGS
  ==================================================
  */

  const handleReset = () => {
    if (saving) {
      return;
    }

    setSettings(
      cloneSettings(
        initialSettings
      )
    );

    setSuccess(false);
  };


  /*
  ==================================================
  LOADING STATE
  ==================================================
  */

  if (loading && !notificationSettings) {
    return (
      <SectionCard
        icon={<Bell size={22} />}
        title="Notification Preferences"
        description="Loading your notification preferences..."
      >
        <div
          className="
            space-y-3
          "
        >
          <div
            className="
              w-full h-14
              bg-slate-100
              rounded-xl
              animate-pulse
            "
            /
          >
          <div
            className="
              w-full h-14
              bg-slate-100
              rounded-xl
              animate-pulse
            "
            /
          >
          <div
            className="
              w-full h-14
              bg-slate-100
              rounded-xl
              animate-pulse
            "
            /
          >
        </div>
      </SectionCard>
    );
  }


  /*
  ==================================================
  RENDER
  ==================================================
  */

  return (
    <div
      className="
        space-y-6
      "
    >

      {/* =========================================
          HEADER
      ========================================= */}

      <SectionCard
        icon={<Bell size={22} />}
        title="Notification Preferences"
        description="Control how SmartBudget communicates with you about transactions, security, budgets, and account activity.">
        <div
          className="
            text-slate-500 text-sm
          "
        >
          Choose which notifications you want to
          receive and where you want to receive them.
        </div>
      </SectionCard>


      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div
          role="alert"
          className="
            p-4
            text-red-700 text-sm
            bg-red-50
            border border-red-200 rounded-2xl
          "
        >
          {typeof error === "string"
            ? error
            : error?.message ||
              "Unable to load notification preferences."}
        </div>
      )}


      {/* =========================================
          SUCCESS
      ========================================= */}

      {success && (
        <div
          role="status"
          className="
            p-4
            text-green-700 text-sm
            bg-green-50
            border border-green-200 rounded-2xl
          "
        >
          Notification preferences updated successfully.
        </div>
      )}


      {/* =========================================
          FINANCIAL ALERTS
      ========================================= */}

      <NotificationGroup
        title="Financial Alerts"
        description="Receive important updates about your money activity."
        icon={<WalletCards size={20} />}
        section="financial"
        settings={settings.financial}
        onToggle={updateSetting}
      />


      {/* =========================================
          SECURITY
      ========================================= */}

      <NotificationGroup
        title="Security Notifications"
        description="Protect your account with important security alerts."
        icon={<ShieldCheck size={20} />}
        section="security"
        settings={settings.security}
        onToggle={updateSetting}
      />


      {/* =========================================
          COMMUNICATION
      ========================================= */}

      <NotificationGroup
        title="Communication Preferences"
        description="Manage SmartBudget updates and product information."
        icon={<MessageSquare size={20} />}
        section="communication"
        settings={settings.communication}
        onToggle={updateSetting}
      />


      {/* =========================================
          DELIVERY CHANNELS
      ========================================= */}

      <NotificationGroup
        title="Delivery Channels"
        description="Choose where you want to receive notifications."
        icon={<Smartphone size={20} />}
        section="channels"
        settings={settings.channels}
        onToggle={updateSetting}
      />


      {/* =========================================
          SAVE BAR
      ========================================= */}

      {hasChanges && (
        <div
          className="
            bottom-4 z-20 sticky flex flex-col sm:flex-row justify-between
            items-start sm:items-center
            p-4
            bg-white
            border border-slate-200 rounded-2xl
            shadow-lg
            gap-4
          "
        >

          <div>
            <p
              className="
                font-semibold text-slate-900 text-sm
              "
            >
              Unsaved changes
            </p>

            <p
              className="
                mt-1
                text-slate-500 text-xs
              "
            >
              Save your notification preferences before
              leaving this page.
            </p>
          </div>


          <div
            className="
              flex items-center
              w-full sm:w-auto
              gap-3
            "
          >

            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="
                inline-flex justify-center items-center
                w-full sm:w-auto
                px-5 py-3
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-xl
                disabled:opacity-50 transition
                gap-2
              "
            >
              <span>Reset</span>
            </button>


            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="
                inline-flex justify-center items-center
                w-full sm:w-auto
                px-5 py-3
                font-semibold text-white text-sm
                bg-slate-900 hover:bg-slate-800
                rounded-xl
                disabled:opacity-50 transition
                gap-2
              "
            >
              {saving ? (
                <>
                  <span
                    className="
                      w-4 h-4
                      border-2 border-white/30 border-t-white rounded-full
                      animate-spin
                    "
                    /
                  >

                  <span>
                    Saving...
                  </span>
                </>
              ) : (
                <>
                  <Mail size={17} />

                  <span>
                    Save Preferences
                  </span>
                </>
              )}
            </button>

          </div>

        </div>
      )}

    </div>
  );
};


export default NotificationSettings;
