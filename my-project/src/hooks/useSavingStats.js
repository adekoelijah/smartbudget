
// src/hooks/smartSave/useSavingStats.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import smartSaveService from "../../services/smartSaveService";

import {
  DEFAULT_CURRENCY,
  SAVINGS_STAT_TYPES,
} from "../../constants/smartSaveConstants";

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULTS = Object.freeze({
  currency:
    DEFAULT_CURRENCY ?? "NGN",

  autoFetch: true,

  includeAccount:
    true,

  includeChallenges:
    true,

  includeExecutions:
    true,

  includeInsights:
    true,

  includeGoals:
    true,

  includePlans:
    false,
});


/* =========================================================
   STAT TYPES
========================================================= */

const STAT_TYPES = Object.freeze({
  TOTAL_SAVED:
    SAVINGS_STAT_TYPES?.TOTAL_SAVED ??
    "total_saved",

  TOTAL_TARGET:
    SAVINGS_STAT_TYPES?.TOTAL_TARGET ??
    "total_target",

  ACTIVE_GOALS:
    SAVINGS_STAT_TYPES?.ACTIVE_GOALS ??
    "active_goals",

  COMPLETED_GOALS:
    SAVINGS_STAT_TYPES?.COMPLETED_GOALS ??
    "completed_goals",

  SAVINGS_RATE:
    SAVINGS_STAT_TYPES?.SAVINGS_RATE ??
    "savings_rate",

  MONTHLY_SAVINGS:
    SAVINGS_STAT_TYPES?.MONTHLY_SAVINGS ??
    "monthly_savings",

  WEEKLY_SAVINGS:
    SAVINGS_STAT_TYPES?.WEEKLY_SAVINGS ??
    "weekly_savings",

  TOTAL_CONTRIBUTIONS:
    SAVINGS_STAT_TYPES?.TOTAL_CONTRIBUTIONS ??
    "total_contributions",

  ACTIVE_CHALLENGES:
    SAVINGS_STAT_TYPES?.ACTIVE_CHALLENGES ??
    "active_challenges",

  COMPLETED_CHALLENGES:
    SAVINGS_STAT_TYPES?.COMPLETED_CHALLENGES ??
    "completed_challenges",

  PROGRESS:
    SAVINGS_STAT_TYPES?.PROGRESS ??
    "progress",

  FORECAST:
    SAVINGS_STAT_TYPES?.FORECAST ??
    "forecast",

  AVAILABLE_BALANCE:
    SAVINGS_STAT_TYPES?.AVAILABLE_BALANCE ??
    "available_balance",
});


/* =========================================================
   SAFE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);


const isFiniteNumber = (value) =>
  Number.isFinite(
    typeof value === "number"
      ? value
      : Number(value)
  );


const toNumber = (
  value,
  fallback = 0
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};


const normalizeText = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};


const normalizeKey = (
  value
) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_");


/* =========================================================
   RESPONSE UNWRAPPING
========================================================= */

/**
 * The service already unwraps the Axios transport layer.
 *
 * This additional helper handles business-level wrappers that
 * may still be returned by individual backend services.
 *
 * It intentionally does not reshape domain objects.
 */
const unwrapData = (
  value
) => {
  let current = value;

  /*
   * Prevent accidental infinite traversal in malformed
   * responses.
   */
  let depth = 0;

  while (
    depth < 3 &&
    isObject(current) &&
    Object.prototype.hasOwnProperty.call(
      current,
      "data"
    )
  ) {
    /*
     * Do not unwrap objects where `data` is clearly part of
     * the actual domain model.
     */
    if (
      Object.prototype.hasOwnProperty.call(
        current,
        "success"
      ) ||
      Object.keys(current).length <= 3
    ) {
      current =
        current.data;

      depth += 1;
      continue;
    }

    break;
  }

  return current;
};


/* =========================================================
   ARRAY NORMALIZATION
========================================================= */

