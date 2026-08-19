import { useMemo } from "react";

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  formatCurrency,
  formatPercentage,
  normalizeSavingsChallenge,
} from "../../../../utils/smartSave/savingsFormatters";

import { calculateSavingsProgress } from "../../../../utils/smartSave/savingsProgress";

import {
  SAVINGS_CHALLENGE_STATUS,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_STATUS =
  SAVINGS_CHALLENGE_STATUS?.ACTIVE || "active";

const DEFAULT_CHALLENGE_NAME = "Savings Challenge";

/* =========================================================
   HELPERS
========================================================= */

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const clamp = (
  value,
  min = 0,
  max = 100
) => {
  const number = toNumber(value, min);

  return Math.min(
    Math.max(number, min),
    max
  );
};

const getFirstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return undefined;
};

/* =========================================================
   STATUS HELPERS
========================================================= */

const getStatusLabel = (status) => {
  switch (status) {
    case SAVINGS_CHALLENGE_STATUS?.ACTIVE:
      return "Active";

    case SAVINGS_CHALLENGE_STATUS?.PAUSED:
      return "Paused";

    case SAVINGS_CHALLENGE_STATUS?.COMPLETED:
      return "Completed";

    case SAVINGS_CHALLENGE_STATUS?.CANCELLED:
      return "Cancelled";

    case SAVINGS_CHALLENGE_STATUS?.FAILED:
      return "Failed";

    case SAVINGS_CHALLENGE_STATUS?.EXPIRED:
      return "Expired";

    default:
      return "In progress";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case SAVINGS_CHALLENGE_STATUS?.COMPLETED:
      return CheckCircle2;

    case SAVINGS_CHALLENGE_STATUS?.PAUSED:
    case SAVINGS_CHALLENGE_STATUS?.CANCELLED:
    case SAVINGS_CHALLENGE_STATUS?.FAILED:
    case SAVINGS_CHALLENGE_STATUS?.EXPIRED:
      return CircleAlert;

    default:
      return TrendingUp;
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case SAVINGS_CHALLENGE_STATUS?.COMPLETED:
      return {
        badge:
          "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        progress:
          "bg-emerald-500",
      };

    case SAVINGS_CHALLENGE_STATUS?.PAUSED:
      return {
        badge:
          "bg-amber-50 text-amber-700 ring-amber-600/10",
        progress:
          "bg-amber-500",
      };

    case SAVINGS_CHALLENGE_STATUS?.CANCELLED:
    case SAVINGS_CHALLENGE_STATUS?.FAILED:
    case SAVINGS_CHALLENGE_STATUS?.EXPIRED:
      return {
        badge:
          "bg-red-50 text-red-700 ring-red-600/10",
        progress:
          "bg-red-500",
      };

    default:
      return {
        badge:
          "bg-blue-50 text-blue-700 ring-blue-600/10",
        progress:
          "bg-blue-600",
      };
  }
};

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatChallengeDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

/* =========================================================
   PROGRESS NORMALIZATION
========================================================= */

/**
 * Extracts progress from the backend response.
 *
 * Priority:
 *
 * 1. Backend progress/snapshot
 * 2. Shared calculateSavingsProgress utility
 * 3. Direct challenge fields
 *
 * The backend remains the financial source of truth.
 */
