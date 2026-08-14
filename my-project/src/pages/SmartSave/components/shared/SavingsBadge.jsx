
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  Flame,
  Info,
  PauseCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  SAVINGS_STATUS,
  SAVINGS_INSIGHT_TYPES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE CONFIGURATION
========================================================= */

import {
  SMART_SAVE_STRATEGY_CONFIG,
} from "../../../../config/smartSaveConfig";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  normalizeSavingsStatus,
} from "../../../../utils/smartSave/savingsNormalizers";

/* =========================================================
   SAFE FALLBACKS
========================================================= */

const STATUS = {
  ACTIVE:
    SAVINGS_STATUS?.ACTIVE ??
    "active",

  INACTIVE:
    SAVINGS_STATUS?.INACTIVE ??
    "inactive",

  PAUSED:
    SAVINGS_STATUS?.PAUSED ??
    "paused",

  COMPLETED:
    SAVINGS_STATUS?.COMPLETED ??
    "completed",

  CANCELLED:
    SAVINGS_STATUS?.CANCELLED ??
    "cancelled",

  PENDING:
    SAVINGS_STATUS?.PENDING ??
    "pending",

  DRAFT:
    SAVINGS_STATUS?.DRAFT ??
    "draft",

  FAILED:
    SAVINGS_STATUS?.FAILED ??
    "failed",

  SUCCESS:
    SAVINGS_STATUS?.SUCCESS ??
    "success",

  UPCOMING:
    SAVINGS_STATUS?.UPCOMING ??
    "upcoming",

  EXPIRED:
    SAVINGS_STATUS?.EXPIRED ??
    "expired",
};

/* =========================================================
   INSIGHT TYPES
========================================================= */

const INSIGHT_TYPES = {
  GOAL:
    SAVINGS_INSIGHT_TYPES?.GOAL ??
    "goal",

  PROGRESS:
    SAVINGS_INSIGHT_TYPES?.PROGRESS ??
    "progress",

  RISK:
    SAVINGS_INSIGHT_TYPES?.RISK ??
    "risk",

  OPPORTUNITY:
    SAVINGS_INSIGHT_TYPES?.OPPORTUNITY ??
    "opportunity",

  RECOMMENDATION:
    SAVINGS_INSIGHT_TYPES?.RECOMMENDATION ??
    "recommendation",
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const resolveStatus = (value) => {
  const normalized =
    normalizeValue(value);

  if (!normalized) {
    return "neutral";
  }

  /*
   * Prefer the project's normalizer when available.
   * The local fallback keeps this primitive resilient
   * when a status comes from a legacy or custom source.
   */
  try {
    if (
      typeof normalizeSavingsStatus ===
      "function"
    ) {
      const result =
        normalizeSavingsStatus(
          value
        );

      if (
        typeof result ===
        "string"
      ) {
        return normalizeValue(
          result
        );
      }
    }
  } catch {
    // Fall through to local normalization.
  }

  return normalized;
};

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    tone:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconTone:
      "text-emerald-600",
  },

  inactive: {
    label: "Inactive",
    icon: Circle,
    tone:
      "border-slate-200 bg-slate-50 text-slate-600",
    iconTone:
      "text-slate-500",
  },

  paused: {
    label: "Paused",
    icon: PauseCircle,
    tone:
      "border-amber-200 bg-amber-50 text-amber-700",
    iconTone:
      "text-amber-600",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    tone:
      "border-blue-200 bg-blue-50 text-blue-700",
    iconTone:
      "text-blue-600",
  },

  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    tone:
      "border-slate-200 bg-slate-100 text-slate-600",
    iconTone:
      "text-slate-500",
  },

  pending: {
    label: "Pending",
    icon: Clock3,
    tone:
      "border-amber-200 bg-amber-50 text-amber-700",
    iconTone:
      "text-amber-600",
  },

  draft: {
    label: "Draft",
    icon: Circle,
    tone:
      "border-slate-200 bg-slate-50 text-slate-600",
    iconTone:
      "text-slate-500",
  },

  failed: {
    label: "Failed",
    icon: AlertCircle,
    tone:
      "border-red-200 bg-red-50 text-red-700",
    iconTone:
      "text-red-600",
  },

  success: {
    label: "Successful",
    icon: CheckCircle2,
    tone:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconTone:
      "text-emerald-600",
  },

  upcoming: {
    label: "Upcoming",
    icon: Clock3,
    tone:
      "border-indigo-200 bg-indigo-50 text-indigo-700",
    iconTone:
      "text-indigo-600",
  },

  expired: {
    label: "Expired",
    icon: Clock3,
    tone:
      "border-slate-200 bg-slate-100 text-slate-600",
    iconTone:
      "text-slate-500",
  },

  goal: {
    label: "Goal",
    icon: Target,
    tone:
      "border-blue-200 bg-blue-50 text-blue-700",
    iconTone:
      "text-blue-600",
  },

  progress: {
    label: "Progress",
    icon: TrendingUp,
    tone:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconTone:
      "text-emerald-600",
  },

  risk: {
    label: "Risk",
    icon: ShieldCheck,
    tone:
      "border-red-200 bg-red-50 text-red-700",
    iconTone:
      "text-red-600",
  },

  opportunity: {
    label: "Opportunity",
    icon: Sparkles,
    tone:
      "border-violet-200 bg-violet-50 text-violet-700",
    iconTone:
      "text-violet-600",
  },

  recommendation: {
    label: "Recommendation",
    icon: Zap,
    tone:
      "border-cyan-200 bg-cyan-50 text-cyan-700",
    iconTone:
      "text-cyan-600",
  },

  neutral: {
    label: "Status",
    icon: Info,
    tone:
      "border-slate-200 bg-slate-50 text-slate-600",
    iconTone:
      "text-slate-500",
  },
};

