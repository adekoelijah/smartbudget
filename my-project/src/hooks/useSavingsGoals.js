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

const DEFAULT_FILTERS = {
  status: "",
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
};

const DEFAULT_STATE = {
  goals: [],
  pagination: {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

/* =========================================================
   NORMALIZATION
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
  filters = {}
) => ({
  status:
    typeof filters.status === "string"
      ? filters.status.trim()
      : "",

  page: normalizePositiveInteger(
    filters.page,
    DEFAULT_PAGE
  ),

  limit: normalizePositiveInteger(
    filters.limit,
    DEFAULT_LIMIT
  ),
});

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

/**
 * Supports common response shapes without coupling
 * components to a specific controller serializer.
 *
 * Examples:
 *
 * { data: [...] }
 * { data: { goals: [...] } }
 * { goals: [...] }
 * [...]
 */
const normalizeGoals = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.goals
    )
  ) {
    return response.data.goals;
  }

  if (
    Array.isArray(response?.goals)
  ) {
    return response.goals;
  }

  if (
    Array.isArray(
      response?.data?.items
    )
  ) {
    return response.data.items;
  }

  if (
    Array.isArray(response?.items)
  ) {
    return response.items;
  }

  return [];
};

/* =========================================================
   PAGINATION NORMALIZATION
========================================================= */

