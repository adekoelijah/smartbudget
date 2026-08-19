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

const RESOURCE_KEYS = Object.freeze([
  "accounts",
  "goals",
  "plans",
  "schedules",
  "executions",
  "challenges",
  "insights",
]);

const INITIAL_DATA = Object.freeze({
  accounts: [],
  goals: [],
  plans: [],
  schedules: [],
  executions: [],
  challenges: [],
  insights: [],
});

const INITIAL_LOADING = Object.freeze({
  accounts: false,
  goals: false,
  plans: false,
  schedules: false,
  executions: false,
  challenges: false,
  insights: false,
});

const INITIAL_ERRORS = Object.freeze({
  accounts: null,
  goals: null,
  plans: null,
  schedules: null,
  executions: null,
  challenges: null,
  insights: null,
});

const EMPTY_QUERY = Object.freeze({});

const RESOURCE_METHODS = Object.freeze({
  accounts: "getSavingAccounts",
  goals: "getSavingGoals",
  plans: "getSavingPlans",
  schedules: "getSavingSchedules",
  executions: "getSavingExecutions",
  challenges: "getSavingsChallenges",
  insights: "getDashboardSavingInsights",
});

/* ============================================================
   HELPERS
============================================================ */

/**
 * Safely convert API resource responses into arrays.
 *
 * Supported backend response shapes:
 *
 * []
 * { data: [] }
 * { items: [] }
 * { results: [] }
 * { data: { data: [] } }
 * { data: { items: [] } }
 */
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

  if (Array.isArray(value?.data?.data)) {
    return value.data.data;
  }

  if (Array.isArray(value?.data?.items)) {
    return value.data.items;
  }

  if (Array.isArray(value?.data?.results)) {
    return value.data.results;
  }

  return [];
};

/* ============================================================
   STABLE SERIALIZATION
============================================================ */

/**
 * Stable serialization prevents this:
 *
 * useSmartSave({
 *   goalsQuery: {}
 * })
 *
 * from becoming a new dependency on every render.
 *
 * Unlike JSON.stringify(query, Object.keys(query).sort()),
 * this implementation correctly handles nested objects and
 * arrays.
 */
const stableSerialize = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return String(value);
  }

  if (
    typeof value !== "object"
  ) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value
      .map(stableSerialize)
      .join(",")}]`;
  }

  const keys = Object.keys(value).sort();

  return `{${keys
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableSerialize(
          value[key]
        )}`
    )
    .join(",")}}`;
};

/* ============================================================
   QUERY NORMALIZATION
============================================================ */

const normalizeQuery = (query) => {
  if (
    !query ||
    typeof query !== "object" ||
    Array.isArray(query)
  ) {
    return {};
  }

  return {
    ...query,
  };
};

/* ============================================================
   RESOURCE NORMALIZATION
============================================================ */

const normalizeResources = (
  resources
) => {
  /*
   * Default:
   *
   * useSmartSave()
   *
   * fetches all SmartSave resources.
   */
  if (
    resources === undefined ||
    resources === null
  ) {
    return [...RESOURCE_KEYS];
  }

  if (
    !Array.isArray(resources)
  ) {
    return [...RESOURCE_KEYS];
  }

  const uniqueResources = [
    ...new Set(resources),
  ];

  return uniqueResources.filter(
    (resource) =>
      RESOURCE_KEYS.includes(resource)
  );
};

/* ============================================================
   PAGINATION
============================================================ */

