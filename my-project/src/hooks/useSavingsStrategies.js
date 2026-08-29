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

const EMPTY_FILTERS = Object.freeze({});

const INITIAL_STATE = {
  plans: [],
  schedules: [],
  autoSaves: [],

  loading: false,
  refreshing: false,

  error: null,

  plansPagination: null,
  schedulesPagination: null,
  autoSavesPagination: null,
};

/* ============================================================
   SAFE ERROR NORMALIZATION
============================================================ */

const normalizeError = (error) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return {
      message:
        error.trim() ||
        "Unable to load savings strategies.",
      code: "SAVINGS_STRATEGY_ERROR",
      status: null,
      details: null,
    };
  }

  return {
    message:
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to load savings strategies.",

    code:
      error?.response?.data?.code ||
      error?.code ||
      "SAVINGS_STRATEGY_ERROR",

    status:
      error?.response?.status ||
      error?.statusCode ||
      error?.status ||
      null,

    details:
      error?.response?.data?.details ||
      error?.details ||
      null,
  };
};

/* ============================================================
   SAFE ARRAY NORMALIZATION
============================================================ */

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return EMPTY_ARRAY;
  }

  if (Array.isArray(value.data)) {
    return value.data;
  }

  if (Array.isArray(value.items)) {
    return value.items;
  }

  if (Array.isArray(value.results)) {
    return value.results;
  }

  if (Array.isArray(value.plans)) {
    return value.plans;
  }

  if (Array.isArray(value.schedules)) {
    return value.schedules;
  }

  if (Array.isArray(value.autoSaves)) {
    return value.autoSaves;
  }

  return EMPTY_ARRAY;
};

/* ============================================================
   RESPONSE DATA HELPERS
============================================================ */

const extractData = (response) => {
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

const extractPagination = (response) => {
  if (!response || typeof response !== "object") {
    return null;
  }

  return (
    response.pagination ||
    response.meta?.pagination ||
    response.meta ||
    null
  );
};

/* ============================================================
   ABORT ERROR DETECTION
============================================================ */

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ECONNABORTED" ||
    error?.message === "canceled" ||
    error?.message === "aborted"
  );
};

/* ============================================================
   FILTER SANITIZATION
============================================================ */

const sanitizeFilters = (filters) => {
  if (!filters || typeof filters !== "object") {
    return EMPTY_FILTERS;
  }

  return filters;
};

/* ============================================================
   HOOK
============================================================ */

