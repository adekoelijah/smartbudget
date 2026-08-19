import {
  useId,
  useMemo,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  Info,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import useSavingsForecast from "../../../../hooks/useSavingsForecast";

import {
  formatCurrency,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  normalizeForecast,
} from "../../../../utils/smartSave/savingsNormalizers";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_LOCALE = "en-NG";

const DEFAULT_HEIGHT = 280;
const MIN_HEIGHT = 180;
const MAX_HEIGHT = 600;

const DEFAULT_TITLE = "Savings Projection";

const DEFAULT_DESCRIPTION =
  "Projected savings growth toward your target.";

/* =========================================================
   SAFE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

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

const normalizeString = (
  value,
  fallback = ""
) =>
  typeof value === "string" &&
  value.trim()
    ? value.trim()
    : fallback;

const normalizeCurrency = (
  value
) =>
  normalizeString(
    value,
    DEFAULT_CURRENCY
  ).toUpperCase();

const normalizeLocale = (
  value
) =>
  normalizeString(
    value,
    DEFAULT_LOCALE
  );

/* =========================================================
   ERROR MESSAGE
========================================================= */

const normalizeErrorMessage = (
  error
) => {
  if (!error) {
    return "Something went wrong while preparing the savings projection.";
  }

  if (typeof error === "string") {
    return (
      error.trim() ||
      "Something went wrong while preparing the savings projection."
    );
  }

  if (error instanceof Error) {
    return (
      error.message?.trim() ||
      "Something went wrong while preparing the savings projection."
    );
  }

  if (isObject(error)) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.data?.message ||
      error?.data?.error ||
      error?.message ||
      error?.error;

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return message.trim();
    }
  }

  return "Something went wrong while preparing the savings projection.";
};

/* =========================================================
   DATE HELPERS
========================================================= */

const parseDate = (
  value
) => {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};

const getTimestamp = (
  value,
  fallback = Number.MAX_SAFE_INTEGER
) => {
  const date = parseDate(value);

  return date
    ? date.getTime()
    : fallback;
};

const formatChartDate = (
  value,
  locale = DEFAULT_LOCALE
) => {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      locale,
      {
        month: "short",
        day: "numeric",
      }
    ).format(date);
  } catch {
    return new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      {
        month: "short",
        day: "numeric",
      }
    ).format(date);
  }
};

/* =========================================================
   PROJECTION POINT
========================================================= */

const normalizeProjectionPoint = (
  point,
  index,
  locale
) => {
  if (!isObject(point)) {
    return null;
  }

  const date = firstDefined(
    point.date,
    point.periodDate,
    point.executionDate,
    point.projectedDate,
    point.timestamp,
    point.at
  );

  const projectedAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        point.projectedAmount,
        point.amount,
        point.balance,
        point.projectedBalance,
        point.value,
        point.total
      )
    )
  );

  const targetAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        point.targetAmount,
        point.target,
        point.goalAmount
      )
    )
  );

  const timestamp =
    getTimestamp(date);

  const rawId = firstDefined(
    point.id,
    point._id,
    point.key
  );

  return {
    id:
      rawId !== undefined
        ? String(rawId)
        : `${timestamp}-${index}`,

    date: date || null,

    timestamp,

    label: date
      ? formatChartDate(
          date,
          locale
        )
      : `Period ${index + 1}`,

    projectedAmount,

    targetAmount,
  };
};

/* =========================================================
   PROJECTION SERIES
========================================================= */

