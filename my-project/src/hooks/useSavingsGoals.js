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

const DEFAULT_ERROR_MESSAGE =
  "Unable to process savings goal request.";

const DEFAULT_ERROR_CODE =
  "SAVINGS_GOALS_ERROR";

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

const normalizeFilters = (value = {}) => {
  const source =
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? value
      : {};

  return {
    status:
      typeof source.status === "string"
        ? source.status.trim()
        : "",

    page: normalizePositiveInteger(
      source.page,
      DEFAULT_PAGE
    ),

    limit: normalizePositiveInteger(
      source.limit,
      DEFAULT_LIMIT
    ),
  };
};

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

  const rawTotal = Number(
    source?.total
  );

  const total = Number.isFinite(rawTotal)
    ? Math.max(0, rawTotal)
    : 0;

  const rawTotalPages = Number(
    source?.totalPages
  );

  const totalPages =
    Number.isFinite(rawTotalPages)
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
      typeof source?.hasNextPage ===
      "boolean"
        ? source.hasNextPage
        : page < totalPages,

    hasPreviousPage:
      typeof source?.hasPreviousPage ===
      "boolean"
        ? source.hasPreviousPage
        : page > 1,
  };
};

/* =========================================================
   RESPONSE EXTRACTION
========================================================= */

const extractGoals = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    !response ||
    typeof response !== "object"
  ) {
    return [];
  }

  if (Array.isArray(response.goals)) {
    return response.goals;
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

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    if (Array.isArray(response.data.goals)) {
      return response.data.goals;
    }

    if (Array.isArray(response.data.items)) {
      return response.data.items;
    }

    if (
      Array.isArray(response.data.results)
    ) {
      return response.data.results;
    }
  }

  return [];
};

/* =========================================================
   GOAL VALUE HELPERS
========================================================= */

const toFiniteNumber = (
  value,
  fallback = 0
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const getGoalId = (goal) =>
  goal?._id ??
  goal?.id ??
  goal?.goalId ??
  null;

const getGoalName = (goal) => {
  const value =
    goal?.name ??
    goal?.title ??
    goal?.goalName ??
    "";

  return typeof value === "string"
    ? value.trim()
    : "";
};

const getGoalCurrency = (goal) => {
  const value =
    goal?.currency ??
    goal?.targetCurrency ??
    "NGN";

  return typeof value === "string" &&
    value.trim()
    ? value.trim().toUpperCase()
    : "NGN";
};

const getGoalTargetAmount = (goal) =>
  Math.max(
    0,
    toFiniteNumber(
      goal?.targetAmount ??
        goal?.target ??
        goal?.amount,
      0
    )
  );

const getGoalCurrentAmount = (goal) =>
  Math.max(
    0,
    toFiniteNumber(
      goal?.currentAmount ??
        goal?.savedAmount ??
        goal?.amountSaved ??
        goal?.totalSaved,
      0
    )
  );

const getGoalStatus = (goal) => {
  const value =
    goal?.status ?? "active";

  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "active";
};

const getGoalTargetDate = (goal) =>
  goal?.targetDate ??
  goal?.deadline ??
  goal?.endDate ??
  null;

/* =========================================================
   GOAL NORMALIZATION
========================================================= */

/**
 * Convert the backend goal into one predictable
 * frontend view model.
 *
 * Components should consume this shape instead
 * of trying to understand multiple API field names.
 */

const normalizeGoal = (goal) => {
  if (
    !goal ||
    typeof goal !== "object"
  ) {
    return null;
  }

  const id = getGoalId(goal);

  const name = getGoalName(goal);

  const currency =
    getGoalCurrency(goal);

  const targetAmount =
    getGoalTargetAmount(goal);

  const currentAmount =
    getGoalCurrentAmount(goal);

  const remainingAmount =
    Math.max(
      targetAmount - currentAmount,
      0
    );

  const calculatedProgress =
    targetAmount > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentAmount /
              targetAmount) *
              100
          )
        )
      : 0;

  const backendProgress =
    toFiniteNumber(
      goal?.progress,
      NaN
    );

  const progress = Number.isFinite(
    backendProgress
  )
    ? Math.min(
        100,
        Math.max(
          0,
          backendProgress
        )
      )
    : calculatedProgress;

  const normalizedStatus =
    getGoalStatus(goal);

  const isCompleted =
    normalizedStatus ===
      "completed" ||
    currentAmount >=
      targetAmount;

  return {
    ...goal,

    id,

    name,

    currency,

    targetAmount,

    currentAmount,

    remainingAmount,

    progress,

    targetDate:
      getGoalTargetDate(goal),

    status: isCompleted
      ? "completed"
      : normalizedStatus,

    isCompleted,
  };
};

