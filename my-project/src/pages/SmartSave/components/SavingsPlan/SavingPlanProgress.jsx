// components/.../SavingPlanProgress.js

import {
  CheckCircle2,
  Target,
} from "lucide-react";
import {
  memo,
  useId,
  useMemo,
} from "react";

import {
  getSavingPlanTargetAmount,
  getSavingPlanTargetDate,
  getSavingPlanName,
  isSavingPlanCompleted,
} from "../../../../utils/smartSave/savingPlanHelpers";

import {
  formatSavingPlanAmount,
  formatSavingPlanDate,
  formatSavingPlanProgress,
  formatSavingPlanRemainingDays,
} from "../../../../utils/smartSave/savingPlanFormatters";

/**
 * SavingPlanProgress
 *
 * Presentational progress component for a saving plan.
 *
 * Responsibilities:
 * - Display current progress
 * - Display target amount
 * - Display percentage completed
 * - Display remaining amount
 * - Display target date / remaining days
 * - Display completed state
 *
 * This component intentionally does NOT:
 * - Fetch data
 * - Call APIs
 * - Update parent state
 * - Use effects
 * - Perform financial business calculations
 *
 * Financial values should come from the backend or the
 * parent data layer. Any lightweight arithmetic here is
 * strictly for presentation fallback purposes.
 */

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

const clampPercentage = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, numericValue),
  );
};

const toFiniteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};

const getCurrentAmount = (plan) => {
  if (!plan || typeof plan !== "object") {
    return 0;
  }

  const candidates = [
    plan.currentAmount,
    plan.savedAmount,
    plan.amountSaved,
    plan.totalSaved,
    plan.progressAmount,
  ];

  for (const candidate of candidates) {
    const value = toFiniteNumber(candidate);

    if (value !== null) {
      return Math.max(0, value);
    }
  }

  return 0;
};

const getProgressValue = (
  plan,
  currentAmount,
  targetAmount,
) => {
  if (!plan || typeof plan !== "object") {
    return 0;
  }

  const explicitProgress =
    plan.progressPercentage ??
    plan.percentageComplete ??
    plan.progress;

  const normalizedExplicitProgress =
    toFiniteNumber(explicitProgress);

  if (normalizedExplicitProgress !== null) {
    return clampPercentage(
      normalizedExplicitProgress,
    );
  }

  if (
    targetAmount !== null &&
    targetAmount > 0
  ) {
    return clampPercentage(
      (currentAmount / targetAmount) * 100,
    );
  }

  return 0;
};

