
import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Info,
  Loader2,
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
  // formatDate,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  normalizeForecast,
} from "../../../../utils/smartSave/savingsNormalizers";

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

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(
    max,
    Math.max(min, toNumber(value))
  );

/* =========================================================
   DATE HELPERS
========================================================= */

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const formatChartDate = (value) => {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
};

const getTimestamp = (value) => {
  const date = parseDate(value);

  return date
    ? date.getTime()
    : Number.MAX_SAFE_INTEGER;
};

/* =========================================================
   FORECAST POINT NORMALIZER
========================================================= */

const normalizeProjectionPoint = (
  point,
  index
) => {
  if (!point) {
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

  const projectedAmount = toNumber(
    firstDefined(
      point.projectedAmount,
      point.amount,
      point.balance,
      point.projectedBalance,
      point.value,
      point.total
    )
  );

  const targetAmount = toNumber(
    firstDefined(
      point.targetAmount,
      point.target,
      point.goalAmount
    )
  );

  return {
    id:
      point.id ||
      point._id ||
      `${date || "point"}-${index}`,

    date,

    timestamp: getTimestamp(date),

    label:
      date
        ? formatChartDate(date)
        : `Period ${index + 1}`,

    projectedAmount,

    targetAmount,
  };
};

/* =========================================================
   EXTRACT PROJECTION SERIES
========================================================= */

const extractProjectionSeries = (
  forecast
) => {
  if (!forecast) {
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
    .map(normalizeProjectionPoint)
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.timestamp - b.timestamp
    );
};

/* =========================================================
   CHART TOOLTIP
========================================================= */

const ProjectionTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const projected = payload.find(
    (item) =>
      item.dataKey ===
      "projectedAmount"
  );

  const target = payload.find(
    (item) =>
      item.dataKey ===
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
        {label}
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
            {formatCurrency(
              projected.value
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
            {formatCurrency(
              target.value
            )}
          </span>
        </div>
      ) : null}
    </div>
  );
};

/* =========================================================
   SKELETON
========================================================= */

const ChartSkeleton = () => (
  <div
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
        h-[260px]
        bg-slate-100
        rounded-xl
      "
      /
    >
  </div>
);

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyProjection = () => (
  <div
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
      A projection chart will appear when your
      SmartSave forecast contains enough timeline
      data.
    </p>
  </div>
);

/* =========================================================
   ERROR STATE
========================================================= */

