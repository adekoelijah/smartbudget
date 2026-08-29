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
 * Convert supported API response shapes into an array.
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

/**
 * IMPORTANT:
 *
 * Undefined resources now means:
 *
 *     fetch NOTHING automatically.
 *
 * This prevents:
 *
 *     /accounts
 *     /goals
 *     /plans
 *     /schedules
 *     /executions
 *     /challenges
 *     /insights
 *
 * from being requested by every consumer.
 */
const normalizeResources = (resources) => {
  if (
    resources === undefined ||
    resources === null
  ) {
    return [];
  }

  if (!Array.isArray(resources)) {
    return [];
  }

  return [
    ...new Set(resources),
  ].filter((resource) =>
    RESOURCE_KEYS.includes(resource)
  );
};

/* ============================================================
   PAGINATION
============================================================ */

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
        ? Math.ceil(
            total / limit
          )
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
   * IMPORTANT:
   *
   * Resources MUST be explicitly supplied.
   *
   * Example:
   *
   * resources={["accounts"]}
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

  const resourceKey = useMemo(
    () =>
      selectedResources.join("|"),
    [selectedResources]
  );

  /* ==========================================================
     QUERY MAP
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

  /* ==========================================================
     QUERY SIGNATURES
  ========================================================== */

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
     REQUEST GENERATION
  ========================================================== */

  /**
   * One generation represents one complete request cycle.
   *
   * IMPORTANT:
   *
   * fetchResource() does NOT increment this.
   *
   * Only refresh()/reset()/configuration changes invalidate
   * a previous generation.
   */
  const generationRef =
    useRef(0);

  /* ==========================================================
     IN-FLIGHT REQUESTS
  ========================================================== */

  /**
   * Map:
   *
   * resource:querySignature
   *
   * -> Promise
   *
   * This prevents duplicate identical requests.
   */
  const inFlightRef =
    useRef(new Map());

  /* ==========================================================
     LAST FETCH SIGNATURES
  ========================================================== */

  const lastFetchKeyRef =
    useRef(new Map());

  /* ==========================================================
     PREVIOUS CONFIGURATION
  ========================================================== */

  const previousResourceKeyRef =
    useRef(null);

  const previousQueryKeysRef =
    useRef(null);

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
              [resource]:
                value,
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
              [resource]:
                message,
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
              [resource]:
                null,
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
            : normalizeQuery(
                queryMap[resource]
              );

        const queryKey =
          stableSerialize(query);

        const requestKey =
          `${resource}:${queryKey}`;

        /*
         * Reuse an identical request already in flight.
         */
        const existingRequest =
          inFlightRef.current.get(
            requestKey
          );

        if (existingRequest) {
          return existingRequest;
        }

        /*
         * Capture the current generation.
         *
         * DO NOT increment generation here.
         */
        const requestGeneration =
          generationRef.current;

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
               * Ignore a response that belongs to an
               * invalidated request generation.
               */
              if (
                !mountedRef.current ||
                requestGeneration !==
                  generationRef.current
              ) {
                return response;
              }

              const normalized =
                asArray(response);

              setData(
                (previous) => {
                  if (
                    previous[
                      resource
                    ] ===
                    normalized
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
                requestGeneration ===
                  generationRef.current
              ) {
                setResourceError(
                  resource,
                  error
                );
              }

              throw error;
            } finally {
              /*
               * Only delete THIS request.
               *
               * Do not clear the entire map.
               */
              if (
                inFlightRef.current.get(
                  requestKey
                ) ===
                requestPromise
              ) {
                inFlightRef.current.delete(
                  requestKey
                );
              }

              if (
                mountedRef.current &&
                requestGeneration ===
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
        queryMap,
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
     REFRESH
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
          resourcesOverride ===
          undefined
            ? selectedResources
            : normalizeResources(
                resourcesOverride
              );

        if (
          resourcesToFetch.length ===
          0
        ) {
          return [];
        }

        /*
         * Start ONE new request generation.
         */
        const generation =
          ++generationRef.current;

        setRefreshing(true);

        /*
         * Do not clear inFlightRef.
         *
         * Existing identical requests can safely be reused.
         */

        const results =
          await Promise.allSettled(
            resourcesToFetch.map(
              (resource) =>
                fetchResource(
                  resource,
                  queryMap[
                    resource
                  ]
                )
            )
          );

        /*
         * Only the latest refresh operation may clear
         * the refreshing state.
         */
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
        queryMap,
        selectedResources,
      ]
    );

  /* ==========================================================
     INITIAL / CONFIGURATION FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    /*
     * No resources means:
     *
     * DO NOTHING.
     */
    if (
      selectedResources.length ===
      0
    ) {
      previousResourceKeyRef.current =
        resourceKey;

      previousQueryKeysRef.current = {
        ...queryKeys,
      };

      return;
    }

    const resourceConfigurationChanged =
      previousResourceKeyRef.current !==
      resourceKey;

    /*
     * First configuration.
     */
    if (
      previousResourceKeyRef.current ===
      null
    ) {
      previousResourceKeyRef.current =
        resourceKey;

      previousQueryKeysRef.current = {
        ...queryKeys,
      };

      void refresh(
        selectedResources
      );

      return;
    }

    /*
     * Resource selection changed.
     *
     * Fetch only newly selected resources.
     */
    if (
      resourceConfigurationChanged
    ) {
      const previousResources =
        previousResourceKeyRef.current
          ? previousResourceKeyRef.current
              .split("|")
              .filter(Boolean)
          : [];

      const addedResources =
        selectedResources.filter(
          (resource) =>
            !previousResources.includes(
              resource
            )
        );

      previousResourceKeyRef.current =
        resourceKey;

      previousQueryKeysRef.current = {
        ...queryKeys,
      };

      if (
        addedResources.length > 0
      ) {
        void refresh(
          addedResources
        );
      }

      return;
    }

    /*
     * Existing resources whose query changed.
     */
    const previousQueries =
      previousQueryKeysRef.current;

    if (!previousQueries) {
      previousQueryKeysRef.current = {
        ...queryKeys,
      };

      return;
    }

    const changedResources =
      selectedResources.filter(
        (resource) =>
          previousQueries[
            resource
          ] !==
          queryKeys[
            resource
          ]
      );

    previousQueryKeysRef.current = {
      ...queryKeys,
    };

    if (
      changedResources.length ===
      0
    ) {
      return;
    }

    /*
     * Query changes only refetch the affected resources.
     */
    changedResources.forEach(
      (resource) => {
        void fetchResource(
          resource,
          queryMap[
            resource
          ]
        );
      }
    );
  }, [
    autoFetch,
    fetchResource,
    queryKeys,
    queryMap,
    refresh,
    resourceKey,
    selectedResources,
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
            goal?.targetAmount ??
              0
          ),
        0
      );

    const totalSaved =
      goals.reduce(
        (total, goal) =>
          total +
          Number(
            goal?.currentAmount ??
              0
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
     RESOURCE HELPERS
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
       * Invalidate all currently running responses.
       *
       * This does NOT cancel HTTP requests.
       * It simply prevents their responses from updating state.
       */
      generationRef.current += 1;

      /*
       * Forget currently tracked requests.
       *
       * We deliberately do not pretend this cancels Axios.
       */
      inFlightRef.current.clear();

      lastFetchKeyRef.current.clear();

      previousResourceKeyRef.current =
        null;

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
       * Complete SmartSave data.
       */
      data,

      /*
       * Resource shortcuts.
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
       * Loading.
       */
      loading,

      isLoading,

      refreshing,

      /*
       * Errors.
       */
      errors,

      error:
        firstError,

      hasError,

      /*
       * Helpers.
       */
      isResourceLoading,

      getResourceError,

      /*
       * Derived metrics.
       */
      metrics,

      /*
       * Pagination.
       */
      pagination,

      /*
       * Explicit resource fetchers.
       */
      fetchAccounts,
      fetchGoals,
      fetchPlans,
      fetchSchedules,
      fetchExecutions,
      fetchChallenges,
      fetchInsights,

      /*
       * Global/resource refresh.
       */
      refresh,

      /*
       * Reset.
       */
      reset,

      /*
       * Resources currently managed by this hook.
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