const toArray = (
  value
) => {
  const data =
    unwrapData(value);

  if (
    Array.isArray(data)
  ) {
    return data;
  }

  if (
    isObject(data)
  ) {
    if (
      Array.isArray(
        data.items
      )
    ) {
      return data.items;
    }

    if (
      Array.isArray(
        data.results
      )
    ) {
      return data.results;
    }

    if (
      Array.isArray(
        data.records
      )
    ) {
      return data.records;
    }

    if (
      Array.isArray(
        data.goals
      )
    ) {
      return data.goals;
    }

    if (
      Array.isArray(
        data.challenges
      )
    ) {
      return data.challenges;
    }

    if (
      Array.isArray(
        data.executions
      )
    ) {
      return data.executions;
    }
  }

  return [];
};


/* =========================================================
   OBJECT LOOKUP
========================================================= */

const getFirstDefined = (
  object,
  keys,
  fallback
) => {
  if (
    !isObject(object)
  ) {
    return fallback;
  }

  for (const key of keys) {
    const value =
      object[key];

    if (
      value !== undefined &&
      value !== null
    ) {
      return value;
    }
  }

  return fallback;
};


/* =========================================================
   NESTED VALUE LOOKUP
========================================================= */

/**
 * Supports common backend structures such as:
 *
 * summary.totalSaved
 * summary.savings.totalSaved
 * summary.data.totalSaved
 */
const getNestedValue = (
  object,
  paths,
  fallback = undefined
) => {
  for (
    const path of paths
  ) {
    const parts =
      path.split(".");

    let current =
      object;

    let valid = true;

    for (
      const part of parts
    ) {
      if (
        !isObject(
          current
        ) &&
        !Array.isArray(
          current
        )
      ) {
        valid = false;
        break;
      }

      if (
        current[part] ===
        undefined
      ) {
        valid = false;
        break;
      }

      current =
        current[part];
    }

    if (
      valid &&
      current !== undefined &&
      current !== null
    ) {
      return current;
    }
  }

  return fallback;
};


/* =========================================================
   STAT FACTORY
========================================================= */

const createStat = ({
  type,
  value = 0,
  trend = null,
  secondaryValue,
  secondaryLabel,
  label,
  description,
  format,
}) => {
  const stat = {
    type,
    value,
  };

  if (
    trend !== null &&
    trend !== undefined
  ) {
    stat.trend =
      trend;
  }

  if (
    secondaryValue !==
      undefined &&
    secondaryValue !== null
  ) {
    stat.secondaryValue =
      secondaryValue;
  }

  if (
    secondaryLabel
  ) {
    stat.secondaryLabel =
      secondaryLabel;
  }

  if (
    label
  ) {
    stat.label =
      label;
  }

  if (
    description
  ) {
    stat.description =
      description;
  }

  if (
    format
  ) {
    stat.format =
      format;
  }

  return stat;
};


/* =========================================================
   INSIGHT STAT NORMALIZATION
========================================================= */

/**
 * Dashboard insight data is the preferred source because the
 * backend insight service owns financial intelligence.
 *
 * We only map backend fields into the presentation contract
 * expected by SavingsStats.jsx.
 */
