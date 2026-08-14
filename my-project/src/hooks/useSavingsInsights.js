// hooks/useSavingsInsights.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import smartSaveService from "../services/smartSaveService";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_STATE = {
  dashboard: null,
  summary: null,
  topInsight: null,
  goalInsights: {},
};

const DEFAULT_OPTIONS = {
  asOfDate: null,
};

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

/**
 * Normalize an optional asOfDate value.
 *
 * The backend contract accepts:
 *
 * ?asOfDate=2026-08-13
 *
 * We intentionally do not create a date automatically here.
 * When omitted, the backend/service determines the current
 * date.
 */
const normalizeAsOfDate = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return null;
    }

    return value
      .toISOString()
      .slice(0, 10);
  }

  const stringValue =
    String(value).trim();

  if (!stringValue) {
    return null;
  }

  /*
   * Preserve an already normalized
   * YYYY-MM-DD value.
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue
    )
  ) {
    return stringValue;
  }

  const date =
    new Date(stringValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date
    .toISOString()
    .slice(0, 10);
};

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

/**
 * Dashboard insight response.
 *
 * Expected backend service output is generally:
 *
 * {
 *   summary: {...},
 *   insights: [...],
 *   goals: [...]
 * }
 *
 * This helper keeps the hook resilient to the common
 * response wrapper used by the API layer.
 */
const normalizeDashboardResponse = (
  response
) => {
  if (
    response?.data &&
    typeof response.data ===
      "object" &&
    !Array.isArray(
      response.data
    )
  ) {
    return response.data;
  }

  if (
    response &&
    typeof response ===
      "object" &&
    !Array.isArray(response)
  ) {
    return response;
  }

  return {
    summary: null,
    insights: [],
    goals: [],
  };
};

/**
 * Normalize dashboard insights.
 */
