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

  if (!Number.isInteger(number) || number <= 0) {
    return fallback;
  }

  return number;
};

const normalizeFilters = (value = {}) => ({
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

const createFilterKey = (filters) =>
  [
    filters.status,
    filters.page,
    filters.limit,
  ].join("|");

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

  const page = normalizePositiveInteger(
    source.page,
    filters.page
  );

  const limit = normalizePositiveInteger(
    source.limit,
    filters.limit
  );

  const rawTotal = Number(source.total);

  const total = Number.isFinite(rawTotal)
    ? Math.max(0, rawTotal)
    : 0;

  const rawTotalPages = Number(
    source.totalPages
  );

  const totalPages = Number.isFinite(
    rawTotalPages
  )
    ? Math.max(0, rawTotalPages)
    : limit > 0
      ? Math.ceil(total / limit)
      : 0;

  const hasNextPage =
    typeof source.hasNextPage === "boolean"
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

const normalizeGoals = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.goals)) {
    return response.goals;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.goals)) {
    return response.data.goals;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  return [];
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const normalizeError = (error) => {
  let sourceError = error;

  if (
    typeof smartSaveService?.normalizeError ===
    "function"
  ) {
    try {
      sourceError =
        smartSaveService.normalizeError(error);
    } catch {
      sourceError = error;
    }
  }

  const message =
    sourceError?.message ??
    sourceError?.response?.data?.message ??
    sourceError?.response?.data?.error ??
    error?.message ??
    "Unable to process savings goal request.";

  return {
    message:
      typeof message === "string" &&
      message.trim()
        ? message.trim()
        : "Unable to process savings goal request.",

    code:
      sourceError?.code ??
      sourceError?.response?.data?.code ??
      "SAVINGS_GOALS_ERROR",

    statusCode:
      sourceError?.statusCode ??
      sourceError?.response?.status ??
      null,

    details:
      sourceError?.details ??
      sourceError?.response?.data?.details ??
      null,

    originalError: error,
  };
};

/* =========================================================
   SERVICE RESOLUTION
========================================================= */

const getServiceMethod = (name) => {
  const method = smartSaveService?.[name];

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
     INITIAL FILTERS
  ======================================================= */

  const normalizedInitialFilters = useMemo(
    () => normalizeFilters(initialFilters),
    [initialFilters]
  );

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [filters, setFiltersState] = useState(
    normalizedInitialFilters
  );

  /* =======================================================
     SERVER STATE
  ======================================================= */

  const [goals, setGoals] = useState([]);

  const [pagination, setPagination] =
    useState(createInitialPagination());

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState(null);

  /* =======================================================
     LIFECYCLE / REQUEST CONTROL
  ======================================================= */

  const mountedRef = useRef(false);

  const requestIdRef = useRef(0);

  /* =======================================================
     MUTATION CONTROL
  ======================================================= */

  const mutationIdRef = useRef(0);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      mutationIdRef.current += 1;
    };
  }, []);

  /* =======================================================
     FILTER KEY
  ======================================================= */

  const filterKey = useMemo(
    () => createFilterKey(filters),
    [filters]
  );

  /* =======================================================
     FETCH GOALS
  ======================================================= */

  const fetchGoals = useCallback(
    async (
      overrideFilters = {},
      options = {}
    ) => {
      const silent = Boolean(
        options?.silent
      );

      const nextFilters = normalizeFilters({
        ...filters,
        ...overrideFilters,
      });

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
        const getSavingGoals =
          getServiceMethod(
            "getSavingGoals"
          );

        const response =
          await getSavingGoals(
            nextFilters
          );

        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }

        const nextGoals =
          normalizeGoals(response);

        const nextPagination =
          normalizePagination(
            response,
            nextFilters
          );

        if (!mountedRef.current) {
          return {
            goals: nextGoals,
            pagination: nextPagination,
            raw: response,
          };
        }

        setGoals(nextGoals);

        setPagination(
          nextPagination
        );

        setFiltersState((previous) => {
          if (
            previous.status ===
              nextFilters.status &&
            previous.page ===
              nextFilters.page &&
            previous.limit ===
              nextFilters.limit
          ) {
            return previous;
          }

          return nextFilters;
        });

        return {
          goals: nextGoals,
          pagination: nextPagination,
          raw: response,
        };
      } catch (requestError) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }

        const normalized =
          normalizeError(requestError);

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
    [filters]
  );

  /* =======================================================
     AUTOMATIC FETCH
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) {
        return;
      }

      try {
        await fetchGoals();
      } catch {
        /*
         * fetchGoals owns the error state.
         */
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [filterKey, fetchGoals]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = useCallback(
  () =>
    fetchGoals(
      {},
      {
        silent: true,
      }
    ),
  [fetchGoals]
);

  /*
   * Alias used by SavingsGoalsPage.jsx.
   */
  const refreshGoals = refresh;

  /* =======================================================
     CREATE GOAL
  ======================================================= */

  const createGoal = useCallback(
    async (payload) => {
      const mutationId =
        ++mutationIdRef.current;

      try {
        const method =
          getServiceMethod(
            "createSavingGoal"
          );

        const response =
          await method(payload);

        /*
         * Do not allow an old mutation to refresh
         * state after a newer mutation has started.
         */
        if (
          mutationId !==
          mutationIdRef.current
        ) {
          return response;
        }

        /*
         * The backend is the source of truth.
         * Re-fetch after successful creation.
         */
        await fetchGoals(
          {},
          {
            silent: true,
          }
        );

        return response;
      } catch (requestError) {
        const normalized =
          normalizeError(requestError);

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }
    },
    [fetchGoals]
  );

  /* =======================================================
     UPDATE GOAL
  ======================================================= */

  const updateGoal = useCallback(
    async (goalId, payload) => {
      if (!goalId) {
        const normalized =
          normalizeError(
            new Error(
              "A savings goal ID is required."
            )
          );

        if (mountedRef.current) {
          setError(normalized);
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
          {},
          {
            silent: true,
          }
        );

        return response;
      } catch (requestError) {
        const normalized =
          normalizeError(requestError);

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }
    },
    [fetchGoals]
  );

  /* =======================================================
     DELETE GOAL
  ======================================================= */

  const deleteGoal = useCallback(
    async (goalId) => {
      if (!goalId) {
        const normalized =
          normalizeError(
            new Error(
              "A savings goal ID is required."
            )
          );

        if (mountedRef.current) {
          setError(normalized);
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
          await method(goalId);

        if (
          mutationId !==
          mutationIdRef.current
        ) {
          return response;
        }

        await fetchGoals(
          {},
          {
            silent: true,
          }
        );

        return response;
      } catch (requestError) {
        const normalized =
          normalizeError(requestError);

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }
    },
    [fetchGoals]
  );

  /* =======================================================
     SET FILTERS
  ======================================================= */

  const setFilters = useCallback(
    (nextValue) => {
      setFiltersState((previous) => {
        const candidate =
          typeof nextValue === "function"
            ? nextValue(previous)
            : {
                ...previous,
                ...nextValue,
              };

        const normalized =
          normalizeFilters(candidate);

        const statusChanged =
          normalized.status !==
          previous.status;

        const limitChanged =
          normalized.limit !==
          previous.limit;

        if (
          statusChanged ||
          limitChanged
        ) {
          normalized.page =
            DEFAULT_PAGE;
        }

        const unchanged =
          previous.status ===
            normalized.status &&
          previous.page ===
            normalized.page &&
          previous.limit ===
            normalized.limit;

        return unchanged
          ? previous
          : normalized;
      });
    },
    []
  );

  /* =======================================================
     SET STATUS
  ======================================================= */

  const setStatus = useCallback(
    (status) => {
      const normalizedStatus =
        typeof status === "string"
          ? status.trim()
          : "";

      setFiltersState((previous) => {
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
          status: normalizedStatus,
          page: DEFAULT_PAGE,
        };
      });
    },
    []
  );

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = useCallback(() => {
    setFiltersState((previous) => {
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

      return normalizeFilters(
        DEFAULT_FILTERS
      );
    });
  }, []);

  /* =======================================================
     PAGE NAVIGATION
  ======================================================= */

  const goToPage = useCallback(
    (page) => {
      const normalizedPage =
        normalizePositiveInteger(
          page,
          DEFAULT_PAGE
        );

      setFiltersState((previous) => {
        if (
          previous.page ===
          normalizedPage
        ) {
          return previous;
        }

        return {
          ...previous,
          page: normalizedPage,
        };
      });
    },
    []
  );

  const nextPage = useCallback(() => {
    setFiltersState((previous) => {
      if (
        !pagination.hasNextPage
      ) {
        return previous;
      }

      return {
        ...previous,
        page: previous.page + 1,
      };
    });
  }, [pagination.hasNextPage]);

  const previousPage = useCallback(() => {
    setFiltersState((previous) => {
      if (
        previous.page <= 1 ||
        !pagination.hasPreviousPage
      ) {
        return previous;
      }

      return {
        ...previous,
        page: previous.page - 1,
      };
    });
  }, [
    pagination.hasPreviousPage,
  ]);

  /* =======================================================
     SINGLE GOAL
  ======================================================= */

  const getGoal = useCallback(
    async (goalId) => {
      try {
        const method =
          getServiceMethod(
            "getSavingGoal"
          );

        return await method(goalId);
      } catch (requestError) {
        const normalized =
          normalizeError(requestError);

        if (mountedRef.current) {
          setError(normalized);
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

          return await method(goalId);
        } catch (requestError) {
          const normalized =
            normalizeError(requestError);

          if (mountedRef.current) {
            setError(normalized);
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
        } catch (requestError) {
          const normalized =
            normalizeError(requestError);

          if (mountedRef.current) {
            setError(normalized);
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
        } catch (requestError) {
          const normalized =
            normalizeError(requestError);

          if (mountedRef.current) {
            setError(normalized);
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
            {
              amount,
            }
          );
        } catch (requestError) {
          const normalized =
            normalizeError(requestError);

          if (mountedRef.current) {
            setError(normalized);
          }

          throw normalized;
        }
      },
      []
    );

  /* =======================================================
     DERIVED GOALS
  ======================================================= */

  const activeGoals = useMemo(
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

  const completedGoals = useMemo(
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

  const pausedGoals = useMemo(
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

  const cancelledGoals = useMemo(
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

  const reset = useCallback(() => {
    requestIdRef.current += 1;

    mutationIdRef.current += 1;

    if (!mountedRef.current) {
      return;
    }

    setGoals([]);

    setPagination(
      createInitialPagination()
    );

    setFiltersState(
      normalizedInitialFilters
    );

    setLoading(false);

    setRefreshing(false);

    setError(null);
  }, [normalizedInitialFilters]);

  /* =======================================================
     RETURN API
  ======================================================= */

  return useMemo(
    () => ({
      /* -----------------------------
         GOALS
      ----------------------------- */

      goals,

      items: goals,

      activeGoals,

      completedGoals,

      pausedGoals,

      cancelledGoals,

      /* -----------------------------
         PAGINATION
      ----------------------------- */

      pagination,

      total: pagination.total,

      currentPage:
        pagination.page,

      totalPages:
        pagination.totalPages,

      hasNextPage:
        pagination.hasNextPage,

      hasPreviousPage:
        pagination.hasPreviousPage,

      /* -----------------------------
         FILTERS
      ----------------------------- */

      filters,

      setFilters,

      setStatus,

      clearFilters,

      /* -----------------------------
         PAGINATION ACTIONS
      ----------------------------- */

      goToPage,

      nextPage,

      previousPage,

      /* -----------------------------
         READ OPERATIONS
      ----------------------------- */

      getGoal,

      getGoalSummary,

      getGoalContributions,

      getGoalHistory,

      checkEligibility,

      /* -----------------------------
         WRITE OPERATIONS
      ----------------------------- */

      createGoal,

      updateGoal,

      deleteGoal,

      /* -----------------------------
         FETCH
      ----------------------------- */

      fetchGoals,

      refresh,

      refreshGoals,

      reset,

      /* -----------------------------
         REQUEST STATE
      ----------------------------- */

      loading,

      refreshing,

      isLoading,

      isRefreshing,

      /* -----------------------------
         ERROR
      ----------------------------- */

      error,

      hasError,

      /* -----------------------------
         EMPTY
      ----------------------------- */

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