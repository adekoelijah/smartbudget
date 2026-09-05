// components/.../SavingPlanEmptyState.js

import {
  ArrowRight,
  Plus,
  SearchX,
  Target,
} from "lucide-react";
import { memo, useCallback, useId } from "react";

/**
 * SavingPlanEmptyState
 *
 * Presentational empty state for the Saving Plans feature.
 *
 * Responsibilities:
 * - Explain why the plan list is empty
 * - Provide an optional primary action
 * - Support both "no plans" and "no search results" states
 * - Remain independent of API calls and business logic
 *
 * This component intentionally:
 * - Does not fetch data
 * - Does not mutate state internally
 * - Does not contain financial business logic
 * - Does not use effects
 * - Does not assume a specific parent layout
 */

const EMPTY_STATE_VARIANTS = Object.freeze({
  noPlans: {
    icon: Target,
    title: "No saving plans yet",
    description:
      "Create your first saving plan and start working toward a financial goal.",
    actionLabel: "Create saving plan",
  },

  noResults: {
    icon: SearchX,
    title: "No saving plans found",
    description:
      "We couldn't find any saving plans matching your current filters or search.",
    actionLabel: "Clear filters",
  },
});

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

/**
 * Resolves the empty-state configuration safely.
 */
const getVariantConfig = (variant) =>
  EMPTY_STATE_VARIANTS[variant] ??
  EMPTY_STATE_VARIANTS.noPlans;

/**
 * SavingPlanEmptyState
 */
const SavingPlanEmptyState = ({
  variant = "noPlans",
  title,
  description,
  actionLabel,
  onAction,
  actionIcon = null,
  showAction = true,
  disabled = false,
  loading = false,
  compact = false,
  className = "",
  testId = "saving-plan-empty-state",
}) => {
  const titleId = useId();
  const descriptionId = useId();

  const config = getVariantConfig(variant);

  const Icon = config.icon;

  const resolvedTitle =
    typeof title === "string" && title.trim()
      ? title.trim()
      : config.title;

  const resolvedDescription =
    typeof description === "string" && description.trim()
      ? description.trim()
      : config.description;

  const resolvedActionLabel =
    typeof actionLabel === "string" &&
    actionLabel.trim()
      ? actionLabel.trim()
      : config.actionLabel;

  const handleAction = useCallback(
    (event) => {
      if (
        disabled ||
        loading ||
        typeof onAction !== "function"
      ) {
        return;
      }

      onAction(event);
    },
    [disabled, loading, onAction],
  );

  const ActionIcon =
    actionIcon || (variant === "noResults" ? ArrowRight : Plus);

  const isActionDisabled =
    disabled ||
    loading ||
    typeof onAction !== "function";

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-testid={testId}
      className={cn(
        "flex justify-center items-center w-full",
        compact
          ? "min-h-[260px] px-4 py-8"
          : "min-h-[380px] px-4 py-12",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center mx-auto w-full max-w-xl text-center",
          compact ? "gap-4" : "gap-5",
        )}
      >
        {/* Icon */}
        <div
          aria-hidden="true"
          className={cn(
            "flex justify-center items-center rounded-2xl",
            "border border-slate-200 bg-slate-50",
            "shadow-sm",
            compact
              ? "h-14 w-14"
              : "h-16 w-16",
          )}
        >
          <Icon
            size={compact ? 26 : 30}
            strokeWidth={1.8}
            className="
              text-slate-500
            "
            /
          >
        </div>

        {/* Text */}
        <div
          className={cn(
            "flex flex-col items-center",
            compact ? "gap-2" : "gap-3",
          )}
        >
          <h2
            id={titleId}
            className={cn(
              "font-semibold text-slate-900 tracking-tight",
              compact
                ? "text-lg"
                : "text-xl sm:text-2xl",
            )}
          >
            {resolvedTitle}
          </h2>

          <p
            id={descriptionId}
            className={cn(
              "max-w-lg text-slate-500 leading-6",
              compact
                ? "text-sm"
                : "text-sm sm:text-base",
            )}
          >
            {resolvedDescription}
          </p>
        </div>

        {/* Action */}
        {showAction && (
          <button
            type="button"
            onClick={handleAction}
            disabled={isActionDisabled}
            aria-busy={loading || undefined}
            className={cn(
              "inline-flex justify-center items-center gap-2",
              "rounded-xl px-4 py-2.5",
              "text-sm font-semibold",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2",
              "focus-visible:ring-slate-900",
              "focus-visible:ring-offset-2",
              "bg-slate-900 text-white",
              "shadow-sm",
              "hover:bg-slate-800",
              "active:scale-[0.98]",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
              "disabled:hover:bg-slate-900",
              compact
                ? "mt-1"
                : "mt-2",
            )}
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="
                    w-4 h-4
                    border-2 border-white/30 border-t-white rounded-full
                    animate-spin
                  "
                  /
                >

                <span>
                  {variant === "noResults"
                    ? "Clearing..."
                    : "Creating..."}
                </span>
              </>
            ) : (
              <>
                <ActionIcon
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>{resolvedActionLabel}</span>
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
};

SavingPlanEmptyState.displayName =
  "SavingPlanEmptyState";

export default memo(SavingPlanEmptyState);