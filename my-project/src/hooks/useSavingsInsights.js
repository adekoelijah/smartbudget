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

const EMPTY_STATE = Object.freeze({
  dashboard: null,
  summary: null,
  topInsight: null,
  goalInsights: {},
});

const DEFAULT_OPTIONS = Object.freeze({
  asOfDate: null,
});

/* =========================================================
   DATE NORMALIZATION
========================================================= */

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

  const parsedDate =
    new Date(stringValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate
    .toISOString()
    .slice(0, 10);
};

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const unwrapData = (response) => {
  if (
    isObject(response?.data)
  ) {
    return response.data;
  }

  return response;
};

const normalizeDashboard = (
  response
) => {
  const source =
    unwrapData(response);

  if (!isObject(source)) {
    return {
      summary: null,
      insights: [],
      goals: [],
    };
  }

  const insights =
    Array.isArray(source.insights)
      ? source.insights
      : Array.isArray(source.items)
        ? source.items
        : Array.isArray(source.results)
          ? source.results
          : [];

  const goals =
    Array.isArray(source.goals)
      ? source.goals
      : [];

  const summary =
    isObject(source.summary)
      ? source.summary
      : null;

  return {
    ...source,
    summary,
    insights,
    goals,
  };
};

const normalizeSummary = (
  response
) => {
  const source =
    unwrapData(response);

  if (
    isObject(source?.summary)
  ) {
    return source.summary;
  }

  if (isObject(source)) {
    return source;
  }

  return null;
};

const normalizeTopInsight = (
  response
) => {
  const source =
    unwrapData(response);

  if (
    isObject(source?.insight)
  ) {
    return source.insight;
  }

  if (isObject(source)) {
    return source;
  }

  return null;
};

