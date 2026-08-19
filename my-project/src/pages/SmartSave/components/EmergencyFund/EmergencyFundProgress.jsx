import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import { useId } from "react";

import {
  formatCurrency,
} from "../../../../utils/smartSave/emergencyFundFormatters";

import {
  calculateProgressPercentage,
} from "../../../../utils/smartSave/emergencyFundProgress";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_STATUS = "starting";

const STATUS_CONFIG = {
  funded: {
    label: "Fully funded",
    description:
      "Your emergency fund has reached its current target.",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    barClass: "bg-emerald-600",
  },

  healthy: {
    label: "Healthy progress",
    description:
      "Your emergency fund is progressing well toward its target.",
    icon: ShieldCheck,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    barClass: "bg-blue-600",
  },

  building: {
    label: "Building",
    description:
      "You are making progress toward your emergency fund target.",
    icon: TrendingUp,
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
    barClass: "bg-slate-900",
  },

  starting: {
    label: "Getting started",
    description:
      "Start building your emergency fund with consistent contributions.",
    icon: Target,
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
    barClass: "bg-slate-700",
  },

  behind: {
    label: "Behind target",
    description:
      "Your current balance is below the pace needed to reach the target.",
    icon: AlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    barClass: "bg-amber-500",
  },

  at_risk: {
    label: "Needs attention",
    description:
      "Your emergency fund needs additional contributions or a revised target.",
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-700",
    barClass: "bg-red-600",
  },
};

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Returns the first value that is actually defined.
 *
 * Important:
 * 0 is considered a valid value.
 */
