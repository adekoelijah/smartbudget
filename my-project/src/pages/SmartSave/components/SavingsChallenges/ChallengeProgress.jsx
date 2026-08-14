// :::writing{variant="document" id="58321" title="ChallengeProgress.jsx"}

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
} from "../../../../utils/smartSave/savingsFormatters";

import {
  calculateSavingsProgress,
} from "../../../../utils/smartSave/savingsProgress";

import {
  normalizeSavingsChallenge,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  SAVINGS_CHALLENGE_STATUS,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(Number(value) || 0, min), max);

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const getStatusLabel = (status) => {
  switch (status) {
    case SAVINGS_CHALLENGE_STATUS.ACTIVE:
      return "Active";

    case SAVINGS_CHALLENGE_STATUS.PAUSED:
      return "Paused";

    case SAVINGS_CHALLENGE_STATUS.COMPLETED:
      return "Completed";

    case SAVINGS_CHALLENGE_STATUS.CANCELLED:
      return "Cancelled";

    case SAVINGS_CHALLENGE_STATUS.FAILED:
      return "Failed";

    case SAVINGS_CHALLENGE_STATUS.EXPIRED:
      return "Expired";

    default:
      return "In progress";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case SAVINGS_CHALLENGE_STATUS.COMPLETED:
      return CheckCircle2;

    case SAVINGS_CHALLENGE_STATUS.PAUSED:
    case SAVINGS_CHALLENGE_STATUS.CANCELLED:
    case SAVINGS_CHALLENGE_STATUS.FAILED:
    case SAVINGS_CHALLENGE_STATUS.EXPIRED:
      return CircleAlert;

    default:
      return TrendingUp;
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case SAVINGS_CHALLENGE_STATUS.COMPLETED:
      return {
        badge:
          "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        progress:
          "bg-emerald-500",
      };

    case SAVINGS_CHALLENGE_STATUS.PAUSED:
      return {
        badge:
          "bg-amber-50 text-amber-700 ring-amber-600/10",
        progress:
          "bg-amber-500",
      };

    case SAVINGS_CHALLENGE_STATUS.CANCELLED:
    case SAVINGS_CHALLENGE_STATUS.FAILED:
    case SAVINGS_CHALLENGE_STATUS.EXPIRED:
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

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

/* =========================================================
   COMPONENT
========================================================= */

/**
 * ChallengeProgress
 *
 * Presentational SmartSave challenge-progress component.
 *
 * IMPORTANT:
 * - Does not fetch data.
 * - Does not mutate challenge state.
 * - Does not call the service layer directly.
 * - Does not call setState during render.
 *
 * Data fetching and lifecycle mutations belong to
 * useSavingsChallenges.js / smartSaveService.js.
 *
 * Expected usage:
 *
 * <ChallengeProgress
 *   challenge={challenge}
 * />
 *
 * Optional:
 *
 * <ChallengeProgress
 *   challenge={challenge}
 *   compact
 *   showDates
 *   showStats
 * />
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

  const normalizedChallenge = useMemo(() => {
    if (!challenge) return null;

    try {
      return normalizeSavingsChallenge(challenge);
    } catch {
      return challenge;
    }
  }, [challenge]);

  /* =======================================================
     DERIVE PROGRESS
  ======================================================= */

  const progress = useMemo(() => {
    if (!normalizedChallenge) {
      return {
        percentage: 0,
        currentAmount: 0,
        targetAmount: 0,
        remainingAmount: 0,
      };
    }

    /*
     * Prefer the backend-calculated snapshot/progress when
     * available because the backend remains the financial
     * source of truth.
     */
    const backendProgress =
      normalizedChallenge.progress ??
      normalizedChallenge.snapshot ??
      normalizedChallenge.challengeProgress ??
      null;

    if (backendProgress) {
      const currentAmount = toNumber(
        backendProgress.currentAmount ??
          backendProgress.savedAmount ??
          backendProgress.totalSaved ??
          backendProgress.amountSaved ??
          normalizedChallenge.currentAmount
      );

      const targetAmount = toNumber(
        backendProgress.targetAmount ??
          backendProgress.goalAmount ??
          normalizedChallenge.targetAmount ??
          normalizedChallenge.targetAmount
      );

      const explicitPercentage =
        backendProgress.percentage ??
        backendProgress.progressPercentage ??
        backendProgress.percent;

      const calculatedPercentage =
        explicitPercentage !== undefined
          ? toNumber(explicitPercentage)
          : targetAmount > 0
            ? (currentAmount / targetAmount) * 100
            : 0;

      return {
        percentage: clamp(calculatedPercentage),
        currentAmount,
        targetAmount,
        remainingAmount: Math.max(
          targetAmount - currentAmount,
          0
        ),
      };
    }

    /*
     * Fall back to the shared savings-progress utility.
     *
     * This keeps calculation logic centralized rather than
     * duplicating financial formulas inside the component.
     */
    try {
      const calculated = calculateSavingsProgress(
        normalizedChallenge
      );

      if (calculated) {
        const currentAmount = toNumber(
          calculated.currentAmount ??
            calculated.savedAmount ??
            calculated.current
        );

        const targetAmount = toNumber(
          calculated.targetAmount ??
            calculated.goalAmount ??
            calculated.target
        );

        return {
          percentage: clamp(
            calculated.percentage ??
              calculated.progressPercentage ??
              (targetAmount > 0
                ? (currentAmount / targetAmount) * 100
                : 0)
          ),
          currentAmount,
          targetAmount,
          remainingAmount: Math.max(
            targetAmount - currentAmount,
            0
          ),
        };
      }
    } catch {
      // Safe fallback below.
    }

    const currentAmount = toNumber(
      normalizedChallenge.currentAmount ??
        normalizedChallenge.savedAmount ??
        normalizedChallenge.totalSaved
    );

    const targetAmount = toNumber(
      normalizedChallenge.targetAmount ??
        normalizedChallenge.goalAmount ??
        normalizedChallenge.amount
    );

    return {
      percentage: clamp(
        targetAmount > 0
          ? (currentAmount / targetAmount) * 100
          : 0
      ),
      currentAmount,
      targetAmount,
      remainingAmount: Math.max(
        targetAmount - currentAmount,
        0
      ),
    };
  }, [normalizedChallenge]);

  /* =======================================================
     DERIVED METADATA
  ======================================================= */

  const metadata = useMemo(() => {
    if (!normalizedChallenge) return null;

    const status =
      normalizedChallenge.status ||
      SAVINGS_CHALLENGE_STATUS.ACTIVE;

    const StatusIcon = getStatusIcon(status);

    const successfulPeriods = toNumber(
      normalizedChallenge.successfulPeriods ??
        normalizedChallenge.periods?.successful ??
        normalizedChallenge.progress?.successfulPeriods
    );

    const missedPeriods = toNumber(
      normalizedChallenge.missedPeriods ??
        normalizedChallenge.periods?.missed ??
        normalizedChallenge.progress?.missedPeriods
    );

    const currentStreak = toNumber(
      normalizedChallenge.currentStreak ??
        normalizedChallenge.streak ??
        normalizedChallenge.progress?.currentStreak
    );

    const totalPeriods = toNumber(
      normalizedChallenge.totalPeriods ??
        normalizedChallenge.numberOfPeriods ??
        normalizedChallenge.progress?.totalPeriods
    );

    return {
      status,
      statusLabel: getStatusLabel(status),
      statusIcon: StatusIcon,
      statusClasses: getStatusClasses(status),
      successfulPeriods,
      missedPeriods,
      currentStreak,
      totalPeriods,
      startDate:
        normalizedChallenge.startDate ??
        normalizedChallenge.startedAt,
      endDate:
        normalizedChallenge.endDate ??
        normalizedChallenge.completedAt,
    };
  }, [normalizedChallenge]);

  /* =======================================================
     EMPTY / INVALID STATE
  ======================================================= */

  if (!normalizedChallenge || !metadata) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={[
        "w-full rounded-2xl border border-slate-200",
        "bg-white shadow-sm",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Savings challenge progress"
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
            min-w-0
          "
        >
          <div
            className="
              flex items-center
              gap-2
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
              <Target size={18} strokeWidth={2} />
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
              >
                {normalizedChallenge.name ||
                  normalizedChallenge.title ||
                  "Savings Challenge"}
              </h3>

              {!compact && (
                <p
                  className="
                    mt-0.5
                    text-slate-500 text-xs
                  "
                >
                  Track your progress toward your target
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div
          className={[
            "inline-flex shrink-0 items-center gap-1.5",
            "rounded-full px-2.5 py-1",
            "text-xs font-medium ring-1 ring-inset",
            metadata.statusClasses.badge,
          ].join(" ")}
        >
          <metadata.statusIcon
            size={13}
            strokeWidth={2}
            aria-hidden="true"
          />

          {metadata.statusLabel}
        </div>
      </div>

      {/* =================================================
         PRIMARY PROGRESS
      ================================================= */}

      <div className={compact ? "mt-5" : "mt-6"}>
        <div
          className="
            flex justify-between items-end
            gap-4
          "
        >
          <div>
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
                font-bold text-slate-900 text-xl sm:text-2xl tracking-tight
              "
            >
              {formatCurrency(
                progress.currentAmount,
                normalizedChallenge.currency
              )}
            </p>
          </div>

          <div
            className="
              text-right
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
              {formatPercentage(progress.percentage)}
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
            aria-valuenow={progress.percentage}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Savings challenge progress"
          >
            <div
              className={[
                "h-full rounded-full transition-[width]",
                "duration-500 ease-out",
                metadata.statusClasses.progress,
              ].join(" ")}
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>
        </div>

        {/* Remaining amount */}
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
            remaining to reach your target.
          </p>
        ) : (
          <p
            className="
              mt-2
              font-medium text-emerald-600 text-xs
            "
          >
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
              <CheckCircle2
                size={16}
                className="
                  text-emerald-600
                "
                aria-hidden="true"
              /
              >

              <span
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Successful periods
              </span>
            </div>

            <p
              className="
                mt-2
                font-semibold text-slate-900 text-lg
              "
            >
              {metadata.successfulPeriods}
            </p>
          </div>

          {/* Missed periods */}
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
              <Clock3
                size={16}
                className="
                  text-amber-600
                "
                aria-hidden="true"
              /
              >

              <span
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Missed periods
              </span>
            </div>

            <p
              className="
                mt-2
                font-semibold text-slate-900 text-lg
              "
            >
              {metadata.missedPeriods}
            </p>
          </div>

          {/* Current streak */}
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
              <Flame
                size={16}
                className="
                  text-orange-500
                "
                aria-hidden="true"
              /
              >

              <span
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Current streak
              </span>
            </div>

            <p
              className="
                mt-2
                font-semibold text-slate-900 text-lg
              "
            >
              {metadata.currentStreak}
            </p>
          </div>
        </div>
      )}

      {/* =================================================
         PERIOD PROGRESS
      ================================================= */}

      {!compact &&
        metadata.totalPeriods > 0 && (
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
                {metadata.successfulPeriods} /{" "}
                {metadata.totalPeriods}
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
              aria-hidden="true"
            >
              <div
                className="
                  h-full
                  bg-slate-700
                  rounded-full
                  transition-[width] duration-500
                "
                style={{
                  width: `${clamp(
                    (metadata.successfulPeriods /
                      metadata.totalPeriods) *
                      100
                  )}%`,
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
        (metadata.startDate || metadata.endDate) && (
          <div
            className="
              flex flex-wrap items-center
              mt-5 pt-4
              text-slate-500 text-xs
              border-slate-100 border-t
              gap-x-5 gap-y-2
            "
          >
            {metadata.startDate && (
              <span>
                Started{" "}
                <strong
                  className="
                    font-medium text-slate-700
                  "
                >
                  {formatDate(metadata.startDate)}
                </strong>
              </span>
            )}

            {metadata.endDate && (
              <span>
                Ends{" "}
                <strong
                  className="
                    font-medium text-slate-700
                  "
                >
                  {formatDate(metadata.endDate)}
                </strong>
              </span>
            )}
          </div>
        )}
    </section>
  );
};

export default ChallengeProgress;