// components/.../SavingPlanStatusBadge.jsx

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import {
  memo,
  useMemo,
} from "react";

import {
  getSavingPlanStatus,
} from "../../../../utils/smartSave/savingPlanHelpers";

import {
  formatSavingPlanStatus,
} from "../../../../utils/smartSave/savingPlanFormatters";

/**
 * SavingPlanStatusBadge
 *
 * Presentational status badge for a saving plan.
 *
 * Responsibilities:
 * - Normalize saving-plan status
 * - Display a consistent status label
 * - Display an appropriate status icon
 * - Provide accessible status information
 *
 * This component intentionally does NOT:
 * - Fetch data
 * - Call APIs
 * - Update state
 * - Use effects
 * - Perform financial calculations
 * - Perform status mutations
 */

const STATUS_CONFIG = Object.freeze({
  active: {
    label: "Active",
    icon: PlayCircle,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-600",
  },

  in_progress: {
    label: "In progress",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    iconClassName: "text-blue-600",
  },

  "in-progress": {
    label: "In progress",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    iconClassName: "text-blue-600",
  },

  ongoing: {
    label: "Ongoing",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    iconClassName: "text-blue-600",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-600",
  },

  complete: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-600",
  },

  achieved: {
    label: "Achieved",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-600",
  },

  paused: {
    label: "Paused",
    icon: PauseCircle,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    iconClassName: "text-amber-600",
  },

  pause: {
    label: "Paused",
    icon: PauseCircle,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    iconClassName: "text-amber-600",
  },

  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
    iconClassName: "text-slate-500",
  },

  canceled: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
    iconClassName: "text-slate-500",
  },

  failed: {
    label: "Failed",
    icon: AlertCircle,
    className:
      "border-red-200 bg-red-50 text-red-700",
    iconClassName: "text-red-600",
  },

  draft: {
    label: "Draft",
    icon: Clock3,
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
    iconClassName: "text-slate-500",
  },

  pending: {
    label: "Pending",
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    iconClassName: "text-amber-600",
  },

  default: {
    label: "Unknown",
    icon: AlertCircle,
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
    iconClassName: "text-slate-500",
  },
});

const SIZE_CONFIG = Object.freeze({
  sm: {
    container:
      "gap-1 px-2 py-0.5 text-[11px]",
    icon: 13,
  },

  md: {
    container:
      "gap-1.5 px-2.5 py-1 text-xs",
    icon: 14,
  },

  lg: {
    container:
      "gap-1.5 px-3 py-1.5 text-sm",
    icon: 16,
  },
});

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

const normalizeStatus = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const resolveStatus = (plan, status) => {
  if (status !== undefined) {
    return normalizeStatus(status);
  }

  return normalizeStatus(
    getSavingPlanStatus(plan),
  );
};

const SavingPlanStatusBadge = ({
  plan = null,
  status,

  size = "md",

  showIcon = true,
  showLabel = true,

  title,
  className = "",

  testId = "saving-plan-status-badge",
}) => {
  const normalizedStatus = useMemo(
    () =>
      resolveStatus(
        plan,
        status,
      ),
    [plan, status],
  );

  const config = useMemo(
    () =>
      STATUS_CONFIG[
        normalizedStatus
      ] ??
      STATUS_CONFIG.default,
    [normalizedStatus],
  );

  const sizeConfig =
    SIZE_CONFIG[size] ??
    SIZE_CONFIG.md;

  const Icon = config.icon;

  const formattedStatus = useMemo(
    () => {
      /*
       * Prefer the explicitly defined UI label for
       * known statuses. The formatter is used as a
       * fallback so the component remains compatible
       * with the shared formatting layer.
       */
      if (
        STATUS_CONFIG[
          normalizedStatus
        ]
      ) {
        return config.label;
      }

      const formatted =
        formatSavingPlanStatus(
          normalizedStatus,
        );

      return formatted || config.label;
    },
    [
      config.label,
      normalizedStatus,
    ],
  );

  const accessibleLabel =
    title ||
    `Saving plan status: ${formattedStatus}`;

  /*
   * If neither the icon nor label is requested,
   * there is nothing meaningful to render.
   */
  if (!showIcon && !showLabel) {
    return null;
  }

  return (
    <span
      data-testid={testId}
      role="status"
      aria-label={accessibleLabel}
      title={title}
      className={cn(
        "inline-flex items-center shrink-0",
        "whitespace-nowrap rounded-full",
        "border font-semibold",
        "leading-none",
        "transition-colors duration-150",
        config.className,
        sizeConfig.container,
        className,
      )}
    >
      {showIcon && (
        <Icon
          size={sizeConfig.icon}
          strokeWidth={2}
          aria-hidden="true"
          className={cn(
            "shrink-0",
            config.iconClassName,
          )}
        />
      )}

      {showLabel && (
        <span>
          {formattedStatus}
        </span>
      )}
    </span>
  );
};

SavingPlanStatusBadge.displayName =
  "SavingPlanStatusBadge";

export default memo(
  SavingPlanStatusBadge,
);