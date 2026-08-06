/*
==================================================
NOTIFICATION CONFIGURATION
==================================================

Single source of truth for:

• Notification labels
• Descriptions
• Display order
• Default values

==================================================
*/

export const NOTIFICATION_CONFIG = {
  financial: {
    title: "Financial Alerts",

    description:
      "Stay informed about your budgets, spending, savings, and financial goals.",

    items: {
      spendingAlerts: {
        label: "Spending Alerts",

        description:
          "Receive an alert when your spending exceeds your planned budget.",

        defaultValue: true,
      },

      budgetWarnings: {
        label: "Budget Warnings",

        description:
          "Get notified before you reach your budget limit.",

        defaultValue: true,
      },

      billReminders: {
        label: "Bill Reminders",

        description:
          "Receive reminders before recurring bills become due.",

        defaultValue: true,
      },

      goalMilestones: {
        label: "Savings Goal Milestones",

        description:
          "Celebrate progress whenever you reach a savings milestone.",

        defaultValue: true,
      },

      weeklySummary: {
        label: "Weekly Financial Summary",

        description:
          "Receive a weekly overview of your income, expenses, and savings.",

        defaultValue: true,
      },
    },
  },

  security: {
    title: "Security Alerts",

    description:
      "Important notifications that help protect your SmartBudget account.",

    items: {
      newLogin: {
        label: "New Device Login",

        description:
          "Receive an alert whenever your account is accessed from a new device.",

        defaultValue: true,
      },

      passwordChanges: {
        label: "Password Changes",

        description:
          "Be notified whenever your account password is updated.",

        defaultValue: true,
      },

      profileChanges: {
        label: "Profile Changes",

        description:
          "Receive a notification whenever important profile information changes.",

        defaultValue: true,
      },

      suspiciousActivity: {
        label: "Suspicious Activity",

        description:
          "Get immediate alerts about unusual or potentially fraudulent activity.",

        defaultValue: true,
      },
    },
  },

  communication: {
    title: "Communication Preferences",

    description:
      "Manage product announcements and marketing communications.",

    items: {
      productUpdates: {
        label: "Product Updates",

        description:
          "Receive information about new SmartBudget features and improvements.",

        defaultValue: false,
      },

      promotions: {
        label: "Special Offers",

        description:
          "Receive promotional offers, discounts, and exclusive campaigns.",

        defaultValue: false,
      },
    },
  },

  channels: {
    title: "Notification Channels",

    description:
      "Choose how SmartBudget delivers notifications.",

    items: {
      email: {
        label: "Email",

        description:
          "Receive notifications through your registered email address.",

        defaultValue: true,
      },

      push: {
        label: "Push Notifications",

        description:
          "Receive notifications directly on supported devices.",

        defaultValue: true,
      },

      sms: {
        label: "SMS",

        description:
          "Receive important notifications via text message.",

        defaultValue: false,
      },
    },
  },
};

/*
==================================================
DEFAULT SETTINGS
==================================================
*/

export const DEFAULT_NOTIFICATION_SETTINGS =
  Object.entries(NOTIFICATION_CONFIG).reduce(
    (sections, [sectionKey, section]) => {
      sections[sectionKey] = {};

      Object.entries(section.items).forEach(
        ([key, item]) => {
          sections[sectionKey][key] =
            item.defaultValue;
        }
      );

      return sections;
    },
    {}
  );

/*
==================================================
HELPERS
==================================================
*/

export const getNotificationMeta = (
  section,
  key
) => {
  return (
    NOTIFICATION_CONFIG?.[section]?.items?.[key] ?? {
      label: key,
      description: "",
      defaultValue: false,
    }
  );
};

export const getNotificationSection = (
  section
) => {
  return NOTIFICATION_CONFIG?.[section] ?? null;
};

export const getNotificationSections = () =>
  Object.keys(NOTIFICATION_CONFIG);