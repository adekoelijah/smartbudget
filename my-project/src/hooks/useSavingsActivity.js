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

const DEFAULT_PAGINATION = Object.freeze({
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

const DEFAULT_FILTERS = Object.freeze({
  savingGoalId: "",
  savingScheduleId: "",
  status: "",
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
});

/* =========================================================
   SAFE HELPERS
========================================================= */

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizePositiveInteger = (
  value,
  fallback
) => {
  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : fallback;
};

const normalizeNonNegativeInteger = (
  value,
  fallback
) => {
  const number = Number(value);

  return Number.isInteger(number) && number >= 0
    ? number
    : fallback;
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

const areFiltersEqual = (a, b) => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a.savingGoalId === b.savingGoalId &&
    a.savingScheduleId ===
      b.savingScheduleId &&
    a.status === b.status &&
    a.page === b.page &&
    a.limit === b.limit
  );
};

/* =========================================================
   REQUEST KEY
========================================================= */

const createRequestKey = (filters) =>
  JSON.stringify([
    filters.savingGoalId,
    filters.savingScheduleId,
    filters.status,
    filters.page,
    filters.limit,
  ]);

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const normalizeItems = (response) => {
  const candidates = [
    response,
    response?.items,
    response?.executions,
    response?.data,
    response?.data?.items,
    response?.data?.executions,
    response?.data?.data,
    response?.data?.data?.items,
    response?.data?.data?.executions,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

/* =========================================================
   PAGINATION SOURCE
========================================================= */

const getPaginationSource = (response) => {
  const candidates = [
    response?.pagination,
    response?.data?.pagination,
    response?.data?.data?.pagination,
    response?.meta?.pagination,
    response?.data?.meta?.pagination,
    response?.meta,
    response?.data?.meta,
    response?.data?.data?.meta,
  ];

  return (
    candidates.find(isPlainObject) || {}
  );
};

/* =========================================================
   PAGINATION NORMALIZATION
========================================================= */

const normalizePagination = (
  response,
  filters
) => {
  const source =
    getPaginationSource(response);

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
    normalizeNonNegativeInteger(
      source.total,
      0
    );

  const calculatedTotalPages =
    limit > 0
      ? Math.ceil(total / limit)
      : 0;

  const totalPages =
    normalizeNonNegativeInteger(
      source.totalPages,
      calculatedTotalPages
    );

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
      normalized?.response?.data?.error?.message ||
      normalized?.response?.data?.error ||
      normalized?.message ||
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
   ABORT DETECTION
========================================================= */

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ECONNABORTED" ||
    error?.message === "canceled" ||
    error?.message === "aborted"
  );
};

/* =========================================================
   HOOK
========================================================= */

const useSavingsActivity = (
  initialFilters = {}
) => {
  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [filters, setFiltersState] =
    useState(() =>
      normalizeFilters(initialFilters)
    );

  /* =======================================================
     DATA STATE
  ======================================================= */

  const [items, setItems] = useState([]);

  const [pagination, setPagination] =
    useState(() => ({
      ...DEFAULT_PAGINATION,
    }));

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* =======================================================
     LIFECYCLE
  ======================================================= */

  const mountedRef = useRef(false);

  const requestIdRef = useRef(0);

  const abortControllerRef =
    useRef(null);

  /*
   * Stores the most recently completed
   * request key.
   */
  const completedRequestKeyRef =
    useRef(null);

  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      abortControllerRef.current?.abort();

      abortControllerRef.current = null;
    };
  }, []);

  /* =======================================================
     STABLE REQUEST KEY
  ======================================================= */

  const requestKey = useMemo(
    () => createRequestKey(filters),
    [filters]
  );

  /* =======================================================
     REQUEST
  ======================================================= */

  const executeRequest = useCallback(
    async (
      requestFilters,
      {
        silent = false,
        force = false,
      } = {}
    ) => {
      if (!mountedRef.current) {
        return null;
      }

      const normalizedFilters =
        normalizeFilters(requestFilters);

      const currentRequestKey =
        createRequestKey(
          normalizedFilters
        );

      /*
       * Prevent accidental duplicate requests.
       */
      if (
        !force &&
        completedRequestKeyRef.current ===
          currentRequestKey
      ) {
        return {
          items,
          pagination,
          raw: null,
          cached: true,
        };
      }

      /*
       * Cancel the previous request.
       */
      abortControllerRef.current?.abort();

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      const requestId =
        ++requestIdRef.current;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        /*
         * Important:
         *
         * Your service should accept `signal`
         * if it uses Axios/fetch.
         *
         * If smartSaveService currently only
         * accepts filters, remove `signal`
         * from this call and keep the request
         * ID protection.
         */
        const response =
          await smartSaveService.getSavingExecutions(
            normalizedFilters,
            {
              signal:
                controller.signal,
            }
          );

        /*
         * Ignore stale responses.
         */
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          requestId !==
            requestIdRef.current
        ) {
          return null;
        }

        const nextItems =
          normalizeItems(response);

        const nextPagination =
          normalizePagination(
            response,
            normalizedFilters
          );

        /*
         * Update data only after the
         * request has been verified current.
         */
        setItems(nextItems);

        setPagination(nextPagination);

        completedRequestKeyRef.current =
          currentRequestKey;

        return {
          items: nextItems,
          pagination: nextPagination,
          raw: response,
          cached: false,
        };
      } catch (requestError) {
        /*
         * Cancellation is expected during
         * rapid filter changes/unmounting.
         */
        if (
          isAbortError(requestError) ||
          controller.signal.aborted
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

        const normalized =
          normalizeError(requestError);

        setError(normalized);

        throw normalized;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [items, pagination]
  );

  /* =======================================================
     AUTOMATIC FETCH
  ======================================================= */

  useEffect(() => {
    if (!mountedRef.current) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        if (cancelled) {
          return;
        }

        await executeRequest(filters);
      } catch {
        /*
         * Error already stored by the hook.
         */
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    requestKey,
    executeRequest,
    filters,
  ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = useCallback(
    async () => {
      try {
        return await executeRequest(
          filters,
          {
            silent: true,
            force: true,
          }
        );
      } catch {
        return null;
      }
    },
    [executeRequest, filters]
  );

  /* =======================================================
     FETCH ACTIVITY
  ======================================================= */

  const fetchActivity = useCallback(
    async (
      overrideFilters = {},
      options = {}
    ) => {
      const merged =
        normalizeFilters({
          ...filters,
          ...overrideFilters,
        });

      return executeRequest(
        merged,
        options
      );
    },
    [filters, executeRequest]
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

        const next =
          normalizeFilters({
            ...candidate,

            /*
             * Filter changes always reset
             * pagination.
             */
            page: DEFAULT_PAGE,
          });

        return areFiltersEqual(
          previous,
          next
        )
          ? previous
          : next;
      });
    },
    []
  );

  /* =======================================================
     PAGE NAVIGATION
  ======================================================= */

  const goToPage = useCallback(
    (page) => {
      const nextPage =
        normalizePositiveInteger(
          page,
          DEFAULT_PAGE
        );

      setFiltersState((previous) => {
        if (
          previous.page === nextPage
        ) {
          return previous;
        }

        return {
          ...previous,
          page: nextPage,
        };
      });
    },
    []
  );

  const nextPage = useCallback(() => {
    setFiltersState((previous) => {
      /*
       * Pagination is intentionally read
       * from the current state inside the
       * callback instead of being captured
       * in the callback dependency array.
       */
      const canGoNext =
        pagination.hasNextPage;

      if (!canGoNext) {
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
      const canGoPrevious =
        pagination.hasPreviousPage;

      if (
        !canGoPrevious ||
        previous.page <= 1
      ) {
        return previous;
      }

      return {
        ...previous,
        page: previous.page - 1,
      };
    });
  }, [pagination.hasPreviousPage]);

  /* =======================================================
     FILTER HELPERS
  ======================================================= */

  const setGoalFilter = useCallback(
    (savingGoalId) => {
      setFiltersState((previous) => {
        const next =
          normalizeFilters({
            ...previous,
            savingGoalId:
              typeof savingGoalId ===
              "string"
                ? savingGoalId.trim()
                : "",
            page: DEFAULT_PAGE,
          });

        return areFiltersEqual(
          previous,
          next
        )
          ? previous
          : next;
      });
    },
    []
  );

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
                  ? savingScheduleId.trim()
                  : "",
              page: DEFAULT_PAGE,
            });

          return areFiltersEqual(
            previous,
            next
          )
            ? previous
            : next;
        });
      },
      []
    );

  const setStatusFilter = useCallback(
    (status) => {
      setFiltersState((previous) => {
        const next =
          normalizeFilters({
            ...previous,
            status:
              typeof status === "string"
                ? status.trim()
                : "",
            page: DEFAULT_PAGE,
          });

        return areFiltersEqual(
          previous,
          next
        )
          ? previous
          : next;
      });
    },
    []
  );

  const clearFilters = useCallback(
    () => {
      setFiltersState((previous) => {
        const next =
          normalizeFilters(
            DEFAULT_FILTERS
          );

        return areFiltersEqual(
          previous,
          next
        )
          ? previous
          : next;
      });
    },
    []
  );

  /* =======================================================
     DERIVED STATE
  ======================================================= */

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
    items.length > 0;

  const isEmpty =
    !loading &&
    !refreshing &&
    items.length === 0;

  /* =======================================================
     PUBLIC API
  ======================================================= */

  return useMemo(
    () => ({
      /* DATA */
      activities: items,
      items,

      /* PAGINATION */
      pagination,
      total,
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,

      /* FILTERS */
      filters,
      setFilters,
      setGoalFilter,
      setScheduleFilter,
      setStatusFilter,
      clearFilters,

      /* NAVIGATION */
      goToPage,
      nextPage,
      previousPage,

      /* REQUEST */
      loading,
      refreshing,
      isLoading: loading,
      isRefreshing: refreshing,

      error,
      hasError: Boolean(error),

      /* EMPTY */
      hasActivity,
      isEmpty,

      /* ACTIONS */
      fetchActivity,
      refresh,
    }),
    [
      items,
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