const normalizeInsightStats = (
  insights
) => {
  const data =
    unwrapData(
      insights
    );

  if (
    !isObject(data)
  ) {
    return [];
  }

  /*
   * Some backends return:
   *
   * {
   *   statistics: [...]
   * }
   *
   * or:
   *
   * {
   *   stats: [...]
   * }
   */
  const suppliedStats =
    getFirstDefined(
      data,
      [
        "stats",
        "statistics",
        "metrics",
      ],
      null
    );

  if (
    Array.isArray(
      suppliedStats
    )
  ) {
    return suppliedStats
      .filter(Boolean)
      .map(
        (stat) => {
          if (
            !isObject(stat)
          ) {
            return null;
          }

          return {
            ...stat,
            type:
              normalizeKey(
                stat.type
              ),
          };
        }
      )
      .filter(
        Boolean
      );
  }

  /*
   * If the insight service returns a dashboard object rather
   * than an array, map known backend values.
   */
  const stats = [];

  const totalSaved =
    getNestedValue(
      data,
      [
        "totalSaved",
        "total_saved",
        "savings.totalSaved",
        "savings.total_saved",
        "summary.totalSaved",
        "summary.total_saved",
      ]
    );

  if (
    totalSaved !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.TOTAL_SAVED,
        value:
          toNumber(
            totalSaved
          ),
        format:
          "currency",
      })
    );
  }

  const totalTarget =
    getNestedValue(
      data,
      [
        "totalTarget",
        "total_target",
        "savings.totalTarget",
        "savings.total_target",
        "summary.totalTarget",
        "summary.total_target",
      ]
    );

  if (
    totalTarget !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.TOTAL_TARGET,
        value:
          toNumber(
            totalTarget
          ),
        format:
          "currency",
      })
    );
  }

  const savingsRate =
    getNestedValue(
      data,
      [
        "savingsRate",
        "savings_rate",
        "savings.rate",
        "summary.savingsRate",
      ]
    );

  if (
    savingsRate !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.SAVINGS_RATE,
        value:
          toNumber(
            savingsRate
          ),
        format:
          "percentage",
      })
    );
  }

  const monthlySavings =
    getNestedValue(
      data,
      [
        "monthlySavings",
        "monthly_savings",
        "savings.monthlySavings",
        "summary.monthlySavings",
      ]
    );

  if (
    monthlySavings !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.MONTHLY_SAVINGS,
        value:
          toNumber(
            monthlySavings
          ),
        format:
          "currency",
      })
    );
  }

  const weeklySavings =
    getNestedValue(
      data,
      [
        "weeklySavings",
        "weekly_savings",
        "savings.weeklySavings",
        "summary.weeklySavings",
      ]
    );

  if (
    weeklySavings !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.WEEKLY_SAVINGS,
        value:
          toNumber(
            weeklySavings
          ),
        format:
          "currency",
      })
    );
  }

  const progress =
    getNestedValue(
      data,
      [
        "progress",
        "overallProgress",
        "overall_progress",
        "savings.progress",
      ]
    );

  if (
    progress !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.PROGRESS,
        value:
          toNumber(
            progress
          ),
        format:
          "percentage",
      })
    );
  }

  const forecast =
    getNestedValue(
      data,
      [
        "forecast",
        "projectedSavings",
        "projected_savings",
        "savings.forecast",
      ]
    );

  if (
    forecast !==
    undefined &&
    isFiniteNumber(
      forecast
    )
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.FORECAST,
        value:
          toNumber(
            forecast
          ),
        format:
          "currency",
      })
    );
  }

  return stats;
};


/* =========================================================
   ACCOUNT STAT NORMALIZATION
========================================================= */

const normalizeAccountStats = (
  summary,
  balance
) => {
  const stats = [];

  const summaryData =
    unwrapData(
      summary
    );

  const balanceData =
    unwrapData(
      balance
    );

  const totalSaved =
    getNestedValue(
      summaryData,
      [
        "totalSaved",
        "total_saved",
        "saved",
        "currentSaved",
        "current_saved",
        "balance",
      ]
    );

  if (
    totalSaved !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.TOTAL_SAVED,
        value:
          toNumber(
            totalSaved
          ),
        format:
          "currency",
      })
    );
  }

  const availableBalance =
    getNestedValue(
      balanceData,
      [
        "availableBalance",
        "available_balance",
        "balance",
        "currentBalance",
        "current_balance",
      ]
    );

  if (
    availableBalance !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.AVAILABLE_BALANCE,
        value:
          toNumber(
            availableBalance
          ),
        format:
          "currency",
      })
    );
  }

  const contributions =
    getNestedValue(
      summaryData,
      [
        "totalContributions",
        "total_contributions",
        "contributions",
        "contributionCount",
      ]
    );

  if (
    contributions !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.TOTAL_CONTRIBUTIONS,
        value:
          toNumber(
            contributions
          ),
        format:
          "number",
      })
    );
  }

  return stats;
};


/* =========================================================
   GOAL STAT NORMALIZATION
========================================================= */

