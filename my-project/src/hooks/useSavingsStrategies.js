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

const EMPTY_ARRAY = [];

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

  return {
    message:
      error?.message ||
      error?.response?.data?.message ||
      "Unable to load savings strategies.",

    code:
      error?.code ||
      error?.response?.data?.code ||
      "SAVINGS_STRATEGY_ERROR",

    status:
      error?.status ||
      error?.statusCode ||
      error?.response?.status ||
      null,

    details:
      error?.details ||
      error?.response?.data?.details ||
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

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return EMPTY_ARRAY;
};

/* ============================================================
   RESPONSE DATA HELPERS
============================================================ */

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

const extractData = (response) => {
  if (!response) {
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
   HOOK
============================================================ */

const useSavingsStrategies = ({
  autoFetch = true,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  planFilters = {},
  scheduleFilters = {},
  autoSaveFilters = {},
} = {}) => {
  /* ==========================================================
     STATE
  ========================================================== */

  const [state, setState] = useState(
    INITIAL_STATE
  );

  const mountedRef = useRef(true);

  const requestIdRef = useRef(0);

  /* ==========================================================
     MOUNT TRACKING
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
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
     FETCH PLANS
  ========================================================== */

  const fetchPlans = useCallback(
    async ({
      page: requestedPage = page,
      limit: requestedLimit = limit,
      ...filters
    } = {}) => {
      const requestId =
        ++requestIdRef.current;

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
            ...planFilters,
            ...filters,
          });

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const data =
          extractData(response);

        const plans =
          normalizeArray(data);

        const pagination =
          extractPagination(response) ||
          extractPagination(data);

        updateState((previous) => ({
          ...previous,
          plans,
          plansPagination:
            pagination,
          loading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const normalized =
          normalizeError(error);

        updateState((previous) => ({
          ...previous,
          loading: false,
          error: normalized,
        }));

        throw error;
      }
    },
    [
      limit,
      page,
      planFilters,
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
      const requestId =
        ++requestIdRef.current;

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
            ...scheduleFilters,
            ...filters,
          });

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const data =
          extractData(response);

        const schedules =
          normalizeArray(data);

        const pagination =
          extractPagination(response) ||
          extractPagination(data);

        updateState((previous) => ({
          ...previous,
          schedules,
          schedulesPagination:
            pagination,
          loading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const normalized =
          normalizeError(error);

        updateState((previous) => ({
          ...previous,
          loading: false,
          error: normalized,
        }));

        throw error;
      }
    },
    [
      limit,
      page,
      scheduleFilters,
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
      const requestId =
        ++requestIdRef.current;

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
            ...autoSaveFilters,
            ...filters,
          });

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const data =
          extractData(response);

        const autoSaves =
          normalizeArray(data);

        const pagination =
          extractPagination(response) ||
          extractPagination(data);

        updateState((previous) => ({
          ...previous,
          autoSaves,
          autoSavesPagination:
            pagination,
          loading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const normalized =
          normalizeError(error);

        updateState((previous) => ({
          ...previous,
          loading: false,
          error: normalized,
        }));

        throw error;
      }
    },
    [
      autoSaveFilters,
      limit,
      page,
      updateState,
    ]
  );

  /* ==========================================================
     FETCH ALL STRATEGIES
  ========================================================== */

  const fetchStrategies = useCallback(
    async ({
      planOptions = {},
      scheduleOptions = {},
      autoSaveOptions = {},
    } = {}) => {
      const requestId =
        ++requestIdRef.current;

      updateState((previous) => ({
        ...previous,
        loading: true,
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
            ...planFilters,
            ...planOptions,
          }),

          smartSaveService.getSavingSchedules({
            page,
            limit,
            ...scheduleFilters,
            ...scheduleOptions,
          }),

          smartSaveService.getAutoSaves({
            page,
            limit,
            ...autoSaveFilters,
            ...autoSaveOptions,
          }),
        ]);

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const plansData =
          extractData(plansResponse);

        const schedulesData =
          extractData(
            schedulesResponse
          );

        const autoSavesData =
          extractData(
            autoSavesResponse
          );

        updateState((previous) => ({
          ...previous,

          plans:
            normalizeArray(
              plansData
            ),

          schedules:
            normalizeArray(
              schedulesData
            ),

          autoSaves:
            normalizeArray(
              autoSavesData
            ),

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
          schedules:
            schedulesResponse,
          autoSaves:
            autoSavesResponse,
        };
      } catch (error) {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        const normalized =
          normalizeError(error);

        updateState((previous) => ({
          ...previous,
          loading: false,
          refreshing: false,
          error: normalized,
        }));

        throw error;
      }
    },
    [
      autoSaveFilters,
      limit,
      page,
      planFilters,
      scheduleFilters,
      updateState,
    ]
  );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh = useCallback(
    async () => {
      updateState((previous) => ({
        ...previous,
        refreshing: true,
        error: null,
      }));

      return fetchStrategies();
    },
    [
      fetchStrategies,
      updateState,
    ]
  );

  /* ==========================================================
     PLAN OPERATIONS
  ========================================================== */

  const createPlan = useCallback(
    async (payload) =>
      smartSaveService.createSavingPlan(
        payload
      ),
    []
  );

  const updatePlan = useCallback(
    async (planId, payload) =>
      smartSaveService.updateSavingPlan(
        planId,
        payload
      ),
    []
  );

  const activatePlan = useCallback(
    async (planId) =>
      smartSaveService.activateSavingPlan(
        planId
      ),
    []
  );

  const pausePlan = useCallback(
    async (planId, payload = {}) =>
      smartSaveService.pauseSavingPlan(
        planId,
        payload
      ),
    []
  );

  const resumePlan = useCallback(
    async (planId) =>
      smartSaveService.resumeSavingPlan(
        planId
      ),
    []
  );

  const completePlan = useCallback(
    async (planId, payload = {}) =>
      smartSaveService.completeSavingPlan(
        planId,
        payload
      ),
    []
  );

  const cancelPlan = useCallback(
    async (planId, payload = {}) =>
      smartSaveService.cancelSavingPlan(
        planId,
        payload
      ),
    []
  );

  const recalculatePlanMetrics =
    useCallback(
      async (planId) =>
        smartSaveService.recalculateSavingPlanMetrics(
          planId
        ),
      []
    );

  const refreshPlanProgress =
    useCallback(
      async (planId) =>
        smartSaveService.refreshSavingPlanProgress(
          planId
        ),
      []
    );

  const getPlanStats = useCallback(
    async (planId) =>
      smartSaveService.getSavingPlanStatistics(
        planId
      ),
    []
  );

  const checkPlanEligibility =
    useCallback(
      async (planId) =>
        smartSaveService.checkSavingPlanEligibility(
          planId
        ),
      []
    );

  /* ==========================================================
     SCHEDULE OPERATIONS
  ========================================================== */

  const createSchedule = useCallback(
    async (payload) =>
      smartSaveService.createSavingSchedule(
        payload
      ),
    []
  );

  const updateSchedule = useCallback(
    async (scheduleId, payload) =>
      smartSaveService.updateSavingSchedule(
        scheduleId,
        payload
      ),
    []
  );

  const activateSchedule =
    useCallback(
      async (
        scheduleId,
        payload = {}
      ) =>
        smartSaveService.activateSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const pauseSchedule =
    useCallback(
      async (
        scheduleId,
        payload = {}
      ) =>
        smartSaveService.pauseSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const resumeSchedule =
    useCallback(
      async (
        scheduleId,
        payload = {}
      ) =>
        smartSaveService.resumeSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const cancelSchedule =
    useCallback(
      async (
        scheduleId,
        payload = {}
      ) =>
        smartSaveService.cancelSavingSchedule(
          scheduleId,
          payload
        ),
      []
    );

  const completeSchedule =
    useCallback(
      async (scheduleId) =>
        smartSaveService.completeSavingSchedule(
          scheduleId
        ),
      []
    );

  const deleteSchedule =
    useCallback(
      async (scheduleId) =>
        smartSaveService.deleteSavingSchedule(
          scheduleId
        ),
      []
    );

  const getScheduleStats =
    useCallback(
      async (scheduleId) =>
        smartSaveService.getSavingScheduleStats(
          scheduleId
        ),
      []
    );

  /* ==========================================================
     AUTOSAVE OPERATIONS
  ========================================================== */

  const createAutoSave = useCallback(
    async (payload) =>
      smartSaveService.createAutoSave(
        payload
      ),
    []
  );

  const updateAutoSave = useCallback(
    async (autoSaveId, payload) =>
      smartSaveService.updateAutoSave(
        autoSaveId,
        payload
      ),
    []
  );

  const activateAutoSave =
    useCallback(
      async (autoSaveId) =>
        smartSaveService.activateAutoSave(
          autoSaveId
        ),
      []
    );

  const pauseAutoSave =
    useCallback(
      async (autoSaveId) =>
        smartSaveService.pauseAutoSave(
          autoSaveId
        ),
      []
    );

  const resumeAutoSave =
    useCallback(
      async (autoSaveId) =>
        smartSaveService.resumeAutoSave(
          autoSaveId
        ),
      []
    );

  const cancelAutoSave =
    useCallback(
      async (autoSaveId) =>
        smartSaveService.cancelAutoSave(
          autoSaveId
        ),
      []
    );

  const deleteAutoSave =
    useCallback(
      async (autoSaveId) =>
        smartSaveService.deleteAutoSave(
          autoSaveId
        ),
      []
    );

  const getAutoSaveStats =
    useCallback(
      async (autoSaveId) =>
        smartSaveService.getAutoSaveStats(
          autoSaveId
        ),
      []
    );

  /* ==========================================================
     AUTOMATION HELPERS
  ========================================================== */

  const attachAutomation =
    useCallback(
      async (planId, payload) =>
        smartSaveService.attachSavingPlanAutomation(
          planId,
          payload
        ),
      []
    );

  const detachAutomation =
    useCallback(
      async (planId) =>
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
     AUTO FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      try {
        await fetchStrategies();
      } catch {
        if (cancelled) {
          return;
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    autoFetch,
    fetchStrategies,
  ]);

  /* ==========================================================
     RETURN API
  ========================================================== */

  return {
    /* State */
    ...state,

    /* Derived */
    activePlans,
    activeSchedules,
    activeAutoSaves,
    strategyCount,
    hasStrategies,

    /* Fetching */
    fetchPlans,
    fetchSchedules,
    fetchAutoSaves,
    fetchStrategies,
    refresh,

    /* Plans */
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

    /* Schedules */
    createSchedule,
    updateSchedule,
    activateSchedule,
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    completeSchedule,
    deleteSchedule,
    getScheduleStats,

    /* AutoSave */
    createAutoSave,
    updateAutoSave,
    activateAutoSave,
    pauseAutoSave,
    resumeAutoSave,
    cancelAutoSave,
    deleteAutoSave,
    getAutoSaveStats,

    /* Automation */
    attachAutomation,
    detachAutomation,

    /* Error */
    clearError: () =>
      updateState((previous) => ({
        ...previous,
        error: null,
      })),
  };
};

export default useSavingsStrategies;