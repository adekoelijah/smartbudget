
// hooks/useSavingsStrategies.js

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

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const INITIAL_STATE = {
  plans: EMPTY_ARRAY,
  schedules: EMPTY_ARRAY,
  autoSaves: EMPTY_ARRAY,

  strategies: EMPTY_ARRAY,

  loading: false,
  refreshing: false,

  error: null,

  plansPagination: null,
  schedulesPagination: null,
  autoSavesPagination: null,
};

/* ============================================================
   ERROR NORMALIZATION
============================================================ */

const normalizeError = (error) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return {
      message:
        message || "Unable to load savings strategies.",
      code: "SAVINGS_STRATEGY_ERROR",
      status: null,
      details: null,
    };
  }

  const responseData = error?.response?.data;

  const message =
    responseData?.message ??
    responseData?.error ??
    error?.message ??
    error?.error ??
    "Unable to load savings strategies.";

  return {
    message:
      typeof message === "string" && message.trim()
        ? message.trim()
        : "Unable to load savings strategies.",

    code:
      responseData?.code ??
      error?.code ??
      "SAVINGS_STRATEGY_ERROR",

    status:
      error?.response?.status ??
      error?.statusCode ??
      error?.status ??
      null,

    details:
      responseData?.details ??
      error?.details ??
      null,
  };
};

/* ============================================================
   ABORT DETECTION
============================================================ */

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.code === "ERR_CANCELED" ||
    error?.message === "canceled" ||
    error?.message === "aborted"
  );
};

/* ============================================================
   SAFE ARRAY EXTRACTION
============================================================ */

const extractArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return EMPTY_ARRAY;
  }

  const candidates = [
    value.data,
    value.items,
    value.results,
    value.plans,
    value.schedules,
    value.autoSaves,
    value.strategies,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return EMPTY_ARRAY;
};

/* ============================================================
   RESPONSE DATA EXTRACTION
============================================================ */

const extractResponseData = (response) => {
  if (response == null) {
    return null;
  }

  if (
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    return response.data;
  }

  return response;
};

/* ============================================================
   PAGINATION EXTRACTION
============================================================ */

const extractPagination = (response) => {
  if (!response || typeof response !== "object") {
    return null;
  }

  return (
    response.pagination ??
    response.meta?.pagination ??
    response.meta ??
    null
  );
};

/* ============================================================
   FILTER SANITIZATION
============================================================ */

const sanitizeFilters = (filters) => {
  if (!filters || typeof filters !== "object") {
    return EMPTY_OBJECT;
  }

  const result = {};

  for (const [key, value] of Object.entries(filters)) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    result[key] = value;
  }

  return Object.keys(result).length
    ? result
    : EMPTY_OBJECT;
};

/* ============================================================
   ID RESOLUTION
============================================================ */

const getResourceId = (resource) => {
  if (!resource) {
    return null;
  }

  if (typeof resource === "string") {
    const value = resource.trim();

    return value || null;
  }

  const id =
    resource?._id ??
    resource?.id ??
    resource?.planId ??
    resource?.strategyId ??
    resource?.scheduleId ??
    resource?.autoSaveId;

  if (id === undefined || id === null) {
    return null;
  }

  const value = String(id).trim();

  return value || null;
};

/* ============================================================
   STATUS NORMALIZATION
============================================================ */