const firstDefined = (...values) => {
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

/**
 * Safely converts a value to a finite number.
 */
const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Converts a value to a non-negative finite number.
 */
const normalizeNonNegativeNumber = (
  value,
  fallback = 0
) =>
  Math.max(
    0,
    toNumber(value, fallback)
  );

/**
 * Restricts a number to a known range.
 */
const clamp = (
  value,
  min = 0,
  max = 100
) =>
  Math.min(
    max,
    Math.max(
      min,
      toNumber(value, min)
    )
  );

/**
 * Determines whether a value is actually usable.
 */
const hasValue = (value) =>
  value !== undefined &&
  value !== null &&
  value !== "";

/**
 * Ensures the supplied source is a usable object.
 */
const normalizeSource = (
  emergencyFund,
  data
) => {
  const source = firstDefined(
    emergencyFund,
    data
  );

  if (
    !source ||
    typeof source !== "object" ||
    Array.isArray(source)
  ) {
    return null;
  }

  return source;
};

/* =========================================================
   STATUS NORMALIZER
========================================================= */

const normalizeStatus = ({
  status,
  progress,
  targetAmount,
  currentAmount,
}) => {
  const normalizedStatus = String(
    status || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  /*
   * Explicit backend status always wins when
   * it maps to a supported UI status.
   */
  switch (normalizedStatus) {
    case "funded":
    case "fully_funded":
    case "complete":
    case "completed":
    case "reached":
      return "funded";

    case "at_risk":
    case "risk":
    case "critical":
      return "at_risk";

    case "behind":
    case "behind_target":
      return "behind";

    case "healthy":
    case "good":
    case "strong":
      return "healthy";

    case "building":
    case "in_progress":
      return "building";

    case "starting":
    case "new":
      return "starting";

    default:
      break;
  }

  /*
   * Only derive a status when the backend did not
   * provide a recognized status.
   */
  if (
    targetAmount > 0 &&
    currentAmount >= targetAmount
  ) {
    return "funded";
  }

  if (progress >= 75) {
    return "healthy";
  }

  if (progress >= 40) {
    return "building";
  }

  if (progress > 0) {
    return "starting";
  }

  return DEFAULT_STATUS;
};

/* =========================================================
   DERIVE EMERGENCY FUND VALUES
========================================================= */

/**
 * Pure function.
 *
 * No hooks.
 * No state.
 * No side effects.
 * No memoization.
 *
 * This is intentionally outside the component so React
 * has nothing to track.
 */
const deriveEmergencyFundValues = ({
  source,
  suppliedCurrentAmount,
  suppliedTargetAmount,
  suppliedProgress,
}) => {
  /* -------------------------------------------------------
     CURRENT AMOUNT
  ------------------------------------------------------- */

  const currentAmount =
    normalizeNonNegativeNumber(
      firstDefined(
        suppliedCurrentAmount,
        source?.currentAmount,
        source?.currentBalance,
        source?.balance,
        source?.amountSaved,
        source?.savedAmount,
        source?.progress?.current,
        0
      )
    );

  /* -------------------------------------------------------
     TARGET AMOUNT
     
     Deliberately do NOT use recommendedTarget here.
     Recommended target is advisory data, not the actual
     configured target.
  ------------------------------------------------------- */

  const targetAmount =
    normalizeNonNegativeNumber(
      firstDefined(
        suppliedTargetAmount,
        source?.targetAmount,
        source?.target,
        source?.fundTarget,
        source?.goalAmount,
        source?.progress?.target,
        0
      )
    );

  /* -------------------------------------------------------
     PROGRESS
  ------------------------------------------------------- */

  const explicitProgress =
    firstDefined(
      suppliedProgress,
      source?.progressPercentage,
      source?.progressPercent,
      source?.percentage,
      source?.progress?.percentage
    );

  let progress;

  if (hasValue(explicitProgress)) {
    progress = clamp(
      explicitProgress
    );
  } else if (targetAmount > 0) {
    progress = clamp(
      calculateProgressPercentage({
        targetAmount,
        currentAmount,
      })
    );
  } else {
    progress = 0;
  }

  /* -------------------------------------------------------
     REMAINING
  ------------------------------------------------------- */

  const calculatedRemaining =
    Math.max(
      targetAmount -
        currentAmount,
      0
    );

  const suppliedRemaining =
    firstDefined(
      source?.remainingAmount,
      source?.amountRemaining
    );

  const remainingAmount =
    hasValue(suppliedRemaining)
      ? normalizeNonNegativeNumber(
          suppliedRemaining
        )
      : calculatedRemaining;

  /*
   * Never allow remaining to exceed the target when
   * a target exists.
   */
  const safeRemainingAmount =
    targetAmount > 0
      ? Math.min(
          remainingAmount,
          targetAmount
        )
      : remainingAmount;

  /* -------------------------------------------------------
     MONTHS COVERED
  ------------------------------------------------------- */

  const rawMonthsCovered =
    firstDefined(
      source?.monthsCovered,
      source?.coverageMonths,
      source?.monthsOfCoverage,
      source?.coverage?.months
    );

  const monthsCovered =
    hasValue(rawMonthsCovered)
      ? normalizeNonNegativeNumber(
          rawMonthsCovered
        )
      : null;

  /* -------------------------------------------------------
     RECOMMENDED TARGET
  ------------------------------------------------------- */

  const rawRecommendedTarget =
    firstDefined(
      source?.recommendedTarget,
      source?.recommendedAmount,
      source?.idealTarget
    );

  const recommendedTarget =
    hasValue(rawRecommendedTarget)
      ? normalizeNonNegativeNumber(
          rawRecommendedTarget
        )
      : null;

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  const status =
    normalizeStatus({
      status: firstDefined(
        source?.status,
        source?.health,
        source?.fundStatus
      ),
      progress,
      targetAmount,
      currentAmount,
    });

  return {
    currentAmount,
    targetAmount,
    progress,
    remainingAmount:
      safeRemainingAmount,
    monthsCovered,
    recommendedTarget,
    status,
  };
};

/* =========================================================
   SKELETON
========================================================= */

const EmergencyFundProgressSkeleton = () => (
  <div
    className="
      space-y-5
      animate-pulse
    "
    aria-hidden="true"
  >
    <div
      className="
        flex justify-between items-center
        gap-4
      "
    >
      <div
        className="
          w-32 h-4
          bg-slate-200
          rounded
        "
        /
      >
      <div
        className="
          w-16 h-4
          bg-slate-200
          rounded
        "
        /
      >
    </div>

    <div
      className="
        overflow-hidden
        h-3
        bg-slate-200
        rounded-full
      "
    >
      <div
        className="
          w-1/2 h-full
          bg-slate-300
          rounded-full
        "
        /
      >
    </div>

    <div
      className="
        grid grid-cols-1 sm:grid-cols-3
        gap-3
      "
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            h-20
            bg-slate-100
            rounded-xl
          "
          /
        >
      ))}
    </div>
  </div>
);

/* =========================================================
   EMPTY STATE
========================================================= */