const normalizeGoals = (response) =>
  extractGoals(response)
    .map(normalizeGoal)
    .filter(Boolean);

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const normalizeError = (error) => {
  if (
    error &&
    typeof error === "object" &&
    error.code &&
    error.message
  ) {
    return {
      message:
        typeof error.message === "string" &&
        error.message.trim()
          ? error.message.trim()
          : DEFAULT_ERROR_MESSAGE,

      code:
        error.code ||
        DEFAULT_ERROR_CODE,

      statusCode:
        error.statusCode ??
        error.status ??
        null,

      details:
        error.details ??
        null,

      originalError:
        error.originalError ??
        error,
    };
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.message ??
    error?.error ??
    DEFAULT_ERROR_MESSAGE;

  return {
    message:
      typeof message === "string" &&
      message.trim()
        ? message.trim()
        : DEFAULT_ERROR_MESSAGE,

    code:
      error?.response?.data?.code ??
      error?.code ??
      DEFAULT_ERROR_CODE,

    statusCode:
      error?.response?.status ??
      error?.statusCode ??
      error?.status ??
      null,

    details:
      error?.response?.data?.details ??
      error?.response?.data?.errors ??
      error?.details ??
      null,

    originalError: error,
  };
};

/* =========================================================
   LOCAL ERROR FACTORY
========================================================= */

const createHookError = ({
  message,
  code = "SAVINGS_GOAL_ERROR",
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
   CREATE PAYLOAD NORMALIZATION
========================================================= */

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
      : "";

  const rawTargetAmount =
    payload.targetAmount;

  const targetAmount =
    typeof rawTargetAmount === "string"
      ? Number(rawTargetAmount.trim())
      : Number(rawTargetAmount);

  const currency =
    typeof payload.currency === "string" &&
    payload.currency.trim()
      ? payload.currency
          .trim()
          .toUpperCase()
      : "NGN";

  const targetDate =
    typeof payload.targetDate === "string"
      ? payload.targetDate.trim()
      : "";

  const description =
    typeof payload.description === "string"
      ? payload.description.trim()
      : "";

  const missingFields = [];

  if (!name) {
    missingFields.push("name");
  }

  if (
    rawTargetAmount === null ||
    rawTargetAmount === undefined ||
    rawTargetAmount === ""
  ) {
    missingFields.push(
      "targetAmount"
    );
  }

  if (!targetDate) {
    missingFields.push(
      "targetDate"
    );
  }

  if (missingFields.length > 0) {
    throw createHookError({
      message:
        `Savings goal is missing required field(s): ${missingFields.join(
          ", "
        )}.`,
      code:
        "SAVINGS_GOAL_REQUIRED_FIELDS",
      details: {
        fields: missingFields,
      },
    });
  }

  if (
    !Number.isFinite(targetAmount) ||
    targetAmount <= 0
  ) {
    throw createHookError({
      message:
        "Savings goal target amount must be greater than zero.",
      code:
        "INVALID_SAVINGS_GOAL_TARGET_AMOUNT",
      details: {
        field: "targetAmount",
      },
    });
  }

  return {
    name,
    targetAmount,
    currency,
    targetDate,

    ...(description
      ? { description }
      : {}),
  };
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

  const normalizedInitialFilters =
    useMemo(
      () =>
        normalizeFilters(
          initialFilters
        ),
      [initialFilters]
    );

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
     REQUEST LIFECYCLE
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
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      mutationIdRef.current += 1;

      abortControllerRef.current?.abort();

      abortControllerRef.current =
        null;
    };
  }, []);

  /* =======================================================
     FILTER KEY
  ======================================================= */

  const filterKey = useMemo(
    () =>
      createFilterKey(filters),
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
          ...filters,
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
          controller.signal.aborted ||
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
            pagination:
              nextPagination,
            raw: response,
          };
        }

        setGoals(nextGoals);

        setPagination(
          nextPagination
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
    [filters]
  );

  /* =======================================================
     AUTOMATIC FETCH
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
        // fetchGoals owns error state.
      }
    };

    void loadGoals();

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
              method: methodName,
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
              method: methodName,
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

          return {
            ...DEFAULT_FILTERS,
          };
        }
      );
    },
    []
  );

  /* =======================================================
     PAGINATION
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
    useCallback(
      () => {
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
      [pagination.hasPreviousPage]
    );

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

        const response =
          await method(goalId);

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

  const activeGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal.status ===
            "active"
        ),
      [goals]
    );

  const completedGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal.status ===
            "completed"
        ),
      [goals]
    );

  const pausedGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal.status ===
            "paused"
        ),
      [goals]
    );

  const cancelledGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal.status ===
            "cancelled"
        ),
      [goals]
    );

  /* =======================================================
     FLAGS
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

  const reset = useCallback(
    () => {
      requestIdRef.current += 1;

      mutationIdRef.current += 1;

      abortControllerRef.current?.abort();

      abortControllerRef.current =
        null;

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
      /* Goals */
      goals,
      items: goals,

      /* Derived collections */
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

      /* Single-goal operations */
      getGoal,
      getGoalSummary,
      getGoalContributions,
      getGoalHistory,
      checkEligibility,

      /* Mutations */
      createGoal,
      updateGoal,
      deleteGoal,

      /* Fetching */
      fetchGoals,
      refresh,
      refreshGoals,

      /* Reset */
      reset,

      /* Loading */
      loading,
      refreshing,
      isLoading,
      isRefreshing,

      /* Errors */
      error,
      hasError,

      /* Convenience flags */
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