const normalizePagination = (
  response,
  filters
) => {
  const source =
    response?.pagination ||
    response?.data?.pagination ||
    response?.meta ||
    response?.data?.meta ||
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

  const totalValue =
    Number(source.total);

  const total =
    Number.isFinite(totalValue)
      ? totalValue
      : 0;

  const suppliedTotalPages =
    Number(source.totalPages);

  const totalPages =
    Number.isFinite(
      suppliedTotalPages
    )
      ? suppliedTotalPages
      : limit > 0
        ? Math.ceil(
            total / limit
          )
        : 0;

  return {
    page,
    limit,
    total,
    totalPages,

    hasNextPage:
      typeof source.hasNextPage ===
      "boolean"
        ? source.hasNextPage
        : page < totalPages,

    hasPreviousPage:
      typeof source.hasPreviousPage ===
      "boolean"
        ? source.hasPreviousPage
        : page > 1,
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
      ?.normalizeError === "function"
      ? smartSaveService.normalizeError(
          error
        )
      : error;

  return {
    message:
      serviceError?.message ||
      "Unable to load savings goals.",

    code:
      serviceError?.code ||
      "SAVINGS_GOALS_ERROR",

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

const useSavingsGoals = (
  initialFilters = {}
) => {
  const mountedRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  const initialFiltersRef =
    useRef(
      normalizeFilters(
        initialFilters
      )
    );

  const [
    filters,
    setFiltersState,
  ] = useState(
    initialFiltersRef.current
  );

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

  /* =======================================================
     MOUNT LIFECYCLE
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      /*
       * Invalidate any request that finishes after
       * unmount.
       */
      requestIdRef.current += 1;
    };
  }, []);

  /* =======================================================
     FETCH GOALS
  ======================================================= */

  const fetchGoals = useCallback(
    async (
      overrideFilters = {},
      options = {}
    ) => {
      const {
        silent = false,
      } = options;

      const requestId =
        ++requestIdRef.current;

      const nextFilters =
        normalizeFilters({
          ...filters,
          ...overrideFilters,
        });

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
         * This must map to:
         *
         * GET /api/savings/goals
         */
        const response =
          await smartSaveService.getSavingGoals(
            nextFilters
          );

        /*
         * Ignore stale responses.
         *
         * This prevents an older request from
         * overwriting newer server state.
         */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }

        const goals =
          normalizeGoals(response);

        const pagination =
          normalizePagination(
            response,
            nextFilters
          );

        if (mountedRef.current) {
          setState({
            goals,
            pagination,
          });

          setFiltersState(
            nextFilters
          );
        }

        return {
          goals,
          pagination,
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
    [filters]
  );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadGoals = async () => {
      if (cancelled) {
        return;
      }

      try {
        await fetchGoals();
      } catch {
        /*
         * fetchGoals already stores the normalized
         * error in hook state.
         *
         * Do not rethrow from the effect.
         */
      }
    };

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, [fetchGoals]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(async () => {
      try {
        return await fetchGoals(
          {},
          {
            silent: true,
          }
        );
      } catch {
        return null;
      }
    }, [fetchGoals]);

  /* =======================================================
     FILTERS
  ======================================================= */

  const setFilters =
    useCallback(
      (nextFilters) => {
        setFiltersState(
          (previous) => {
            const next =
              typeof nextFilters ===
              "function"
                ? nextFilters(previous)
                : {
                    ...previous,
                    ...nextFilters,
                  };

            return normalizeFilters({
              ...next,
              page: DEFAULT_PAGE,
            });
          }
        );
      },
      []
    );

  const setStatus =
    useCallback(
      (status) => {
        setFiltersState(
          (previous) =>
            normalizeFilters({
              ...previous,
              status:
                status || "",
              page: DEFAULT_PAGE,
            })
        );
      },
      []
    );

  const clearFilters =
    useCallback(() => {
      setFiltersState(
        normalizeFilters(
          DEFAULT_FILTERS
        )
      );
    }, []);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const goToPage =
    useCallback((page) => {
      const normalizedPage =
        normalizePositiveInteger(
          page,
          DEFAULT_PAGE
        );

      setFiltersState(
        (previous) =>
          normalizeFilters({
            ...previous,
            page: normalizedPage,
          })
      );
    }, []);

  const nextPage =
    useCallback(() => {
      setFiltersState(
        (previous) => {
          if (
            state.pagination
              .hasNextPage === false
          ) {
            return previous;
          }

          return normalizeFilters({
            ...previous,
            page:
              previous.page + 1,
          });
        }
      );
    }, [
      state.pagination.hasNextPage,
    ]);

  const previousPage =
    useCallback(() => {
      setFiltersState(
        (previous) => {
          if (
            previous.page <= 1 ||
            state.pagination
              .hasPreviousPage === false
          ) {
            return previous;
          }

          return normalizeFilters({
            ...previous,
            page:
              previous.page - 1,
          });
        }
      );
    }, [
      state.pagination
        .hasPreviousPage,
    ]);

  /* =======================================================
     GET SINGLE GOAL
  ======================================================= */

  const getGoal =
    useCallback(
      async (goalId) => {
        try {
          return await smartSaveService.getSavingGoal(
            goalId
          );
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
      []
    );

  /* =======================================================
     GOAL SUMMARY
  ======================================================= */

  const getGoalSummary =
    useCallback(
      async (goalId) => {
        try {
          return await smartSaveService.getSavingGoalSummary(
            goalId
          );
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
          return await smartSaveService.getSavingGoalContributions(
            goalId,
            contributionFilters
          );
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
          return await smartSaveService.getSavingHistory(
            goalId,
            historyFilters
          );
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
      []
    );

  /* =======================================================
     CONTRIBUTION ELIGIBILITY
  ======================================================= */

  const checkEligibility =
    useCallback(
      async (
        goalId,
        amount
      ) => {
        try {
          return await smartSaveService.checkSavingEligibility(
            goalId,
            {
              amount,
            }
          );
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
      []
    );

  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const goals =
    state.goals;

  const hasGoals =
    goals.length > 0;

  const isEmpty =
    !loading &&
    !refreshing &&
    goals.length === 0;

  const total =
    state.pagination.total;

  const currentPage =
    state.pagination.page;

  const totalPages =
    state.pagination.totalPages;

  const hasNextPage =
    state.pagination.hasNextPage;

  const hasPreviousPage =
    state.pagination
      .hasPreviousPage;

  /* =======================================================
     STATUS DERIVATIONS
  ======================================================= */

  const activeGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal?.status ===
            "active"
        ),
      [goals]
    );

  const completedGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal?.status ===
            "completed"
        ),
      [goals]
    );

  const pausedGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal?.status ===
            "paused"
        ),
      [goals]
    );

  const cancelledGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal?.status ===
            "cancelled"
        ),
      [goals]
    );

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

      pagination:
        state.pagination,

      total,

      currentPage,

      totalPages,

      hasNextPage,

      hasPreviousPage,

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
         GOAL OPERATIONS
      ----------------------------- */

      getGoal,

      getGoalSummary,

      getGoalContributions,

      getGoalHistory,

      checkEligibility,

      /* -----------------------------
         FETCH / REFRESH
      ----------------------------- */

      fetchGoals,

      refresh,

      /* -----------------------------
         REQUEST STATE
      ----------------------------- */

      loading,

      refreshing,

      isLoading: loading,

      isRefreshing:
        refreshing,

      /* -----------------------------
         ERROR STATE
      ----------------------------- */

      error,

      hasError:
        Boolean(error),

      /* -----------------------------
         EMPTY STATE
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
      state.pagination,
      total,
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,
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
      fetchGoals,
      refresh,
      loading,
      refreshing,
      error,
      hasGoals,
      isEmpty,
    ]
  );
};

export default useSavingsGoals;