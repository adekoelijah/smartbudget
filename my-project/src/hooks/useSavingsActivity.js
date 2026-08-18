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

const DEFAULT_PAGINATION = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const DEFAULT_STATE = {
  items: [],
  pagination: DEFAULT_PAGINATION,
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

const normalizeNonNegativeInteger = (
  value,
  fallback
) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    return fallback;
  }

  return number;
};

/* =========================================================
   FILTER NORMALIZATION
========================================================= */

const normalizeFilters = (filters = {}) => ({
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

/* =========================================================
   FILTER EQUALITY
========================================================= */

const areFiltersEqual = (first, second) => {
  if (first === second) {
    return true;
  }

  if (!first || !second) {
    return false;
  }

  return (
    first.savingGoalId === second.savingGoalId &&
    first.savingScheduleId === second.savingScheduleId &&
    first.status === second.status &&
    first.page === second.page &&
    first.limit === second.limit
  );
};

/* =========================================================
   REQUEST KEY
========================================================= */

const createRequestKey = (filters) =>
  [
    filters.savingGoalId,
    filters.savingScheduleId,
    filters.status,
    filters.page,
    filters.limit,
  ].join("|");

/* =========================================================
   RESPONSE DATA EXTRACTION
========================================================= */

/**
 * SmartSave can potentially return any of these shapes:
 *
 * []
 *
 * { data: [] }
 *
 * { items: [] }
 *
 * { executions: [] }
 *
 * { data: { items: [] } }
 *
 * { data: { executions: [] } }
 *
 * { data: { data: { items: [] } } }
 *
 * { data: { data: { executions: [] } } }
 */
const normalizeItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.executions)) {
    return response.executions;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.data?.executions)) {
    return response.data.executions;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.data?.items)) {
    return response.data.data.items;
  }

  if (Array.isArray(response?.data?.data?.executions)) {
    return response.data.data.executions;
  }

  return [];
};

/* =========================================================
   PAGINATION SOURCE
========================================================= */

const getPaginationSource = (response) => {
  return (
    response?.pagination ||
    response?.data?.pagination ||
    response?.data?.data?.pagination ||
    response?.meta?.pagination ||
    response?.data?.meta?.pagination ||
    response?.meta ||
    response?.data?.meta ||
    response?.data?.data?.meta ||
    {}
  );
};

/* =========================================================
   PAGINATION NORMALIZATION
========================================================= */