const normalizeStatus = (resource) => {
  const status =
    resource?.status ??
    resource?.state ??
    "";

  if (typeof status !== "string") {
    return "";
  }

  return status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

/* ============================================================
   ACTIVE CHECK
============================================================ */

const isActive = (resource) => {
  const status = normalizeStatus(resource);

  return (
    status === "active" ||
    status === "running" ||
    status === "enabled"
  );
};

/* ============================================================
   STRATEGY TYPE RESOLUTION
============================================================ */

const getStrategyType = (resource) => {
  if (!resource || typeof resource !== "object") {
    return "unknown";
  }

  const value =
    resource?.strategyType ??
    resource?.strategy ??
    resource?.type ??
    resource?.method ??
    resource?.kind ??
    resource?.planType ??
    "";

  if (typeof value !== "string") {
    return "unknown";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

/* ============================================================
   STRATEGY NORMALIZATION
============================================================ */

/*
 * A strategy may come from:
 *
 *   plans
 *   schedules
 *   autoSaves
 *
 * We preserve the original resource while adding a small
 * amount of metadata that makes it safe for the frontend.
 */

const normalizeStrategy = (
  resource,
  source
) => {
  if (
    !resource ||
    typeof resource !== "object"
  ) {
    return null;
  }

  const id = getResourceId(resource);

  if (!id) {
    return null;
  }

  return {
    ...resource,

    id,

    strategyId:
      resource.strategyId ??
      id,

    strategySource:
      resource.strategySource ??
      source,

    strategyType:
      resource.strategyType ??
      getStrategyType(resource),

    normalizedStatus:
      normalizeStatus(resource),

    isActive:
      typeof resource.isActive === "boolean"
        ? resource.isActive
        : isActive(resource),
  };
};

/* ============================================================
   STRATEGY COLLECTION
============================================================ */

const buildStrategies = ({
  plans,
  schedules,
  autoSaves,
}) => {
  const result = [];

  for (const plan of plans) {
    const normalized = normalizeStrategy(
      plan,
      "plan"
    );

    if (normalized) {
      result.push(normalized);
    }
  }

  for (const schedule of schedules) {
    const normalized = normalizeStrategy(
      schedule,
      "schedule"
    );

    if (normalized) {
      result.push(normalized);
    }
  }

  for (const autoSave of autoSaves) {
    const normalized = normalizeStrategy(
      autoSave,
      "autosave"
    );

    if (normalized) {
      result.push(normalized);
    }
  }

  return result;
};

/* ============================================================
   HOOK
============================================================ */

const useSavingsStrategies = ({
  autoFetch = true,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  planFilters = EMPTY_OBJECT,
  scheduleFilters = EMPTY_OBJECT,
  autoSaveFilters = EMPTY_OBJECT,
} = {}) => {
  /* ==========================================================
     STATE
  ========================================================== */

  const [state, setState] =
    useState(INITIAL_STATE);

  /* ==========================================================
     LIFECYCLE
  ========================================================== */

  const mountedRef =
    useRef(false);

  const initialFetchRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  const abortControllerRef =
    useRef(null);

  /*
   * Keeps the latest configuration available to stable
   * callbacks without forcing those callbacks to change
   * identity every render.
   */
  const configRef = useRef({
    page,
    limit,
    planFilters,
    scheduleFilters,
    autoSaveFilters,
  });

  configRef.current = {
    page,
    limit,
    planFilters: sanitizeFilters(
      planFilters
    ),
    scheduleFilters: sanitizeFilters(
      scheduleFilters
    ),
    autoSaveFilters: sanitizeFilters(
      autoSaveFilters
    ),
  };

  /*
   * Keeps the latest state available to stable callbacks.
   */
  const stateRef = useRef(state);

  stateRef.current = state;

  /* ==========================================================
     MOUNT / UNMOUNT
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();

        abortControllerRef.current = null;
      }
    };
  }, []);

  /* ==========================================================
     SAFE STATE UPDATE
  ========================================================== */

  const updateState = useCallback(
    (updater) => {
      if (!mountedRef.current) {
        return;
      }

      setState(updater);
    },
    []
  );

  /* ==========================================================
     CANCEL ACTIVE FETCH
  ========================================================== */

  const cancelActiveFetch =
    useCallback(() => {
      if (!abortControllerRef.current) {
        return;
      }

      abortControllerRef.current.abort();

      abortControllerRef.current = null;
    }, []);

  /* ==========================================================
     START COMBINED FETCH
  ========================================================== */

  const startFetch = useCallback(() => {
    requestIdRef.current += 1;

    const requestId =
      requestIdRef.current;

    cancelActiveFetch();

    const controller =
      new AbortController();

    abortControllerRef.current =
      controller;

    return {
      requestId,
      signal: controller.signal,
    };
  }, [cancelActiveFetch]);

  /* ==========================================================
     REQUEST VALIDATION
  ========================================================== */

  const isCurrentRequest =
    useCallback(
      (requestId) => {
        return (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        );
      },
      []
    );

  /* ==========================================================
     FINISH FETCH
  ========================================================== */

  const finishFetch = useCallback(
    (requestId) => {
      if (
        requestId ===
          requestIdRef.current &&
        abortControllerRef.current
      ) {
        abortControllerRef.current =
          null;
      }
    },
    []
  );

  /* ==========================================================
     FETCH ALL STRATEGIES
  ========================================================== */

  const fetchStrategies =
    useCallback(
      async ({
        planOptions = EMPTY_OBJECT,
        scheduleOptions = EMPTY_OBJECT,
        autoSaveOptions = EMPTY_OBJECT,
      } = {}) => {
        if (!mountedRef.current) {
          return null;
        }

        const {
          page: currentPage,
          limit: currentLimit,
          planFilters: currentPlanFilters,
          scheduleFilters:
            currentScheduleFilters,
          autoSaveFilters:
            currentAutoSaveFilters,
        } = configRef.current;

        const previousState =
          stateRef.current;

        const hasExistingData =
          previousState.plans.length > 0 ||
          previousState.schedules.length > 0 ||
          previousState.autoSaves.length > 0;

        const {
          requestId,
          signal,
        } = startFetch();

        updateState((previous) => ({
          ...previous,

          loading: !hasExistingData,

          refreshing: hasExistingData,

          error: null,
        }));

        try {
          const [
            plansResponse,
            schedulesResponse,
            autoSavesResponse,
          ] = await Promise.all([
            smartSaveService.getSavingPlans({
              page: currentPage,
              limit: currentLimit,
              ...currentPlanFilters,
              ...planOptions,
              signal,
            }),

            smartSaveService.getSavingSchedules({
              page: currentPage,
              limit: currentLimit,
              ...currentScheduleFilters,
              ...scheduleOptions,
              signal,
            }),

            smartSaveService.getAutoSaves({
              page: currentPage,
              limit: currentLimit,
              ...currentAutoSaveFilters,
              ...autoSaveOptions,
              signal,
            }),
          ]);

          if (
            !isCurrentRequest(requestId)
          ) {
            return null;
          }

          const plansData =
            extractResponseData(
              plansResponse
            );

          const schedulesData =
            extractResponseData(
              schedulesResponse
            );

          const autoSavesData =
            extractResponseData(
              autoSavesResponse
            );

          const plans =
            extractArray(plansData);

          const schedules =
            extractArray(
              schedulesData
            );

          const autoSaves =
            extractArray(
              autoSavesData
            );

          const strategies =
            buildStrategies({
              plans,
              schedules,
              autoSaves,
            });

          const plansPagination =
            extractPagination(
              plansResponse
            ) ??
            extractPagination(
              plansData
            );

          const schedulesPagination =
            extractPagination(
              schedulesResponse
            ) ??
            extractPagination(
              schedulesData
            );

          const autoSavesPagination =
            extractPagination(
              autoSavesResponse
            ) ??
            extractPagination(
              autoSavesData
            );

          updateState((previous) => ({
            ...previous,

            plans,
            schedules,
            autoSaves,

            strategies,

            plansPagination,
            schedulesPagination,
            autoSavesPagination,

            loading: false,
            refreshing: false,

            error: null,
          }));

          return {
            plans: plansResponse,
            schedules:
              schedulesResponse,
            autoSaves:
              autoSavesResponse,
            strategies,
          };
        } catch (error) {
          if (
            !isCurrentRequest(
              requestId
            ) ||
            isAbortError(error)
          ) {
            return null;
          }

          const normalizedError =
            normalizeError(error);

          updateState((previous) => ({
            ...previous,

            loading: false,

            refreshing: false,

            error: normalizedError,
          }));

          return null;
        } finally {
          finishFetch(requestId);
        }
      },
      [
        startFetch,
        isCurrentRequest,
        finishFetch,
        updateState,
      ]
    );

  /* ==========================================================
     FETCH PLANS
  ========================================================== */

  const fetchPlans =
    useCallback(
      async ({
        page: requestedPage,
        limit: requestedLimit,
        ...filters
      } = {}) => {
        if (!mountedRef.current) {
          return null;
        }

        const config =
          configRef.current;

        try {
          const response =
            await smartSaveService.getSavingPlans(
              {
                page:
                  requestedPage ??
                  config.page,

                limit:
                  requestedLimit ??
                  config.limit,

                ...config.planFilters,
                ...filters,
              }
            );

          if (!mountedRef.current) {
            return null;
          }

          const data =
            extractResponseData(
              response
            );

          const plans =
            extractArray(data);

          const pagination =
            extractPagination(
              response
            ) ??
            extractPagination(data);

          updateState((previous) => {
            const strategies =
              buildStrategies({
                plans,
                schedules:
                  previous.schedules,
                autoSaves:
                  previous.autoSaves,
              });

            return {
              ...previous,

              plans,
              plansPagination:
                pagination,

              strategies,

              error: null,
            };
          });

          return response;
        } catch (error) {
          if (
            isAbortError(error)
          ) {
            return null;
          }

          updateState((previous) => ({
            ...previous,

            error:
              normalizeError(error),
          }));

          return null;
        }
      },
      [updateState]
    );

  /* ==========================================================
     FETCH SCHEDULES
  ========================================================== */

  const fetchSchedules =
    useCallback(
      async ({
        page: requestedPage,
        limit: requestedLimit,
        ...filters
      } = {}) => {
        if (!mountedRef.current) {
          return null;
        }

        const config =
          configRef.current;

        try {
          const response =
            await smartSaveService.getSavingSchedules(
              {
                page:
                  requestedPage ??
                  config.page,

                limit:
                  requestedLimit ??
                  config.limit,

                ...config.scheduleFilters,
                ...filters,
              }
            );

          if (!mountedRef.current) {
            return null;
          }

          const data =
            extractResponseData(
              response
            );

          const schedules =
            extractArray(data);

          const pagination =
            extractPagination(
              response
            ) ??
            extractPagination(data);

          updateState((previous) => {
            const strategies =
              buildStrategies({
                plans:
                  previous.plans,
                schedules,
                autoSaves:
                  previous.autoSaves,
              });

            return {
              ...previous,

              schedules,

              schedulesPagination:
                pagination,

              strategies,

              error: null,
            };
          });

          return response;
        } catch (error) {
          if (
            isAbortError(error)
          ) {
            return null;
          }

          updateState((previous) => ({
            ...previous,

            error:
              normalizeError(error),
          }));

          return null;
        }
      },
      [updateState]
    );

  /* ==========================================================
     FETCH AUTOSAVES
  ========================================================== */

  const fetchAutoSaves =
    useCallback(
      async ({
        page: requestedPage,
        limit: requestedLimit,
        ...filters
      } = {}) => {
        if (!mountedRef.current) {
          return null;
        }

        const config =
          configRef.current;

        try {
          const response =
            await smartSaveService.getAutoSaves(
              {
                page:
                  requestedPage ??
                  config.page,

                limit:
                  requestedLimit ??
                  config.limit,

                ...config.autoSaveFilters,
                ...filters,
              }
            );

          if (!mountedRef.current) {
            return null;
          }

          const data =
            extractResponseData(
              response
            );

          const autoSaves =
            extractArray(data);

          const pagination =
            extractPagination(
              response
            ) ??
            extractPagination(data);

          updateState((previous) => {
            const strategies =
              buildStrategies({
                plans:
                  previous.plans,
                schedules:
                  previous.schedules,
                autoSaves,
              });

            return {
              ...previous,

              autoSaves,

              autoSavesPagination:
                pagination,

              strategies,

              error: null,
            };
          });

          return response;
        } catch (error) {
          if (
            isAbortError(error)
          ) {
            return null;
          }

          updateState((previous) => ({
            ...previous,

            error:
              normalizeError(error),
          }));

          return null;
        }
      },
      [updateState]
    );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(async () => {
      return fetchStrategies();
    }, [fetchStrategies]);

  /* ==========================================================
     PLAN OPERATIONS
  ========================================================== */

  const createPlan =
    useCallback(
      (payload) =>
        smartSaveService.createSavingPlan(
          payload
        ),
      []
    );

  const updatePlan =
    useCallback(
      (planId, payload) =>
        smartSaveService.updateSavingPlan(
          planId,
          payload
        ),
      []
    );

  const activatePlan =
    useCallback(
      (planId) =>
        smartSaveService.activateSavingPlan(
          planId
        ),
      []
    );

  const pausePlan =
    useCallback(
      (planId, payload = {}) =>
        smartSaveService.pauseSavingPlan(
          planId,
          payload
        ),
      []
    );

  const resumePlan =
    useCallback(
      (planId) =>
        smartSaveService.resumeSavingPlan(
          planId
        ),
      []
    );

  const completePlan =
    useCallback(
      (planId, payload = {}) =>
        smartSaveService.completeSavingPlan(
          planId,
          payload
        ),
      []
    );

  const cancelPlan =
    useCallback(
      (planId, payload = {}) =>
        smartSaveService.cancelSavingPlan(
          planId,
          payload
        ),
      []
    );

  const recalculatePlanMetrics =
    useCallback(
      (planId) =>
        smartSaveService.recalculateSavingPlanMetrics(
          planId
        ),
      []
    );

  const refreshPlanProgress =
    useCallback(
      (planId) =>
        smartSaveService.refreshSavingPlanProgress(
          planId
        ),
      []
    );

  const getPlanStats =
    useCallback(
      (planId) =>
        smartSaveService.getSavingPlanStatistics(
          planId
        ),
      []
    );

  const checkPlanEligibility =
    useCallback(
      (planId) =>
        smartSaveService.checkSavingPlanEligibility(
          planId
        ),
      []
    );

  /* ==========================================================
     SCHEDULE OPERATIONS
  ========================================================== */

  const createSchedule =
    useCallback(
      (payload) =>
        smartSaveService.createSavingSchedule(
          payload
        ),
      []
    );

  const updateSchedule =
    useCallback(
      (scheduleId, payload) =>
        smartSaveService.updateSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const activateSchedule =
    useCallback(
      (scheduleId, payload = {}) =>
        smartSaveService.activateSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const pauseSchedule =
    useCallback(
      (scheduleId, payload = {}) =>
        smartSaveService.pauseSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const resumeSchedule =
    useCallback(
      (scheduleId, payload = {}) =>
        smartSaveService.resumeSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const cancelSchedule =
    useCallback(
      (scheduleId, payload = {}) =>
        smartSaveService.cancelSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const completeSchedule =
    useCallback(
      (scheduleId) =>
        smartSaveService.completeSavingSchedule(
          scheduleId
        ),
      []
    );

  const deleteSchedule =
    useCallback(
      (scheduleId) =>
        smartSaveService.deleteSavingSchedule(
          scheduleId
        ),
      []
    );

  const getScheduleStats =
    useCallback(
      (scheduleId) =>
        smartSaveService.getSavingScheduleStats(
          scheduleId
        ),
      []
    );

  /* ==========================================================
     AUTOSAVE OPERATIONS
  ========================================================== */

  const createAutoSave =
    useCallback(
      (payload) =>
        smartSaveService.createAutoSave(
          payload
        ),
      []
    );

  const updateAutoSave =
    useCallback(
      (autoSaveId, payload) =>
        smartSaveService.updateAutoSave(
          autoSaveId,
          payload
        ),
      []
    );

  const activateAutoSave =
    useCallback(
      (autoSaveId) =>
        smartSaveService.activateAutoSave(
          autoSaveId
        ),
      []
    );

  const pauseAutoSave =
    useCallback(
      (autoSaveId) =>
        smartSaveService.pauseAutoSave(
          autoSaveId
        ),
      []
    );

  const resumeAutoSave =
    useCallback(
      (autoSaveId) =>
        smartSaveService.resumeAutoSave(
          autoSaveId
        ),
      []
    );

  const cancelAutoSave =
    useCallback(
      (autoSaveId) =>
        smartSaveService.cancelAutoSave(
          autoSaveId
        ),
      []
    );

  const deleteAutoSave =
    useCallback(
      (autoSaveId) =>
        smartSaveService.deleteAutoSave(
          autoSaveId
        ),
      []
    );

  const getAutoSaveStats =
    useCallback(
      (autoSaveId) =>
        smartSaveService.getAutoSaveStats(
          autoSaveId
        ),
      []
    );

  /* ==========================================================
     AUTOMATION
  ========================================================== */

  const attachAutomation =
    useCallback(
      (planId, payload) =>
        smartSaveService.attachSavingPlanAutomation(
          planId,
          payload
        ),
      []
    );

  const detachAutomation =
    useCallback(
      (planId) =>
        smartSaveService.detachSavingPlanAutomation(
          planId
        ),
      []
    );

  /* ==========================================================
     STRATEGY ACTION ALIASES
     
     These aliases make the hook directly compatible with
     SavingsStrategiesPage.
  ========================================================== */

  const activateStrategy =
    useCallback(
      (strategyId) =>
        activatePlan(strategyId),
      [activatePlan]
    );

  const pauseStrategy =
    useCallback(
      (strategyId, payload = {}) =>
        pausePlan(
          strategyId,
          payload
        ),
      [pausePlan]
    );

  const resumeStrategy =
    useCallback(
      (strategyId) =>
        resumePlan(strategyId),
      [resumePlan]
    );

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const activePlans = useMemo(
    () =>
      state.plans.filter(
        (plan) =>
          isActive(plan)
      ),
    [state.plans]
  );

  const activeSchedules = useMemo(
    () =>
      state.schedules.filter(
        (schedule) =>
          isActive(schedule)
      ),
    [state.schedules]
  );

  const activeAutoSaves = useMemo(
    () =>
      state.autoSaves.filter(
        (autoSave) =>
          isActive(autoSave)
      ),
    [state.autoSaves]
  );

  const strategyCount =
    state.strategies.length;

  const hasStrategies =
    strategyCount > 0;

  const activeStrategyCount =
    useMemo(
      () =>
        state.strategies.filter(
          (strategy) =>
            strategy?.isActive === true
        ).length,
      [state.strategies]
    );

  /* ==========================================================
     INITIAL FETCH
     
     IMPORTANT:
     
     fetchStrategies has a stable identity.
     
     The effect depends only on autoFetch.
     
     Therefore:
     
       render
          ↓
       effect
          ↓
       one request
          ↓
       state update
          ↓
       render
     
     does NOT create another request.
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    if (initialFetchRef.current) {
      return undefined;
    }

    initialFetchRef.current = true;

    void fetchStrategies();

    return undefined;
  }, [autoFetch, fetchStrategies]);

  /* ==========================================================
     CLEAR ERROR
  ========================================================== */

  const clearError =
    useCallback(() => {
      updateState((previous) => ({
        ...previous,
        error: null,
      }));
    }, [updateState]);

  /* ==========================================================
     RETURN API
  ========================================================== */

  return {
    /* ========================================================
       STATE
    ======================================================== */

    ...state,

    /* ========================================================
       DERIVED
    ======================================================== */

    activePlans,
    activeSchedules,
    activeAutoSaves,

    strategyCount,
    activeStrategyCount,
    hasStrategies,

    /* ========================================================
       FETCHING
    ======================================================== */

    fetchStrategies,
    fetchPlans,
    fetchSchedules,
    fetchAutoSaves,

    refresh,

    /* ========================================================
       STRATEGY ACTIONS
    ======================================================== */

    activateStrategy,
    pauseStrategy,
    resumeStrategy,

    /* ========================================================
       PLAN OPERATIONS
    ======================================================== */

    createPlan,
    updatePlan,

    activatePlan,
    pausePlan,
    resumePlan,

    completePlan,
    cancelPlan,

    recalculatePlanMetrics,
    refreshPlanProgress,

    getPlanStats,
    checkPlanEligibility,

    /* ========================================================
       SCHEDULE OPERATIONS
    ======================================================== */

    createSchedule,
    updateSchedule,

    activateSchedule,
    pauseSchedule,
    resumeSchedule,

    cancelSchedule,
    completeSchedule,
    deleteSchedule,

    getScheduleStats,

    /* ========================================================
       AUTOSAVE OPERATIONS
    ======================================================== */

    createAutoSave,
    updateAutoSave,

    activateAutoSave,
    pauseAutoSave,
    resumeAutoSave,

    cancelAutoSave,
    deleteAutoSave,

    getAutoSaveStats,

    /* ========================================================
       AUTOMATION
    ======================================================== */

    attachAutomation,
    detachAutomation,

    /* ========================================================
       ERROR
    ======================================================== */

    clearError,

    /* ========================================================
       REQUEST CONTROL
    ======================================================== */

    cancelActiveFetch,
  };
};

export default useSavingsStrategies;

