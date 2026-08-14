// hooks/useSmartSave.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import smartSaveService from "../services/smartSaveService";

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const INITIAL_DATA = {
  accounts: [],
  goals: [],
  plans: [],
  schedules: [],
  executions: [],
  challenges: [],
  insights: [],
};

const INITIAL_LOADING = {
  accounts: false,
  goals: false,
  plans: false,
  schedules: false,
  executions: false,
  challenges: false,
  insights: false,
};

const INITIAL_ERRORS = {
  accounts: null,
  goals: null,
  plans: null,
  schedules: null,
  executions: null,
  challenges: null,
  insights: null,
};

/* ============================================================
   NORMALIZATION HELPERS
============================================================ */

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

const asObject = (value) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  if (
    value?.data &&
    typeof value.data === "object" &&
    !Array.isArray(value.data)
  ) {
    return value.data;
  }

  return null;
};

const normalizePagination = (value) => {
  const source =
    value?.pagination ||
    value?.meta ||
    value?.data?.pagination ||
    value?.data?.meta ||
    {};

  const page = Number(
    source.page ?? DEFAULT_PAGE
  );

  const limit = Number(
    source.limit ?? DEFAULT_LIMIT
  );

  const total = Number(
    source.total ?? 0
  );

  const pages = Number(
    source.pages ??
      (limit > 0
        ? Math.ceil(total / limit)
        : 0)
  );

  return {
    page:
      Number.isFinite(page) && page > 0
        ? page
        : DEFAULT_PAGE,

    limit:
      Number.isFinite(limit) && limit > 0
        ? limit
        : DEFAULT_LIMIT,

    total:
      Number.isFinite(total) && total >= 0
        ? total
        : 0,

    pages:
      Number.isFinite(pages) && pages >= 0
        ? pages
        : 0,

    hasNextPage:
      Boolean(
        source.hasNextPage ??
          (pages > 0 &&
            page < pages)
      ),

    hasPreviousPage:
      Boolean(
        source.hasPreviousPage ??
          page > 1
      ),
  };
};

const normalizeError = (error) => {
  if (!error) {
    return null;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to load SmartSave data."
  );
};

/* ============================================================
   SERVICE METHOD SAFETY
============================================================ */

/**
 * Keeps the hook synchronized with smartSaveService.
 *
 * We deliberately do not silently invent methods.
 */
const requireServiceMethod = (
  methodName
) => {
  const method =
    smartSaveService?.[methodName];

  if (typeof method !== "function") {
    throw new Error(
      `smartSaveService.${methodName} is not available.`
    );
  }

  return method;
};

/* ============================================================
   HOOK
============================================================ */

