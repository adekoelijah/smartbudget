
// hooks/useSavingsGoals.js

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

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const DEFAULT_FILTERS = Object.freeze({
  status: "",
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
});

/* =========================================================
   FILTER HELPERS
========================================================= */

const normalizePositiveInteger = (
  value,
  fallback
) => {
  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number <= 0
  ) {
    return fallback;
  }

  return number;
};

const normalizeFilters = (
  value = {}
) => ({
  status:
    typeof value.status === "string"
      ? value.status.trim()
      : "",

  page: normalizePositiveInteger(
    value.page,
    DEFAULT_PAGE
  ),

  limit: normalizePositiveInteger(
    value.limit,
    DEFAULT_LIMIT
  ),
});

/* =========================================================
   PAGINATION
========================================================= */

const createInitialPagination = () => ({
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

const normalizePagination = (
  response,
  filters
) => {
  const source =
    response?.pagination ??
    response?.data?.pagination ??
    response?.meta ??
    response?.data?.meta ??
    {};

  const page =
    normalizePositiveInteger(
      source.page,
      filters.page
    );

  const limit =
    normalizePositiveInteger(
      source.limit,
      filters.limit
    );

  const rawTotal =
    Number(source.total);

  const total =
    Number.isFinite(rawTotal)
      ? Math.max(0, rawTotal)
      : 0;

  const rawTotalPages =
    Number(source.totalPages);

  const totalPages =
    Number.isFinite(rawTotalPages)
      ? Math.max(0, rawTotalPages)
      : limit > 0
        ? Math.ceil(
            total / limit
          )
        : 0;

  const hasNextPage =
    typeof source.hasNextPage ===
    "boolean"
      ? source.hasNextPage
      : page < totalPages;

  const hasPreviousPage =
    typeof source.hasPreviousPage ===
    "boolean"
      ? source.hasPreviousPage
      : page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const normalizeGoals = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(response?.goals)
  ) {
    return response.goals;
  }

  if (
    Array.isArray(response?.items)
  ) {
    return response.items;
  }

  if (
    Array.isArray(response?.results)
  ) {
    return response.results;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  if (
    Array.isArray(response?.data?.goals)
  ) {
    return response.data.goals;
  }

  if (
    Array.isArray(response?.data?.items)
  ) {
    return response.data.items;
  }

  if (
    Array.isArray(response?.data?.results)
  ) {
    return response.data.results;
  }

  return [];
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const normalizeError = (
  error
) => {
  /*
   * Prefer the SmartSave service's centralized
   * error normalizer.
   */
  if (
    typeof smartSaveService?.normalizeError ===
    "function"
  ) {
    try {
      return smartSaveService.normalizeError(
        error
      );
    } catch {
      /*
       * Fall through to local normalization.
       */
    }
  }

  const response =
    error?.response;

  const responseData =
    response?.data;

  const message =
    responseData?.message ??
    responseData?.error ??
    error?.message ??
    "Unable to process savings goal request.";

  return {
    message:
      typeof message === "string" &&
      message.trim()
        ? message.trim()
        : "Unable to process savings goal request.",

    code:
      responseData?.code ??
      error?.code ??
      "SAVINGS_GOALS_ERROR",

    statusCode:
      response?.status ??
      null,

    details:
      responseData?.details ??
      responseData?.errors ??
      null,

    originalError: error,
  };
};

/* =========================================================
   SERVICE RESOLUTION
========================================================= */

const getServiceMethod = (
  name
) => {
  const method =
    smartSaveService?.[name];

  if (typeof method !== "function") {
    throw new Error(
      `smartSaveService.${name} is not available.`
    );
  }

  return method;
};

/* =========================================================
   HOOK
========================================================= */

const useSavingsGoals = (
  initialFilters = {}
) => {
  /* =======================================================
     FILTER STATE
  ======================================================= */

  /*
   * Lazy initialization is important here.
   *
   * We do NOT use:
   *
   * const ref = useRef(...)
   *
   * followed by:
   *
   * useState(ref.current)
   *
   * because reading ref.current during render is forbidden
   * by the React compiler/lint rules.
   */
  const [
    filters,
    setFiltersState,
  ] = useState(
    () =>
      normalizeFilters(
        initialFilters
      )
  );

  /* =======================================================
     SERVER STATE
  ======================================================= */

  const [
    goals,
    setGoals,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState(
    createInitialPagination()
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

  /* =======================================================
     REQUEST CONTROL
  ======================================================= */

  const mountedRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  const abortControllerRef =
    useRef(null);

  const mutationIdRef =
    useRef(0);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      mutationIdRef.current += 1;

      abortControllerRef.current?.abort();

      abortControllerRef.current = null;
    };
  }, []);

  /* =======================================================
     FETCH GOALS
  ======================================================= */

  const fetchGoals = useCallback(
    async (
      requestFilters,
      options = {}
    ) => {
      const silent =
        Boolean(options?.silent);

      const normalizedFilters =
        normalizeFilters(
          requestFilters
        );

      /*
       * Cancel an older list request.
       */
      abortControllerRef.current?.abort();

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      const requestId =
        ++requestIdRef.current;

      if (
        mountedRef.current
      ) {
        setError(null);

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      }

      try {
        const getSavingGoals =
          getServiceMethod(
            "getSavingGoals"
          );

        /*
         * The service supports signal through the
         * request layer only for methods that explicitly
         * accept it.
         *
         * getSavingGoals currently accepts params,
         * so signal is included in the params object.
         */
        const response =
          await getSavingGoals({
            ...normalizedFilters,
            signal:
              controller.signal,
          });

        /*
         * Ignore stale requests.
         */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }

        /*
         * Ignore aborted requests.
         */
        if (
          controller.signal.aborted
        ) {
          return null;
        }

        const nextGoals =
          normalizeGoals(
            response
          );

        const nextPagination =
          normalizePagination(
            response,
            normalizedFilters
          );

        if (
          !mountedRef.current
        ) {
          return {
            goals: nextGoals,
            pagination:
              nextPagination,
            raw: response,
          };
        }

        setGoals(
          nextGoals
        );

        setPagination(
          nextPagination
        );

        return {
          goals: nextGoals,
          pagination:
            nextPagination,
          raw: response,
        };
      } catch (
        requestError
      ) {
        /*
         * AbortController cancellation is expected
         * during navigation/filter changes/unmounting.
         */
        if (
          controller.signal.aborted
        ) {
          return null;
        }

        /*
         * Ignore stale failures.
         */
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

        if (
          mountedRef.current
        ) {
          setError(
            normalized
          );
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

        if (
          abortControllerRef.current ===
          controller
        ) {
          abortControllerRef.current =
            null;
        }
      }
    },
    []
  );

  /* =======================================================
     AUTOMATIC FETCH
  ======================================================= */

  useEffect(() => {
    /*
     * Capture the primitive filter values for this
     * particular effect execution.
     */
    const requestFilters = {
      status: filters.status,
      page: filters.page,
      limit: filters.limit,
    };

    /*
     * IMPORTANT:
     *
     * The effect does not directly manage state.
     *
     * fetchGoals owns request lifecycle/state updates.
     *
     * The promise rejection is intentionally handled
     * here without changing state.
     */
    let active = true;

    const loadGoals = async () => {
      if (!active) {
        return;
      }

      try {
        await fetchGoals(
          requestFilters
        );
      } catch {
        /*
         * fetchGoals already owns error state.
         */
      }
    };

    void loadGoals();

    return () => {
      active = false;
    };
  }, [
    filters.status,
    filters.page,
    filters.limit,
    fetchGoals,
  ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(
      () =>
        fetchGoals(
          filters,
          {
            silent: true,
          }
        ),
      [filters, fetchGoals]
    );

  const refreshGoals =
    refresh;

  /* =======================================================
     CREATE GOAL
  ======================================================= */

  const createGoal =
    useCallback(
      async (payload) => {
        const mutationId =
          ++mutationIdRef.current;

        try {
          const method =
            getServiceMethod(
              "createSavingGoal"
            );

          const response =
            await method(
              payload
            );

          if (
            mutationId !==
            mutationIdRef.current
          ) {
            return response;
          }

          await fetchGoals(
            filters,
            {
              silent: true,
            }
          );

          return response;
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      [filters, fetchGoals]
    );

  /* =======================================================
     UPDATE GOAL
  ======================================================= */

  const updateGoal =
    useCallback(
      async (
        goalId,
        payload
      ) => {
        if (!goalId) {
          const normalized =
            normalizeError(
              new Error(
                "A savings goal ID is required."
              )
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }

        const mutationId =
          ++mutationIdRef.current;

        try {
          const method =
            getServiceMethod(
              "updateSavingGoal"
            );

          const response =
            await method(
              goalId,
              payload
            );

          if (
            mutationId !==
            mutationIdRef.current
          ) {
            return response;
          }

          await fetchGoals(
            filters,
            {
              silent: true,
            }
          );

          return response;
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      [filters, fetchGoals]
    );

  /* =======================================================
     DELETE GOAL
  ======================================================= */

  const deleteGoal =
    useCallback(
      async (goalId) => {
        if (!goalId) {
          const normalized =
            normalizeError(
              new Error(
                "A savings goal ID is required."
              )
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }

        const mutationId =
          ++mutationIdRef.current;

        try {
          const method =
            getServiceMethod(
              "deleteSavingGoal"
            );

          const response =
            await method(
              goalId
            );

          if (
            mutationId !==
            mutationIdRef.current
          ) {
            return response;
          }

          await fetchGoals(
            filters,
            {
              silent: true,
            }
          );

          return response;
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      [filters, fetchGoals]
    );

  /* =======================================================
     SET FILTERS
  ======================================================= */

  const setFilters =
    useCallback(
      (nextValue) => {
        setFiltersState(
          (previous) => {
            const candidate =
              typeof nextValue ===
              "function"
                ? nextValue(
                    previous
                  )
                : {
                    ...previous,
                    ...nextValue,
                  };

            const normalized =
              normalizeFilters(
                candidate
              );

            /*
             * Changing status or limit resets
             * pagination to page 1.
             */
            if (
              normalized.status !==
                previous.status ||
              normalized.limit !==
                previous.limit
            ) {
              normalized.page =
                DEFAULT_PAGE;
            }

            if (
              previous.status ===
                normalized.status &&
              previous.page ===
                normalized.page &&
              previous.limit ===
                normalized.limit
            ) {
              return previous;
            }

            return normalized;
          }
        );
      },
      []
    );

  /* =======================================================
     SET STATUS
  ======================================================= */

  const setStatus =
    useCallback(
      (status) => {
        const normalizedStatus =
          typeof status ===
          "string"
            ? status.trim()
            : "";

        setFiltersState(
          (previous) => {
            if (
              previous.status ===
                normalizedStatus &&
              previous.page ===
                DEFAULT_PAGE
            ) {
              return previous;
            }

            return {
              ...previous,
              status:
                normalizedStatus,
              page:
                DEFAULT_PAGE,
            };
          }
        );
      },
      []
    );

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters =
    useCallback(() => {
      setFiltersState(
        (previous) => {
          if (
            previous.status ===
              DEFAULT_FILTERS.status &&
            previous.page ===
              DEFAULT_FILTERS.page &&
            previous.limit ===
              DEFAULT_FILTERS.limit
          ) {
            return previous;
          }

          return {
            ...DEFAULT_FILTERS,
          };
        }
      );
    }, []);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const goToPage =
    useCallback(
      (page) => {
        const normalizedPage =
          normalizePositiveInteger(
            page,
            DEFAULT_PAGE
          );

        setFiltersState(
          (previous) => {
            if (
              previous.page ===
              normalizedPage
            ) {
              return previous;
            }

            return {
              ...previous,
              page:
                normalizedPage,
            };
          }
        );
      },
      []
    );

  const nextPage =
    useCallback(() => {
      setFiltersState(
        (previous) => {
          if (
            !pagination.hasNextPage
          ) {
            return previous;
          }

          return {
            ...previous,
            page:
              previous.page + 1,
          };
        }
      );
    },
    [
      pagination.hasNextPage,
    ]);

  const previousPage =
    useCallback(() => {
      setFiltersState(
        (previous) => {
          if (
            previous.page <= 1 ||
            !pagination.hasPreviousPage
          ) {
            return previous;
          }

          return {
            ...previous,
            page:
              previous.page - 1,
          };
        }
      );
    },
    [
      pagination.hasPreviousPage,
    ]);

  /* =======================================================
     SINGLE GOAL
  ======================================================= */

  const getGoal =
    useCallback(
      async (goalId) => {
        try {
          const method =
            getServiceMethod(
              "getSavingGoal"
            );

          return await method(
            goalId
          );
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      []
    );

  /* =======================================================
     GOAL SUMMARY
  ======================================================= */

  const getGoalSummary =
    useCallback(
      async (goalId) => {
        try {
          const method =
            getServiceMethod(
              "getSavingGoalSummary"
            );

          return await method(
            goalId
          );
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      []
    );

  /* =======================================================
     GOAL CONTRIBUTIONS
  ======================================================= */

  const getGoalContributions =
    useCallback(
      async (
        goalId,
        contributionFilters = {}
      ) => {
        try {
          const method =
            getServiceMethod(
              "getSavingGoalContributions"
            );

          return await method(
            goalId,
            contributionFilters
          );
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      []
    );

  /* =======================================================
     GOAL HISTORY
  ======================================================= */

  const getGoalHistory =
    useCallback(
      async (
        goalId,
        historyFilters = {}
      ) => {
        try {
          const method =
            getServiceMethod(
              "getSavingHistory"
            );

          return await method(
            goalId,
            historyFilters
          );
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      []
    );

  /* =======================================================
     ELIGIBILITY
  ======================================================= */

  const checkEligibility =
    useCallback(
      async (
        goalId,
        amount
      ) => {
        try {
          const method =
            getServiceMethod(
              "checkSavingEligibility"
            );

          return await method(
            goalId,
            amount
          );
        } catch (
          requestError
        ) {
          const normalized =
            normalizeError(
              requestError
            );

          if (
            mountedRef.current
          ) {
            setError(
              normalized
            );
          }

          throw normalized;
        }
      },
      []
    );

  /* =======================================================
     DERIVED GOALS
  ======================================================= */

  const activeGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            String(
              goal?.status ?? ""
            )
              .trim()
              .toLowerCase() ===
            "active"
        ),
      [goals]
    );

  const completedGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            String(
              goal?.status ?? ""
            )
              .trim()
              .toLowerCase() ===
            "completed"
        ),
      [goals]
    );

  const pausedGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            String(
              goal?.status ?? ""
            )
              .trim()
              .toLowerCase() ===
            "paused"
        ),
      [goals]
    );

  const cancelledGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            String(
              goal?.status ?? ""
            )
              .trim()
              .toLowerCase() ===
            "cancelled"
        ),
      [goals]
    );

  /* =======================================================
     DERIVED FLAGS
  ======================================================= */

  const hasGoals =
    goals.length > 0;

  const isLoading =
    loading;

  const isRefreshing =
    refreshing;

  const hasError =
    Boolean(error);

  const isEmpty =
    !loading &&
    !refreshing &&
    !hasGoals &&
    !error;

  /* =======================================================
     RESET
  ======================================================= */

  const reset =
    useCallback(() => {
      requestIdRef.current += 1;

      mutationIdRef.current += 1;

      abortControllerRef.current?.abort();

      abortControllerRef.current =
        null;

      if (
        !mountedRef.current
      ) {
        return;
      }

      setGoals([]);

      setPagination(
        createInitialPagination()
      );

      setFiltersState(
        normalizeFilters(
          initialFilters
        )
      );

      setLoading(false);

      setRefreshing(false);

      setError(null);
    }, [initialFilters]);

  /* =======================================================
     RETURN API
  ======================================================= */

  return useMemo(
    () => ({
      /* Goals */
      goals,
      items: goals,

      activeGoals,
      completedGoals,
      pausedGoals,
      cancelledGoals,

      /* Pagination */
      pagination,
      total:
        pagination.total,

      currentPage:
        pagination.page,

      totalPages:
        pagination.totalPages,

      hasNextPage:
        pagination.hasNextPage,

      hasPreviousPage:
        pagination.hasPreviousPage,

      /* Filters */
      filters,
      setFilters,
      setStatus,
      clearFilters,

      /* Pagination actions */
      goToPage,
      nextPage,
      previousPage,

      /* Read operations */
      getGoal,
      getGoalSummary,
      getGoalContributions,
      getGoalHistory,
      checkEligibility,

      /* Write operations */
      createGoal,
      updateGoal,
      deleteGoal,

      /* Fetch */
      fetchGoals: () =>
        fetchGoals(filters),

      refresh,
      refreshGoals,

      reset,

      /* Request state */
      loading,
      refreshing,

      isLoading,
      isRefreshing,

      /* Error */
      error,
      hasError,

      /* Empty */
      hasGoals,
      isEmpty,
    }),
    [
      goals,

      activeGoals,
      completedGoals,
      pausedGoals,
      cancelledGoals,

      pagination,

      filters,

      setFilters,
      setStatus,
      clearFilters,

      goToPage,
      nextPage,
      previousPage,

      getGoal,
      getGoalSummary,
      getGoalContributions,
      getGoalHistory,
      checkEligibility,

      createGoal,
      updateGoal,
      deleteGoal,

      fetchGoals,
      refresh,
      refreshGoals,

      reset,

      loading,
      refreshing,

      isLoading,
      isRefreshing,

      error,
      hasError,

      hasGoals,
      isEmpty,
    ]
  );
};

export default useSavingsGoals;
