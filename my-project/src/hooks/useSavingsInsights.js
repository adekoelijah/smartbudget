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
 * Supported examples:
 *
 * null
 * undefined
 * ""
 * Date
 * "2026-08-30"
 * "August 30, 2026"
 */
const normalizeAsOfDate = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value
      .toISOString()
      .slice(0, 10);
  }

  const stringValue = String(value).trim();

  if (!stringValue) {
    return null;
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue
    )
  ) {
    return stringValue;
  }

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date
    .toISOString()
    .slice(0, 10);
};


/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const normalizeDashboardResponse = (
  response
) => {
  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    typeof response === "object" &&
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


const normalizeSummary = (
  response
) => {
  if (
    response?.summary &&
    typeof response.summary === "object"
  ) {
    return response.summary;
  }

  if (
    response?.data?.summary &&
    typeof response.data.summary === "object"
  ) {
    return response.data.summary;
  }

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response)
  ) {
    return response;
  }

  return null;
};


const normalizeTopInsight = (
  response
) => {
  if (
    response?.insight &&
    typeof response.insight === "object"
  ) {
    return response.insight;
  }

  if (
    response?.data?.insight &&
    typeof response.data.insight === "object"
  ) {
    return response.data.insight;
  }

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response)
  ) {
    return response;
  }

  return null;
};


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
  const serviceNormalizeError =
    typeof smartSaveService?.normalizeError ===
    "function"
      ? smartSaveService.normalizeError
      : null;

  const serviceError =
    serviceNormalizeError
      ? serviceNormalizeError(error)
      : error;

  return {
    message:
      serviceError?.message ||
      "Unable to load savings insights.",

    code:
      serviceError?.code ||
      "SAVINGS_INSIGHTS_ERROR",

    /*
     * Your SmartSaveServiceError uses `status`,
     * while Axios normally exposes `response.status`.
     */
    statusCode:
      serviceError?.status ??
      serviceError?.statusCode ??
      serviceError?.response?.status ??
      null,

    details:
      serviceError?.details ??
      null,

    originalError:
      serviceError?.originalError ??
      error,
  };
};


/* =========================================================
   TOP INSIGHT SORTING
========================================================= */

const getHighestPriorityInsight = (
  insights
) => {
  if (!Array.isArray(insights)) {
    return null;
  }

  if (insights.length === 0) {
    return null;
  }

  return [...insights].sort(
    (a, b) =>
      Number(b?.priority ?? 0) -
      Number(a?.priority ?? 0)
  )[0] ?? null;
};


/* =========================================================
   HOOK
========================================================= */

