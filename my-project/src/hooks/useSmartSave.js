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

const EMPTY_QUERY = Object.freeze({});

const RESOURCE_KEYS = [
  "accounts",
  "goals",
  "plans",
  "schedules",
  "executions",
  "challenges",
  "insights",
];

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
   QUERY NORMALIZATION
============================================================ */

/*
 * Convert query objects into stable primitive signatures.
 *
 * This prevents a caller passing:
 *
 * useSmartSave({
 *   goalsQuery: {}
 * })
 *
 * from causing a new dependency identity every render.
 */

const createQueryKey = (query) => {
  if (
    !query ||
    typeof query !== "object"
  ) {
    return "";
  }

  try {
    return JSON.stringify(
      query,
      Object.keys(query).sort()
    );
  } catch {
    return "";
  }
};

/* ============================================================
   HOOK
============================================================ */

const useSmartSave = ({
  autoFetch = true,

  accountsQuery = EMPTY_QUERY,
  goalsQuery = EMPTY_QUERY,
  plansQuery = EMPTY_QUERY,
  schedulesQuery = EMPTY_QUERY,
  executionsQuery = EMPTY_QUERY,
  challengesQuery = EMPTY_QUERY,
  insightsQuery = EMPTY_QUERY,
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

  /* ==========================================================
     MOUNT SAFETY
  ========================================================== */

  const mountedRef =
    useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ==========================================================
     REFRESH GENERATION
  ========================================================== */

  /*
   * Every complete refresh receives a generation number.
   *
   * This prevents an older refresh from overwriting
   * newer state.
   */

  const generationRef =
    useRef(0);

  /* ==========================================================
     INITIALIZATION GUARD
  ========================================================== */

  /*
   * Prevent accidental duplicate initialization.
   *
   * React StrictMode intentionally mounts effects twice
   * during development. This guard prevents the SmartSave
   * initialization request storm.
   */

  const initializedRef =
    useRef(false);

  /* ==========================================================
     SAFE STATE HELPERS
  ========================================================== */

  const updateLoading = useCallback(
    (key, value) => {
      if (!mountedRef.current) {
        return;
      }

      setLoading((previous) => {
        if (
          previous[key] === value
        ) {
          return previous;
        }

        return {
          ...previous,
          [key]: value,
        };
      });
    },
    []
  );

  const updateError = useCallback(
    (key, error) => {
      if (!mountedRef.current) {
        return;
      }

      const message =
        normalizeError(error);

      setErrors((previous) => {
        if (
          previous[key] === message
        ) {
          return previous;
        }

        return {
          ...previous,
          [key]: message,
        };
      });
    },
    []
  );

  const clearError = useCallback(
    (key) => {
      if (!mountedRef.current) {
        return;
      }

      setErrors((previous) => {
        if (
          previous[key] === null
        ) {
          return previous;
        }

        return {
          ...previous,
          [key]: null,
        };
      });
    },
    []
  );

  /* ==========================================================
     QUERY SIGNATURES
  ========================================================== */

  const accountsQueryKey =
    useMemo(
      () =>
        createQueryKey(
          accountsQuery
        ),
      [accountsQuery]
    );

  const goalsQueryKey =
    useMemo(
      () =>
        createQueryKey(
          goalsQuery
        ),
      [goalsQuery]
    );

  const plansQueryKey =
    useMemo(
      () =>
        createQueryKey(
          plansQuery
        ),
      [plansQuery]
    );

  const schedulesQueryKey =
    useMemo(
      () =>
        createQueryKey(
          schedulesQuery
        ),
      [schedulesQuery]
    );

  const executionsQueryKey =
    useMemo(
      () =>
        createQueryKey(
          executionsQuery
        ),
      [executionsQuery]
    );

  const challengesQueryKey =
    useMemo(
      () =>
        createQueryKey(
          challengesQuery
        ),
      [challengesQuery]
    );

  const insightsQueryKey =
    useMemo(
      () =>
        createQueryKey(
          insightsQuery
        ),
      [insightsQuery]
    );

  /* ==========================================================
     QUERY REFS
  ========================================================== */

  const accountsQueryRef =
    useRef(accountsQuery);

  const goalsQueryRef =
    useRef(goalsQuery);

  const plansQueryRef =
    useRef(plansQuery);

  const schedulesQueryRef =
    useRef(schedulesQuery);

  const executionsQueryRef =
    useRef(executionsQuery);

  const challengesQueryRef =
    useRef(challengesQuery);

  const insightsQueryRef =
    useRef(insightsQuery);

  useEffect(() => {
    accountsQueryRef.current =
      accountsQuery;
  }, [accountsQueryKey]);

  useEffect(() => {
    goalsQueryRef.current =
      goalsQuery;
  }, [goalsQueryKey]);

  useEffect(() => {
    plansQueryRef.current =
      plansQuery;
  }, [plansQueryKey]);

  useEffect(() => {
    schedulesQueryRef.current =
      schedulesQuery;
  }, [schedulesQueryKey]);

  useEffect(() => {
    executionsQueryRef.current =
      executionsQuery;
  }, [executionsQueryKey]);

  useEffect(() => {
    challengesQueryRef.current =
      challengesQuery;
  }, [challengesQueryKey]);

  useEffect(() => {
    insightsQueryRef.current =
      insightsQuery;
  }, [insightsQueryKey]);

  /* ==========================================================
     GENERIC RESOURCE FETCHER
  ========================================================== */

  const fetchResource = useCallback(
    async ({
      key,
      methodName,
      query,
      generation,
    }) => {
      if (!mountedRef.current) {
        return null;
      }

      updateLoading(key, true);
      clearError(key);

      try {
        const method =
          requireServiceMethod(
            methodName
          );

        const response =
          await method(query);

        /*
         * Ignore stale results.
         */
        if (
          !mountedRef.current ||
          generation !==
            generationRef.current
        ) {
          return response;
        }

        setData((previous) => ({
          ...previous,
          [key]:
            asArray(response),
        }));

        return response;
      } catch (error) {
        if (
          mountedRef.current &&
          generation ===
            generationRef.current
        ) {
          updateError(
            key,
            error
          );
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          generation ===
            generationRef.current
        ) {
          updateLoading(
            key,
            false
          );
        }
      }
    },
    [
      clearError,
      updateError,
      updateLoading,
    ]
  );

  /* ==========================================================
     INDIVIDUAL FETCH METHODS
  ========================================================== */

  const fetchAccounts = useCallback(
    async (query) => {
      const generation =
        generationRef.current;

      return fetchResource({
        key: "accounts",
        methodName:
          "getSavingAccounts",
        query:
          query ??
          accountsQueryRef.current,
        generation,
      });
    },
    [fetchResource]
  );

  const fetchGoals = useCallback(
    async (query) => {
      const generation =
        generationRef.current;

      return fetchResource({
        key: "goals",
        methodName:
          "getSavingGoals",
        query:
          query ??
          goalsQueryRef.current,
        generation,
      });
    },
    [fetchResource]
  );

  const fetchPlans = useCallback(
    async (query) => {
      const generation =
        generationRef.current;

      return fetchResource({
        key: "plans",
        methodName:
          "getSavingPlans",
        query:
          query ??
          plansQueryRef.current,
        generation,
      });
    },
    [fetchResource]
  );

  const fetchSchedules = useCallback(
    async (query) => {
      const generation =
        generationRef.current;

      return fetchResource({
        key: "schedules",
        methodName:
          "getSavingSchedules",
        query:
          query ??
          schedulesQueryRef.current,
        generation,
      });
    },
    [fetchResource]
  );

  const fetchExecutions = useCallback(
    async (query) => {
      const generation =
        generationRef.current;

      return fetchResource({
        key: "executions",
        methodName:
          "getSavingExecutions",
        query:
          query ??
          executionsQueryRef.current,
        generation,
      });
    },
    [fetchResource]
  );

  const fetchChallenges = useCallback(
    async (query) => {
      const generation =
        generationRef.current;

      return fetchResource({
        key: "challenges",
        methodName:
          "getSavingsChallenges",
        query:
          query ??
          challengesQueryRef.current,
        generation,
      });
    },
    [fetchResource]
  );

  const fetchInsights = useCallback(
    async (query) => {
      const generation =
        generationRef.current;

      return fetchResource({
        key: "insights",
        methodName:
          "getDashboardSavingInsights",
        query:
          query ??
          insightsQueryRef.current,
        generation,
      });
    },
    [fetchResource]
  );

  /* ==========================================================
     REFRESH EVERYTHING
  ========================================================== */

  const refresh = useCallback(
    async () => {
      if (!mountedRef.current) {
        return;
      }

      const generation =
        ++generationRef.current;

      setRefreshing(true);

      try {
        await Promise.allSettled([
          fetchResource({
            key: "accounts",
            methodName:
              "getSavingAccounts",
            query:
              accountsQueryRef.current,
            generation,
          }),

          fetchResource({
            key: "goals",
            methodName:
              "getSavingGoals",
            query:
              goalsQueryRef.current,
            generation,
          }),

          fetchResource({
            key: "plans",
            methodName:
              "getSavingPlans",
            query:
              plansQueryRef.current,
            generation,
          }),

          fetchResource({
            key: "schedules",
            methodName:
              "getSavingSchedules",
            query:
              schedulesQueryRef.current,
            generation,
          }),

          fetchResource({
            key: "executions",
            methodName:
              "getSavingExecutions",
            query:
              executionsQueryRef.current,
            generation,
          }),

          fetchResource({
            key: "challenges",
            methodName:
              "getSavingsChallenges",
            query:
              challengesQueryRef.current,
            generation,
          }),

          fetchResource({
            key: "insights",
            methodName:
              "getDashboardSavingInsights",
            query:
              insightsQueryRef.current,
            generation,
          }),
        ]);
      } finally {
        if (
          mountedRef.current &&
          generation ===
            generationRef.current
        ) {
          setRefreshing(false);
        }
      }
    },
    [fetchResource]
  );

  /* ==========================================================
     INITIAL FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    if (initializedRef.current) {
      return undefined;
    }

    initializedRef.current = true;

    refresh();

    return undefined;
  }, [autoFetch, refresh]);

  /* ==========================================================
     DERIVED METRICS
  ========================================================== */

  const metrics = useMemo(() => {
    const goals =
      data.goals;

    const accounts =
      data.accounts;

    const plans =
      data.plans;

    const schedules =
      data.schedules;

    const challenges =
      data.challenges;

    const executions =
      data.executions;

    const insights =
      data.insights;

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
     LOADING
  ========================================================== */

  const isLoading =
    useMemo(
      () =>
        Object.values(
          loading
        ).some(Boolean),
      [loading]
    );

  /* ==========================================================
     ERRORS
  ========================================================== */

  const hasError =
    useMemo(
      () =>
        Object.values(
          errors
        ).some(Boolean),
      [errors]
    );

  const firstError =
    useMemo(
      () =>
        Object.values(
          errors
        ).find(Boolean) || null,
      [errors]
    );

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const pagination =
    useMemo(
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

  const reset =
    useCallback(() => {
      if (!mountedRef.current) {
        return;
      }

      generationRef.current += 1;

      initializedRef.current =
        false;

      setData({
        ...INITIAL_DATA,
      });

      setLoading({
        ...INITIAL_LOADING,
      });

      setErrors({
        ...INITIAL_ERRORS,
      });

      setRefreshing(false);
    }, []);

  /* ==========================================================
     RETURN VALUE
  ========================================================== */

  return useMemo(
    () => ({
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

      loading,

      isLoading,

      refreshing,

      errors,

      error:
        firstError,

      hasError,

      metrics,

      pagination,

      fetchAccounts,
      fetchGoals,
      fetchPlans,
      fetchSchedules,
      fetchExecutions,
      fetchChallenges,
      fetchInsights,

      refresh,
      reset,
    }),
    [
      data,
      loading,
      isLoading,
      refreshing,
      errors,
      firstError,
      hasError,
      metrics,
      pagination,
      fetchAccounts,
      fetchGoals,
      fetchPlans,
      fetchSchedules,
      fetchExecutions,
      fetchChallenges,
      fetchInsights,
      refresh,
      reset,
    ]
  );
};

export default useSmartSave;