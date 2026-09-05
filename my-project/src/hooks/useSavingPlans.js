import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import smartSaveService, {
  SmartSaveServiceError,
} from "../services/smartSaveService";

import {
  SMART_SAVE_DEFAULTS,
} from "../constants/smartSaveConstants";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_PAGE = Number(
  SMART_SAVE_DEFAULTS?.page ?? 1
);

const DEFAULT_LIMIT = Number(
  SMART_SAVE_DEFAULTS?.limit ?? 20
);

const MAX_LIMIT = Number(
  SMART_SAVE_DEFAULTS?.maxLimit ?? 100
);

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizePage = (value) => {
  const page = Number(value);

  if (!Number.isFinite(page) || page < 1) {
    return DEFAULT_PAGE;
  }

  return Math.floor(page);
};

const normalizeLimit = (value) => {
  const limit = Number(value);

  if (!Number.isFinite(limit) || limit < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    Math.floor(limit),
    MAX_LIMIT
  );
};

const normalizeFilters = (filters = {}) => {
  const source = isObject(filters)
    ? filters
    : {};

  return {
    ...source,
    page: normalizePage(source.page),
    limit: normalizeLimit(source.limit),
  };
};

const cleanFilters = (filters = {}) => {
  const normalized = normalizeFilters(filters);

  return Object.entries(normalized).reduce(
    (result, [key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return result;
      }

      result[key] = value;

      return result;
    },
    {}
  );
};

const getPlanId = (plan) => {
  if (!plan || typeof plan !== "object") {
    return null;
  }

  return (
    plan._id ??
    plan.id ??
    plan.planId ??
    null
  );
};

const normalizeCollectionResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isObject(response)) {
    return [];
  }

  if (Array.isArray(response.plans)) {
    return response.plans;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

const normalizePaginationResponse = (
  response,
  fallbackFilters,
  fallbackCount
) => {
  const normalized = normalizeFilters(
    fallbackFilters
  );

  if (!isObject(response)) {
    return {
      page: normalized.page,
      limit: normalized.limit,
      total: fallbackCount,
      totalPages: Math.max(
        1,
        Math.ceil(
          fallbackCount / normalized.limit
        )
      ),
    };
  }

  const pagination =
    isObject(response.pagination)
      ? response.pagination
      : isObject(response.meta?.pagination)
        ? response.meta.pagination
        : isObject(response.meta)
          ? response.meta
          : response;

  const page = normalizePage(
    pagination.page ??
      pagination.currentPage ??
      normalized.page
  );

  const limit = normalizeLimit(
    pagination.limit ??
      pagination.pageSize ??
      normalized.limit
  );

  const totalValue =
    pagination.total ??
    pagination.totalItems ??
    pagination.count ??
    fallbackCount;

  const total = Number.isFinite(
    Number(totalValue)
  )
    ? Number(totalValue)
    : fallbackCount;

  const totalPagesValue =
    pagination.totalPages ??
    pagination.pages;

  const totalPages =
    Number.isFinite(
      Number(totalPagesValue)
    )
      ? Math.max(
          1,
          Number(totalPagesValue)
        )
      : Math.max(
          1,
          Math.ceil(total / limit)
        );

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong while processing your saving plans."
) => {
  if (!error) {
    return fallback;
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }

  if (
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  if (
    typeof error.error === "string" &&
    error.error.trim()
  ) {
    return error.error;
  }

  if (
    typeof error.data?.message === "string" &&
    error.data.message.trim()
  ) {
    return error.data.message;
  }

  return fallback;
};

const isAbortError = (error) => {
  if (!error) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    error.code === "ERR_CANCELED" ||
    error.code === "ECONNABORTED" ||
    error.message === "canceled" ||
    error.message === "Cancelled"
  );
};

const areFiltersEqual = (
  first,
  second
) => {
  const firstKeys = Object.keys(
    first || {}
  );

  const secondKeys = Object.keys(
    second || {}
  );

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  return firstKeys.every(
    (key) =>
      first[key] === second[key]
  );
};

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

const useSavingPlans = ({
  initialFilters = {},
  autoFetch = true,
} = {}) => {
  const normalizedInitialFilters =
    normalizeFilters(initialFilters);

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [plans, setPlans] = useState([]);

  const [filters, setFiltersState] =
    useState(
      normalizedInitialFilters
    );

  const [pagination, setPagination] =
    useState({
      page:
        normalizedInitialFilters.page,
      limit:
        normalizedInitialFilters.limit,
      total: 0,
      totalPages: 1,
    });

  const [loading, setLoading] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [activating, setActivating] =
    useState(false);

  const [pausing, setPausing] =
    useState(false);

  const [resuming, setResuming] =
    useState(false);

  const [completing, setCompleting] =
    useState(false);

  const [cancelling, setCancelling] =
    useState(false);

  const [recalculating, setRecalculating] =
    useState(false);

  const [
    refreshingProgress,
    setRefreshingProgress,
  ] = useState(false);

  const [error, setError] =
    useState(null);

  /* ------------------------------------------------------------------------ */
  /* Refs                                                                     */
  /* ------------------------------------------------------------------------ */

  const mountedRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  const mutationRequestIdRef =
    useRef(0);

  const controllerRef =
    useRef(null);

  const filtersRef =
    useRef(filters);

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (
        controllerRef.current
      ) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  /* ------------------------------------------------------------------------ */
  /* Mount safety                                                             */
  /* ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------ */
  /* Request cancellation                                                     */
  /* ------------------------------------------------------------------------ */

  const abortCurrentRequest =
    useCallback(() => {
      if (
        controllerRef.current
      ) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    }, []);

  /* ------------------------------------------------------------------------ */
  /* Fetch plans                                                              */
  /* ------------------------------------------------------------------------ */

  const fetchPlans = useCallback(
    async (
      nextFilters,
      {
        preserveData = false,
        silent = false,
      } = {}
    ) => {
      if (!mountedRef.current) {
        return null;
      }

      const normalizedFilters =
        normalizeFilters(
          nextFilters ??
            filtersRef.current
        );

      const query =
        cleanFilters(
          normalizedFilters
        );

      abortCurrentRequest();

      const controller =
        new AbortController();

      controllerRef.current =
        controller;

      const requestId =
        ++requestIdRef.current;

      if (!silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          await smartSaveService.getSavingPlans(
            {
              ...query,
              signal:
                controller.signal,
            }
          );

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current ||
          controller.signal.aborted
        ) {
          return null;
        }

        const collection =
          normalizeCollectionResponse(
            response
          );

        const nextPagination =
          normalizePaginationResponse(
            response,
            normalizedFilters,
            collection.length
          );

        setPlans((currentPlans) =>
          preserveData &&
          collection.length === 0
            ? currentPlans
            : collection
        );

        setPagination(
          nextPagination
        );

        return {
          plans: collection,
          pagination:
            nextPagination,
          response,
        };
      } catch (requestError) {
        if (
          isAbortError(
            requestError
          )
        ) {
          return null;
        }

        if (
          !mountedRef.current ||
          requestId !==
            requestIdRef.current
        ) {
          return null;
        }

        const message =
          getErrorMessage(
            requestError,
            "Unable to load saving plans."
          );

        setError(
          requestError instanceof
            SmartSaveServiceError
            ? requestError
            : message
        );

        if (!preserveData) {
          setPlans([]);
        }

        return null;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          if (!silent) {
            setLoading(false);
          }

          if (
            controllerRef.current ===
            controller
          ) {
            controllerRef.current =
              null;
          }
        }
      }
    },
    [abortCurrentRequest]
  );

  /* ------------------------------------------------------------------------ */
  /* Initial fetch                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchPlans(
      filtersRef.current
    );
  }, [autoFetch, fetchPlans]);

  /* ------------------------------------------------------------------------ */
  /* Refresh                                                                  */
  /* ------------------------------------------------------------------------ */

  const refreshPlans =
    useCallback(
      async ({
        preserveData = true,
        silent = false,
      } = {}) => {
        return fetchPlans(
          filtersRef.current,
          {
            preserveData,
            silent,
          }
        );
      },
      [fetchPlans]
    );

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                   */
  /* ------------------------------------------------------------------------ */

  const setFilters =
    useCallback(
      (
        nextFilters,
        {
          resetPage = true,
          fetch = false,
        } = {}
      ) => {
        const previous =
          filtersRef.current;

        const incoming =
          typeof nextFilters ===
          "function"
            ? nextFilters(previous)
            : nextFilters;

        const merged =
          normalizeFilters({
            ...previous,
            ...(isObject(incoming)
              ? incoming
              : {}),
          });

        if (resetPage) {
          merged.page =
            DEFAULT_PAGE;
        }

        if (
          areFiltersEqual(
            previous,
            merged
          )
        ) {
          return previous;
        }

        filtersRef.current =
          merged;

        setFiltersState(merged);

        if (fetch) {
          void fetchPlans(merged);
        }

        return merged;
      },
      [fetchPlans]
    );

  const updateFilter =
    useCallback(
      (
        key,
        value,
        {
          resetPage = true,
          fetch = false,
        } = {}
      ) => {
        return setFilters(
          {
            [key]: value,
          },
          {
            resetPage,
            fetch,
          }
        );
      },
      [setFilters]
    );

  const setPage =
    useCallback(
      (
        page,
        {
          fetch = false,
        } = {}
      ) => {
        return setFilters(
          {
            page:
              normalizePage(page),
          },
          {
            resetPage: false,
            fetch,
          }
        );
      },
      [setFilters]
    );

  const setLimit =
    useCallback(
      (
        limit,
        {
          fetch = false,
        } = {}
      ) => {
        return setFilters(
          {
            limit:
              normalizeLimit(limit),
            page:
              DEFAULT_PAGE,
          },
          {
            resetPage: false,
            fetch,
          }
        );
      },
      [setFilters]
    );

  const resetFilters =
    useCallback(
      ({
        fetch = false,
      } = {}) => {
        const reset =
          normalizeFilters({});

        filtersRef.current =
          reset;

        setFiltersState(reset);

        if (fetch) {
          void fetchPlans(reset);
        }

        return reset;
      },
      [fetchPlans]
    );

  /* ------------------------------------------------------------------------ */
  /* Mutation executor                                                        */
  /* ------------------------------------------------------------------------ */

  const executePlanMutation =
    useCallback(
      async ({
        operation,
        setMutationLoading,
        successFallback,
      }) => {
        if (!mountedRef.current) {
          return null;
        }

        const mutationId =
          ++mutationRequestIdRef.current;

        setMutationLoading(true);
        setError(null);

        try {
          const response =
            await operation();

          if (
            !mountedRef.current ||
            mutationId !==
              mutationRequestIdRef.current
          ) {
            return null;
          }

          /*
           * Refresh explicitly after a successful
           * mutation. No effect watches `plans`,
           * so this cannot create a render loop.
           */
          try {
            await fetchPlans(
              filtersRef.current,
              {
                preserveData: true,
                silent: true,
              }
            );
          } catch (refreshError) {
            /*
             * The mutation itself succeeded.
             * Keep its response authoritative and
             * surface refresh failure separately.
             */
            if (
              mountedRef.current &&
              mutationId ===
                mutationRequestIdRef.current
            ) {
              setError(
                getErrorMessage(
                  refreshError,
                  "Saving plan changed successfully, but the list could not be refreshed."
                )
              );
            }
          }

          return {
            success: true,
            response,
          };
        } catch (mutationError) {
          if (
            !mountedRef.current ||
            mutationId !==
              mutationRequestIdRef.current
          ) {
            return null;
          }

          const message =
            getErrorMessage(
              mutationError,
              successFallback
            );

          setError(
            mutationError instanceof
              SmartSaveServiceError
              ? mutationError
              : message
          );

          return {
            success: false,
            error: mutationError,
          };
        } finally {
          if (
            mountedRef.current &&
            mutationId ===
              mutationRequestIdRef.current
          ) {
            setMutationLoading(false);
          }
        }
      },
      [fetchPlans]
    );

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  const createPlan =
    useCallback(
      async (payload) => {
        return executePlanMutation({
          operation: () =>
            smartSaveService.createSavingPlan(
              payload
            ),
          setMutationLoading:
            setCreating,
          successFallback:
            "Unable to create saving plan.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  const updatePlan =
    useCallback(
      async (
        planId,
        payload
      ) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.updateSavingPlan(
              planId,
              payload
            ),
          setMutationLoading:
            setUpdating,
          successFallback:
            "Unable to update saving plan.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Activate                                                                 */
  /* ------------------------------------------------------------------------ */

  const activatePlan =
    useCallback(
      async (planId) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.activateSavingPlan(
              planId
            ),
          setMutationLoading:
            setActivating,
          successFallback:
            "Unable to activate saving plan.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Pause                                                                    */
  /* ------------------------------------------------------------------------ */

  const pausePlan =
    useCallback(
      async (
        planId,
        payload = {}
      ) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.pauseSavingPlan(
              planId,
              payload
            ),
          setMutationLoading:
            setPausing,
          successFallback:
            "Unable to pause saving plan.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Resume                                                                   */
  /* ------------------------------------------------------------------------ */

  const resumePlan =
    useCallback(
      async (planId) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.resumeSavingPlan(
              planId
            ),
          setMutationLoading:
            setResuming,
          successFallback:
            "Unable to resume saving plan.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Complete                                                                 */
  /* ------------------------------------------------------------------------ */

  const completePlan =
    useCallback(
      async (
        planId,
        payload = {}
      ) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.completeSavingPlan(
              planId,
              payload
            ),
          setMutationLoading:
            setCompleting,
          successFallback:
            "Unable to complete saving plan.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Cancel                                                                   */
  /* ------------------------------------------------------------------------ */

  const cancelPlan =
    useCallback(
      async (
        planId,
        payload = {}
      ) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.cancelSavingPlan(
              planId,
              payload
            ),
          setMutationLoading:
            setCancelling,
          successFallback:
            "Unable to cancel saving plan.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Recalculate metrics                                                      */
  /* ------------------------------------------------------------------------ */

  const recalculateMetrics =
    useCallback(
      async (planId) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.recalculateSavingPlanMetrics(
              planId
            ),
          setMutationLoading:
            setRecalculating,
          successFallback:
            "Unable to recalculate saving plan metrics.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Refresh progress                                                         */
  /* ------------------------------------------------------------------------ */

  const refreshProgress =
    useCallback(
      async (planId) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          setError(validationError);

          return {
            success: false,
            error: validationError,
          };
        }

        return executePlanMutation({
          operation: () =>
            smartSaveService.refreshSavingPlanProgress(
              planId
            ),
          setMutationLoading:
            setRefreshingProgress,
          successFallback:
            "Unable to refresh saving plan progress.",
        });
      },
      [executePlanMutation]
    );

  /* ------------------------------------------------------------------------ */
  /* Error management                                                         */
  /* ------------------------------------------------------------------------ */

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /* ------------------------------------------------------------------------ */
  /* Derived state                                                            */
  /* ------------------------------------------------------------------------ */

  const hasPlans =
    plans.length > 0;

  const isMutating =
    creating ||
    updating ||
    activating ||
    pausing ||
    resuming ||
    completing ||
    cancelling ||
    recalculating ||
    refreshingProgress;

  const isBusy =
    loading || isMutating;

  const currentPage =
    pagination.page;

  const currentLimit =
    pagination.limit;

  const totalPlans =
    pagination.total;

  const totalPages =
    pagination.totalPages;

  const getPlanById =
    useCallback(
      (planId) => {
        if (!planId) {
          return null;
        }

        return (
          plans.find(
            (plan) =>
              String(
                getPlanId(plan)
              ) === String(planId)
          ) ?? null
        );
      },
      [plans]
    );

  /* ------------------------------------------------------------------------ */
  /* Stable return value                                                      */
  /* ------------------------------------------------------------------------ */

  return useMemo(
    () => ({
      /* Data */
      plans,
      pagination,
      filters,

      /* Fetching */
      loading,
      fetchPlans,
      refreshPlans,

      /* Filters */
      setFilters,
      updateFilter,
      setPage,
      setLimit,
      resetFilters,

      /* Creation / modification */
      createPlan,
      updatePlan,

      /* Lifecycle */
      activatePlan,
      pausePlan,
      resumePlan,
      completePlan,
      cancelPlan,

      /* Metrics / progress */
      recalculateMetrics,
      refreshProgress,

      /* Loading states */
      creating,
      updating,
      activating,
      pausing,
      resuming,
      completing,
      cancelling,
      recalculating,
      refreshingProgress,

      /* Aggregate loading */
      isMutating,
      isBusy,

      /* Pagination helpers */
      currentPage,
      currentLimit,
      totalPlans,
      totalPages,

      /* Derived helpers */
      hasPlans,
      getPlanById,

      /* Error */
      error,
      clearError,
    }),
    [
      plans,
      pagination,
      filters,
      loading,
      fetchPlans,
      refreshPlans,
      setFilters,
      updateFilter,
      setPage,
      setLimit,
      resetFilters,
      createPlan,
      updatePlan,
      activatePlan,
      pausePlan,
      resumePlan,
      completePlan,
      cancelPlan,
      recalculateMetrics,
      refreshProgress,
      creating,
      updating,
      activating,
      pausing,
      resuming,
      completing,
      cancelling,
      recalculating,
      refreshingProgress,
      isMutating,
      isBusy,
      currentPage,
      currentLimit,
      totalPlans,
      totalPages,
      hasPlans,
      getPlanById,
      error,
      clearError,
    ]
  );
};

export default useSavingPlans;