const extractProjectionSeries = (
  forecast,
  locale
) => {
  if (!isObject(forecast)) {
    return [];
  }

  const source = firstDefined(
    forecast.projections,
    forecast.projection,
    forecast.timeline,
    forecast.forecastPoints,
    forecast.points,
    forecast.series
  );

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map(
      (point, index) =>
        normalizeProjectionPoint(
          point,
          index,
          locale
        )
    )
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.timestamp -
        b.timestamp
    );
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const safeFormatCurrency = (
  value,
  currency,
  locale
) => {
  const amount = toNumber(value);

  try {
    return formatCurrency(
      amount,
      currency,
      locale
    );
  } catch {
    try {
      return new Intl.NumberFormat(
        locale,
        {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }
      ).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString(
        locale
      )}`;
    }
  }
};

/* =========================================================
   CHART TOOLTIP
========================================================= */

const ProjectionTooltip = ({
  active,
  payload,
  label,
  currency,
  locale,
}) => {
  if (
    !active ||
    !Array.isArray(payload) ||
    payload.length === 0
  ) {
    return null;
  }

  const projected = payload.find(
    (item) =>
      item?.dataKey ===
      "projectedAmount"
  );

  const target = payload.find(
    (item) =>
      item?.dataKey ===
      "targetAmount"
  );

  return (
    <div
      className="
        min-w-[180px]
        p-3
        bg-white
        border border-slate-200 rounded-xl
        shadow-lg
      "
    >
      <p
        className="
          mb-2
          font-semibold text-slate-900 text-xs
        "
      >
        {label || "Projection"}
      </p>

      {projected ? (
        <div
          className="
            flex justify-between items-center
            text-xs
            gap-4
          "
        >
          <span
            className="
              text-slate-500
            "
          >
            Projected
          </span>

          <span
            className="
              font-semibold text-slate-900
            "
          >
            {safeFormatCurrency(
              projected.value,
              currency,
              locale
            )}
          </span>
        </div>
      ) : null}

      {target ? (
        <div
          className="
            flex justify-between items-center
            mt-1
            text-xs
            gap-4
          "
        >
          <span
            className="
              text-slate-500
            "
          >
            Target
          </span>

          <span
            className="
              font-semibold text-slate-700
            "
          >
            {safeFormatCurrency(
              target.value,
              currency,
              locale
            )}
          </span>
        </div>
      ) : null}
    </div>
  );
};

/* =========================================================
   LOADING
========================================================= */

const ChartSkeleton = ({
  height,
}) => (
  <div
    role="status"
    aria-label="Loading savings projection"
    aria-busy="true"
    className="
      animate-pulse
    "
  >
    <div
      className="
        w-32 h-4
        mb-4
        bg-slate-200
        rounded
      "
      /
    >

    <div
      className="
        w-full
        bg-slate-100
        rounded-xl
      "
      style={{
        height,
      }}
    /
    >

    <span
      className="
        sr-only
      "
    >
      Loading savings projection.
      Please wait.
    </span>
  </div>
);

/* =========================================================
   EMPTY
========================================================= */

const EmptyProjection = () => (
  <div
    role="status"
    className="
      flex flex-col justify-center items-center
      min-h-[260px]
      px-6
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
      <TrendingUp
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
      Projection unavailable
    </h4>

    <p
      className="
        max-w-sm
        mt-1
        text-slate-500 text-xs leading-5
      "
    >
      A projection chart will appear when
      your SmartSave forecast contains
      enough timeline data.
    </p>
  </div>
);

/* =========================================================
   ERROR
========================================================= */

const ProjectionError = ({
  error,
  onRetry,
}) => (
  <div
    role="alert"
    aria-live="assertive"
    className="
      flex justify-center items-center
      min-h-[260px]
      p-6
      bg-red-50
      border border-red-200 rounded-xl
    "
  >
    <div
      className="
        max-w-sm
        text-center
      "
    >
      <div
        className="
          flex justify-center items-center
          w-10 h-10
          mx-auto
          bg-red-100
          rounded-full
        "
        aria-hidden="true"
      >
        <AlertTriangle
          size={20}
          className="
            text-red-600
          "
          /
        >
      </div>

      <h4
        className="
          mt-3
          font-semibold text-red-800 text-sm
        "
      >
        Unable to load projection
      </h4>

      <p
        className="
          mt-1
          text-red-700 text-xs leading-5
        "
      >
        {normalizeErrorMessage(error)}
      </p>

      {typeof onRetry === "function" ? (
        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex justify-center items-center
            min-h-9
            mt-4 px-3 py-2
            font-semibold text-red-700 text-xs
            bg-white hover:bg-red-100
            border border-red-200 rounded-lg focus:outline-none
            focus:ring-2 focus:ring-red-500/30
            transition
            gap-2
          "
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
          />

          Try again
        </button>
      ) : null}
    </div>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsProjectionChart = ({
  goalId,
  planId,

  forecast: suppliedForecast = null,

  title = DEFAULT_TITLE,

  description =
    DEFAULT_DESCRIPTION,

  height = DEFAULT_HEIGHT,

  showTarget = true,

  showRefresh = true,

  currency = DEFAULT_CURRENCY,

  locale = DEFAULT_LOCALE,

  className = "",
}) => {
  /* =======================================================
     SAFE PROPS
  ======================================================= */

  const chartHeight = Math.min(
    MAX_HEIGHT,
    Math.max(
      MIN_HEIGHT,
      toNumber(
        height,
        DEFAULT_HEIGHT
      )
    )
  );

  const resolvedCurrency =
    normalizeCurrency(currency);

  const resolvedLocale =
    normalizeLocale(locale);

  /* =======================================================
     UNIQUE CHART ID
  ======================================================= */

  const generatedId = useId();

  const gradientId =
    `smart-save-projection-${generatedId
      .replace(/:/g, "")}`;

  /* =======================================================
     FORECAST HOOK
  ======================================================= */

  const forecastState =
    useSavingsForecast({
      goalId,
      planId,
      enabled:
        suppliedForecast == null,
    }) || {};

  const {
    forecast: hookForecast = null,
    data = null,
    loading = false,
    isLoading = false,
    error = null,
    refetch,
    refresh,
  } = forecastState;

  /* =======================================================
     FORECAST SOURCE
  ======================================================= */

  const rawForecast =
    useMemo(
      () =>
        firstDefined(
          suppliedForecast,
          hookForecast,
          data?.forecast,
          data
        ),
      [
        suppliedForecast,
        hookForecast,
        data,
      ]
    );

  /* =======================================================
     NORMALIZED FORECAST
  ======================================================= */

  const forecast =
    useMemo(() => {
      if (!rawForecast) {
        return null;
      }

      try {
        return normalizeForecast(
          rawForecast
        );
      } catch {
        return null;
      }
    }, [rawForecast]);

  /* =======================================================
     PROJECTION SERIES
  ======================================================= */

  const projectionData =
    useMemo(
      () =>
        extractProjectionSeries(
          forecast,
          resolvedLocale
        ),
      [
        forecast,
        resolvedLocale,
      ]
    );

  /* =======================================================
     TARGET AMOUNT
  ======================================================= */

  const targetAmount =
    useMemo(() => {
      const projectionTarget =
        projectionData.find(
          (item) =>
            item.targetAmount > 0
        )?.targetAmount;

      return Math.max(
        0,
        toNumber(
          firstDefined(
            forecast?.targetAmount,
            forecast?.goalAmount,
            forecast?.target,
            projectionTarget
          )
        )
      );
    }, [
      forecast,
      projectionData,
    ]);

  /* =======================================================
     CURRENT AMOUNT
  ======================================================= */

  const currentAmount =
    useMemo(
      () =>
        Math.max(
          0,
          toNumber(
            firstDefined(
              forecast?.currentAmount,
              forecast?.currentSaved,
              forecast?.amountSaved,
              forecast?.progress?.current,
              projectionData[0]
                ?.projectedAmount
            )
          )
        ),
      [
        forecast,
        projectionData,
      ]
    );

  /* =======================================================
     FINAL PROJECTED AMOUNT
  ======================================================= */

  const projectedFinalAmount =
    useMemo(() => {
      if (
        projectionData.length === 0
      ) {
        return Math.max(
          0,
          toNumber(
            firstDefined(
              forecast?.projectedAmount,
              forecast?.projectedBalance,
              forecast?.forecastAmount
            )
          )
        );
      }

      return Math.max(
        0,
        toNumber(
          projectionData[
            projectionData.length - 1
          ]?.projectedAmount
        )
      );
    }, [
      forecast,
      projectionData,
    ]);

  /* =======================================================
     PROJECTED PROGRESS
  ======================================================= */

  const projectedProgress =
    useMemo(() => {
      if (targetAmount <= 0) {
        return 0;
      }

      return clamp(
        (
          projectedFinalAmount /
          targetAmount
        ) * 100
      );
    }, [
      projectedFinalAmount,
      targetAmount,
    ]);

  /* =======================================================
     CHART DATA
  ======================================================= */

  const chartData =
    useMemo(
      () =>
        projectionData.map(
          (point) => ({
            ...point,

            projectedAmount:
              Math.max(
                0,
                toNumber(
                  point.projectedAmount
                )
              ),

            targetAmount:
              point.targetAmount > 0
                ? point.targetAmount
                : targetAmount > 0
                  ? targetAmount
                  : null,
          })
        ),
      [
        projectionData,
        targetAmount,
      ]
    );

  /* =======================================================
     LOADING
  ======================================================= */

  const busy =
    Boolean(loading) ||
    Boolean(isLoading);

  /* =======================================================
     RETRY
  ======================================================= */

  const retry =
    typeof refetch === "function"
      ? refetch
      : typeof refresh === "function"
        ? refresh
        : undefined;

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summaryText =
    useMemo(() => {
      if (
        targetAmount <= 0 ||
        projectedFinalAmount <= 0
      ) {
        return null;
      }

      if (
        projectedFinalAmount >=
        targetAmount
      ) {
        return "Your current savings trajectory is projected to reach the target.";
      }

      return "Your current trajectory is below the target. Increasing contributions may improve the projected outcome.";
    }, [
      targetAmount,
      projectedFinalAmount,
    ]);

  /* =======================================================
     ACCESSIBILITY SUMMARY
  ======================================================= */

  const chartDescription =
    useMemo(() => {
      if (
        targetAmount <= 0
      ) {
        return "Savings projection chart.";
      }

      return `Savings projection showing ${Math.round(
        projectedProgress
      )}% projected progress toward a target of ${safeFormatCurrency(
        targetAmount,
        resolvedCurrency,
        resolvedLocale
      )}.`;
    }, [
      targetAmount,
      projectedProgress,
      resolvedCurrency,
      resolvedLocale,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
      aria-labelledby={`${gradientId}-title`}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex justify-between items-start
          mb-5
          gap-4
        "
      >
        <div
          className="
            flex items-start
            min-w-0
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
            <TrendingUp
              size={18}
              className="
                text-slate-700
              "
              /
            >
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h3
              id={`${gradientId}-title`}
              className="
                font-bold text-slate-900 text-sm
              "
            >
              {normalizeString(
                title,
                DEFAULT_TITLE
              )}
            </h3>

            <p
              className="
                mt-0.5
                text-slate-500 text-xs
              "
            >
              {normalizeString(
                description,
                DEFAULT_DESCRIPTION
              )}
            </p>
          </div>
        </div>

        {showRefresh &&
        typeof retry === "function" ? (
          <button
            type="button"
            onClick={retry}
            disabled={busy}
            aria-label="Refresh savings projection"
            title="Refresh projection"
            className="
              flex justify-center items-center
              w-9 h-9
              text-slate-500 hover:text-slate-900
              bg-white hover:bg-slate-50
              border border-slate-200 rounded-lg focus:outline-none
              focus:ring-2 focus:ring-slate-400/30
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            <RefreshCw
              size={15}
              className={
                busy
                  ? "animate-spin"
                  : undefined
              }
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {busy && !forecast ? (
        <ChartSkeleton
          height={chartHeight}
        />
      ) : null}

      {/* =================================================
          ERROR
      ================================================= */}

      {!busy && error ? (
        <ProjectionError
          error={error}
          onRetry={retry}
        />
      ) : null}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!busy &&
      !error &&
      chartData.length === 0 ? (
        <EmptyProjection />
      ) : null}

      {/* =================================================
          CHART
      ================================================= */}

      {!busy &&
      !error &&
      chartData.length > 0 ? (
        <div>
          <p
            className="
              sr-only
            "
          >
            {chartDescription}
          </p>

          <div
            className="
              w-full min-w-0
            "
            style={{
              height: chartHeight,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 8,
                  right: 8,
                  left: 4,
                  bottom: 4,
                }}
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopOpacity={0.22}
                    />

                    <stop
                      offset="100%"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.35}
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={68}
                  tickFormatter={(value) =>
                    safeFormatCurrency(
                      value,
                      resolvedCurrency,
                      resolvedLocale
                    )
                  }
                />

                <Tooltip
                  content={
                    <ProjectionTooltip
                      currency={
                        resolvedCurrency
                      }
                      locale={
                        resolvedLocale
                      }
                    />
                  }
                />

                {showTarget &&
                targetAmount > 0 ? (
                  <ReferenceLine
                    y={targetAmount}
                    strokeDasharray="5 5"
                    strokeOpacity={0.6}
                    label={{
                      value: "Target",
                      position:
                        "insideTopRight",
                      fontSize: 10,
                    }}
                  />
                ) : null}

                <Area
                  type="monotone"
                  dataKey="projectedAmount"
                  name="Projected"
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* =================================================
              LEGEND
          ================================================= */}

          <div
            className="
              flex flex-wrap items-center
              mt-4
              text-xs
              gap-x-5 gap-y-2
            "
            aria-hidden="true"
          >
            <div
              className="
                flex items-center
                gap-2
              "
            >
              <span
                className="
                  w-2 h-2
                  bg-slate-700
                  rounded-full
                "
                /
              >

              <span
                className="
                  text-slate-500
                "
              >
                Projected savings
              </span>
            </div>

            {showTarget &&
            targetAmount > 0 ? (
              <div
                className="
                  flex items-center
                  gap-2
                "
              >
                <span
                  className="
                    w-4 h-0
                    border-slate-400 border-t border-dashed
                  "
                  /
                >

                <span
                  className="
                    text-slate-500
                  "
                >
                  Target
                </span>
              </div>
            ) : null}
          </div>

          {/* =================================================
              SUMMARY METRICS
          ================================================= */}

          <div
            className="
              grid grid-cols-1 sm:grid-cols-3
              mt-5
              gap-3
            "
          >
            <div
              className="
                p-3
                bg-slate-50
                border border-slate-200 rounded-xl
              "
            >
              <div
                className="
                  flex items-center
                  mb-1
                  text-slate-500
                  gap-2
                "
              >
                <TrendingUp
                  size={14}
                  aria-hidden="true"
                />

                <span
                  className="
                    font-medium text-[11px]
                  "
                >
                  Current
                </span>
              </div>

              <p
                className="
                  font-bold text-slate-900 text-sm
                "
              >
                {safeFormatCurrency(
                  currentAmount,
                  resolvedCurrency,
                  resolvedLocale
                )}
              </p>
            </div>

            <div
              className="
                p-3
                bg-slate-50
                border border-slate-200 rounded-xl
              "
            >
              <div
                className="
                  flex items-center
                  mb-1
                  text-slate-500
                  gap-2
                "
              >
                <Target
                  size={14}
                  aria-hidden="true"
                />

                <span
                  className="
                    font-medium text-[11px]
                  "
                >
                  Target
                </span>
              </div>

              <p
                className="
                  font-bold text-slate-900 text-sm
                "
              >
                {targetAmount > 0
                  ? safeFormatCurrency(
                      targetAmount,
                      resolvedCurrency,
                      resolvedLocale
                    )
                  : "—"}
              </p>
            </div>

            <div
              className="
                p-3
                bg-slate-50
                border border-slate-200 rounded-xl
              "
            >
              <div
                className="
                  flex items-center
                  mb-1
                  text-slate-500
                  gap-2
                "
              >
                <CalendarDays
                  size={14}
                  aria-hidden="true"
                />

                <span
                  className="
                    font-medium text-[11px]
                  "
                >
                  Projected
                </span>
              </div>

              <p
                className="
                  font-bold text-slate-900 text-sm
                "
              >
                {projectedFinalAmount > 0
                  ? safeFormatCurrency(
                      projectedFinalAmount,
                      resolvedCurrency,
                      resolvedLocale
                    )
                  : "—"}
              </p>

              {targetAmount > 0 &&
              projectedFinalAmount > 0 ? (
                <p
                  className="
                    mt-1
                    font-medium text-[11px] text-slate-500
                  "
                >
                  {Math.round(
                    projectedProgress
                  )}
                  % of target
                </p>
              ) : null}
            </div>
          </div>

          {/* =================================================
              PROJECTION INSIGHT
          ================================================= */}

          {summaryText ? (
            <div
              className="
                flex items-start
                mt-4 p-4
                bg-slate-50
                border border-slate-200 rounded-xl
                gap-3
              "
            >
              <Info
                size={15}
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
                  Projection insight
                </p>

                <p
                  className="
                    mt-1
                    text-slate-500 text-xs leading-5
                  "
                >
                  {summaryText}
                </p>
              </div>
            </div>
          ) : null}

          {/* =================================================
              DISCLAIMER
          ================================================= */}

          <p
            className="
              mt-4
              text-[11px] text-slate-400 leading-5
            "
          >
            Projections are estimates based on
            available SmartSave savings data and
            may change as contributions and
            schedules change.
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default SavingsProjectionChart;