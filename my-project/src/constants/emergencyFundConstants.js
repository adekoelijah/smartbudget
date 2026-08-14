export const EMERGENCY_FUND_DEFAULTS = Object.freeze({
  targetMonths: 6,
  minimumTargetMonths: 3,
  maximumTargetMonths: 12,
  currency: "NGN",
});

export const EMERGENCY_FUND_HEALTH_CONFIG =
  Object.freeze({
    critical: {
      label: "Critical",
      description:
        "Your emergency fund needs immediate attention.",
    },

    low: {
      label: "Low",
      description:
        "Your emergency fund is below a comfortable safety buffer.",
    },

    fair: {
      label: "Fair",
      description:
        "Your emergency fund is growing but needs more coverage.",
    },

    healthy: {
      label: "Healthy",
      description:
        "Your emergency fund provides a solid financial buffer.",
    },

    strong: {
      label: "Strong",
      description:
        "Your emergency fund has reached its recommended target.",
    },
  });


  
/* ============================================================
   EMERGENCY FUND STATUS
============================================================ */

export const EMERGENCY_FUND_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ARCHIVED: "archived",
});



export const EMERGENCY_FUND_STATUS_CONFIG =
  Object.freeze({
    not_started: {
      label: "Needs attention",
    },

    building: {
      label: "Building",
    },

    healthy: {
      label: "Healthy",
    },

    complete: {
      label: "Target reached",
    },
  });