const resolveChallengeProgress = (
  challenge
) => {
  if (!challenge) {
    return {
      percentage: 0,
      currentAmount: 0,
      targetAmount: 0,
      remainingAmount: 0,
    };
  }

  /*
   * Backend-calculated progress.
   */
  const backendProgress =
    challenge.progress ??
    challenge.snapshot ??
    challenge.challengeProgress ??
    null;

  if (backendProgress) {
    const currentAmount = toNumber(
      getFirstValue(
        backendProgress.currentAmount,
        backendProgress.savedAmount,
        backendProgress.totalSaved,
        backendProgress.amountSaved,
        challenge.currentAmount,
        challenge.savedAmount,
        challenge.totalSaved
      )
    );

    const targetAmount = toNumber(
      getFirstValue(
        backendProgress.targetAmount,
        backendProgress.goalAmount,
        challenge.targetAmount,
        challenge.goalAmount,
        challenge.amount
      )
    );

    const explicitPercentage =
      getFirstValue(
        backendProgress.percentage,
        backendProgress.progressPercentage,
        backendProgress.percent
      );

    const calculatedPercentage =
      explicitPercentage !== undefined
        ? toNumber(explicitPercentage)
        : targetAmount > 0
          ? (currentAmount / targetAmount) * 100
          : 0;

    const percentage = clamp(
      calculatedPercentage
    );

    return {
      percentage,
      currentAmount,
      targetAmount,
      remainingAmount: Math.max(
        targetAmount - currentAmount,
        0
      ),
    };
  }

  /*
   * Shared progress calculation.
   *
   * This should contain reusable financial calculation
   * logic rather than the UI component duplicating it.
   */
  try {
    const calculated =
      calculateSavingsProgress(challenge);

    if (calculated) {
      const currentAmount = toNumber(
        getFirstValue(
          calculated.currentAmount,
          calculated.savedAmount,
          calculated.current
        )
      );

      const targetAmount = toNumber(
        getFirstValue(
          calculated.targetAmount,
          calculated.goalAmount,
          calculated.target
        )
      );

      const explicitPercentage =
        getFirstValue(
          calculated.percentage,
          calculated.progressPercentage,
          calculated.percent
        );

      const calculatedPercentage =
        explicitPercentage !== undefined
          ? toNumber(explicitPercentage)
          : targetAmount > 0
            ? (currentAmount / targetAmount) * 100
            : 0;

      const percentage = clamp(
        calculatedPercentage
      );

      return {
        percentage,
        currentAmount,
        targetAmount,
        remainingAmount: Math.max(
          targetAmount - currentAmount,
          0
        ),
      };
    }
  } catch {
    /*
     * The presentation layer must remain resilient
     * if the shared calculation utility receives an
     * unexpected payload.
     */
  }

  /*
   * Final defensive fallback.
   */
  const currentAmount = toNumber(
    getFirstValue(
      challenge.currentAmount,
      challenge.savedAmount,
      challenge.totalSaved
    )
  );

  const targetAmount = toNumber(
    getFirstValue(
      challenge.targetAmount,
      challenge.goalAmount,
      challenge.amount
    )
  );

  const percentage =
    targetAmount > 0
      ? clamp(
          (currentAmount / targetAmount) *
            100
        )
      : 0;

  return {
    percentage,
    currentAmount,
    targetAmount,
    remainingAmount: Math.max(
      targetAmount - currentAmount,
      0
    ),
  };
};

/* =========================================================
   METADATA NORMALIZATION
========================================================= */