const SavingPlanProgress = ({
  plan = null,

  currentAmount,
  targetAmount,
  progress,

  currency,

  targetDate,

  showTargetAmount = true,
  showCurrentAmount = true,
  showRemainingAmount = true,
  showTargetDate = true,
  showRemainingDays = true,
  showPercentage = true,

  showHeader = true,
  showIcon = true,

  compact = false,
  completed = false,

  className = "",
  testId = "saving-plan-progress",
}) => {
  const progressId = useId();
  const progressLabelId = useId();

  const resolvedTargetAmount = useMemo(() => {
    const explicit =
      toFiniteNumber(targetAmount);

    if (explicit !== null) {
      return Math.max(0, explicit);
    }

    return getSavingPlanTargetAmount(plan);
  }, [plan, targetAmount]);

  const resolvedCurrentAmount = useMemo(() => {
    const explicit =
      toFiniteNumber(currentAmount);

    if (explicit !== null) {
      return Math.max(0, explicit);
    }

    return getCurrentAmount(plan);
  }, [currentAmount, plan]);

  const resolvedProgress = useMemo(() => {
    const explicit =
      toFiniteNumber(progress);

    if (explicit !== null) {
      return clampPercentage(explicit);
    }

    return getProgressValue(
      plan,
      resolvedCurrentAmount,
      resolvedTargetAmount,
    );
  }, [
    plan,
    progress,
    resolvedCurrentAmount,
    resolvedTargetAmount,
  ]);

  const resolvedCurrency = useMemo(() => {
    if (
      typeof currency === "string" &&
      currency.trim()
    ) {
      return currency.trim().toUpperCase();
    }

    if (
      plan &&
      typeof plan.currency === "string" &&
      plan.currency.trim()
    ) {
      return plan.currency.trim().toUpperCase();
    }

    return "NGN";
  }, [currency, plan]);

  const resolvedTargetDate = useMemo(() => {
    if (targetDate !== undefined) {
      return targetDate;
    }

    return getSavingPlanTargetDate(plan);
  }, [plan, targetDate]);

  const planName = useMemo(
    () => getSavingPlanName(plan),
    [plan],
  );

  const isPlanCompleted = useMemo(
    () => completed || isSavingPlanCompleted(plan),
    [completed, plan],
  );

  const remainingAmount = useMemo(() => {
    if (
      resolvedTargetAmount === null ||
      resolvedTargetAmount <= 0
    ) {
      return null;
    }

    return Math.max(
      0,
      resolvedTargetAmount -
        resolvedCurrentAmount,
    );
  }, [
    resolvedCurrentAmount,
    resolvedTargetAmount,
  ]);

  const formattedCurrentAmount = useMemo(
    () =>
      formatSavingPlanAmount(
        resolvedCurrentAmount,
        resolvedCurrency,
      ),
    [
      resolvedCurrentAmount,
      resolvedCurrency,
    ],
  );

  const formattedTargetAmount = useMemo(() => {
    if (
      resolvedTargetAmount === null ||
      resolvedTargetAmount <= 0
    ) {
      return null;
    }

    return formatSavingPlanAmount(
      resolvedTargetAmount,
      resolvedCurrency,
    );
  }, [
    resolvedTargetAmount,
    resolvedCurrency,
  ]);

  const formattedRemainingAmount = useMemo(() => {
    if (remainingAmount === null) {
      return null;
    }

    return formatSavingPlanAmount(
      remainingAmount,
      resolvedCurrency,
    );
  }, [
    remainingAmount,
    resolvedCurrency,
  ]);

  const formattedProgress = useMemo(
    () =>
      formatSavingPlanProgress(
        resolvedProgress,
      ),
    [resolvedProgress],
  );

  const formattedTargetDate = useMemo(() => {
    if (!resolvedTargetDate) {
      return null;
    }

    return formatSavingPlanDate(
      resolvedTargetDate,
    );
  }, [resolvedTargetDate]);

  const formattedRemainingDays = useMemo(() => {
    if (!resolvedTargetDate) {
      return null;
    }

    return formatSavingPlanRemainingDays(
      resolvedTargetDate,
    );
  }, [resolvedTargetDate]);

  const progressWidth = `${resolvedProgress}%`;

  const progressLabel =
    `${formattedProgress} completed`;

  const accessibleLabel = planName
    ? `${planName}: ${progressLabel}`
    : progressLabel;

  return (
    <section
      data-testid={testId}
      aria-labelledby={progressLabelId}
      className={cn(
        "w-full",
        className,
      )}
    >
      {showHeader && (
        <div
          className={cn(
            "flex justify-between items-start gap-4 mb-4",
          )}
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-3
            "
          >
            {showIcon && (
              <div
                aria-hidden="true"
                className={cn(
                  "flex justify-center items-center rounded-xl shrink-0",
                  isPlanCompleted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-600",
                  compact
                    ? "h-9 w-9"
                    : "h-10 w-10",
                )}
              >
                {isPlanCompleted ? (
                  <CheckCircle2
                    size={compact ? 18 : 20}
                    strokeWidth={2}
                  />
                ) : (
                  <Target
                    size={compact ? 18 : 20}
                    strokeWidth={2}
                  />
                )}
              </div>
            )}

            <div
              className="
                min-w-0
              "
            >
              <h3
                id={progressLabelId}
                className={cn(
                  "font-semibold text-slate-900 truncate",
                  compact
                    ? "text-sm"
                    : "text-base",
                )}
              >
                {isPlanCompleted
                  ? "Plan completed"
                  : "Saving progress"}
              </h3>

              {!compact && planName && (
                <p
                  className="
                    mt-0.5
                    text-slate-500 text-xs truncate
                  "
                >
                  {planName}
                </p>
              )}
            </div>
          </div>

          {showPercentage && (
            <span
              className={cn(
                "font-semibold shrink-0",
                isPlanCompleted
                  ? "text-emerald-600"
                  : "text-slate-900",
                compact
                  ? "text-sm"
                  : "text-base",
              )}
            >
              {formattedProgress}
            </span>
          )}
        </div>
      )}

      {/* Accessible progress indicator */}
      <div
        id={progressId}
        role="progressbar"
        aria-label={accessibleLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={resolvedProgress}
        className={cn(
          "bg-slate-100 rounded-full w-full overflow-hidden",
          compact
            ? "h-2"
            : "h-2.5",
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "rounded-full h-full transition-[width] duration-500 ease-out",
            isPlanCompleted
              ? "bg-emerald-500"
              : "bg-slate-900",
          )}
          style={{
            width: progressWidth,
          }}
        />
      </div>

      {/* Amount summary */}
      {(showCurrentAmount ||
        showTargetAmount ||
        showRemainingAmount) && (
        <div
          className={cn(
            "gap-3 grid mt-4",
            compact
              ? "grid-cols-2"
              : "grid-cols-1 sm:grid-cols-3",
          )}
        >
          {showCurrentAmount && (
            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Saved
              </p>

              <p
                className={cn(
                  "mt-1 font-semibold text-slate-900 truncate",
                  compact
                    ? "text-sm"
                    : "text-base",
                )}
              >
                {formattedCurrentAmount}
              </p>
            </div>
          )}

          {showTargetAmount &&
            formattedTargetAmount && (
              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    font-medium text-slate-500 text-xs
                  "
                >
                  Target
                </p>

                <p
                  className={cn(
                    "mt-1 font-semibold text-slate-900 truncate",
                    compact
                      ? "text-sm"
                      : "text-base",
                  )}
                >
                  {formattedTargetAmount}
                </p>
              </div>
            )}

          {showRemainingAmount &&
            formattedRemainingAmount &&
            !isPlanCompleted && (
              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    font-medium text-slate-500 text-xs
                  "
                >
                  Remaining
                </p>

                <p
                  className={cn(
                    "mt-1 font-semibold text-slate-900 truncate",
                    compact
                      ? "text-sm"
                      : "text-base",
                  )}
                >
                  {formattedRemainingAmount}
                </p>
              </div>
            )}
        </div>
      )}

      {/* Target date */}
      {(showTargetDate ||
        showRemainingDays) &&
        resolvedTargetDate && (
          <div
            className={cn(
              "flex flex-wrap justify-between items-center gap-2 mt-4",
              "border-t border-slate-100 pt-4",
            )}
          >
            {showTargetDate &&
              formattedTargetDate && (
                <div
                  className="
                    min-w-0
                  "
                >
                  <p
                    className="
                      font-medium text-slate-500 text-xs
                    "
                  >
                    Target date
                  </p>

                  <p
                    className="
                      mt-1
                      font-medium text-slate-700 text-sm
                    "
                  >
                    {formattedTargetDate}
                  </p>
                </div>
              )}

            {showRemainingDays &&
              formattedRemainingDays && (
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full font-semibold text-xs",
                    isPlanCompleted
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  {formattedRemainingDays}
                </span>
              )}
          </div>
        )}

      {/* Completed state */}
      {isPlanCompleted && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-center gap-2 mt-4 rounded-xl",
            "border border-emerald-100 bg-emerald-50",
            compact
              ? "px-3 py-2"
              : "px-4 py-3",
          )}
        >
          <CheckCircle2
            size={17}
            strokeWidth={2}
            className="
              text-emerald-600
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <p
            className={cn(
              "font-medium text-emerald-700",
              compact
                ? "text-xs"
                : "text-sm",
            )}
          >
            Saving goal reached
          </p>
        </div>
      )}
    </section>
  );
};

SavingPlanProgress.displayName =
  "SavingPlanProgress";

export default memo(SavingPlanProgress);