const normalizeInsights = (
  response
) => {
  if (
    Array.isArray(
      response?.insights
    )
  ) {
    return response.insights;
  }

  if (
    Array.isArray(
      response?.data?.insights
    )
  ) {
    return response.data.insights;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

/**
 * Normalize summary response.
 */
const normalizeSummary = (
  response
) => {
  if (
    response?.summary &&
    typeof response.summary ===
      "object"
  ) {
    return response.summary;
  }

  if (
    response?.data?.summary &&
    typeof response.data.summary ===
      "object"
  ) {
    return response.data.summary;
  }

  if (
    response?.data &&
    typeof response.data ===
      "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    typeof response ===
      "object" &&
    !Array.isArray(response)
  ) {
    return response;
  }

  return null;
};

/**
 * Normalize top insight response.
 */
const normalizeTopInsight = (
  response
) => {
  if (
    response?.insight &&
    typeof response.insight ===
      "object"
  ) {
    return response.insight;
  }

  if (
    response?.data?.insight &&
    typeof response.data.insight ===
      "object"
  ) {
    return response.data.insight;
  }

  if (
    response?.data &&
    typeof response.data ===
      "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    typeof response ===
      "object" &&
    !Array.isArray(response)
  ) {
    return response;
  }

  return null;
};

/**
 * Normalize goal-level insight response.
 */
const normalizeGoalInsights = (
  response
) => {
  if (
    response?.snapshot ||
    response?.insights
  ) {
    return response;
  }

  if (
    response?.data?.snapshot ||
    response?.data?.insights
  ) {
    return response.data;
  }

  return {
    snapshot: null,
    insights: [],
  };
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const normalizeError = (
  error
) => {
  const serviceError =
    typeof smartSaveService
      ?.normalizeError ===
    "function"
      ? smartSaveService.normalizeError(
          error
        )
      : error;

  return {
    message:
      serviceError?.message ||
      "Unable to load savings insights.",

    code:
      serviceError?.code ||
      "SAVINGS_INSIGHTS_ERROR",

    statusCode:
      serviceError?.statusCode ??
      serviceError?.response?.status ??
      null,

    details:
      serviceError?.details ??
      null,

    originalError:
      error,
  };
};

/* =========================================================
   HOOK
========================================================= */

const useSavingsInsights = (
  options = {}
) => {
  const mountedRef =
    useRef(false);

  /*
   * Every asynchronous operation gets an ID.
   *
   * This prevents an older request from overwriting
   * a newer request when multiple requests are running.
   */
  const requestIdRef =
    useRef(0);

  const normalizedOptions =
    useMemo(
      () => ({
        asOfDate:
          normalizeAsOfDate(
            options?.asOfDate
          ),
      }),
      [options?.asOfDate]
    );

  const [
    state,
    setState,
  ] = useState(
    DEFAULT_STATE
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    goalLoading,
    setGoalLoading,
  ] = useState({});

  const [
    goalErrors,
    setGoalErrors,
  ] = useState({});

  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      /*
       * Invalidate all pending requests.
       */
      requestIdRef.current += 1;
    };
  }, []);

  /* =======================================================
     BUILD REQUEST OPTIONS
  ======================================================= */

  const buildOptions =
    useCallback(
      (override = {}) => {
        const asOfDate =
          normalizeAsOfDate(
            override?.asOfDate ??
              normalizedOptions.asOfDate
          );

        return asOfDate
          ? { asOfDate }
          : {};
      },
      [normalizedOptions.asOfDate]
    );

  /* =======================================================
     FETCH DASHBOARD INSIGHTS
  ======================================================= */

  const fetchDashboardInsights =
    useCallback(
      async (
        overrideOptions = {},
        requestOptions = {}
      ) => {
        const {
          silent = false,
        } = requestOptions;

        const requestId =
          ++requestIdRef.current;

        if (mountedRef.current) {
          setError(null);

          if (silent) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }
        }

        try {
          /*
           * Exact backend endpoint:
           *
           * GET /api/savings/insights
           */
          const response =
            await smartSaveService.getDashboardSavingInsights(
              buildOptions(
                overrideOptions
              )
            );

          /*
           * Ignore stale responses.
           */
          if (
            requestId !==
            requestIdRef.current
          ) {
            return null;
          }

          const dashboard =
            normalizeDashboardResponse(
              response
            );

          const insights =
            normalizeInsights(
              dashboard
            );

          const summary =
            dashboard?.summary ??
            null;

          const goals =
            Array.isArray(
              dashboard?.goals
            )
              ? dashboard.goals
              : [];

          const normalizedDashboard = {
            ...dashboard,
            summary,
            insights,
            goals,
          };

          if (mountedRef.current) {
            setState(
              (previous) => ({
                ...previous,
                dashboard:
                  normalizedDashboard,
                summary:
                  summary ??
                  previous.summary,
              })
            );
          }

          return normalizedDashboard;
        } catch (requestError) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return null;
          }

          const normalized =
            normalizeError(
              requestError
            );

          if (mountedRef.current) {
            setError(normalized);
          }

          throw normalized;
        } finally {
          if (
            requestId ===
              requestIdRef.current &&
            mountedRef.current
          ) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      },
      [buildOptions]
    );

  /* =======================================================
     FETCH SUMMARY
  ======================================================= */

  const fetchSummary =
    useCallback(
      async (
        overrideOptions = {}
      ) => {
        try {
          /*
           * Exact endpoint:
           *
           * GET /api/savings/insights/summary
           */
          const response =
            await smartSaveService.getSavingInsightSummary(
              buildOptions(
                overrideOptions
              )
            );

          const summary =
            normalizeSummary(
              response
            );

          if (
            mountedRef.current
          ) {
            setState(
              (previous) => ({
                ...previous,
                summary,
              })
            );
          }

          return summary;
        } catch (requestError) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(normalized);
          }

          throw normalized;
        }
      },
      [buildOptions]
    );

  /* =======================================================
     FETCH TOP INSIGHT
  ======================================================= */

  const fetchTopInsight =
    useCallback(
      async (
        overrideOptions = {}
      ) => {
        try {
          /*
           * Exact endpoint:
           *
           * GET /api/savings/insights/top
           */
          const response =
            await smartSaveService.getTopSavingInsight(
              buildOptions(
                overrideOptions
              )
            );

          const topInsight =
            normalizeTopInsight(
              response
            );

          if (
            mountedRef.current
          ) {
            setState(
              (previous) => ({
                ...previous,
                topInsight,
              })
            );
          }

          return topInsight;
        } catch (requestError) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(normalized);
          }

          throw normalized;
        }
      },
      [buildOptions]
    );

  /* =======================================================
     FETCH GOAL INSIGHTS
  ======================================================= */

  const fetchGoalInsights =
    useCallback(
      async (
        goalId,
        overrideOptions = {}
      ) => {
        if (
          !goalId ||
          typeof goalId !==
            "string"
        ) {
          const normalized = {
            message:
              "A valid saving goal ID is required.",

            code:
              "INVALID_GOAL_ID",

            statusCode: 400,

            details: null,

            originalError: null,
          };

          if (
            mountedRef.current
          ) {
            setError(normalized);
          }

          throw normalized;
        }

        if (mountedRef.current) {
          setGoalErrors(
            (previous) => ({
              ...previous,
              [goalId]: null,
            })
          );

          setGoalLoading(
            (previous) => ({
              ...previous,
              [goalId]: true,
            })
          );
        }

        try {
          /*
           * Exact endpoint:
           *
           * GET /api/savings/insights/goals/:goalId
           */
          const response =
            await smartSaveService.getGoalSavingInsights(
              goalId,
              buildOptions(
                overrideOptions
              )
            );

          const goalResult =
            normalizeGoalInsights(
              response
            );

          if (
            mountedRef.current
          ) {
            setState(
              (previous) => ({
                ...previous,
                goalInsights: {
                  ...previous.goalInsights,
                  [goalId]:
                    goalResult,
                },
              })
            );
          }

          return goalResult;
        } catch (requestError) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setGoalErrors(
              (previous) => ({
                ...previous,
                [goalId]:
                  normalized,
              })
            );

            /*
             * Also expose the most recent goal
             * request error through the global error.
             */
            setError(normalized);
          }

          throw normalized;
        } finally {
          if (
            mountedRef.current
          ) {
            setGoalLoading(
              (previous) => ({
                ...previous,
                [goalId]: false,
              })
            );
          }
        }
      },
      [buildOptions]
    );

  /* =======================================================
     INITIAL DASHBOARD LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadInsights =
      async () => {
        if (cancelled) {
          return;
        }

        try {
          await fetchDashboardInsights();
        } catch {
          /*
           * The request error has already been
           * normalized and stored in hook state.
           */
        }
      };

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, [
    fetchDashboardInsights,
  ]);

  /* =======================================================
     REFRESH ALL DASHBOARD INSIGHTS
  ======================================================= */

  const refresh =
    useCallback(async () => {
      try {
        const dashboard =
          await fetchDashboardInsights(
            {},
            {
              silent: true,
            }
          );

        /*
         * Refreshing the dashboard should also
         * refresh the supporting summary and top
         * insight from the same backend state.
         */
        if (
          dashboard &&
          mountedRef.current
        ) {
          const summary =
            dashboard.summary ??
            null;

          /*
           * We deliberately do not make extra
           * requests here. The dashboard endpoint
           * already returns its calculated summary
           * and insight collection.
           *
           * The top insight is derived from the
           * returned insight list when possible.
           */
          const insights =
            Array.isArray(
              dashboard.insights
            )
              ? dashboard.insights
              : [];

          const topInsight =
            insights.length > 0
              ? [...insights].sort(
                  (a, b) =>
                    Number(
                      b?.priority || 0
                    ) -
                    Number(
                      a?.priority || 0
                    )
                )[0]
              : null;

          setState(
            (previous) => ({
              ...previous,
              dashboard,
              summary,
              topInsight,
            })
          );
        }

        return dashboard;
      } catch {
        return null;
      }
    }, [
      fetchDashboardInsights,
    ]);

  /* =======================================================
     CLEAR ERROR
  ======================================================= */

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  const clearGoalError =
    useCallback((goalId) => {
      if (!goalId) {
        return;
      }

      setGoalErrors(
        (previous) => {
          if (
            !Object.prototype.hasOwnProperty.call(
              previous,
              goalId
            )
          ) {
            return previous;
          }

          const next = {
            ...previous,
          };

          delete next[goalId];

          return next;
        }
      );
    }, []);

  /* =======================================================
     DERIVED DASHBOARD DATA
  ======================================================= */

  const dashboard =
    state.dashboard;

  const insights =
    useMemo(
      () =>
        Array.isArray(
          dashboard?.insights
        )
          ? dashboard.insights
          : [],
      [dashboard]
    );

  const goals =
    useMemo(
      () =>
        Array.isArray(
          dashboard?.goals
        )
          ? dashboard.goals
          : [],
      [dashboard]
    );

  const dashboardSummary =
    dashboard?.summary ??
    state.summary ??
    null;

  const hasInsights =
    insights.length > 0;

  const isEmpty =
    !loading &&
    !refreshing &&
    !hasInsights;

  /* =======================================================
     INSIGHT SEVERITY DERIVATIONS
  ======================================================= */

  const criticalInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.severity ===
            "critical"
        ),
      [insights]
    );

  const warningInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.severity ===
            "warning"
        ),
      [insights]
    );

  const successInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.severity ===
            "success"
        ),
      [insights]
    );

  const infoInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.severity ===
            "info"
        ),
      [insights]
    );

  /* =======================================================
     INSIGHT TYPE DERIVATIONS
  ======================================================= */

  const riskInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.type ===
            "risk"
        ),
      [insights]
    );

  const progressInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.type ===
            "progress"
        ),
      [insights]
    );

  const paceInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.type ===
            "pace"
        ),
      [insights]
    );

  const milestoneInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.type ===
            "milestone"
        ),
      [insights]
    );

  const recommendationInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.type ===
            "recommendation"
        ),
      [insights]
    );

  /* =======================================================
     TOP INSIGHT DERIVATION
  ======================================================= */

  const derivedTopInsight =
    useMemo(() => {
      if (
        state.topInsight
      ) {
        return state.topInsight;
      }

      if (
        insights.length === 0
      ) {
        return null;
      }

      return [...insights].sort(
        (a, b) =>
          Number(
            b?.priority || 0
          ) -
          Number(
            a?.priority || 0
          )
      )[0];
    }, [
      state.topInsight,
      insights,
    ]);

  /* =======================================================
     RETURN API
  ======================================================= */

  return useMemo(
    () => ({
      /* -----------------------------
         DASHBOARD
      ----------------------------- */

      dashboard,

      insights,

      goals,

      summary:
        dashboardSummary,

      dashboardSummary,

      topInsight:
        derivedTopInsight,

      /* -----------------------------
         SEVERITY GROUPS
      ----------------------------- */

      criticalInsights,

      warningInsights,

      successInsights,

      infoInsights,

      /* -----------------------------
         TYPE GROUPS
      ----------------------------- */

      riskInsights,

      progressInsights,

      paceInsights,

      milestoneInsights,

      recommendationInsights,

      /* -----------------------------
         GOAL INSIGHTS
      ----------------------------- */

      goalInsights:
        state.goalInsights,

      getGoalInsights:
        (goalId) =>
          state.goalInsights?.[
            goalId
          ] ?? null,

      goalLoading,

      goalErrors,

      isGoalLoading:
        (goalId) =>
          Boolean(
            goalLoading?.[goalId]
          ),

      getGoalError:
        (goalId) =>
          goalErrors?.[goalId] ??
          null,

      /* -----------------------------
         REQUEST STATE
      ----------------------------- */

      loading,

      refreshing,

      isLoading: loading,

      isRefreshing:
        refreshing,

      /* -----------------------------
         EMPTY / ERROR
      ----------------------------- */

      hasInsights,

      isEmpty,

      error,

      hasError:
        Boolean(error),

      /* -----------------------------
         REQUEST ACTIONS
      ----------------------------- */

      fetchDashboardInsights,

      fetchSummary,

      fetchTopInsight,

      fetchGoalInsights,

      refresh,

      /* -----------------------------
         ERROR ACTIONS
      ----------------------------- */

      clearError,

      clearGoalError,
    }),
    [
      dashboard,
      insights,
      goals,
      dashboardSummary,
      derivedTopInsight,
      criticalInsights,
      warningInsights,
      successInsights,
      infoInsights,
      riskInsights,
      progressInsights,
      paceInsights,
      milestoneInsights,
      recommendationInsights,
      state.goalInsights,
      goalLoading,
      goalErrors,
      loading,
      refreshing,
      hasInsights,
      isEmpty,
      error,
      fetchDashboardInsights,
      fetchSummary,
      fetchTopInsight,
      fetchGoalInsights,
      refresh,
      clearError,
      clearGoalError,
    ]
  );
};

export default useSavingsInsights;