const resolveChallengeMetadata = (
  challenge
) => {
  const status =
    challenge?.status ||
    DEFAULT_STATUS;

  return {
    status,

    statusLabel:
      getStatusLabel(status),

    statusIcon:
      getStatusIcon(status),

    statusClasses:
      getStatusClasses(status),

    successfulPeriods: toNumber(
      getFirstValue(
        challenge?.successfulPeriods,
        challenge?.periods?.successful,
        challenge?.progress?.successfulPeriods
      )
    ),

    missedPeriods: toNumber(
      getFirstValue(
        challenge?.missedPeriods,
        challenge?.periods?.missed,
        challenge?.progress?.missedPeriods
      )
    ),

    currentStreak: toNumber(
      getFirstValue(
        challenge?.currentStreak,
        challenge?.streak,
        challenge?.progress?.currentStreak
      )
    ),

    totalPeriods: toNumber(
      getFirstValue(
        challenge?.totalPeriods,
        challenge?.numberOfPeriods,
        challenge?.progress?.totalPeriods
      )
    ),

    startDate:
      getFirstValue(
        challenge?.startDate,
        challenge?.startedAt
      ),

    endDate:
      getFirstValue(
        challenge?.endDate,
        challenge?.completedAt,
        challenge?.endsAt
      ),
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

/**
 * ChallengeProgress
 *
 * Purely presentational SmartSave challenge-progress
 * component.
 *
 * Responsibilities:
 * - Normalize challenge data.
 * - Present financial progress.
 * - Present challenge metadata.
 * - Present challenge status.
 *
 * Does NOT:
 * - fetch data
 * - mutate data
 * - call services
 * - manage API state
 * - manage lifecycle actions
 * - call setState
 *
 * The parent/hook layer remains responsible for:
 *
 * ChallengeProgress
 *       ↓
 * useSavingsChallenges
 *       ↓
 * smartSaveService
 *       ↓
 * SmartSave backend
 */
const ChallengeProgress = ({
  challenge,
  compact = false,
  showDates = true,
  showStats = true,
  className = "",
}) => {
  /* =======================================================
     NORMALIZE CHALLENGE
  ======================================================= */

  const normalizedChallenge =
    useMemo(() => {
      if (!challenge) {
        return null;
      }

      try {
        return normalizeSavingsChallenge(
          challenge
        );
      } catch {
        /*
         * Defensive fallback.
         *
         * A malformed optional field should not
         * crash the entire challenges page.
         */
        return challenge;
      }
    }, [challenge]);

  /* =======================================================
     DERIVE PROGRESS
  ======================================================= */

  const progress = useMemo(
    () =>
      resolveChallengeProgress(
        normalizedChallenge
      ),
    [normalizedChallenge]
  );

  /* =======================================================
     DERIVE METADATA
  ======================================================= */

  const metadata = useMemo(() => {
    if (!normalizedChallenge) {
      return null;
    }

    return resolveChallengeMetadata(
      normalizedChallenge
    );
  }, [normalizedChallenge]);

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    !normalizedChallenge ||
    !metadata
  ) {
    return null;
  }

  const {
    statusIcon: StatusIcon,
    statusLabel,
    statusClasses,
    successfulPeriods,
    missedPeriods,
    currentStreak,
    totalPeriods,
    startDate,
    endDate,
  } = metadata;

  const challengeName =
    normalizedChallenge.name ||
    normalizedChallenge.title ||
    DEFAULT_CHALLENGE_NAME;

  const periodPercentage =
    totalPeriods > 0
      ? clamp(
          (successfulPeriods /
            totalPeriods) *
            100
        )
      : 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={cn(
        "rounded-2xl w-full",
        "border border-slate-200",
        "bg-white shadow-sm",
        compact
          ? "p-4"
          : "p-5 sm:p-6",
        className
      )}
      aria-label={`${challengeName} progress`}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex justify-between items-start
          gap-4
        "
      >
        <div
          className="
            flex items-center
            min-w-0
            gap-2.5
          "
        >
          <div
            className="
              flex justify-center items-center
              w-9 h-9
              text-blue-600
              bg-blue-50
              rounded-xl
              shrink-0
            "
            aria-hidden="true"
          >
            <Target
              size={18}
              strokeWidth={2}
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h3
              className="
                font-semibold text-slate-900 text-sm truncate
              "
              title={challengeName}
            >
              {challengeName}
            </h3>

            {!compact && (
              <p
                className="
                  mt-0.5
                  text-slate-500 text-xs
                "
              >
                Track your progress toward
                your target
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div
          className={cn(
            "inline-flex shrink-0",
            "items-center gap-1.5",
            "rounded-full px-2.5 py-1",
            "text-xs font-medium",
            "ring-1 ring-inset",
            statusClasses.badge
          )}
          aria-label={`Challenge status: ${statusLabel}`}
        >
          <StatusIcon
            size={13}
            strokeWidth={2}
            aria-hidden="true"
          />

          {statusLabel}
        </div>
      </div>

      {/* =================================================
          PRIMARY PROGRESS
      ================================================= */}

      <div
        className={
          compact ? "mt-5" : "mt-6"
        }
      >
        <div
          className="
            flex justify-between items-end
            gap-4
          "
        >
          {/* Saved */}
          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                font-medium text-slate-500 text-xs uppercase tracking-wide
              "
            >
              Saved
            </p>

            <p
              className="
                mt-1
                font-bold text-slate-900 text-xl sm:text-2xl truncate
                tracking-tight
              "
            >
              {formatCurrency(
                progress.currentAmount,
                normalizedChallenge.currency
              )}
            </p>
          </div>

          {/* Target */}
          <div
            className="
              text-right
              shrink-0
            "
          >
            <p
              className="
                text-slate-500 text-xs
              "
            >
              of{" "}
              {formatCurrency(
                progress.targetAmount,
                normalizedChallenge.currency
              )}
            </p>

            <p
              className="
                mt-1
                font-semibold text-slate-700 text-sm
              "
            >
              {formatPercentage(
                progress.percentage
              )}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="
            mt-3
          "
        >
          <div
            className="
              overflow-hidden
              w-full h-2.5
              bg-slate-100
              rounded-full
            "
            role="progressbar"
            aria-valuenow={Math.round(
              progress.percentage
            )}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${challengeName} savings progress`}
          >
            <div
              className={cn(
                "rounded-full h-full",
                "transition-[width]",
                "duration-500 ease-out",
                statusClasses.progress
              )}
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>
        </div>

        {/* Remaining */}
        {progress.remainingAmount > 0 ? (
          <p
            className="
              mt-2
              text-slate-500 text-xs
            "
          >
            {formatCurrency(
              progress.remainingAmount,
              normalizedChallenge.currency
            )}{" "}
            remaining to reach your
            target.
          </p>
        ) : (
          <p
            className="
              flex items-center
              mt-2
              font-medium text-emerald-600 text-xs
              gap-1.5
            "
          >
            <CheckCircle2
              size={14}
              aria-hidden="true"
            />

            Target reached.
          </p>
        )}
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      {showStats && !compact && (
        <div
          className="
            grid grid-cols-1 sm:grid-cols-3
            mt-6
            gap-3
          "
        >
          {/* Successful periods */}
          <ProgressStat
            icon={CheckCircle2}
            iconClass="text-emerald-600"
            label="Successful periods"
            value={successfulPeriods}
          />

          {/* Missed periods */}
          <ProgressStat
            icon={Clock3}
            iconClass="text-amber-600"
            label="Missed periods"
            value={missedPeriods}
          />

          {/* Current streak */}
          <ProgressStat
            icon={Flame}
            iconClass="text-orange-500"
            label="Current streak"
            value={currentStreak}
          />
        </div>
      )}

      {/* =================================================
          PERIOD PROGRESS
      ================================================= */}

      {!compact &&
        totalPeriods > 0 && (
          <div
            className="
              mt-5
            "
          >
            <div
              className="
                flex justify-between items-center
                text-xs
                gap-3
              "
            >
              <span
                className="
                  font-medium text-slate-600
                "
              >
                Challenge periods
              </span>

              <span
                className="
                  text-slate-500
                "
              >
                {successfulPeriods} /{" "}
                {totalPeriods}
              </span>
            </div>

            <div
              className="
                overflow-hidden
                h-1.5
                mt-2
                bg-slate-100
                rounded-full
              "
              role="progressbar"
              aria-valuenow={Math.round(
                periodPercentage
              )}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Successful challenge periods"
            >
              <div
                className="
                  h-full
                  bg-slate-700
                  rounded-full
                  transition-[width] duration-500
                "
                style={{
                  width: `${periodPercentage}%`,
                }}
              /
              >
            </div>
          </div>
        )}

      {/* =================================================
          DATES
      ================================================= */}

      {showDates &&
        !compact &&
        (startDate || endDate) && (
          <div
            className="
              flex flex-wrap items-center
              mt-5 pt-4
              text-slate-500 text-xs
              border-slate-100 border-t
              gap-x-5 gap-y-2
            "
          >
            {startDate && (
              <span>
                Started{" "}
                <strong
                  className="
                    font-medium text-slate-700
                  "
                >
                  {formatChallengeDate(
                    startDate
                  )}
                </strong>
              </span>
            )}

            {endDate && (
              <span>
                Ends{" "}
                <strong
                  className="
                    font-medium text-slate-700
                  "
                >
                  {formatChallengeDate(
                    endDate
                  )}
                </strong>
              </span>
            )}
          </div>
        )}
    </section>
  );
};

/* =========================================================
   PROGRESS STAT
========================================================= */

const ProgressStat = ({
  icon: Icon,
  iconClass,
  label,
  value,
}) => {
  return (
    <div
      className="
        p-3
        bg-slate-50
        rounded-xl
      "
    >
      <div
        className="
          flex items-center
          gap-2
        "
      >
        <Icon
          size={16}
          className={iconClass}
          aria-hidden="true"
        />

        <span
          className="
            font-medium text-slate-500 text-xs
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-2
          font-semibold text-slate-900 text-lg
        "
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   EXPORT
========================================================= */

export default ChallengeProgress;