const useSmartSave = ({
  autoFetch = true,
  accountsQuery = {},
  goalsQuery = {},
  plansQuery = {},
  schedulesQuery = {},
  executionsQuery = {},
  challengesQuery = {},
  insightsQuery = {},
} = {}) => {
  /* ==========================================================
     STATE
  ========================================================== */

  const [data, setData] =
    useState(INITIAL_DATA);

  const [loading, setLoading] =
    useState(INITIAL_LOADING);

  const [errors, setErrors] =
    useState(INITIAL_ERRORS);

  const [refreshing, setRefreshing] =
    useState(false);

  const mountedRef =
    useRef(true);

  const requestIdRef =
    useRef(0);

  /* ==========================================================
     MOUNT / UNMOUNT SAFETY
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ==========================================================
     SAFE STATE HELPERS
  ========================================================== */

  const updateLoading = useCallback(
    (key, value) => {
      if (!mountedRef.current) {
        return;
      }

      setLoading((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    []
  );

  const updateError = useCallback(
    (key, error) => {
      if (!mountedRef.current) {
        return;
      }

      setErrors((previous) => ({
        ...previous,
        [key]: normalizeError(error),
      }));
    },
    []
  );

  const clearError = useCallback(
    (key) => {
      if (!mountedRef.current) {
        return;
      }

      setErrors((previous) => ({
        ...previous,
        [key]: null,
      }));
    },
    []
  );

  /* ==========================================================
     FETCH ACCOUNTS
  ========================================================== */

  const fetchAccounts = useCallback(
    async (query = accountsQuery) => {
      const requestId =
        ++requestIdRef.current;

      updateLoading(
        "accounts",
        true
      );

      clearError("accounts");

      try {
        const method =
          requireServiceMethod(
            "getSavingAccounts"
          );

        const response =
          await method(query);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          accounts:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateError(
            "accounts",
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateLoading(
            "accounts",
            false
          );
        }
      }
    },
    [
      accountsQuery,
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     FETCH GOALS
  ========================================================== */

  const fetchGoals = useCallback(
    async (query = goalsQuery) => {
      const requestId =
        ++requestIdRef.current;

      updateLoading(
        "goals",
        true
      );

      clearError("goals");

      try {
        const method =
          requireServiceMethod(
            "getSavingGoals"
          );

        const response =
          await method(query);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          goals:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateError(
            "goals",
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateLoading(
            "goals",
            false
          );
        }
      }
    },
    [
      goalsQuery,
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     FETCH PLANS
  ========================================================== */

  const fetchPlans = useCallback(
    async (query = plansQuery) => {
      const requestId =
        ++requestIdRef.current;

      updateLoading(
        "plans",
        true
      );

      clearError("plans");

      try {
        const method =
          requireServiceMethod(
            "getSavingPlans"
          );

        const response =
          await method(query);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          plans:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateError(
            "plans",
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateLoading(
            "plans",
            false
          );
        }
      }
    },
    [
      plansQuery,
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     FETCH SCHEDULES
  ========================================================== */

  const fetchSchedules = useCallback(
    async (query = schedulesQuery) => {
      const requestId =
        ++requestIdRef.current;

      updateLoading(
        "schedules",
        true
      );

      clearError("schedules");

      try {
        const method =
          requireServiceMethod(
            "getSavingSchedules"
          );

        const response =
          await method(query);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          schedules:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateError(
            "schedules",
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateLoading(
            "schedules",
            false
          );
        }
      }
    },
    [
      schedulesQuery,
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     FETCH EXECUTIONS
  ========================================================== */

  const fetchExecutions = useCallback(
    async (query = executionsQuery) => {
      const requestId =
        ++requestIdRef.current;

      updateLoading(
        "executions",
        true
      );

      clearError("executions");

      try {
        const method =
          requireServiceMethod(
            "getSavingExecutions"
          );

        const response =
          await method(query);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          executions:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateError(
            "executions",
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateLoading(
            "executions",
            false
          );
        }
      }
    },
    [
      executionsQuery,
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     FETCH CHALLENGES
  ========================================================== */

  const fetchChallenges = useCallback(
    async (query = challengesQuery) => {
      const requestId =
        ++requestIdRef.current;

      updateLoading(
        "challenges",
        true
      );

      clearError("challenges");

      try {
        const method =
          requireServiceMethod(
            "getSavingsChallenges"
          );

        const response =
          await method(query);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          challenges:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateError(
            "challenges",
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateLoading(
            "challenges",
            false
          );
        }
      }
    },
    [
      challengesQuery,
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     FETCH INSIGHTS
  ========================================================== */

  const fetchInsights = useCallback(
    async (query = insightsQuery) => {
      const requestId =
        ++requestIdRef.current;

      updateLoading(
        "insights",
        true
      );

      clearError("insights");

      try {
        const method =
          requireServiceMethod(
            "getDashboardSavingInsights"
          );

        const response =
          await method(query);

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          insights:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateError(
            "insights",
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          updateLoading(
            "insights",
            false
          );
        }
      }
    },
    [
      insightsQuery,
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     FETCH EVERYTHING
  ========================================================== */

  const refresh = useCallback(
    async () => {
      if (!mountedRef.current) {
        return;
      }

      setRefreshing(true);

      try {
        /*
         * Promise.allSettled prevents one failed
         * resource from preventing the others
         * from refreshing.
         */
        await Promise.allSettled([
          fetchAccounts(),
          fetchGoals(),
          fetchPlans(),
          fetchSchedules(),
          fetchExecutions(),
          fetchChallenges(),
          fetchInsights(),
        ]);
      } finally {
        if (mountedRef.current) {
          setRefreshing(false);
        }
      }
    },
    [
      fetchAccounts,
      fetchGoals,
      fetchPlans,
      fetchSchedules,
      fetchExecutions,
      fetchChallenges,
      fetchInsights,
    ]
  );

  /* ==========================================================
     INITIAL FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      if (cancelled) {
        return;
      }

      await refresh();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [autoFetch, refresh]);

  /* ==========================================================
     DERIVED METRICS
  ========================================================== */

  const metrics = useMemo(() => {
    const goals =
      data.goals || [];

    const accounts =
      data.accounts || [];

    const plans =
      data.plans || [];

    const schedules =
      data.schedules || [];

    const challenges =
      data.challenges || [];

    const executions =
      data.executions || [];

    const insights =
      data.insights || [];

    const totalTarget =
      goals.reduce(
        (total, goal) =>
          total +
          Number(
            goal?.targetAmount || 0
          ),
        0
      );

    const totalSaved =
      goals.reduce(
        (total, goal) =>
          total +
          Number(
            goal?.currentAmount || 0
          ),
        0
      );

    const totalRemaining =
      Math.max(
        0,
        totalTarget - totalSaved
      );

    const activeGoals =
      goals.filter(
        (goal) =>
          goal?.status === "active"
      ).length;

    const completedGoals =
      goals.filter(
        (goal) =>
          goal?.status === "completed"
      ).length;

    const activePlans =
      plans.filter(
        (plan) =>
          plan?.status === "active"
      ).length;

    const activeSchedules =
      schedules.filter(
        (schedule) =>
          schedule?.status === "active"
      ).length;

    const activeChallenges =
      challenges.filter(
        (challenge) =>
          challenge?.status === "active"
      ).length;

    const pendingExecutions =
      executions.filter(
        (execution) =>
          execution?.status === "pending"
      ).length;

    const criticalInsights =
      insights.filter(
        (insight) =>
          insight?.severity ===
          "critical"
      ).length;

    const progressPercentage =
      totalTarget > 0
        ? Math.min(
            100,
            Math.round(
              (totalSaved /
                totalTarget) *
                10000
            ) / 100
          )
        : 0;

    return {
      totalTarget,
      totalSaved,
      totalRemaining,
      progressPercentage,

      totalGoals:
        goals.length,

      activeGoals,
      completedGoals,

      totalAccounts:
        accounts.length,

      totalPlans:
        plans.length,

      activePlans,

      totalSchedules:
        schedules.length,

      activeSchedules,

      totalExecutions:
        executions.length,

      pendingExecutions,

      totalChallenges:
        challenges.length,

      activeChallenges,

      totalInsights:
        insights.length,

      criticalInsights,
    };
  }, [data]);

  /* ==========================================================
     LOADING STATE
  ========================================================== */

  const isLoading =
    Object.values(loading).some(
      Boolean
    );

  /* ==========================================================
     ERROR STATE
  ========================================================== */

  const hasError =
    Object.values(errors).some(
      Boolean
    );

  const firstError =
    Object.values(errors).find(
      Boolean
    ) || null;

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const pagination = useMemo(
    () => ({
      accounts:
        normalizePagination(
          data.accounts
        ),

      goals:
        normalizePagination(
          data.goals
        ),

      plans:
        normalizePagination(
          data.plans
        ),

      schedules:
        normalizePagination(
          data.schedules
        ),

      executions:
        normalizePagination(
          data.executions
        ),

      challenges:
        normalizePagination(
          data.challenges
        ),
    }),
    [data]
  );

  /* ==========================================================
     RESET
  ========================================================== */

  const reset = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    requestIdRef.current += 1;

    setData(INITIAL_DATA);
    setLoading(INITIAL_LOADING);
    setErrors(INITIAL_ERRORS);
    setRefreshing(false);
  }, []);

  /* ==========================================================
     RETURN
  ========================================================== */

  return useMemo(
    () => ({
      /* ------------------------------------------------------
         RAW DATA
      ------------------------------------------------------ */

      data,

      accounts:
        data.accounts,

      goals:
        data.goals,

      plans:
        data.plans,

      schedules:
        data.schedules,

      executions:
        data.executions,

      challenges:
        data.challenges,

      insights:
        data.insights,

      /* ------------------------------------------------------
         LOADING
      ------------------------------------------------------ */

      loading,

      isLoading,

      refreshing,

      /* ------------------------------------------------------
         ERRORS
      ------------------------------------------------------ */

      errors,

      error:
        firstError,

      hasError,

      /* ------------------------------------------------------
         METRICS
      ------------------------------------------------------ */

      metrics,

      /* ------------------------------------------------------
         PAGINATION
      ------------------------------------------------------ */

      pagination,

      /* ------------------------------------------------------
         FETCH METHODS
      ------------------------------------------------------ */

      fetchAccounts,
      fetchGoals,
      fetchPlans,
      fetchSchedules,
      fetchExecutions,
      fetchChallenges,
      fetchInsights,

      /* ------------------------------------------------------
         REFRESH / RESET
      ------------------------------------------------------ */

      refresh,
      reset,
    }),
    [
      data,
      errors,
      fetchAccounts,
      fetchChallenges,
      fetchExecutions,
      fetchGoals,
      fetchInsights,
      fetchPlans,
      fetchSchedules,
      firstError,
      hasError,
      isLoading,
      loading,
      metrics,
      pagination,
      refresh,
      refreshing,
      reset,
    ]
  );
};

export default useSmartSave;