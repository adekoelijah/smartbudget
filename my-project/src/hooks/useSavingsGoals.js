
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
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number <= 0
  ) {
    return fallback;
  }

  return number;
};

const normalizeFilters = (value = {}) => ({
  status:
    typeof value?.status === "string"
      ? value.status.trim()
      : "",

  page: normalizePositiveInteger(
    value?.page,
    DEFAULT_PAGE
  ),

  limit: normalizePositiveInteger(
    value?.limit,
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
    source?.page,
    filters.page
  );

  const limit = normalizePositiveInteger(
    source?.limit,
    filters.limit
  );

  const rawTotal = Number(source?.total);

  const total = Number.isFinite(rawTotal)
    ? Math.max(0, rawTotal)
    : 0;

  const rawTotalPages = Number(
    source?.totalPages
  );

  const totalPages = Number.isFinite(
    rawTotalPages
  )
    ? Math.max(0, rawTotalPages)
    : limit > 0
      ? Math.ceil(total / limit)
      : 0;

  return {
    page,
    limit,
    total,
    totalPages,

    hasNextPage:
      typeof source?.hasNextPage === "boolean"
        ? source.hasNextPage
        : page < totalPages,

    hasPreviousPage:
      typeof source?.hasPreviousPage === "boolean"
        ? source.hasPreviousPage
        : page > 1,
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
  const message =
    error?.message ??
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    "Unable to process savings goal request.";

  return {
    message:
      typeof message === "string" &&
      message.trim()
        ? message.trim()
        : "Unable to process savings goal request.",

    code:
      error?.code ??
      error?.response?.data?.code ??
      "SAVINGS_GOALS_ERROR",

    statusCode:
      error?.status ??
      error?.statusCode ??
      error?.response?.status ??
      null,

    details:
      error?.details ??
      error?.response?.data?.details ??
      error?.response?.data?.errors ??
      null,

    originalError: error,
  };
};

/* =========================================================
   LOCAL ERROR FACTORY
========================================================= */

const createHookError = ({
  message,
  code = "SAVINGS_GOAL_VALIDATION_ERROR",
  details = null,
}) => ({
  message,
  code,
  statusCode: null,
  details,
  originalError: null,
});

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
   CREATE PAYLOAD NORMALIZATION
========================================================= */

/**
 * Create-goal requests are deliberately normalized here.
 *
 * The backend expects these fields at the top level:
 *
 * {
 *   name,
 *   targetAmount,
 *   targetDate
 * }
 *
 * We do NOT invent missing values.
 *
 * We also do NOT silently rename arbitrary fields such as
 * goalName -> name or amount -> targetAmount because doing
 * so could hide a contract problem between the modal and
 * the hook.
 */
const normalizeCreateGoalPayload = (
  payload
) => {
  if (
    payload === null ||
    payload === undefined ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw createHookError({
      message:
        "Savings goal payload must be an object.",
      code:
        "INVALID_SAVINGS_GOAL_PAYLOAD",
    });
  }

  const name =
    typeof payload.name === "string"
      ? payload.name.trim()
      : payload.name;

  const targetAmount =
    typeof payload.targetAmount === "string"
      ? payload.targetAmount.trim()
      : payload.targetAmount;

  const targetDate =
    typeof payload.targetDate === "string"
      ? payload.targetDate.trim()
      : payload.targetDate;

  const missingFields = [];

  if (
    name === undefined ||
    name === null ||
    name === ""
  ) {
    missingFields.push("name");
  }

  if (
    targetAmount === undefined ||
    targetAmount === null ||
    targetAmount === ""
  ) {
    missingFields.push("targetAmount");
  }

  if (
    targetDate === undefined ||
    targetDate === null ||
    targetDate === ""
  ) {
    missingFields.push("targetDate");
  }

  if (missingFields.length > 0) {
    throw createHookError({
      message:
        `Savings goal is missing required field(s): ` +
        missingFields.join(", ") +
        ".",
      code:
        "SAVINGS_GOAL_REQUIRED_FIELDS",
      details: {
        fields: missingFields,
      },
    });
  }

  const numericTargetAmount =
    Number(targetAmount);

  if (
    !Number.isFinite(numericTargetAmount) ||
    numericTargetAmount <= 0
  ) {
    throw createHookError({
      message:
        "Savings goal target amount must be greater than zero.",
      code:
        "INVALID_SAVINGS_GOAL_TARGET_AMOUNT",
      details: {
        field: "targetAmount",
        value: targetAmount,
      },
    });
  }

  const normalizedPayload = {
    ...payload,
    name,
    targetAmount:
      numericTargetAmount,
    targetDate,
  };

  return normalizedPayload;
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

  const initialFiltersKey = useMemo(
    () => {
      const normalized =
        normalizeFilters(initialFilters);

      return createFilterKey(normalized);
    },
    [
      initialFilters?.status,
      initialFilters?.page,
      initialFilters?.limit,
    ]
  );

  const normalizedInitialFilters =
    useMemo(() => {
      const [
        status,
        page,
        limit,
      ] = initialFiltersKey.split("|");

      return normalizeFilters({
        status,
        page,
        limit,
      });
    }, [initialFiltersKey]);

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [filters, setFiltersState] =
    useState(
      normalizedInitialFilters
    );

  /* =======================================================
     SERVER STATE
  ======================================================= */

  const [goals, setGoals] =
    useState([]);

  const [pagination, setPagination] =
    useState(
      createInitialPagination
    );

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* =======================================================
     REQUEST CONTROL
  ======================================================= */

  const mountedRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  const abortControllerRef =
    useRef(null);

  const filtersRef =
    useRef(filters);

  /* =======================================================
     MUTATION CONTROL
  ======================================================= */

  const mutationIdRef =
    useRef(0);

  /* =======================================================
     KEEP FILTER REF CURRENT
  ======================================================= */

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  /* =======================================================
     MOUNT / UNMOUNT
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

      const nextFilters =
        normalizeFilters({
          ...filtersRef.current,
          ...overrideFilters,
        });

      const requestId =
        ++requestIdRef.current;

      abortControllerRef.current?.abort();

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

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
          await getSavingGoals({
            ...nextFilters,
            signal:
              controller.signal,
          });

        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }

        if (
          controller.signal.aborted
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
            pagination:
              nextPagination,
            raw: response,
          };
        }

        setGoals(nextGoals);

        setPagination(
          nextPagination
        );

        setFiltersState(
          (previous) => {
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
          }
        );

        return {
          goals: nextGoals,
          pagination:
            nextPagination,
          raw: response,
        };
      } catch (requestError) {
        if (
          controller.signal.aborted ||
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
    let cancelled = false;

    const load = async () => {
      if (cancelled) {
        return;
      }

      try {
        await fetchGoals();
      } catch {
        /*
         * fetchGoals owns error state.
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

  const refreshGoals = refresh;

  /* =======================================================
     CREATE GOAL
  ======================================================= */

  const createGoal = useCallback(
    async (payload) => {
      const mutationId =
        ++mutationIdRef.current;

      let normalizedPayload;

      try {
        normalizedPayload =
          normalizeCreateGoalPayload(
            payload
          );
      } catch (validationError) {
        const normalized =
          normalizeError(
            validationError
          );

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }

      try {
        const createSavingGoal =
          getServiceMethod(
            "createSavingGoal"
          );

        /*
         * IMPORTANT:
         *
         * The payload sent to the service is now
         * explicitly validated and normalized.
         *
         * This prevents:
         *
         * createSavingGoal(undefined)
         * createSavingGoal({})
         *
         * from reaching the backend.
         */
        const response =
          await createSavingGoal(
            normalizedPayload
          );

        if (
          mutationId !==
          mutationIdRef.current
        ) {
          return response;
        }

        /*
         * Refresh the list only after successful
         * creation.
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
          normalizeError(
            requestError
          );

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
    async (
      goalId,
      payload
    ) => {
      if (!goalId) {
        const normalized =
          createHookError({
            message:
              "A savings goal ID is required.",
            code:
              "SAVINGS_GOAL_ID_REQUIRED",
          });

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }

      /*
       * The current smartSaveService does not expose
       * updateSavingGoal().
       *
       * Resolve the method explicitly so this failure
       * becomes clear instead of becoming a silent
       * backend problem.
       */
      const methodName =
        "updateSavingGoal";

      if (
        typeof smartSaveService?.[
          methodName
        ] !== "function"
      ) {
        const normalized =
          createHookError({
            message:
              "Updating savings goals is not currently supported by the SmartSave service.",
            code:
              "SAVINGS_GOAL_UPDATE_UNAVAILABLE",
            details: {
              method:
                methodName,
            },
          });

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
            methodName
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
          normalizeError(
            requestError
          );

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
          createHookError({
            message:
              "A savings goal ID is required.",
            code:
              "SAVINGS_GOAL_ID_REQUIRED",
          });

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }

      /*
       * The current smartSaveService does not expose
       * deleteSavingGoal().
       */
      const methodName =
        "deleteSavingGoal";

      if (
        typeof smartSaveService?.[
          methodName
        ] !== "function"
      ) {
        const normalized =
          createHookError({
            message:
              "Deleting savings goals is not currently supported by the SmartSave service.",
            code:
              "SAVINGS_GOAL_DELETE_UNAVAILABLE",
            details: {
              method:
                methodName,
            },
          });

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
            methodName
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
          normalizeError(
            requestError
          );

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }
    },
    [fetchGoals]
  );

  /* =======================================================
     FILTERS
  ======================================================= */

  const setFilters = useCallback(
    (nextValue) => {
      setFiltersState(
        (previous) => {
          const candidate =
            typeof nextValue ===
            "function"
              ? nextValue(previous)
              : {
                  ...previous,
                  ...nextValue,
                };

          const normalized =
            normalizeFilters(
              candidate
            );

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
     STATUS
  ======================================================= */

  const setStatus = useCallback(
    (status) => {
      const normalizedStatus =
        typeof status === "string"
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

  const clearFilters = useCallback(
    () => {
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

          return normalizeFilters(
            DEFAULT_FILTERS
          );
        }
      );
    },
    []
  );

  /* =======================================================
     PAGE
  ======================================================= */

  const goToPage = useCallback(
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

  const nextPage = useCallback(
    () => {
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
    [pagination.hasNextPage]
  );

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
    }, [
      pagination.hasPreviousPage,
    ]);

  /* =======================================================
     SINGLE GOAL
  ======================================================= */

  const getGoal = useCallback(
    async (goalId) => {
      if (!goalId) {
        const normalized =
          createHookError({
            message:
              "A savings goal ID is required.",
            code:
              "SAVINGS_GOAL_ID_REQUIRED",
          });

        if (mountedRef.current) {
          setError(normalized);
        }

        throw normalized;
      }

      try {
        const method =
          getServiceMethod(
            "getSavingGoal"
          );

        return await method(
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
     SUMMARY
  ======================================================= */

  const getGoalSummary =
    useCallback(
      async (goalId) => {
        if (!goalId) {
          const normalized =
            createHookError({
              message:
                "A savings goal ID is required.",
              code:
                "SAVINGS_GOAL_ID_REQUIRED",
            });

          if (mountedRef.current) {
            setError(normalized);
          }

          throw normalized;
        }

        try {
          const method =
            getServiceMethod(
              "getSavingGoalSummary"
            );

          return await method(
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
     CONTRIBUTIONS
  ======================================================= */

  const getGoalContributions =
    useCallback(
      async (
        goalId,
        contributionFilters = {}
      ) => {
        if (!goalId) {
          const normalized =
            createHookError({
              message:
                "A savings goal ID is required.",
              code:
                "SAVINGS_GOAL_ID_REQUIRED",
            });

          if (mountedRef.current) {
            setError(normalized);
          }

          throw normalized;
        }

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
     HISTORY
  ======================================================= */

  const getGoalHistory =
    useCallback(
      async (
        goalId,
        historyFilters = {}
      ) => {
        if (!goalId) {
          const normalized =
            createHookError({
              message:
                "A savings goal ID is required.",
              code:
                "SAVINGS_GOAL_ID_REQUIRED",
            });

          if (mountedRef.current) {
            setError(normalized);
          }

          throw normalized;
        }

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
     ELIGIBILITY
  ======================================================= */

  const checkEligibility =
    useCallback(
      async (
        goalId,
        amount
      ) => {
        if (!goalId) {
          const normalized =
            createHookError({
              message:
                "A savings goal ID is required.",
              code:
                "SAVINGS_GOAL_ID_REQUIRED",
            });

          if (mountedRef.current) {
            setError(normalized);
          }

          throw normalized;
        }

        try {
          const method =
            getServiceMethod(
              "checkSavingEligibility"
            );

          /*
           * IMPORTANT:
           *
           * smartSaveService.checkSavingEligibility()
           * expects:
           *
           * checkSavingEligibility(goalId, amount)
           *
           * NOT:
           *
           * checkSavingEligibility(goalId, { amount })
           */
          return await method(
            goalId,
            amount
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
     FLAGS
  ======================================================= */

  const hasGoals =
    goals.length > 0;

  const isLoading = loading;

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

  const reset = useCallback(
    () => {
      requestIdRef.current += 1;
      mutationIdRef.current += 1;

      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

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
    },
    [normalizedInitialFilters]
  );

  /* =======================================================
     RETURN API
  ======================================================= */

  return useMemo(
    () => ({
      goals,

      items: goals,

      activeGoals,
      completedGoals,
      pausedGoals,
      cancelledGoals,

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
