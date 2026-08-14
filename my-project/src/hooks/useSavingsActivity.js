// hooks/useSavingsActivity.js

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

const DEFAULT_STATE = {
  items: [],
  pagination: {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const DEFAULT_FILTERS = {
  savingGoalId: "",
  savingScheduleId: "",
  status: "",
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
};

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

/**
 * Prevents malformed API values from reaching the hook.
 */
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

const normalizeFilters = (
  filters = {}
) => ({
  savingGoalId:
    typeof filters.savingGoalId === "string"
      ? filters.savingGoalId.trim()
      : "",

  savingScheduleId:
    typeof filters.savingScheduleId === "string"
      ? filters.savingScheduleId.trim()
      : "",

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

/**
 * Extract the array regardless of whether the backend
 * returns:
 *
 * { data: [...] }
 * { data: { items: [...] } }
 * { executions: [...] }
 * [...]
 */
const normalizeItems = (
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
      response?.data?.items
    )
  ) {
    return response.data.items;
  }

  if (
    Array.isArray(
      response?.data?.executions
    )
  ) {
    return response.data.executions;
  }

  if (
    Array.isArray(
      response?.executions
    )
  ) {
    return response.executions;
  }

  return [];
};

/**
 * Normalizes pagination without assuming a single
 * backend response shape.
 */
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

  const total =
    Number.isFinite(
      Number(source.total)
    )
      ? Number(source.total)
      : 0;

  const totalPages =
    Number.isFinite(
      Number(source.totalPages)
    )
      ? Number(source.totalPages)
      : limit > 0
        ? Math.ceil(total / limit)
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
  const normalized =
    smartSaveService?.normalizeError
      ? smartSaveService.normalizeError(
          error
        )
      : error;

  return {
    message:
      normalized?.message ||
      "Unable to load savings activity.",

    code:
      normalized?.code ||
      "SAVINGS_ACTIVITY_ERROR",

    statusCode:
      normalized?.statusCode ??
      normalized?.response?.status ??
      null,

    details:
      normalized?.details ??
      null,

    originalError:
      error,
  };
};

/* =========================================================
   HOOK
========================================================= */

const useSavingsActivity = (
  initialFilters = {}
) => {
  const mountedRef =
    useRef(true);

  const requestIdRef =
    useRef(0);

  const initialNormalizedFilters =
    useMemo(
      () =>
        normalizeFilters(
          initialFilters
        ),
      [
        initialFilters?.savingGoalId,
        initialFilters?.savingScheduleId,
        initialFilters?.status,
        initialFilters?.page,
        initialFilters?.limit,
      ]
    );

  const [
    filters,
    setFiltersState,
  ] = useState(
    initialNormalizedFilters
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
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     FETCH ACTIVITY
  ======================================================= */

  const fetchActivity = useCallback(
    async (
      overrideFilters = {},
      options = {}
    ) => {
      const {
        silent = false,
      } = options;

      const requestId =
        ++requestIdRef.current;

      const mergedFilters =
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
        const response =
          await smartSaveService.getSavingExecutions(
            mergedFilters
          );

        /*
         * Ignore stale responses.
         *
         * Example:
         * request A starts
         * request B starts
         * request B finishes first
         * request A finishes later
         *
         * Request A must not overwrite B.
         */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }

        const items =
          normalizeItems(response);

        const pagination =
          normalizePagination(
            response,
            mergedFilters
          );

        if (mountedRef.current) {
          setState({
            items,
            pagination,
          });

          setFiltersState(
            mergedFilters
          );
        }

        return {
          items,
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

    const load = async () => {
      try {
        await fetchActivity();
      } catch {
        /*
         * Error is already stored inside the hook.
         *
         * We intentionally do not rethrow from the
         * effect because that would create an unhandled
         * promise rejection.
         */
      }
    };

    if (!cancelled) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [fetchActivity]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(async () => {
      try {
        return await fetchActivity(
          {},
          {
            silent: true,
          }
        );
      } catch {
        return null;
      }
    }, [fetchActivity]);

  /* =======================================================
     SET FILTERS
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
              page: 1,
            });
          }
        );
      },
      []
    );

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
          (previous) =>
            normalizeFilters({
              ...previous,
              page: normalizedPage,
            })
        );
      },
      []
    );

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
      state.pagination.hasPreviousPage,
    ]);

  /* =======================================================
     FILTER SHORTCUTS
  ======================================================= */

  const setGoalFilter =
    useCallback(
      (savingGoalId) => {
        setFiltersState(
          (previous) =>
            normalizeFilters({
              ...previous,
              savingGoalId:
                savingGoalId || "",
              page: 1,
            })
        );
      },
      []
    );

  const setScheduleFilter =
    useCallback(
      (savingScheduleId) => {
        setFiltersState(
          (previous) =>
            normalizeFilters({
              ...previous,
              savingScheduleId:
                savingScheduleId || "",
              page: 1,
            })
        );
      },
      []
    );

  const setStatusFilter =
    useCallback(
      (status) => {
        setFiltersState(
          (previous) =>
            normalizeFilters({
              ...previous,
              status: status || "",
              page: 1,
            })
        );
      },
      []
    );

  const clearFilters =
    useCallback(() => {
      setFiltersState(
        normalizeFilters({
          ...DEFAULT_FILTERS,
        })
      );
    }, []);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activities =
    state.items;

  const hasActivity =
    activities.length > 0;

  const isEmpty =
    !loading &&
    !refreshing &&
    activities.length === 0;

  const total =
    state.pagination.total;

  const currentPage =
    state.pagination.page;

  const totalPages =
    state.pagination.totalPages;

  const hasNextPage =
    state.pagination.hasNextPage;

  const hasPreviousPage =
    state.pagination.hasPreviousPage;

  /* =======================================================
     MEMOIZED RESULT
  ======================================================= */

  return useMemo(
    () => ({
      /* -----------------------------
         DATA
      ----------------------------- */

      activities,

      items: activities,

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

      setGoalFilter,

      setScheduleFilter,

      setStatusFilter,

      clearFilters,

      /* -----------------------------
         NAVIGATION
      ----------------------------- */

      goToPage,

      nextPage,

      previousPage,

      /* -----------------------------
         REQUEST STATE
      ----------------------------- */

      loading,

      refreshing,

      isLoading: loading,

      isRefreshing:
        refreshing,

      error,

      hasError:
        Boolean(error),

      /* -----------------------------
         EMPTY STATE
      ----------------------------- */

      hasActivity,

      isEmpty,

      /* -----------------------------
         ACTIONS
      ----------------------------- */

      fetchActivity,

      refresh,
    }),
    [
      activities,
      state.pagination,
      total,
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      filters,
      setFilters,
      setGoalFilter,
      setScheduleFilter,
      setStatusFilter,
      clearFilters,
      goToPage,
      nextPage,
      previousPage,
      loading,
      refreshing,
      error,
      hasActivity,
      isEmpty,
      fetchActivity,
      refresh,
    ]
  );
};

export default useSavingsActivity;