const normalizePagination = (
  value
) => {
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
      Number.isFinite(page) &&
      page > 0
        ? page
        : DEFAULT_PAGE,

    limit:
      Number.isFinite(limit) &&
      limit > 0
        ? limit
        : DEFAULT_LIMIT,

    total:
      Number.isFinite(total) &&
      total >= 0
        ? total
        : 0,

    pages:
      Number.isFinite(pages) &&
      pages >= 0
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

/* ============================================================
   ERROR NORMALIZATION
============================================================ */

const normalizeError = (
  error
) => {
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
   SERVICE SAFETY
============================================================ */

const getServiceMethod = (
  methodName
) => {
  const method =
    smartSaveService?.[methodName];

  if (
    typeof method !== "function"
  ) {
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

  /*
   * Selective fetching.
   *
   * Example:
   *
   * resources={["goals"]}
   *
   * or:
   *
   * resources={["accounts", "goals"]}
   */
  resources,

  accountsQuery = EMPTY_QUERY,
  goalsQuery = EMPTY_QUERY,
  plansQuery = EMPTY_QUERY,
  schedulesQuery = EMPTY_QUERY,
  executionsQuery = EMPTY_QUERY,
  challengesQuery = EMPTY_QUERY,
  insightsQuery = EMPTY_QUERY,
} = {}) => {
  /* ==========================================================
     RESOURCE SELECTION
  ========================================================== */

  const selectedResources = useMemo(
    () =>
      normalizeResources(
        resources
      ),
    [resources]
  );

  /*
   * Stable resource signature.
   *
   * Prevents:
   *
   * resources={["goals"]}
   *
   * from causing repeated effects when the parent creates
   * a new array on every render.
   */
  const resourceKey = useMemo(
    () =>
      selectedResources.join("|"),
    [selectedResources]
  );

  /* ==========================================================
     QUERY SIGNATURES
  ========================================================== */

  const queryMap = useMemo(
    () => ({
      accounts:
        normalizeQuery(
          accountsQuery
        ),

      goals:
        normalizeQuery(
          goalsQuery
        ),

      plans:
        normalizeQuery(
          plansQuery
        ),

      schedules:
        normalizeQuery(
          schedulesQuery
        ),

      executions:
        normalizeQuery(
          executionsQuery
        ),

      challenges:
        normalizeQuery(
          challengesQuery
        ),

      insights:
        normalizeQuery(
          insightsQuery
        ),
    }),
    [
      accountsQuery,
      goalsQuery,
      plansQuery,
      schedulesQuery,
      executionsQuery,
      challengesQuery,
      insightsQuery,
    ]
  );

  const queryKeys = useMemo(
    () => ({
      accounts:
        stableSerialize(
          queryMap.accounts
        ),

      goals:
        stableSerialize(
          queryMap.goals
        ),

      plans:
        stableSerialize(
          queryMap.plans
        ),

      schedules:
        stableSerialize(
          queryMap.schedules
        ),

      executions:
        stableSerialize(
          queryMap.executions
        ),

      challenges:
        stableSerialize(
          queryMap.challenges
        ),

      insights:
        stableSerialize(
          queryMap.insights
        ),
    }),
    [queryMap]
  );

  /* ==========================================================
     STATE
  ========================================================== */

  const [data, setData] =
    useState(() => ({
      ...INITIAL_DATA,
    }));

  const [loading, setLoading] =
    useState(() => ({
      ...INITIAL_LOADING,
    }));

  const [errors, setErrors] =
    useState(() => ({
      ...INITIAL_ERRORS,
    }));

  const [refreshing, setRefreshing] =
    useState(false);

  /* ==========================================================
     LIFECYCLE
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
     GENERATION
  ========================================================== */

  const generationRef =
    useRef(0);

  /*
   * Every request generation represents the latest valid
   * request cycle.
   *
   * Older requests are ignored when they finish.
   */

  /* ==========================================================
     INITIAL FETCH GUARD
  ========================================================== */

  const initializedRef =
    useRef(false);

  /* ==========================================================
     IN-FLIGHT REQUESTS
  ========================================================== */

  /*
   * Prevent duplicate requests for the same resource.
   *
   * Example:
   *
   * GET /goals
   * GET /goals
   * GET /goals
   *
   * triggered before the first request finishes.
   */
  const inFlightRef =
    useRef(new Map());

  /* ==========================================================
     LAST FETCH SIGNATURES
  ========================================================== */

  const lastFetchKeyRef =
    useRef(new Map());

  /* ==========================================================
     QUERY REFS
  ========================================================== */

  const queryRefs =
    useRef({
      accounts:
        normalizeQuery(
          accountsQuery
        ),

      goals:
        normalizeQuery(
          goalsQuery
        ),

      plans:
        normalizeQuery(
          plansQuery
        ),

      schedules:
        normalizeQuery(
          schedulesQuery
        ),

      executions:
        normalizeQuery(
          executionsQuery
        ),

      challenges:
        normalizeQuery(
          challengesQuery
        ),

      insights:
        normalizeQuery(
          insightsQuery
        ),
    });

  /*
   * Keep the latest query values available without making
   * callbacks depend on unstable object identities.
   */
  useEffect(() => {
    queryRefs.current.accounts =
      queryMap.accounts;

    queryRefs.current.goals =
      queryMap.goals;

    queryRefs.current.plans =
      queryMap.plans;

    queryRefs.current.schedules =
      queryMap.schedules;

    queryRefs.current.executions =
      queryMap.executions;

    queryRefs.current.challenges =
      queryMap.challenges;

    queryRefs.current.insights =
      queryMap.insights;
  }, [queryMap]);

  /* ==========================================================
     STATE HELPERS
  ========================================================== */

  const setResourceLoading =
    useCallback(
      (resource, value) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setLoading(
          (previous) => {
            if (
              previous[resource] ===
              value
            ) {
              return previous;
            }

            return {
              ...previous,
              [resource]: value,
            };
          }
        );
      },
      []
    );

  const setResourceError =
    useCallback(
      (resource, error) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        const message =
          normalizeError(error);

        setErrors(
          (previous) => {
            if (
              previous[resource] ===
              message
            ) {
              return previous;
            }

            return {
              ...previous,
              [resource]: message,
            };
          }
        );
      },
      []
    );

  const clearResourceError =
    useCallback(
      (resource) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setErrors(
          (previous) => {
            if (
              previous[resource] ===
              null
            ) {
              return previous;
            }

            return {
              ...previous,
              [resource]: null,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     FETCH RESOURCE
  ========================================================== */

  const fetchResource =
    useCallback(
      async (
        resource,
        queryOverride
      ) => {
        if (
          !RESOURCE_KEYS.includes(
            resource
          )
        ) {
          throw new Error(
            `Unknown SmartSave resource: ${resource}`
          );
        }

        if (
          !mountedRef.current
        ) {
          return null;
        }

        const methodName =
          RESOURCE_METHODS[
            resource
          ];

        const query =
          queryOverride !==
          undefined
            ? normalizeQuery(
                queryOverride
              )
            : queryRefs.current[
                resource
              ];

        const queryKey =
          stableSerialize(query);

        const requestKey =
          `${resource}:${queryKey}`;

        /*
         * Reuse an existing identical request.
         */
        const existingRequest =
          inFlightRef.current.get(
            requestKey
          );

        if (existingRequest) {
          return existingRequest;
        }

        const generation =
          ++generationRef.current;

        clearResourceError(
          resource
        );

        setResourceLoading(
          resource,
          true
        );

        const requestPromise =
          (async () => {
            try {
              const method =
                getServiceMethod(
                  methodName
                );

              const response =
                await method(query);

              /*
               * Ignore stale responses.
               */
              if (
                !mountedRef.current ||
                generation !==
                  generationRef.current
              ) {
                return response;
              }

              const normalized =
                asArray(response);

              setData(
                (previous) => {
                  /*
                   * Avoid a pointless render when the same
                   * array reference is returned.
                   */
                  if (
                    previous[
                      resource
                    ] === normalized
                  ) {
                    return previous;
                  }

                  return {
                    ...previous,
                    [resource]:
                      normalized,
                  };
                }
              );

              lastFetchKeyRef.current.set(
                resource,
                requestKey
              );

              return response;
            } catch (error) {
              if (
                mountedRef.current &&
                generation ===
                  generationRef.current
              ) {
                setResourceError(
                  resource,
                  error
                );
              }

              /*
               * Keep the error available to callers.
               */
              throw error;
            } finally {
              inFlightRef.current.delete(
                requestKey
              );

              if (
                mountedRef.current &&
                generation ===
                  generationRef.current
              ) {
                setResourceLoading(
                  resource,
                  false
                );
              }
            }
          })();

        inFlightRef.current.set(
          requestKey,
          requestPromise
        );

        return requestPromise;
      },
      [
        clearResourceError,
        setResourceError,
        setResourceLoading,
      ]
    );

  /* ==========================================================
     INDIVIDUAL RESOURCE METHODS
  ========================================================== */

  const fetchAccounts =
    useCallback(
      (query) =>
        fetchResource(
          "accounts",
          query
        ),
      [fetchResource]
    );

  const fetchGoals =
    useCallback(
      (query) =>
        fetchResource(
          "goals",
          query
        ),
      [fetchResource]
    );

  const fetchPlans =
    useCallback(
      (query) =>
        fetchResource(
          "plans",
          query
        ),
      [fetchResource]
    );

  const fetchSchedules =
    useCallback(
      (query) =>
        fetchResource(
          "schedules",
          query
        ),
      [fetchResource]
    );

  const fetchExecutions =
    useCallback(
      (query) =>
        fetchResource(
          "executions",
          query
        ),
      [fetchResource]
    );

  const fetchChallenges =
    useCallback(
      (query) =>
        fetchResource(
          "challenges",
          query
        ),
      [fetchResource]
    );

  const fetchInsights =
    useCallback(
      (query) =>
        fetchResource(
          "insights",
          query
        ),
      [fetchResource]
    );

  /* ==========================================================
     RESOURCE FETCH MAP
  ========================================================== */

  const fetchers = useMemo(
    () => ({
      accounts:
        fetchAccounts,

      goals:
        fetchGoals,

      plans:
        fetchPlans,

      schedules:
        fetchSchedules,

      executions:
        fetchExecutions,

      challenges:
        fetchChallenges,

      insights:
        fetchInsights,
    }),
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
     FETCH SELECTED RESOURCES
  ========================================================== */

  const refresh =
    useCallback(
      async (
        resourcesOverride
      ) => {
        if (
          !mountedRef.current
        ) {
          return [];
        }

        const resourcesToFetch =
          normalizeResources(
            resourcesOverride ??
              selectedResources
          );

        if (
          resourcesToFetch.length === 0
        ) {
          return [];
        }

        setRefreshing(true);

        const generation =
          ++generationRef.current;

        /*
         * Fetch resources in parallel.
         *
         * Promise.allSettled guarantees that one failed
         * resource does not cancel the others.
         */
        const results =
          await Promise.allSettled(
            resourcesToFetch.map(
              (resource) =>
                fetchResource(
                  resource,
                  queryRefs.current[
                    resource
                  ]
                )
            )
          );

        if (
          mountedRef.current &&
          generation ===
            generationRef.current
        ) {
          setRefreshing(false);
        }

        return results;
      },
      [
        fetchResource,
        selectedResources,
      ]
    );

  /* ==========================================================
     INITIAL FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    if (
      initializedRef.current
    ) {
      return;
    }

    initializedRef.current = true;

    /*
     * Do not await inside the effect.
     *
     * refresh handles its own lifecycle.
     */
    void refresh(
      selectedResources
    );
  }, [
    autoFetch,
    refresh,
    resourceKey,
    selectedResources,
  ]);

  /* ==========================================================
     QUERY CHANGE FETCHING
  ========================================================== */

  const previousQueryKeysRef =
    useRef(null);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    /*
     * Initial fetch is already handled above.
     */
    if (
      previousQueryKeysRef.current ===
      null
    ) {
      previousQueryKeysRef.current = {
        ...queryKeys,
      };

      return;
    }

    const previous =
      previousQueryKeysRef.current;

    const changedResources =
      selectedResources.filter(
        (resource) =>
          previous[resource] !==
          queryKeys[resource]
      );

    previousQueryKeysRef.current = {
      ...queryKeys,
    };

    if (
      changedResources.length === 0
    ) {
      return;
    }

    /*
     * Only fetch resources whose query actually changed.
     *
     * This is the key protection against unnecessary
     * SmartSave request storms.
     */
    changedResources.forEach(
      (resource) => {
        void fetchResource(
          resource,
          queryRefs.current[
            resource
          ]
        );
      }
    );
  }, [
    autoFetch,
    queryKeys,
    selectedResources,
    fetchResource,
  ]);

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

    const executions =
      data.executions;

    const challenges =
      data.challenges;

    const insights =
      data.insights;

    const totalTarget =
      goals.reduce(
        (total, goal) =>
          total +
          Number(
            goal?.targetAmount ?? 0
          ),
        0
      );

    const totalSaved =
      goals.reduce(
        (total, goal) =>
          total +
          Number(
            goal?.currentAmount ?? 0
          ),
        0
      );

    const totalRemaining =
      Math.max(
        0,
        totalTarget -
          totalSaved
      );

    const activeGoals =
      goals.filter(
        (goal) =>
          goal?.status ===
          "active"
      ).length;

    const completedGoals =
      goals.filter(
        (goal) =>
          goal?.status ===
          "completed"
      ).length;

    const activePlans =
      plans.filter(
        (plan) =>
          plan?.status ===
          "active"
      ).length;

    const activeSchedules =
      schedules.filter(
        (schedule) =>
          schedule?.status ===
          "active"
      ).length;

    const activeChallenges =
      challenges.filter(
        (challenge) =>
          challenge?.status ===
          "active"
      ).length;

    const pendingExecutions =
      executions.filter(
        (execution) =>
          execution?.status ===
          "pending"
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
        ).find(Boolean) ??
        null,
      [errors]
    );

  /* ==========================================================
     RESOURCE LOADING / ERROR HELPERS
  ========================================================== */

  const isResourceLoading =
    useCallback(
      (resource) =>
        Boolean(
          loading[resource]
        ),
      [loading]
    );

  const getResourceError =
    useCallback(
      (resource) =>
        errors[resource] ??
        null,
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

        insights:
          normalizePagination(
            data.insights
          ),
      }),
      [data]
    );

  /* ==========================================================
     RESET
  ========================================================== */

  const reset =
    useCallback(() => {
      if (
        !mountedRef.current
      ) {
        return;
      }

      /*
       * Invalidate all existing requests.
       */
      generationRef.current += 1;

      /*
       * Prevent old requests from being considered
       * in-flight by the next initialization cycle.
       */
      inFlightRef.current.clear();

      lastFetchKeyRef.current.clear();

      initializedRef.current =
        false;

      previousQueryKeysRef.current =
        null;

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
     RETURN CONTRACT
  ========================================================== */

  return useMemo(
    () => ({
      /*
       * Complete SmartSave data tree.
       */
      data,

      /*
       * Convenient resource access.
       */
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

      /*
       * Loading state.
       */
      loading,

      isLoading,

      refreshing,

      /*
       * Error state.
       */
      errors,

      error:
        firstError,

      hasError,

      /*
       * Resource helpers.
       */
      isResourceLoading,

      getResourceError,

      /*
       * Centralized derived metrics.
       */
      metrics,

      /*
       * Pagination.
       */
      pagination,

      /*
       * Resource fetchers.
       */
      fetchAccounts,
      fetchGoals,
      fetchPlans,
      fetchSchedules,
      fetchExecutions,
      fetchChallenges,
      fetchInsights,

      /*
       * Global refresh.
       */
      refresh,

      /*
       * Complete state reset.
       */
      reset,

      /*
       * Useful for consumers that need to know what this
       * hook is currently responsible for fetching.
       */
      resources:
        selectedResources,
    }),
    [
      data,
      loading,
      isLoading,
      refreshing,
      errors,
      firstError,
      hasError,
      isResourceLoading,
      getResourceError,
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
      selectedResources,
    ]
  );
};

export default useSmartSave;