const normalizeGoalStats = (
  goals
) => {
  const list =
    toArray(
      goals
    );

  if (
    list.length ===
    0
  ) {
    return [];
  }

  /*
   * Counts are based on explicit backend goal status values.
   * This is aggregation for presentation only; it does not
   * calculate financial business rules.
   */
  let active = 0;
  let completed = 0;

  for (
    const goal of list
  ) {
    if (
      !isObject(goal)
    ) {
      continue;
    }

    const status =
      normalizeKey(
        getFirstDefined(
          goal,
          [
            "status",
            "state",
          ],
          ""
        )
      );

    if (
      [
        "active",
        "in_progress",
        "pending",
        "ongoing",
      ].includes(
        status
      )
    ) {
      active += 1;
    }

    if (
      [
        "completed",
        "complete",
        "achieved",
      ].includes(
        status
      )
    ) {
      completed += 1;
    }
  }

  return [
    createStat({
      type:
        STAT_TYPES.ACTIVE_GOALS,
      value:
        active,
      format:
        "number",
    }),

    createStat({
      type:
        STAT_TYPES.COMPLETED_GOALS,
      value:
        completed,
      format:
        "number",
    }),
  ];
};


/* =========================================================
   CHALLENGE STAT NORMALIZATION
========================================================= */

const normalizeChallengeStats = (
  summary
) => {
  const data =
    unwrapData(
      summary
    );

  if (
    !isObject(data)
  ) {
    return [];
  }

  const active =
    getNestedValue(
      data,
      [
        "active",
        "activeChallenges",
        "active_challenges",
        "counts.active",
      ]
    );

  const completed =
    getNestedValue(
      data,
      [
        "completed",
        "completedChallenges",
        "completed_challenges",
        "counts.completed",
      ]
    );

  const stats = [];

  if (
    active !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.ACTIVE_CHALLENGES,
        value:
          toNumber(
            active
          ),
        format:
          "number",
      })
    );
  }

  if (
    completed !==
    undefined
  ) {
    stats.push(
      createStat({
        type:
          STAT_TYPES.COMPLETED_CHALLENGES,
        value:
          toNumber(
            completed
          ),
        format:
          "number",
      })
    );
  }

  return stats;
};


/* =========================================================
   EXECUTION STAT NORMALIZATION
========================================================= */

const normalizeExecutionStats = (
  summary
) => {
  const data =
    unwrapData(
      summary
    );

  if (
    !isObject(data)
  ) {
    return [];
  }

  const contributions =
    getNestedValue(
      data,
      [
        "totalContributions",
        "total_contributions",
        "count",
        "total",
      ]
    );

  if (
    contributions ===
    undefined
  ) {
    return [];
  }

  return [
    createStat({
      type:
        STAT_TYPES.TOTAL_CONTRIBUTIONS,
      value:
        toNumber(
          contributions
        ),
      format:
        "number",
    }),
  ];
};


/* =========================================================
   STAT DEDUPLICATION
========================================================= */

const mergeStats = (
  ...groups
) => {
  const map =
    new Map();

  for (
    const group of groups
  ) {
    if (
      !Array.isArray(
        group
      )
    ) {
      continue;
    }

    for (
      const stat of group
    ) {
      if (
        !stat ||
        !stat.type
      ) {
        continue;
      }

      const key =
        normalizeKey(
          stat.type
        );

      /*
       * Later sources intentionally win.
       *
       * This allows backend insight statistics to override
       * generic account-derived presentation values.
       */
      map.set(
        key,
        {
          ...stat,
          type: key,
        }
      );
    }
  }

  return Array.from(
    map.values()
  );
};


/* =========================================================
   SERVICE ERROR NORMALIZATION
========================================================= */

const normalizeHookError = (
  error
) => {
  if (!error) {
    return null;
  }

  return {
    error,

    message:
      normalizeText(
        error.message
      ) ||
      "Unable to load savings statistics",

    code:
      error.code ??
      "SMART_SAVE_STATS_ERROR",

    status:
      error.status ??
      null,

    details:
      error.details ??
      null,
  };
};

/* =========================================================
   MAIN HOOK
========================================================= */