const ProjectionError = ({
  error,
  onRetry,
}) => (
  <div
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
      <AlertTriangle
        size={22}
        className="
          mx-auto
          text-red-600
        "
        /
      >

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
        {typeof error === "string"
          ? error
          : error?.message ||
            "Something went wrong while preparing the savings projection."}
      </p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex items-center
            mt-4 px-3 py-2
            font-semibold text-red-700 text-xs
            bg-white hover:bg-red-100
            border border-red-200 rounded-lg focus:outline-none
            focus:ring-2 focus:ring-red-500/30
            transition
            gap-2
          "
        >
          <RefreshCw size={14} />
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
  forecast: suppliedForecast,
  title = "Savings Projection",
  description = "Projected savings growth toward your target.",
  height = 280,
  showTarget = true,
  showRefresh = true,
  className = "",
}) => {
  /*
   * No direct API calls are made here.
   *
   * The hook remains the integration point with
   * SmartSave's service layer.
   */
  const forecastState =
    useSavingsForecast({
      goalId,
      planId,
      enabled: !suppliedForecast,
    }) || {};

  const {
    forecast: hookForecast,
    data,
    loading = false,
    isLoading = false,
    error,
    refetch,
    refresh,
  } = forecastState;

  /* =======================================================
     FORECAST SOURCE
  ======================================================= */

  const rawForecast = useMemo(
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
     NORMALIZE FORECAST
  ======================================================= */

  const forecast = useMemo(() => {
    if (!rawForecast) {
      return null;
    }

    return normalizeForecast(
      rawForecast
    );
  }, [rawForecast]);

  /* =======================================================
     PROJECTION DATA
  ======================================================= */

  const projectionData = useMemo(
    () =>
      extractProjectionSeries(
        forecast
      ),
    [forecast]
  );

  /* =======================================================
     TARGET
  ======================================================= */

  const targetAmount = useMemo(
    () =>
      toNumber(
        firstDefined(
          forecast?.targetAmount,
          forecast?.goalAmount,
          forecast?.target,
          projectionData.find(
            (item) =>
              item.targetAmount > 0
          )?.targetAmount
        )
      ),
    [
      forecast,
      projectionData,
    ]
  );

  /* =======================================================
     CURRENT AMOUNT
  ======================================================= */

  const currentAmount = toNumber(
  firstDefined(
    forecast?.currentAmount,
    forecast?.currentSaved,
    forecast?.amountSaved,
    forecast?.progress?.current,
    projectionData[0]?.projectedAmount
  )
);

  /* =======================================================
     PROJECTED FINAL AMOUNT
  ======================================================= */

  const projectedFinalAmount =
    useMemo(
      () =>
        toNumber(
          projectionData[
            projectionData.length - 1
          ]?.projectedAmount
        ),
      [projectionData]
    );

  /* =======================================================
     PROGRESS
  ======================================================= */

  const projectedProgress =
    useMemo(() => {
      if (targetAmount <= 0) {
        return 0;
      }

      return clamp(
        (projectedFinalAmount /
          targetAmount) *
          100
      );
    }, [
      projectedFinalAmount,
      targetAmount,
    ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const retry =
    typeof refetch === "function"
      ? refetch
      : typeof refresh === "function"
        ? refresh
        : undefined;

  const busy =
    Boolean(loading) ||
    Boolean(isLoading);

  /* =======================================================
     CHART DATA
  ======================================================= */

  const chartData = useMemo(
    () =>
      projectionData.map(
        (point) => ({
          ...point,

          projectedAmount:
            Math.max(
              0,
              point.projectedAmount
            ),

          targetAmount:
            point.targetAmount > 0
              ? point.targetAmount
              : targetAmount,
        })
      ),
    [
      projectionData,
      targetAmount,
    ]
  );

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summaryText = useMemo(() => {
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
     RENDER
  ======================================================= */

  return (
    <section
      className={`
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
      aria-labelledby="savings-projection-title"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
              id="savings-projection-title"
              className="
                font-bold text-slate-900 text-sm
              "
            >
              {title}
            </h3>

            <p
              className="
                mt-0.5
                text-slate-500 text-xs
              "
            >
              {description}
            </p>
          </div>
        </div>

        {showRefresh && retry ? (
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
                  : ""
              }
            />
          </button>
        ) : null}
      </div>

      {/* ===================================================
          LOADING
      =================================================== */}

      {busy && !forecast ? (
        <ChartSkeleton />
      ) : null}

      {/* ===================================================
          ERROR
      =================================================== */}

      {!busy && error ? (
        <ProjectionError
          error={error}
          onRetry={retry}
        />
      ) : null}

      {/* ===================================================
          EMPTY
      =================================================== */}

      {!busy &&
      !error &&
      projectionData.length === 0 ? (
        <EmptyProjection />
      ) : null}

      {/* ===================================================
          CHART
      =================================================== */}

      {!busy &&
      !error &&
      chartData.length > 0 ? (
        <div>
          <div
            className="
              w-full min-w-0 h-72
            "
            style={{
              height,
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
                    id="smartSaveProjectionGradient"
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
                  width={62}
                  tickFormatter={(value) =>
                    formatCurrency(
                      value,
                      {
                        compact: true,
                      }
                    )
                  }
                />

                <Tooltip
                  content={
                    <ProjectionTooltip />
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
                      position: "insideTopRight",
                      fontSize: 10,
                    }}
                  />
                ) : null}

                <Area
                  type="monotone"
                  dataKey="projectedAmount"
                  name="Projected"
                  strokeWidth={2.5}
                  fill="url(#smartSaveProjectionGradient)"
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
                <TrendingUp size={14} />

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
                {formatCurrency(
                  currentAmount
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
                <Target size={14} />

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
                  ? formatCurrency(
                      targetAmount
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
    <CalendarDays size={14} />

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
      ? formatCurrency(
          projectedFinalAmount
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
      {Math.round(projectedProgress)}% of target
    </p>
  ) : null}
</div>
          </div>

          {/* =================================================
              PROJECTION RESULT
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
              FOOTNOTE
          ================================================= */}

          <p
            className="
              mt-4
              text-[11px] text-slate-400 leading-5
            "
          >
            Projections are estimates based on the
            available SmartSave savings data and may
            change as contributions and schedules change.
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default SavingsProjectionChart;