/* =========================================================
   SPECIAL BADGE TYPES
========================================================= */

const SPECIAL_CONFIG = {
  challenge: {
    label: "Challenge",
    icon: Trophy,
    tone:
      "border-violet-200 bg-violet-50 text-violet-700",
    iconTone:
      "text-violet-600",
  },

  streak: {
    label: "Streak",
    icon: Flame,
    tone:
      "border-orange-200 bg-orange-50 text-orange-700",
    iconTone:
      "text-orange-600",
  },

  automated: {
    label: "Automated",
    icon: Zap,
    tone:
      "border-indigo-200 bg-indigo-50 text-indigo-700",
    iconTone:
      "text-indigo-600",
  },

  saving: {
    label: "Saving",
    icon: PiggyBankIcon,
    tone:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconTone:
      "text-emerald-600",
  },
};

/* =========================================================
   ICON FALLBACK
========================================================= */

function PiggyBankIcon({
  size = 14,
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 5.5A4.5 4.5 0 0 0 14.5 1H11a7 7 0 0 0-7 7v4a7 7 0 0 0 7 7h4a5 5 0 0 0 5-5v-1" />
      <path d="M4 10H2v5h3" />
      <path d="M19 9h2a2 2 0 0 1 2 2v1h-4" />
      <path d="M8 8h.01" />
      <path d="M13 13h.01" />
      <path d="M17 5h2" />
    </svg>
  );
}

/* =========================================================
   SIZE CONFIGURATION
========================================================= */

const SIZE_CONFIG = {
  xs: {
    wrapper:
      "min-h-5 px-1.5 text-[10px]",
    icon: 10,
    gap: "gap-1",
  },

  sm: {
    wrapper:
      "min-h-6 px-2 text-[11px]",
    icon: 12,
    gap: "gap-1",
  },

  md: {
    wrapper:
      "min-h-7 px-2.5 text-xs",
    icon: 14,
    gap: "gap-1.5",
  },

  lg: {
    wrapper:
      "min-h-8 px-3 text-sm",
    icon: 15,
    gap: "gap-1.5",
  },
};

