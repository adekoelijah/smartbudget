/**
 * SavingPlanStrategyBadge.jsx
 *
 * Production-ready strategy badge for SmartSave saving plans.
 *
 * Responsibilities:
 * - Display the saving strategy consistently.
 * - Normalize common strategy value variations.
 * - Provide accessible labels and tooltips.
 * - Support compact and standard sizes.
 * - Allow optional icons.
 *
 * This component must remain:
 * - Presentational
 * - Side-effect free
 * - API independent
 * - State independent
 * - Safe to render with incomplete backend data
 */

import {
  Gauge,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { memo, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/* Strategy configuration                                                     */
/* -------------------------------------------------------------------------- */

const STRATEGY_CONFIG = {
  conservative: {
    label: "Conservative",
    description:
      "A lower-risk strategy focused on steady and controlled saving.",
    icon: ShieldCheck,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-600",
  },

  balanced: {
    label: "Balanced",
    description:
      "A balanced approach between saving stability and growth.",
    icon: Gauge,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    iconClassName: "text-blue-600",
  },

  aggressive: {
    label: "Aggressive",
    description:
      "A higher-intensity strategy designed to accelerate saving progress.",
    icon: TrendingUp,
    className:
      "border-orange-200 bg-orange-50 text-orange-700",
    iconClassName: "text-orange-600",
  },

  flexible: {
    label: "Flexible",
    description:
      "A flexible saving approach that can adapt to changing circumstances.",
    icon: Sparkles,
    className:
      "border-violet-200 bg-violet-50 text-violet-700",
    iconClassName: "text-violet-600",
  },

  standard: {
    label: "Standard",
    description:
      "A standard saving strategy.",
    icon: Gauge,
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
    iconClassName: "text-slate-600",
  },

  default: {
    label: "Standard",
    description:
      "A standard saving strategy.",
    icon: Gauge,
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
    iconClassName: "text-slate-600",
  },
};

/* -------------------------------------------------------------------------- */
/* Size configuration                                                         */
/* -------------------------------------------------------------------------- */

const SIZE_CONFIG = {
  sm: {
    container:
      "min-h-6 gap-1 px-2 py-0.5 text-[11px]",
    icon: "h-3 w-3",
  },

  md: {
    container:
      "min-h-7 gap-1.5 px-2.5 py-1 text-xs",
    icon: "h-3.5 w-3.5",
  },

  lg: {
    container:
      "min-h-8 gap-2 px-3 py-1.5 text-sm",
    icon: "h-4 w-4",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Normalize strategy values coming from different API/UI representations.
 *
 * Examples:
 * "Conservative"      -> "conservative"
 * "CONSERVATIVE"      -> "conservative"
 * "conservative-risk" -> "conservative"
 * "balanced_strategy" -> "balanced"
 */
const normalizeStrategy = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (!normalized) {
    return "";
  }

  if (
    normalized === "conservative" ||
    normalized.includes("conservative")
  ) {
    return "conservative";
  }

  if (
    normalized === "balanced" ||
    normalized.includes("balanced")
  ) {
    return "balanced";
  }

  if (
    normalized === "aggressive" ||
    normalized.includes("aggressive")
  ) {
    return "aggressive";
  }

  if (
    normalized === "flexible" ||
    normalized.includes("flexible")
  ) {
    return "flexible";
  }

  if (
    normalized === "standard" ||
    normalized.includes("standard")
  ) {
    return "standard";
  }

  return normalized;
};

/**
 * Extract the strategy from either:
 * - an explicit strategy prop
 * - a saving plan object
 */
const resolveStrategy = (plan, strategy) => {
  if (strategy !== null && strategy !== undefined) {
    return strategy;
  }

  if (!plan || typeof plan !== "object") {
    return "";
  }

  return (
    plan.strategy ??
    plan.savingStrategy ??
    plan.planStrategy ??
    plan.type ??
    ""
  );
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const SavingPlanStrategyBadge = ({
  plan = null,
  strategy = null,
  size = "md",
  showIcon = true,
  showLabel = true,
  className = "",
  title = null,
}) => {
  const normalizedStrategy = useMemo(
    () =>
      normalizeStrategy(
        resolveStrategy(plan, strategy),
      ),
    [plan, strategy],
  );

  const strategyConfig = useMemo(
    () =>
      STRATEGY_CONFIG[normalizedStrategy] ??
      STRATEGY_CONFIG.default,
    [normalizedStrategy],
  );

  const sizeConfig =
    SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  const Icon = strategyConfig.icon;

  const accessibleLabel =
    title ||
    `${strategyConfig.label} saving strategy`;

  const badgeClassName = [
    "inline-flex",
    "w-fit",
    "items-center",
    "justify-center",
    "rounded-full",
    "border",
    "font-semibold",
    "leading-none",
    "whitespace-nowrap",
    "transition-colors",
    "select-none",
    sizeConfig.container,
    strategyConfig.className,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={badgeClassName}
      role="status"
      aria-label={accessibleLabel}
      title={
        title ||
        strategyConfig.description
      }
    >
      {showIcon ? (
        <Icon
          aria-hidden="true"
          className={[
            "shrink-0",
            sizeConfig.icon,
            strategyConfig.iconClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}

      {showLabel ? (
        <span>
          {strategyConfig.label}
        </span>
      ) : null}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export default memo(
  SavingPlanStrategyBadge,
);