const useSavingsInsights = (
  options = DEFAULT_OPTIONS
) => {
  /* =======================================================
     MOUNT STATE
  ======================================================= */

  const mountedRef = useRef(false);

  /*
   * Used to invalidate old dashboard requests.
   */
  const dashboardRequestIdRef =
    useRef(0);

  /*
   * Each goal has its own request sequence.
   *
   * Example:
   *
   * goal A request 1
   * goal A request 2
   *
   * Response from request 1 must not overwrite
   * response from request 2.
   */
  const goalRequestIdsRef =
    useRef({});


  /* =======================================================
     OPTIONS
  ======================================================= */

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


  /* =======================================================
     STATE
  ======================================================= */

  const [
    state,
    setState,
  ] = useState(DEFAULT_STATE);

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

      dashboardRequestIdRef.current += 1;

      goalRequestIdsRef.current = {};
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

        if (!asOfDate) {
          return {};
        }

        return {
          asOfDate,
        };
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
        const silent =
          requestOptions?.silent === true;

        const requestId =
          ++dashboardRequestIdRef.current;

        /*
         * IMPORTANT:
         *
         * The request is started BEFORE changing loading state.
         *
         * This keeps the request function asynchronous from
         * the caller's perspective and avoids the problematic
         * effect -> function -> synchronous setState chain.
         */

        const requestPromise =
          smartSaveService
            .getDashboardSavingInsights(
              buildOptions(
                overrideOptions
              )
            );

        if (mountedRef.current) {
          setError(null);

          if (silent) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }
        }

        try {
          const response =
            await requestPromise;

          /*
           * Ignore stale responses.
           */
          if (
            requestId !==
            dashboardRequestIdRef.current
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
                topInsight:
                  getHighestPriorityInsight(
                    insights
                  ),
              })
            );
          }

          return normalizedDashboard;
        } catch (requestError) {
          if (
            requestId !==
            dashboardRequestIdRef.current
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
              dashboardRequestIdRef.current &&
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
     INITIAL DASHBOARD LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    /*
     * Do NOT directly execute:
     *
     * fetchDashboardInsights();
     *
     * inside the effect.
     *
     * Schedule it as a microtask so React finishes
     * the effect phase before the request lifecycle
     * starts updating state.
     */
    const scheduleInitialLoad = () => {
      if (cancelled) {
        return;
      }

      Promise.resolve().then(() => {
        if (cancelled) {
          return;
        }

        fetchDashboardInsights().catch(
          () => {
            /*
             * Error is already stored in hook state.
             */
          }
        );
      });
    };

    scheduleInitialLoad();

    return () => {
      cancelled = true;
    };
  }, [
    fetchDashboardInsights,
  ]);


  /* =======================================================
     FETCH SUMMARY
  ======================================================= */

  const fetchSummary =
    useCallback(
      async (
        overrideOptions = {}
      ) => {
        try {
          const response =
            await smartSaveService
              .getSavingInsightSummary(
                buildOptions(
                  overrideOptions
                )
              );

          const summary =
            normalizeSummary(
              response
            );

          if (mountedRef.current) {
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

          if (mountedRef.current) {
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
          const response =
            await smartSaveService
              .getTopSavingInsight(
                buildOptions(
                  overrideOptions
                )
              );

          const topInsight =
            normalizeTopInsight(
              response
            );

          if (mountedRef.current) {
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

          if (mountedRef.current) {
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
          typeof goalId !== "string"
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

          if (mountedRef.current) {
            setError(normalized);
          }

          throw normalized;
        }

        /*
         * Create a request sequence for this goal.
         */
        const previousRequestId =
          goalRequestIdsRef.current[
            goalId
          ] ?? 0;

        const requestId =
          previousRequestId + 1;

        goalRequestIdsRef.current[
          goalId
        ] = requestId;

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
          const response =
            await smartSaveService
              .getGoalSavingInsights(
                goalId,
                buildOptions(
                  overrideOptions
                )
              );

          /*
           * Ignore stale goal response.
           */
          if (
            goalRequestIdsRef.current[
              goalId
            ] !== requestId
          ) {
            return null;
          }

          const goalResult =
            normalizeGoalInsights(
              response
            );

          if (mountedRef.current) {
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
          if (
            goalRequestIdsRef.current[
              goalId
            ] !== requestId
          ) {
            return null;
          }

          const normalized =
            normalizeError(
              requestError
            );

          if (mountedRef.current) {
            setGoalErrors(
              (previous) => ({
                ...previous,
                [goalId]:
                  normalized,
              })
            );

            setError(normalized);
          }

          throw normalized;
        } finally {
          if (
            goalRequestIdsRef.current[
              goalId
            ] === requestId &&
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
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(
      async () => {
        try {
          const dashboard =
            await fetchDashboardInsights(
              {},
              {
                silent: true,
              }
            );

          if (
            !dashboard ||
            !mountedRef.current
          ) {
            return dashboard;
          }

          const summary =
            dashboard.summary ??
            null;

          const insights =
            Array.isArray(
              dashboard.insights
            )
              ? dashboard.insights
              : [];

          const topInsight =
            getHighestPriorityInsight(
              insights
            );

          setState(
            (previous) => ({
              ...previous,
              dashboard,
              summary,
              topInsight,
            })
          );

          return dashboard;
        } catch {
          return null;
        }
      },
      [fetchDashboardInsights]
    );


  /* =======================================================
     CLEAR ERRORS
  ======================================================= */

  const clearError =
    useCallback(() => {
      if (!mountedRef.current) {
        return;
      }

      setError(null);
    }, []);


  const clearGoalError =
    useCallback(
      (goalId) => {
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
      },
      []
    );


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
     SEVERITY GROUPS
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
     TYPE GROUPS
  ======================================================= */

  const riskInsights =
    useMemo(
      () =>
        insights.filter(
          (insight) =>
            insight?.type === "risk"
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
            insight?.type === "pace"
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
     TOP INSIGHT
  ======================================================= */

  const derivedTopInsight =
    useMemo(() => {
      if (state.topInsight) {
        return state.topInsight;
      }

      return getHighestPriorityInsight(
        insights
      );
    }, [
      state.topInsight,
      insights,
    ]);


  /* =======================================================
     STABLE GOAL ACCESSORS
  ======================================================= */

  const getGoalInsights =
    useCallback(
      (goalId) =>
        state.goalInsights?.[
          goalId
        ] ?? null,
      [state.goalInsights]
    );


  const isGoalLoading =
    useCallback(
      (goalId) =>
        Boolean(
          goalLoading?.[goalId]
        ),
      [goalLoading]
    );


  const getGoalError =
    useCallback(
      (goalId) =>
        goalErrors?.[goalId] ??
        null,
      [goalErrors]
    );


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

      getGoalInsights,

      goalLoading,

      goalErrors,

      isGoalLoading,

      getGoalError,


      /* -----------------------------
         REQUEST STATE
      ----------------------------- */

      loading,

      refreshing,

      isLoading:
        loading,

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

      getGoalInsights,
      goalLoading,
      goalErrors,
      isGoalLoading,
      getGoalError,

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