/* =========================================================
   VARIANT CONFIGURATION
========================================================= */

const VARIANT_CLASSES = {
  solid: {
    base: "",
  },

  subtle: {
    base: "",
  },

  outline: {
    base:
      "bg-transparent",
  },

  dot: {
    base:
      "border-transparent bg-transparent px-0",
  },
};

/* =========================================================
   LABEL RESOLUTION
========================================================= */

const humanize = (value) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};

const resolveConfig = ({
  status,
  type,
}) => {
  const normalizedStatus =
    resolveStatus(status);

  const normalizedType =
    normalizeValue(type);

  if (
    normalizedType &&
    STATUS_CONFIG[
      normalizedType
    ]
  ) {
    return {
      ...STATUS_CONFIG[
        normalizedType
      ],
      key: normalizedType,
    };
  }

  if (
    normalizedType &&
    SPECIAL_CONFIG[
      normalizedType
    ]
  ) {
    return {
      ...SPECIAL_CONFIG[
        normalizedType
      ],
      key: normalizedType,
    };
  }

  if (
    STATUS_CONFIG[
      normalizedStatus
    ]
  ) {
    return {
      ...STATUS_CONFIG[
        normalizedStatus
      ],
      key: normalizedStatus,
    };
  }

  return {
    ...STATUS_CONFIG.neutral,
    key: "neutral",
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsBadge = ({
  status,
  type,

  label,
  children,

  size = "md",
  variant = "subtle",

  icon,
  showIcon = true,

  dot = false,

  title,
  ariaLabel,

  className = "",
}) => {
  /* =======================================================
     CONFIG
  ======================================================= */

  const config =
    resolveConfig({
      status,
      type,
    });

  const sizeConfig =
    SIZE_CONFIG[size] ??
    SIZE_CONFIG.md;

  const variantConfig =
    VARIANT_CLASSES[
      variant
    ] ??
    VARIANT_CLASSES.subtle;

  const Icon =
    icon ??
    config.icon;

  /* =======================================================
     LABEL
  ======================================================= */

  const resolvedLabel =
    label ??
    children ??
    config.label ??
    humanize(type) ??
    humanize(status) ??
    SMART_SAVE_STRATEGY_CONFIG
      ?.defaultBadgeLabel ??
    "Status";

  /* =======================================================
     ACCESSIBILITY
  ======================================================= */

  const resolvedAriaLabel =
    ariaLabel ??
    String(resolvedLabel);

  /* =======================================================
     DOT MODE
  ======================================================= */

  if (dot) {
    return (
      <span
        title={
          title ??
          resolvedLabel
        }
        aria-label={
          resolvedAriaLabel
        }
        className={`
          inline-flex
          items-center
          gap-1.5
          text-xs
          font-semibold
          ${config.iconTone}
          ${className}
        `}
      >
        <span
          className="
            w-1.5 h-1.5
            bg-current
            rounded-full
            shrink-0
          "
          aria-hidden="true"
        /
        >

        <span>
          {resolvedLabel}
        </span>
      </span>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <span
      title={title}
      aria-label={
        resolvedAriaLabel
      }
      className={`
        inline-flex
        w-fit
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        font-semibold
        leading-none
        ${sizeConfig.wrapper}
        ${sizeConfig.gap}
        ${config.tone}
        ${variantConfig.base}
        ${className}
      `}
    >
      {showIcon &&
        Icon && (
          <Icon
            size={
              sizeConfig.icon
            }
            strokeWidth={2}
            aria-hidden="true"
            className="
              shrink-0
            "
            /
          >
        )}

      <span
        className="
          whitespace-nowrap
        "
      >
        {resolvedLabel}
      </span>
    </span>
  );
};

export default SavingsBadge;
