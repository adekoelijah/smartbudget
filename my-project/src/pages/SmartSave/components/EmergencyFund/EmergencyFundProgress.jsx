
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import { useMemo } from "react";

import {
  formatCurrency,
} from "../../../../utils/smartSave/emergencyFundFormatters";

import {
  calculateProgressPercentage,
} from "../../../../utils/smartSave/emergencyFundProgress";

import {
  EMERGENCY_FUND_STATUS,
} from "../../../../constants/emergencyFundConstants";

/* =========================================================
   SAFE HELPERS
========================================================= */

const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const toNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const clamp = (
  value,
  min = 0,
  max = 100
) =>
  Math.min(
    max,
    Math.max(
      min,
      toNumber(value)
    )
  );

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
    .toLowerCase();

  if (
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("funded") ||
    normalizedStatus.includes("reached")
  ) {
    return "funded";
  }

  if (
    normalizedStatus.includes("risk") ||
    normalizedStatus.includes("critical")
  ) {
    return "at_risk";
  }

  if (
    normalizedStatus.includes("behind")
  ) {
    return "behind";
  }

  if (
    normalizedStatus.includes("healthy") ||
    normalizedStatus.includes("good")
  ) {
    return "healthy";
  }

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

  return "starting";
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  funded: {
    label: "Fully funded",
    description:
      "Your emergency fund has reached its current target.",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    barClass:
      "bg-emerald-600",
  },

  healthy: {
    label: "Healthy progress",
    description:
      "Your emergency fund is progressing well toward its target.",
    icon: ShieldCheck,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    barClass:
      "bg-blue-600",
  },

  building: {
    label: "Building",
    description:
      "You are making progress toward your emergency fund target.",
    icon: TrendingUp,
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
    barClass:
      "bg-slate-900",
  },

  starting: {
    label: "Getting started",
    description:
      "Start building your emergency fund with consistent contributions.",
    icon: Target,
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
    barClass:
      "bg-slate-700",
  },

  behind: {
    label: "Behind target",
    description:
      "Your current balance is below the pace needed to reach the target.",
    icon: AlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    barClass:
      "bg-amber-500",
  },

  at_risk: {
    label: "Needs attention",
    description:
      "Your emergency fund needs additional contributions or a revised target.",
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-700",
    barClass:
      "bg-red-600",
  },
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
  /* =======================================================
     SOURCE
  ======================================================= */

  const source = useMemo(
    () =>
      firstDefined(
        emergencyFund,
        data
      ),
    [
      emergencyFund,
      data,
    ]
  );

  /* =======================================================
     DERIVED VALUES
  ======================================================= */
  
const values = (() => {
  const currentAmount = toNumber(
    firstDefined(
      suppliedCurrentAmount,
      source?.currentAmount,
      source?.currentBalance,
      source?.balance,
      source?.amountSaved,
      source?.savedAmount,
      source?.progress?.current,
      0
    ),
    0
  );

  const targetAmount = toNumber(
    firstDefined(
      suppliedTargetAmount,
      source?.targetAmount,
      source?.target,
      source?.recommendedTarget,
      source?.fundTarget,
      source?.goalAmount,
      source?.progress?.target,
      0
    ),
    0
  );

  const explicitProgress = firstDefined(
    suppliedProgress,
    source?.progressPercentage,
    source?.progressPercent,
    source?.percentage,
    source?.progress?.percentage
  );

  let progress = 0;

  if (
    explicitProgress !== undefined &&
    explicitProgress !== null &&
    explicitProgress !== ""
  ) {
    progress = clamp(
      toNumber(explicitProgress, 0)
    );
  } else if (targetAmount > 0) {
    progress = clamp(
      calculateProgressPercentage({
        targetAmount,
        currentAmount,
      })
    );
  }

  const calculatedRemaining = Math.max(
    targetAmount - currentAmount,
    0
  );

  const remainingAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        source?.remainingAmount,
        source?.amountRemaining,
        calculatedRemaining
      ),
      calculatedRemaining
    )
  );

  const rawMonthsCovered = firstDefined(
    source?.monthsCovered,
    source?.coverageMonths,
    source?.monthsOfCoverage,
    source?.coverage?.months
  );

  const monthsCovered =
    rawMonthsCovered !== undefined &&
    rawMonthsCovered !== null &&
    rawMonthsCovered !== ""
      ? Math.max(
          0,
          toNumber(rawMonthsCovered, 0)
        )
      : null;

  const rawRecommendedTarget = firstDefined(
    source?.recommendedTarget,
    source?.recommendedAmount,
    source?.idealTarget
  );

  const recommendedTarget =
    rawRecommendedTarget !== undefined &&
    rawRecommendedTarget !== null &&
    rawRecommendedTarget !== ""
      ? Math.max(
          0,
          toNumber(rawRecommendedTarget, 0)
        )
      : null;

  const status = normalizeStatus({
    status:
      source?.status ||
      source?.health ||
      source?.fundStatus ||
      null,

    progress,
    targetAmount,
    currentAmount,
  });

  return {
    currentAmount,
    targetAmount,
    progress,
    remainingAmount,
    monthsCovered,
    recommendedTarget,
    status,
  };
})();



  /* =======================================================
     LOADING
  ======================================================= */

  const isBusy =
    Boolean(loading) ||
    Boolean(isLoading);

  if (isBusy && !source) {
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
        <EmergencyFundProgressSkeleton />
      </section>
    );
  }

  /* =======================================================
     EMPTY
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
     STATUS
  ======================================================= */

  const statusConfig =
    STATUS_CONFIG[
      values.status
    ] ||
    STATUS_CONFIG.starting;

  const StatusIcon =
    statusConfig.icon;

  /* =======================================================
     COMPACT
  ======================================================= */

  if (compact) {
    return (
      <section
        aria-label="Emergency fund progress"
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
          className="
            overflow-hidden
            h-2
            bg-slate-100
            rounded-full
          "
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={values.progress}
          aria-label="Emergency fund progress"
        >
          <div
            className={`
              h-full
              rounded-full
              transition-all
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
      aria-labelledby="emergency-fund-progress-title"
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
            id="emergency-fund-progress-title"
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

      {/* ===================================================
          STATUS
      =================================================== */}

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
            <StatusIcon size={14} />

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

      {/* ===================================================
          PROGRESS
      =================================================== */}

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
          className="
            overflow-hidden
            h-3
            bg-slate-100
            rounded-full
          "
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={values.progress}
          aria-label="Emergency fund progress"
        >
          <div
            className={`
              h-full
              rounded-full
              transition-all
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

      {/* ===================================================
          METRICS
      =================================================== */}

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
              values.monthsCovered !==
              undefined
                ? `${toNumber(
                    values.monthsCovered
                  ).toFixed(1)} months`
                : "—"
            }
            description="Estimated expense coverage"
          />
        </div>
      ) : null}

      {/* ===================================================
          RECOMMENDED TARGET
      =================================================== */}

      {values.recommendedTarget !==
        undefined &&
      values.recommendedTarget !== null ? (
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
              Based on your current financial
              profile, a target of{" "}
              <strong
                className="
                  text-slate-700
                "
              >
                {formatCurrency(
                  values.recommendedTarget
                )}
              </strong>{" "}
              may provide a stronger emergency
              reserve.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default EmergencyFundProgress;