const EmergencyFundProgressEmpty = () => (
  <div
    className="
      flex flex-col justify-center items-center
      px-5 py-8
      text-center
      bg-slate-50
      border border-slate-300 border-dashed rounded-xl
    "
  >
    <div
      className="
        flex justify-center items-center
        w-11 h-11
        mb-3
        bg-white
        rounded-full
        shadow-sm
      "
      aria-hidden="true"
    >
      <ShieldCheck
        size={20}
        className="
          text-slate-500
        "
        /
      >
    </div>

    <h4
      className="
        font-semibold text-slate-900 text-sm
      "
    >
      Emergency fund not configured
    </h4>

    <p
      className="
        max-w-sm
        mt-1
        text-slate-500 text-xs leading-5
      "
    >
      Set an emergency fund target to start
      tracking your financial safety net.
    </p>
  </div>
);

/* =========================================================
   METRIC
========================================================= */

const ProgressMetric = ({
  label,
  value,
  description,
}) => (
  <div
    className="
      p-3.5
      bg-white
      border border-slate-200 rounded-xl
    "
  >
    <p
      className="
        font-medium text-[11px] text-slate-500
      "
    >
      {label}
    </p>

    <p
      className="
        mt-1
        font-semibold text-slate-900 text-sm
      "
    >
      {value}
    </p>

    {description ? (
      <p
        className="
          mt-1
          text-[11px] text-slate-400 leading-4
        "
      >
        {description}
      </p>
    ) : null}
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EmergencyFundProgress = ({
  emergencyFund,
  data,

  currentAmount: suppliedCurrentAmount,
  targetAmount: suppliedTargetAmount,
  progress: suppliedProgress,

  loading = false,
  isLoading = false,

  title = "Emergency fund progress",

  description =
    "Track how close you are to building your financial safety net.",

  showStatus = true,
  showMetrics = true,

  compact = false,

  className = "",
}) => {
  /* -------------------------------------------------------
     ACCESSIBILITY
  ------------------------------------------------------- */

  const componentId = useId();

  const titleId =
    `emergency-fund-progress-title-${componentId}`;

  const progressId =
    `emergency-fund-progress-${componentId}`;

  /* -------------------------------------------------------
     SOURCE
     
     IMPORTANT:
     This is intentionally NOT memoized.
     
     There is no expensive computation here and no reason
     for React to retain an object reference.
  ------------------------------------------------------- */

  const source = normalizeSource(
    emergencyFund,
    data
  );

  /* -------------------------------------------------------
     DERIVED DATA
     
     Pure synchronous calculation.
     
     No useMemo.
     No useEffect.
     No setState.
  ------------------------------------------------------- */

  const values =
    deriveEmergencyFundValues({
      source,
      suppliedCurrentAmount,
      suppliedTargetAmount,
      suppliedProgress,
    });

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const isBusy =
    Boolean(loading) ||
    Boolean(isLoading);

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  const statusConfig =
    STATUS_CONFIG[
      values.status
    ] ||
    STATUS_CONFIG[
      DEFAULT_STATUS
    ];

  const StatusIcon =
    statusConfig.icon;

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (
    isBusy &&
    !source
  ) {
    return (
      <section
        aria-label="Emergency fund progress"
        aria-busy="true"
        className={`
          rounded-2xl
          border border-slate-200
          bg-white
          p-5
          shadow-sm
          ${className}
        `}
      >
        <EmergencyFundProgressSkeleton />
      </section>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    !isBusy &&
    !source
  ) {
    return (
      <section
        aria-label="Emergency fund progress"
        className={`
          rounded-2xl
          border border-slate-200
          bg-white
          p-5
          shadow-sm
          ${className}
        `}
      >
        <EmergencyFundProgressEmpty />
      </section>
    );
  }

  /* =======================================================
     COMPACT
  ======================================================= */

  if (compact) {
    return (
      <section
        aria-labelledby={titleId}
        className={`
          rounded-xl
          border border-slate-200
          bg-white
          p-4
          ${className}
        `}
      >
        <div
          className="
            flex justify-between items-center
            mb-2
            gap-3
          "
        >
          <span
            id={titleId}
            className="
              font-medium text-slate-600 text-xs
            "
          >
            {title}
          </span>

          <span
            className="
              font-bold text-slate-900 text-xs
            "
          >
            {values.progress.toFixed(0)}%
          </span>
        </div>

        <div
          id={progressId}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={values.progress}
          aria-labelledby={titleId}
          className="
            overflow-hidden
            h-2
            bg-slate-100
            rounded-full
          "
        >
          <div
            className={`
              h-full
              rounded-full
              transition-[width]
              duration-500
              ${statusConfig.barClass}
            `}
            style={{
              width: `${values.progress}%`,
            }}
          />
        </div>

        <div
          className="
            flex justify-between
            mt-2
            text-[11px]
            gap-3
          "
        >
          <span
            className="
              text-slate-500
            "
          >
            {formatCurrency(
              values.currentAmount
            )}
          </span>

          <span
            className="
              text-slate-500
            "
          >
            {formatCurrency(
              values.targetAmount
            )}
          </span>
        </div>
      </section>
    );
  }

  /* =======================================================
     FULL CONTENT
  ======================================================= */

  return (
    <section
      aria-labelledby={titleId}
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
    >
      {/* HEADER */}

      <header
        className="
          flex items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-9 h-9
            bg-slate-100
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <ShieldCheck
            size={18}
            className="
              text-slate-700
            "
            /
          >
        </div>

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <h3
            id={titleId}
            className="
              font-bold text-slate-900 text-sm
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-0.5
              text-slate-500 text-xs leading-5
            "
          >
            {description}
          </p>
        </div>
      </header>

      {/* STATUS */}

      {showStatus ? (
        <div
          className="
            mt-5
          "
        >
          <div
            className={`
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              border
              rounded-full
              font-semibold
              text-xs
              ${statusConfig.className}
            `}
          >
            <StatusIcon
              size={14}
              aria-hidden="true"
            />

            {statusConfig.label}
          </div>

          <p
            className="
              mt-2
              text-slate-500 text-xs leading-5
            "
          >
            {statusConfig.description}
          </p>
        </div>
      ) : null}

      {/* PROGRESS */}

      <div
        className="
          mt-5
        "
      >
        <div
          className="
            flex justify-between items-end
            mb-2
            gap-3
          "
        >
          <div>
            <p
              className="
                font-medium text-slate-500 text-xs
              "
            >
              Current balance
            </p>

            <p
              className="
                mt-1
                font-bold text-slate-900 text-lg
              "
            >
              {formatCurrency(
                values.currentAmount
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
              Target
            </p>

            <p
              className="
                mt-1
                font-semibold text-slate-800 text-sm
              "
            >
              {formatCurrency(
                values.targetAmount
              )}
            </p>
          </div>
        </div>

        <div
          id={progressId}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={values.progress}
          aria-labelledby={titleId}
          className="
            overflow-hidden
            h-3
            bg-slate-100
            rounded-full
          "
        >
          <div
            className={`
              h-full
              rounded-full
              transition-[width]
              duration-700
              ${statusConfig.barClass}
            `}
            style={{
              width: `${values.progress}%`,
            }}
          />
        </div>

        <div
          className="
            flex justify-between items-center
            mt-2
            gap-3
          "
        >
          <span
            className="
              text-slate-500 text-xs
            "
          >
            {formatCurrency(
              values.remainingAmount
            )}{" "}
            remaining
          </span>

          <span
            className="
              font-bold text-slate-900 text-xs
            "
          >
            {values.progress.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* METRICS */}

      {showMetrics ? (
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            mt-5
            gap-3
          "
        >
          <ProgressMetric
            label="Saved"
            value={formatCurrency(
              values.currentAmount
            )}
            description="Current emergency reserve"
          />

          <ProgressMetric
            label="Remaining"
            value={formatCurrency(
              values.remainingAmount
            )}
            description="Amount needed to reach target"
          />

          <ProgressMetric
            label="Coverage"
            value={
              values.monthsCovered !== null
                ? `${values.monthsCovered.toFixed(1)} months`
                : "—"
            }
            description="Estimated expense coverage"
          />
        </div>
      ) : null}

      {/* RECOMMENDED TARGET */}

      {values.recommendedTarget !== null ? (
        <div
          className="
            flex items-start
            mt-4 p-3.5
            bg-slate-50
            border border-slate-200 rounded-xl
            gap-3
          "
        >
          <Target
            size={16}
            className="
              mt-0.5
              text-slate-500
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <div>
            <p
              className="
                font-semibold text-slate-800 text-xs
              "
            >
              Recommended safety target
            </p>

            <p
              className="
                mt-1
                text-slate-500 text-xs leading-5
              "
            >
              Based on your current financial profile,
              a target of{" "}
              <strong
                className="
                  text-slate-700
                "
              >
                {formatCurrency(
                  values.recommendedTarget
                )}
              </strong>{" "}
              may provide a stronger emergency reserve.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default EmergencyFundProgress;