const useSavingStats = ({
  currency = DEFAULTS.currency,

  autoFetch = DEFAULTS.autoFetch,

  includeAccount = DEFAULTS.includeAccount,

  includeChallenges = DEFAULTS.includeChallenges,

  includeExecutions = DEFAULTS.includeExecutions,

  includeInsights = DEFAULTS.includeInsights,

  includeGoals = DEFAULTS.includeGoals,

  includePlans = DEFAULTS.includePlans,
} = {}) => {
  /* =======================================================
     STATE
  ======================================================= */

  const [state, setState] = useState(() => ({
    stats: [],

    raw: {
      primaryAccount: null,
      insights: null,
      accountSummary: null,
      accountBalance: null,
      goals: null,
      challenges: null,
      executions: null,
      plans: null,
    },

    loading: false,

    refreshing: false,

    error: null,

    lastUpdated: null,
  }));


  /* =======================================================
     LIFECYCLE / REQUEST CONTROL
  ======================================================= */

  const mountedRef = useRef(false);

  const requestIdRef = useRef(0);

  const activeRequestRef = useRef(null);


  /* =======================================================
     LATEST CONFIGURATION
  ======================================================= */

  const configRef = useRef({
    includeAccount,
    includeChallenges,
    includeExecutions,
    includeInsights,
    includeGoals,
    includePlans,
  });

  /*
   * Keep the latest configuration available without making
   * fetchStats depend on every configuration value.
   */
  useEffect(() => {
    configRef.current = {
      includeAccount,
      includeChallenges,
      includeExecutions,
      includeInsights,
      includeGoals,
      includePlans,
    };
  }, [
    includeAccount,
    includeChallenges,
    includeExecutions,
    includeInsights,
    includeGoals,
    includePlans,
  ]);


  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      /*
       * Invalidate every outstanding request.
       */
      requestIdRef.current += 1;

      /*
       * Abort the active request when possible.
       */
      if (
        activeRequestRef.current &&
        typeof activeRequestRef.current.abort ===
          "function"
      ) {
        activeRequestRef.current.abort();
      }

      activeRequestRef.current = null;
    };
  }, []);


  /* =======================================================
     SAFE STATE UPDATE
  ======================================================= */

  const updateStateIfCurrent = useCallback(
    (
      requestId,
      updater
    ) => {
      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return false;
      }

      setState(updater);

      return true;
    },
    []
  );


  /* =======================================================
     FETCH STATS
  ======================================================= */

  const fetchStats = useCallback(
    async ({
      silent = false,
    } = {}) => {
      /*
       * Cancel/invalidate the previous request.
       *
       * This is especially important when:
       *
       * refresh()
       * and
       * autoFetch
       *
       * happen close together.
       */
      if (
        activeRequestRef.current &&
        typeof activeRequestRef.current.abort ===
          "function"
      ) {
        activeRequestRef.current.abort();
      }

      const requestId =
        ++requestIdRef.current;

      /*
       * The current service layer does not expose AbortController
       * support explicitly, so this controller is primarily used
       * as lifecycle metadata and can be passed to services later
       * without changing the hook architecture.
       */
      const controller =
        typeof AbortController !== "undefined"
          ? new AbortController()
          : null;

      activeRequestRef.current =
        controller;

      if (!mountedRef.current) {
        return null;
      }

      /*
       * Set request state once at request start.
       */
      updateStateIfCurrent(
        requestId,
        (previous) => ({
          ...previous,

          loading:
            silent
              ? previous.loading
              : true,

          refreshing:
            silent
              ? true
              : false,

          error: null,
        })
      );


      /* =====================================================
         READ CURRENT CONFIGURATION
      ===================================================== */

      const {
        includeAccount:
          shouldIncludeAccount,

        includeChallenges:
          shouldIncludeChallenges,

        includeExecutions:
          shouldIncludeExecutions,

        includeInsights:
          shouldIncludeInsights,

        includeGoals:
          shouldIncludeGoals,

        includePlans:
          shouldIncludePlans,
      } = configRef.current;


      /* =====================================================
         LOCAL REQUEST DATA
      ===================================================== */

      let primaryAccount = null;

      let accountSummary = null;

      let accountBalance = null;

      let goals = null;

      let challenges = null;

      let executions = null;

      let insights = null;

      let plans = null;


      try {
        /* ===================================================
           ACCOUNT
        =================================================== */

        if (
          shouldIncludeAccount
        ) {
          primaryAccount =
            await smartSaveService
              .getPrimarySavingAccount();

          /*
           * Ignore stale request immediately after await.
           */
          if (
            requestId !==
            requestIdRef.current
          ) {
            return null;
          }

          const account =
            unwrapData(
              primaryAccount
            );

          const accountId =
            getNestedValue(
              account,
              [
                "_id",
                "id",
                "accountId",
              ]
            );

          if (accountId) {
            /*
             * Account summary and balance are independent.
             */
            [
              accountSummary,
              accountBalance,
            ] = await Promise.all([
              smartSaveService
                .getSavingAccountSummary(
                  accountId
                ),

              smartSaveService
                .getSavingAccountBalance(
                  accountId
                ),
            ]);
          }
        }


        /* ===================================================
           INSIGHTS
        =================================================== */

        if (
          shouldIncludeInsights
        ) {
          insights =
            await smartSaveService
              .getDashboardSavingInsights();
        }


        /* ===================================================
           SECONDARY RESOURCES
        =================================================== */

        const secondaryRequests = [];


        if (
          shouldIncludeGoals
        ) {
          secondaryRequests.push(
            smartSaveService
              .getSavingGoals()
              .then(
                (result) => {
                  goals = result;
                }
              )
          );
        }


        if (
          shouldIncludeChallenges
        ) {
          secondaryRequests.push(
            smartSaveService
              .getSavingsChallengeSummary()
              .then(
                (result) => {
                  challenges = result;
                }
              )
          );
        }


        if (
          shouldIncludeExecutions
        ) {
          secondaryRequests.push(
            smartSaveService
              .getSavingExecutionStats()
              .then(
                (result) => {
                  executions = result;
                }
              )
          );
        }


        if (
          shouldIncludePlans
        ) {
          secondaryRequests.push(
            smartSaveService
              .getSavingPlans()
              .then(
                (result) => {
                  plans = result;
                }
              )
          );
        }


        await Promise.all(
          secondaryRequests
        );


        /* ===================================================
           STALE REQUEST PROTECTION
        =================================================== */

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }


        /* ===================================================
           NORMALIZATION
        =================================================== */

        const insightStats =
          normalizeInsightStats(
            insights
          );

        const accountStats =
          normalizeAccountStats(
            accountSummary,
            accountBalance
          );

        const goalStats =
          normalizeGoalStats(
            goals
          );

        const challengeStats =
          normalizeChallengeStats(
            challenges
          );

        const executionStats =
          normalizeExecutionStats(
            executions
          );


        /* ===================================================
           MERGE
        =================================================== */

        const normalizedStats =
          mergeStats(
            accountStats,
            goalStats,
            challengeStats,
            executionStats,
            insightStats
          );


        /* ===================================================
           RAW RESPONSE
        =================================================== */

        const raw = {
          primaryAccount,
          insights,
          accountSummary,
          accountBalance,
          goals,
          challenges,
          executions,
          plans,
        };


        /* ===================================================
           SINGLE SUCCESS STATE UPDATE
        =================================================== */

        updateStateIfCurrent(
          requestId,
          () => ({
            stats:
              normalizedStats,

            raw,

            loading:
              false,

            refreshing:
              false,

            error:
              null,

            lastUpdated:
              new Date(),
          })
        );


        /*
         * Clear active request only if this is still the
         * current request.
         */
        if (
          requestId ===
          requestIdRef.current
        ) {
          activeRequestRef.current =
            null;
        }


        return {
          stats:
            normalizedStats,

          raw,
        };
      } catch (
        error
      ) {
        /*
         * Abort errors are expected during request replacement
         * or component unmount.
         */
        if (
          error?.name ===
          "AbortError"
        ) {
          return null;
        }


        /*
         * Never allow an old request to overwrite newer data.
         */
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }


        const normalizedError =
          normalizeHookError(
            error
          );


        /* ===================================================
           SINGLE ERROR STATE UPDATE
        =================================================== */

        updateStateIfCurrent(
          requestId,
          (previous) => ({
            ...previous,

            loading:
              false,

            refreshing:
              false,

            error:
              normalizedError,
          })
        );


        activeRequestRef.current =
          null;


        /*
         * Imperative callers can still handle the rejection.
         */
        throw error;
      }
    },
    [
      updateStateIfCurrent,
    ]
  );


  /* =======================================================
     AUTOMATIC INITIAL FETCH
  ======================================================= */

  const autoFetchKey = useMemo(
    () =>
      [
        autoFetch,
        includeAccount,
        includeChallenges,
        includeExecutions,
        includeInsights,
        includeGoals,
        includePlans,
      ].join("|"),
    [
      autoFetch,
      includeAccount,
      includeChallenges,
      includeExecutions,
      includeInsights,
      includeGoals,
      includePlans,
    ]
  );


  const lastAutoFetchKeyRef =
    useRef(null);


  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    /*
     * Prevent the same automatic request from being initiated
     * repeatedly because of unrelated renders.
     */
    if (
      lastAutoFetchKeyRef.current ===
      autoFetchKey
    ) {
      return undefined;
    }

    lastAutoFetchKeyRef.current =
      autoFetchKey;


    let cancelled = false;


    fetchStats().catch(
      () => {
        /*
         * fetchStats already stores the normalized error.
         *
         * The local catch prevents an unhandled promise
         * rejection from the automatic effect.
         */
        if (cancelled) {
          return;
        }
      }
    );


    return () => {
      cancelled = true;
    };
  }, [
    autoFetch,
    autoFetchKey,
    fetchStats,
  ]);


  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(
      () =>
        fetchStats({
          silent: true,
        }),
      [
        fetchStats,
      ]
    );


  /* =======================================================
     CLEAR ERROR
  ======================================================= */

  const clearError =
    useCallback(() => {
      if (!mountedRef.current) {
        return;
      }

      setState(
        (previous) => {
          if (!previous.error) {
            return previous;
          }

          return {
            ...previous,
            error: null,
          };
        }
      );
    }, []);


  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const hasStats =
    state.stats.length > 0;

  const isEmpty =
    !state.loading &&
    !hasStats &&
    !state.error;

  const isInitialLoading =
    state.loading &&
    !hasStats;

  const isRefreshing =
    state.refreshing &&
    hasStats;


  /* =======================================================
     STATS BY TYPE
  ======================================================= */

  const statsByType =
    useMemo(
      () =>
        state.stats.reduce(
          (
            result,
            stat
          ) => {
            if (
              stat?.type
            ) {
              result[
                stat.type
              ] = stat;
            }

            return result;
          },
          {}
        ),
      [
        state.stats,
      ]
    );


  /* =======================================================
     COMMON VALUES
  ======================================================= */

  const values =
    useMemo(
      () => {
        const getValue =
          (type) =>
            statsByType[
              type
            ]?.value ?? 0;

        return {
          totalSaved:
            getValue(
              STAT_TYPES.TOTAL_SAVED
            ),

          totalTarget:
            getValue(
              STAT_TYPES.TOTAL_TARGET
            ),

          activeGoals:
            getValue(
              STAT_TYPES.ACTIVE_GOALS
            ),

          completedGoals:
            getValue(
              STAT_TYPES.COMPLETED_GOALS
            ),

          savingsRate:
            getValue(
              STAT_TYPES.SAVINGS_RATE
            ),

          monthlySavings:
            getValue(
              STAT_TYPES.MONTHLY_SAVINGS
            ),

          weeklySavings:
            getValue(
              STAT_TYPES.WEEKLY_SAVINGS
            ),

          totalContributions:
            getValue(
              STAT_TYPES.TOTAL_CONTRIBUTIONS
            ),

          activeChallenges:
            getValue(
              STAT_TYPES.ACTIVE_CHALLENGES
            ),

          completedChallenges:
            getValue(
              STAT_TYPES.COMPLETED_CHALLENGES
            ),

          progress:
            getValue(
              STAT_TYPES.PROGRESS
            ),

          forecast:
            getValue(
              STAT_TYPES.FORECAST
            ),

          availableBalance:
            getValue(
              STAT_TYPES.AVAILABLE_BALANCE
            ),
        };
      },
      [
        statsByType,
      ]
    );


  /* =======================================================
     RESULT
  ======================================================= */

  return {
    /* Statistics */

    stats:
      state.stats,

    statsByType,

    values,

    currency,


    /* Request state */

    loading:
      state.loading,

    refreshing:
      state.refreshing,

    isLoading:
      state.loading,

    isInitialLoading,

    isRefreshing,

    hasStats,

    isEmpty,


    /* Error */

    error:
      state.error,

    hasError:
      Boolean(
        state.error
      ),

    clearError,


    /* Data */

    raw:
      state.raw,

    lastUpdated:
      state.lastUpdated,


    /* Actions */

    fetchStats,

    refresh,
  };
};


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default useSavingStats;