const useSavingsStrategies = ({
  autoFetch = true,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  planFilters = EMPTY_FILTERS,
  scheduleFilters = EMPTY_FILTERS,
  autoSaveFilters = EMPTY_FILTERS,
} = {}) => {
  /* ==========================================================
     STATE
  ========================================================== */

  const [state, setState] = useState(INITIAL_STATE);

  /* ==========================================================
     LIFECYCLE REFS
  ========================================================== */

  const mountedRef = useRef(false);

  const requestIdRef = useRef(0);

  const abortControllerRef = useRef(null);

  /*
   * Prevents the automatic effect from issuing the same
   * initial request repeatedly during the component lifecycle.
   */
  const initialFetchStartedRef = useRef(false);

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
     SAFE FILTERS
  ========================================================== */

  const safePlanFilters = useMemo(() => {
    return sanitizeFilters(planFilters);
  }, [planFilters]);

  const safeScheduleFilters = useMemo(() => {
    return sanitizeFilters(scheduleFilters);
  }, [scheduleFilters]);

  const safeAutoSaveFilters = useMemo(() => {
    return sanitizeFilters(autoSaveFilters);
  }, [autoSaveFilters]);

  /* ==========================================================
     SAFE STATE UPDATE
  ========================================================== */

  const updateState = useCallback((updater) => {
    if (!mountedRef.current) {
      return;
    }

    setState(updater);
  }, []);

  /* ==========================================================
     START REQUEST
  ========================================================== */

  const startRequest = useCallback(() => {
    requestIdRef.current += 1;

    const requestId = requestIdRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    return {
      requestId,
      signal: controller.signal,
    };
  }, []);

  /* ==========================================================
     REQUEST VALIDATION
  ========================================================== */

  const isCurrentRequest = useCallback(
    (requestId) => {
      return (
        mountedRef.current &&
        requestId === requestIdRef.current
      );
    },
    []
  );

  /* ==========================================================
     FINISH REQUEST
  ========================================================== */

  const finishRequest = useCallback(
    (requestId) => {
      if (
        requestId === requestIdRef.current &&
        abortControllerRef.current
      ) {
        abortControllerRef.current = null;
      }
    },
    []
  );

  /* ==========================================================
     FETCH PLANS
  ========================================================== */

  const fetchPlans = useCallback(
    async ({
      page: requestedPage = page,
      limit: requestedLimit = limit,
      ...filters
    } = {}) => {
      const {
        requestId,
        signal,
      } = startRequest();

      updateState((previous) => ({
        ...previous,

        loading:
          previous.plans.length === 0
            ? true
            : previous.loading,

        error: null,
      }));

      try {
        const response =
          await smartSaveService.getSavingPlans({
            page: requestedPage,
            limit: requestedLimit,
            ...safePlanFilters,
            ...filters,
            signal,
          });

        if (!isCurrentRequest(requestId)) {
          return null;
        }

        const data = extractData(response);

        const plans = normalizeArray(data);

        const pagination =
          extractPagination(response) ||
          extractPagination(data);

        updateState((previous) => ({
          ...previous,

          plans,

          plansPagination: pagination,

          loading: false,

          error: null,
        }));

        return response;
      } catch (error) {
        if (
          !isCurrentRequest(requestId) ||
          isAbortError(error)
        ) {
          return null;
        }

        updateState((previous) => ({
          ...previous,

          loading: false,

          error: normalizeError(error),
        }));

        return null;
      } finally {
        finishRequest(requestId);
      }
    },
    [
      page,
      limit,
      safePlanFilters,
      startRequest,
      isCurrentRequest,
      finishRequest,
      updateState,
    ]
  );

  /* ==========================================================
     FETCH SCHEDULES
  ========================================================== */

  const fetchSchedules = useCallback(
    async ({
      page: requestedPage = page,
      limit: requestedLimit = limit,
      ...filters
    } = {}) => {
      const {
        requestId,
        signal,
      } = startRequest();

      updateState((previous) => ({
        ...previous,

        loading:
          previous.schedules.length === 0
            ? true
            : previous.loading,

        error: null,
      }));

      try {
        const response =
          await smartSaveService.getSavingSchedules({
            page: requestedPage,
            limit: requestedLimit,
            ...safeScheduleFilters,
            ...filters,
            signal,
          });

        if (!isCurrentRequest(requestId)) {
          return null;
        }

        const data = extractData(response);

        const schedules = normalizeArray(data);

        const pagination =
          extractPagination(response) ||
          extractPagination(data);

        updateState((previous) => ({
          ...previous,

          schedules,

          schedulesPagination: pagination,

          loading: false,

          error: null,
        }));

        return response;
      } catch (error) {
        if (
          !isCurrentRequest(requestId) ||
          isAbortError(error)
        ) {
          return null;
        }

        updateState((previous) => ({
          ...previous,

          loading: false,

          error: normalizeError(error),
        }));

        return null;
      } finally {
        finishRequest(requestId);
      }
    },
    [
      page,
      limit,
      safeScheduleFilters,
      startRequest,
      isCurrentRequest,
      finishRequest,
      updateState,
    ]
  );

  /* ==========================================================
     FETCH AUTOSAVES
  ========================================================== */

  const fetchAutoSaves = useCallback(
    async ({
      page: requestedPage = page,
      limit: requestedLimit = limit,
      ...filters
    } = {}) => {
      const {
        requestId,
        signal,
      } = startRequest();

      updateState((previous) => ({
        ...previous,

        loading:
          previous.autoSaves.length === 0
            ? true
            : previous.loading,

        error: null,
      }));

      try {
        const response =
          await smartSaveService.getAutoSaves({
            page: requestedPage,
            limit: requestedLimit,
            ...safeAutoSaveFilters,
            ...filters,
            signal,
          });

        if (!isCurrentRequest(requestId)) {
          return null;
        }

        const data = extractData(response);

        const autoSaves = normalizeArray(data);

        const pagination =
          extractPagination(response) ||
          extractPagination(data);

        updateState((previous) => ({
          ...previous,

          autoSaves,

          autoSavesPagination: pagination,

          loading: false,

          error: null,
        }));

        return response;
      } catch (error) {
        if (
          !isCurrentRequest(requestId) ||
          isAbortError(error)
        ) {
          return null;
        }

        updateState((previous) => ({
          ...previous,

          loading: false,

          error: normalizeError(error),
        }));

        return null;
      } finally {
        finishRequest(requestId);
      }
    },
    [
      page,
      limit,
      safeAutoSaveFilters,
      startRequest,
      isCurrentRequest,
      finishRequest,
      updateState,
    ]
  );

  /* ==========================================================
     FETCH ALL STRATEGIES
     
     IMPORTANT:
     This is the ONLY function used by the automatic
     strategy-page fetch.
  ========================================================== */

  const fetchStrategies = useCallback(
    async ({
      planOptions = {},
      scheduleOptions = {},
      autoSaveOptions = {},
    } = {}) => {
      const {
        requestId,
        signal,
      } = startRequest();

      const hasExistingData =
        state.plans.length > 0 ||
        state.schedules.length > 0 ||
        state.autoSaves.length > 0;

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
            page,
            limit,
            ...safePlanFilters,
            ...planOptions,
            signal,
          }),

          smartSaveService.getSavingSchedules({
            page,
            limit,
            ...safeScheduleFilters,
            ...scheduleOptions,
            signal,
          }),

          smartSaveService.getAutoSaves({
            page,
            limit,
            ...safeAutoSaveFilters,
            ...autoSaveOptions,
            signal,
          }),
        ]);

        if (!isCurrentRequest(requestId)) {
          return null;
        }

        const plansData =
          extractData(plansResponse);

        const schedulesData =
          extractData(schedulesResponse);

        const autoSavesData =
          extractData(autoSavesResponse);

        updateState((previous) => ({
          ...previous,

          plans:
            normalizeArray(plansData),

          schedules:
            normalizeArray(schedulesData),

          autoSaves:
            normalizeArray(autoSavesData),

          plansPagination:
            extractPagination(
              plansResponse
            ) ||
            extractPagination(
              plansData
            ),

          schedulesPagination:
            extractPagination(
              schedulesResponse
            ) ||
            extractPagination(
              schedulesData
            ),

          autoSavesPagination:
            extractPagination(
              autoSavesResponse
            ) ||
            extractPagination(
              autoSavesData
            ),

          loading: false,

          refreshing: false,

          error: null,
        }));

        return {
          plans: plansResponse,
          schedules: schedulesResponse,
          autoSaves: autoSavesResponse,
        };
      } catch (error) {
        if (
          !isCurrentRequest(requestId) ||
          isAbortError(error)
        ) {
          return null;
        }

        updateState((previous) => ({
          ...previous,

          loading: false,

          refreshing: false,

          error: normalizeError(error),
        }));

        return null;
      } finally {
        finishRequest(requestId);
      }
    },
    [
      page,
      limit,
      safePlanFilters,
      safeScheduleFilters,
      safeAutoSaveFilters,
      state.plans.length,
      state.schedules.length,
      state.autoSaves.length,
      startRequest,
      isCurrentRequest,
      finishRequest,
      updateState,
    ]
  );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh = useCallback(
    async () => {
      if (!mountedRef.current) {
        return null;
      }

      return fetchStrategies();
    },
    [fetchStrategies]
  );

  /* ==========================================================
     PLAN OPERATIONS
  ========================================================== */

  const createPlan = useCallback(
    (payload) =>
      smartSaveService.createSavingPlan(payload),
    []
  );

  const updatePlan = useCallback(
    (planId, payload) =>
      smartSaveService.updateSavingPlan(
        planId,
        payload
      ),
    []
  );

  const activatePlan = useCallback(
    (planId) =>
      smartSaveService.activateSavingPlan(
        planId
      ),
    []
  );

  const pausePlan = useCallback(
    (planId, payload = {}) =>
      smartSaveService.pauseSavingPlan(
        planId,
        payload
      ),
    []
  );

  const resumePlan = useCallback(
    (planId) =>
      smartSaveService.resumeSavingPlan(
        planId
      ),
    []
  );

  const completePlan = useCallback(
    (planId, payload = {}) =>
      smartSaveService.completeSavingPlan(
        planId,
        payload
      ),
    []
  );

  const cancelPlan = useCallback(
    (planId, payload = {}) =>
      smartSaveService.cancelSavingPlan(
        planId,
        payload
      ),
    []
  );

  const recalculatePlanMetrics = useCallback(
    (planId) =>
      smartSaveService.recalculateSavingPlanMetrics(
        planId
      ),
    []
  );

  const refreshPlanProgress = useCallback(
    (planId) =>
      smartSaveService.refreshSavingPlanProgress(
        planId
      ),
    []
  );

  const getPlanStats = useCallback(
    (planId) =>
      smartSaveService.getSavingPlanStatistics(
        planId
      ),
    []
  );

  const checkPlanEligibility = useCallback(
    (planId) =>
      smartSaveService.checkSavingPlanEligibility(
        planId
      ),
    []
  );

  /* ==========================================================
     SCHEDULE OPERATIONS
  ========================================================== */

  const createSchedule = useCallback(
    (payload) =>
      smartSaveService.createSavingSchedule(
        payload
      ),
    []
  );

  const updateSchedule = useCallback(
    (scheduleId, payload) =>
      smartSaveService.updateSavingSchedule(
        scheduleId,
        payload
      ),
    []
  );

  const activateSchedule = useCallback(
    (scheduleId, payload = {}) =>
      smartSaveService.activateSavingSchedule(
        scheduleId,
        payload
      ),
    []
  );

  const pauseSchedule = useCallback(
    (scheduleId, payload = {}) =>
      smartSaveService.pauseSavingSchedule(
        scheduleId,
        payload
      ),
    []
  );

  const resumeSchedule = useCallback(
    (scheduleId, payload = {}) =>
      smartSaveService.resumeSavingSchedule(
        scheduleId,
        payload
      ),
    []
  );

  const cancelSchedule = useCallback(
    (scheduleId, payload = {}) =>
      smartSaveService.cancelSavingSchedule(
        scheduleId,
        payload
      ),
    []
  );

  const completeSchedule = useCallback(
    (scheduleId) =>
      smartSaveService.completeSavingSchedule(
        scheduleId
      ),
    []
  );

  const deleteSchedule = useCallback(
    (scheduleId) =>
      smartSaveService.deleteSavingSchedule(
        scheduleId
      ),
    []
  );

  const getScheduleStats = useCallback(
    (scheduleId) =>
      smartSaveService.getSavingScheduleStats(
        scheduleId
      ),
    []
  );

  /* ==========================================================
     AUTOSAVE OPERATIONS
  ========================================================== */

  const createAutoSave = useCallback(
    (payload) =>
      smartSaveService.createAutoSave(payload),
    []
  );

  const updateAutoSave = useCallback(
    (autoSaveId, payload) =>
      smartSaveService.updateAutoSave(
        autoSaveId,
        payload
      ),
    []
  );

  const activateAutoSave = useCallback(
    (autoSaveId) =>
      smartSaveService.activateAutoSave(
        autoSaveId
      ),
    []
  );

  const pauseAutoSave = useCallback(
    (autoSaveId) =>
      smartSaveService.pauseAutoSave(
        autoSaveId
      ),
    []
  );

  const resumeAutoSave = useCallback(
    (autoSaveId) =>
      smartSaveService.resumeAutoSave(
        autoSaveId
      ),
    []
  );

  const cancelAutoSave = useCallback(
    (autoSaveId) =>
      smartSaveService.cancelAutoSave(
        autoSaveId
      ),
    []
  );

  const deleteAutoSave = useCallback(
    (autoSaveId) =>
      smartSaveService.deleteAutoSave(
        autoSaveId
      ),
    []
  );

  const getAutoSaveStats = useCallback(
    (autoSaveId) =>
      smartSaveService.getAutoSaveStats(
        autoSaveId
      ),
    []
  );

  /* ==========================================================
     AUTOMATION HELPERS
  ========================================================== */

  const attachAutomation = useCallback(
    (planId, payload) =>
      smartSaveService.attachSavingPlanAutomation(
        planId,
        payload
      ),
    []
  );

  const detachAutomation = useCallback(
    (planId) =>
      smartSaveService.detachSavingPlanAutomation(
        planId
      ),
    []
  );

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const activePlans = useMemo(
    () =>
      state.plans.filter(
        (plan) =>
          plan?.status === "active"
      ),
    [state.plans]
  );

  const activeSchedules = useMemo(
    () =>
      state.schedules.filter(
        (schedule) =>
          schedule?.status === "active"
      ),
    [state.schedules]
  );

  const activeAutoSaves = useMemo(
    () =>
      state.autoSaves.filter(
        (autoSave) =>
          autoSave?.status === "active"
      ),
    [state.autoSaves]
  );

  const strategyCount = useMemo(
    () =>
      state.plans.length +
      state.schedules.length +
      state.autoSaves.length,
    [
      state.plans.length,
      state.schedules.length,
      state.autoSaves.length,
    ]
  );

  const hasStrategies =
    strategyCount > 0;

  /* ==========================================================
     AUTOMATIC INITIAL FETCH
     
     CRITICAL:
     We intentionally do NOT depend on fetchStrategies.
     
     Otherwise:
     
       state update
          ↓
       fetchStrategies identity changes
          ↓
       effect runs again
          ↓
       API request
          ↓
       state update
          ↓
       ...
     
     Instead, the initial fetch is explicitly guarded.
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    if (initialFetchStartedRef.current) {
      return undefined;
    }

    initialFetchStartedRef.current = true;

    void fetchStrategies();

    return undefined;
  }, [autoFetch, fetchStrategies]);

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
    hasStrategies,

    /* ========================================================
       FETCHING
    ======================================================== */

    fetchPlans,
    fetchSchedules,
    fetchAutoSaves,
    fetchStrategies,
    refresh,

    /* ========================================================
       PLANS
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
       SCHEDULES
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
       AUTOSAVE
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

    clearError: () => {
      updateState((previous) => ({
        ...previous,
        error: null,
      }));
    },
  };
};

export default useSavingsStrategies;