const normalizeGoalInsights = (
  response
) => {
  const source =
    unwrapData(response);

  if (!isObject(source)) {
    return {
      snapshot: null,
      insights: [],
    };
  }

  return {
    ...source,
    snapshot:
      source.snapshot ?? null,
    insights:
      Array.isArray(source.insights)
        ? source.insights
        : [],
  };
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const normalizeError = (
  error
) => {
  let source = error;

  if (
    typeof smartSaveService?.normalizeError ===
    "function"
  ) {
    try {
      source =
        smartSaveService.normalizeError(
          error
        );
    } catch {
      source = error;
    }
  }

  const responseData =
    error?.response?.data;

  const messageCandidates = [
    source?.message,
    responseData?.message,
    responseData?.error,
    error?.data?.message,
    error?.data?.error,
    error?.message,
  ];

  const message =
    messageCandidates.find(
      (value) =>
        typeof value === "string" &&
        value.trim()
    ) ||
    "Unable to load savings insights.";

  return {
    message: message.trim(),

    code:
      source?.code ??
      responseData?.code ??
      "SAVINGS_INSIGHTS_ERROR",

    statusCode:
      source?.status ??
      source?.statusCode ??
      error?.response?.status ??
      null,

    details:
      source?.details ??
      responseData?.details ??
      null,

    originalError:
      source?.originalError ??
      error,
  };
};

/* =========================================================
   PRIORITY
========================================================= */

const getHighestPriorityInsight = (
  insights
) => {
  if (
    !Array.isArray(insights) ||
    insights.length === 0
  ) {
    return null;
  }

  return insights.reduce(
    (highest, current) => {
      if (!highest) {
        return current;
      }

      const highestPriority =
        Number(
          highest?.priority ?? 0
        );

      const currentPriority =
        Number(
          current?.priority ?? 0
        );

      return currentPriority >
        highestPriority
        ? current
        : highest;
    },
    null
  );
};

/* =========================================================
   HOOK
========================================================= */

const useSavingsInsights = (
  options = DEFAULT_OPTIONS
) => {
  /* =======================================================
     MOUNT
  ======================================================= */

  const mountedRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  const goalRequestIdsRef =
    useRef({});

  /* =======================================================
     NORMALIZED OPTIONS
  ======================================================= */

  const asOfDate =
    normalizeAsOfDate(
      options?.asOfDate
    );

  const requestOptions = useMemo(
    () => {
      if (!asOfDate) {
        return {};
      }

      return {
        asOfDate,
      };
    },
    [asOfDate]
  );

  /* =======================================================
     STATE
  ======================================================= */

  const [state, setState] =
    useState(EMPTY_STATE);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [goalLoading, setGoalLoading] =
    useState({});

  const [goalErrors, setGoalErrors] =
    useState({});

  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      goalRequestIdsRef.current = {};
    };
  }, []);

  /* =======================================================
     FETCH DASHBOARD INSIGHTS
  ======================================================= */

  const fetchDashboardInsights =
    useCallback(
      async (
        overrideOptions = {},
        requestOptionsConfig = {}
      ) => {
        const silent =
          requestOptionsConfig?.silent === true;

        const currentRequestId =
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
          const finalOptions = {
            ...requestOptions,
            ...overrideOptions,
          };

          const response =
            await smartSaveService.getDashboardSavingInsights(
              finalOptions
            );

          if (
            currentRequestId !==
            requestIdRef.current
          ) {
            return null;
          }

          const dashboard =
            normalizeDashboard(
              response
            );

          const insights =
            dashboard.insights;

          const summary =
            dashboard.summary;

          const topInsight =
            getHighestPriorityInsight(
              insights
            );

          const normalizedDashboard = {
            ...dashboard,
            insights,
            goals: dashboard.goals,
            summary,
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
                topInsight,
              })
            );
          }

          return normalizedDashboard;
        } catch (requestError) {
          if (
            currentRequestId !==
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
            currentRequestId ===
              requestIdRef.current &&
            mountedRef.current
          ) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      },
      [requestOptions]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) {
        return;
      }

      try {
        await fetchDashboardInsights();
      } catch {
        // Error is already stored in hook state.
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchDashboardInsights]);

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
            await smartSaveService.getSavingInsightSummary(
              {
                ...requestOptions,
                ...overrideOptions,
              }
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
      [requestOptions]
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
            await smartSaveService.getTopSavingInsight(
              {
                ...requestOptions,
                ...overrideOptions,
              }
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
      [requestOptions]
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
          const invalidError = {
            message:
              "A valid saving goal ID is required.",
            code: "INVALID_GOAL_ID",
            statusCode: 400,
            details: null,
            originalError: null,
          };

          if (mountedRef.current) {
            setError(invalidError);
          }

          throw invalidError;
        }

        const previousId =
          goalRequestIdsRef.current[
            goalId
          ] ?? 0;

        const currentId =
          previousId + 1;

        goalRequestIdsRef.current[
          goalId
        ] = currentId;

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
            await smartSaveService.getGoalSavingInsights(
              goalId,
              {
                ...requestOptions,
                ...overrideOptions,
              }
            );

          if (
            goalRequestIdsRef.current[
              goalId
            ] !== currentId
          ) {
            return null;
          }

          const result =
            normalizeGoalInsights(
              response
            );

          if (mountedRef.current) {
            setState(
              (previous) => ({
                ...previous,
                goalInsights: {
                  ...previous.goalInsights,
                  [goalId]: result,
                },
              })
            );
          }

          return result;
        } catch (requestError) {
          if (
            goalRequestIdsRef.current[
              goalId
            ] !== currentId
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
                [goalId]: normalized,
              })
            );

            setError(normalized);
          }

          throw normalized;
        } finally {
          if (
            goalRequestIdsRef.current[
              goalId
            ] === currentId &&
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
      [requestOptions]
    );

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(
      () =>
        fetchDashboardInsights(
          {},
          {
            silent: true,
          }
        ).catch(() => null),
      [fetchDashboardInsights]
    );

  /* =======================================================
     CLEAR ERROR
  ======================================================= */

  const clearError =
    useCallback(() => {
      if (!mountedRef.current) {
        return;
      }

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
     DERIVED DATA
  ======================================================= */

  const dashboard =
    state.dashboard;

  const insights = useMemo(
    () =>
      Array.isArray(
        dashboard?.insights
      )
        ? dashboard.insights
        : [],
    [dashboard]
  );

  const goals = useMemo(
    () =>
      Array.isArray(
        dashboard?.goals
      )
        ? dashboard.goals
        : [],
    [dashboard]
  );

  const summary =
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
     GROUPS
  ======================================================= */

  const criticalInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.severity ===
            "critical"
        ),
      [insights]
    );

  const warningInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.severity ===
            "warning"
        ),
      [insights]
    );

  const successInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.severity ===
            "success"
        ),
      [insights]
    );

  const infoInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.severity ===
            "info"
        ),
      [insights]
    );

  const riskInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.type === "risk"
        ),
      [insights]
    );

  const progressInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.type ===
            "progress"
        ),
      [insights]
    );

  const paceInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.type === "pace"
        ),
      [insights]
    );

  const milestoneInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.type ===
            "milestone"
        ),
      [insights]
    );

  const recommendationInsights =
    useMemo(
      () =>
        insights.filter(
          (item) =>
            item?.type ===
            "recommendation"
        ),
      [insights]
    );

  const topInsight =
    state.topInsight ??
    getHighestPriorityInsight(
      insights
    );

  /* =======================================================
     GOAL ACCESSORS
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
     RETURN
  ======================================================= */

  return useMemo(
    () => ({
      dashboard,

      insights,

      goals,

      summary,

      dashboardSummary:
        summary,

      topInsight,

      criticalInsights,

      warningInsights,

      successInsights,

      infoInsights,

      riskInsights,

      progressInsights,

      paceInsights,

      milestoneInsights,

      recommendationInsights,

      goalInsights:
        state.goalInsights,

      getGoalInsights,

      goalLoading,

      goalErrors,

      isGoalLoading,

      getGoalError,

      loading,

      refreshing,

      isLoading:
        loading,

      isRefreshing:
        refreshing,

      hasInsights,

      isEmpty,

      error,

      hasError:
        Boolean(error),

      fetchDashboardInsights,

      fetchSummary,

      fetchTopInsight,

      fetchGoalInsights,

      refresh,

      clearError,

      clearGoalError,
    }),
    [
      dashboard,
      insights,
      goals,
      summary,
      topInsight,

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