const normalizePagination = (
  response,
  filters
) => {
  const source = getPaginationSource(response);

  const page = normalizePositiveInteger(
    source.page,
    filters.page
  );

  const limit = normalizePositiveInteger(
    source.limit,
    filters.limit
  );

  const total = normalizeNonNegativeInteger(
    source.total,
    0
  );

  const calculatedTotalPages =
    limit > 0
      ? Math.ceil(total / limit)
      : 0;

  const totalPages = normalizeNonNegativeInteger(
    source.totalPages,
    calculatedTotalPages
  );

  return {
    page,
    limit,
    total,
    totalPages,

    hasNextPage:
      typeof source.hasNextPage === "boolean"
        ? source.hasNextPage
        : page < totalPages,

    hasPreviousPage:
      typeof source.hasPreviousPage === "boolean"
        ? source.hasPreviousPage
        : page > 1,
  };
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const normalizeError = (error) => {
  const normalized =
    typeof smartSaveService?.normalizeError ===
    "function"
      ? smartSaveService.normalizeError(error)
      : error;

  return {
    message:
      normalized?.message ||
      normalized?.response?.data?.message ||
      "Unable to load savings activity.",

    code:
      normalized?.code ||
      normalized?.response?.data?.code ||
      "SAVINGS_ACTIVITY_ERROR",

    statusCode:
      normalized?.statusCode ??
      normalized?.response?.status ??
      null,

    details:
      normalized?.details ??
      normalized?.response?.data?.details ??
      null,

    originalError: error,
  };
};

/* =========================================================
   HOOK
========================================================= */

const useSavingsActivity = (initialFilters = {}) => {
  /* =======================================================
     INITIAL FILTER STATE
  ======================================================= */

  const [filters, setFiltersState] = useState(() =>
    normalizeFilters(initialFilters)
  );

  /* =======================================================
     DATA STATE
  ======================================================= */

  const [state, setState] = useState(() => ({
    items: [],
    pagination: {
      ...DEFAULT_PAGINATION,
    },
  }));

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  /* =======================================================
     LIFECYCLE / REQUEST REFS
  ======================================================= */

  /**
   * This is intentionally the only mutable ref used by
   * the hook for request coordination.
   *
   * It is NEVER accessed or mutated during render.
   */
  const mountedRef = useRef(false);

  /**
   * Every request gets a monotonically increasing ID.
   *
   * This prevents stale requests from overwriting newer
   * request results.
   */
  const requestIdRef = useRef(0);

  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      /*
       * Invalidate every outstanding request.
       */
      requestIdRef.current += 1;
    };
  }, []);

  /* =======================================================
     REQUEST KEY
  ======================================================= */

  const requestKey = createRequestKey(filters);

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

      /*
       * Never start a request after unmount.
       */
      if (!mountedRef.current) {
        return null;
      }

      /*
       * Build the request from the latest state captured
       * by this callback plus any explicit overrides.
       */
      const mergedFilters = normalizeFilters({
        ...filters,
        ...overrideFilters,
      });

      /*
       * Generate a unique request ID.
       */
      const requestId =
        ++requestIdRef.current;

      /*
       * Clear the previous error before starting a new
       * request.
       */
      setError(null);

      /*
       * `silent` means an explicit refresh.
       *
       * Otherwise this is a normal data load.
       */
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response =
          await smartSaveService.getSavingExecutions(
            mergedFilters
          );

        /*
         * Ignore the response if:
         *
         * 1. The component has unmounted.
         * 2. A newer request has started.
         */
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
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

        setState({
          items,
          pagination,
        });

        return {
          items,
          pagination,
          raw: response,
        };
      } catch (requestError) {
        /*
         * Ignore stale request errors.
         */
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const normalized =
          normalizeError(requestError);

        setError(normalized);

        /*
         * Keep the public behavior predictable:
         * callers can catch a normalized error.
         */
        throw normalized;
      } finally {
        /*
         * Only the current request can change the
         * request-state flags.
         */
        if (
          mountedRef.current &&
          requestId === requestIdRef.current
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

    const loadActivity = async () => {
      if (
        cancelled ||
        !mountedRef.current
      ) {
        return;
      }

      try {
        await fetchActivity();
      } catch {
        /*
         * fetchActivity already stores the normalized
         * error in hook state.
         */
      }
    };

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [requestKey, fetchActivity]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = useCallback(
    async () => {
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
    },
    [fetchActivity]
  );

  /* =======================================================
     SET FILTERS
  ======================================================= */

  const setFilters = useCallback(
    (nextFilters) => {
      setFiltersState((previous) => {
        const candidate =
          typeof nextFilters === "function"
            ? nextFilters(previous)
            : {
                ...previous,
                ...nextFilters,
              };

        const next = normalizeFilters({
          ...candidate,

          /*
           * Any actual filter change returns the user to
           * the first page.
           */
          page: DEFAULT_PAGE,
        });

        if (
          areFiltersEqual(
            previous,
            next
          )
        ) {
          return previous;
        }

        return next;
      });
    },
    []
  );

  /* =======================================================
     GO TO PAGE
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

        return normalizeFilters({
          ...previous,
          page: normalizedPage,
        });
      });
    },
    []
  );

  /* =======================================================
     NEXT PAGE
  ======================================================= */

  const nextPage = useCallback(() => {
    setFiltersState((previous) => {
      const pagination =
        state.pagination;

      if (
        !pagination.hasNextPage
      ) {
        return previous;
      }

      return normalizeFilters({
        ...previous,
        page: previous.page + 1,
      });
    });
  }, [state.pagination]);

  /* =======================================================
     PREVIOUS PAGE
  ======================================================= */

  const previousPage = useCallback(() => {
    setFiltersState((previous) => {
      const pagination =
        state.pagination;

      if (
        !pagination.hasPreviousPage ||
        previous.page <= 1
      ) {
        return previous;
      }

      return normalizeFilters({
        ...previous,
        page: previous.page - 1,
      });
    });
  }, [state.pagination]);

  /* =======================================================
     GOAL FILTER
  ======================================================= */

  const setGoalFilter = useCallback(
    (savingGoalId) => {
      setFiltersState((previous) => {
        const next = normalizeFilters({
          ...previous,
          savingGoalId:
            typeof savingGoalId === "string"
              ? savingGoalId
              : "",
          page: DEFAULT_PAGE,
        });

        if (
          areFiltersEqual(
            previous,
            next
          )
        ) {
          return previous;
        }

        return next;
      });
    },
    []
  );

  /* =======================================================
     SCHEDULE FILTER
  ======================================================= */

  const setScheduleFilter =
    useCallback(
      (savingScheduleId) => {
        setFiltersState((previous) => {
          const next =
            normalizeFilters({
              ...previous,
              savingScheduleId:
                typeof savingScheduleId ===
                "string"
                  ? savingScheduleId
                  : "",
              page: DEFAULT_PAGE,
            });

          if (
            areFiltersEqual(
              previous,
              next
            )
          ) {
            return previous;
          }

          return next;
        });
      },
      []
    );

  /* =======================================================
     STATUS FILTER
  ======================================================= */

  const setStatusFilter = useCallback(
    (status) => {
      setFiltersState((previous) => {
        const next = normalizeFilters({
          ...previous,
          status:
            typeof status === "string"
              ? status
              : "",
          page: DEFAULT_PAGE,
        });

        if (
          areFiltersEqual(
            previous,
            next
          )
        ) {
          return previous;
        }

        return next;
      });
    },
    []
  );

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = useCallback(() => {
    setFiltersState((previous) => {
      const next = normalizeFilters(
        DEFAULT_FILTERS
      );

      if (
        areFiltersEqual(
          previous,
          next
        )
      ) {
        return previous;
      }

      return next;
    });
  }, []);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activities = state.items;

  const pagination =
    state.pagination;

  const total = pagination.total;

  const currentPage =
    pagination.page;

  const totalPages =
    pagination.totalPages;

  const hasNextPage =
    pagination.hasNextPage;

  const hasPreviousPage =
    pagination.hasPreviousPage;

  const hasActivity =
    activities.length > 0;

  const isEmpty =
    !loading &&
    !refreshing &&
    activities.length === 0;

  /* =======================================================
     PUBLIC API
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

      pagination,

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

      isRefreshing: refreshing,

      error,

      hasError: Boolean(error),

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
      pagination,

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