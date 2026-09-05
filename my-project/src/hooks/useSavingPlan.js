import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import smartSaveService, {
  SmartSaveServiceError,
} from "../services/smartSaveService";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const getPlanId = (plan) => {
  if (!plan || typeof plan !== "object") {
    return null;
  }

  return (
    plan._id ??
    plan.id ??
    plan.planId ??
    null
  );
};

const getErrorMessage = (
  error,
  fallback
) => {
  if (!error) {
    return fallback;
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }

  if (
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  if (
    typeof error.error === "string" &&
    error.error.trim()
  ) {
    return error.error;
  }

  if (
    typeof error.data?.message === "string" &&
    error.data.message.trim()
  ) {
    return error.data.message;
  }

  return fallback;
};

const isAbortError = (error) => {
  if (!error) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    error.code === "ERR_CANCELED" ||
    error.message === "canceled" ||
    error.message === "Cancelled"
  );
};

const normalizePlanResponse = (
  response
) => {
  if (!response) {
    return null;
  }

  if (
    response.plan &&
    isObject(response.plan)
  ) {
    return response.plan;
  }

  if (
    response.data &&
    isObject(response.data)
  ) {
    if (
      response.data.plan &&
      isObject(response.data.plan)
    ) {
      return response.data.plan;
    }

    return response.data;
  }

  if (isObject(response)) {
    return response;
  }

  return null;
};

const normalizeStatisticsResponse = (
  response
) => {
  if (!response) {
    return null;
  }

  if (
    response.statistics &&
    isObject(response.statistics)
  ) {
    return response.statistics;
  }

  if (
    response.stats &&
    isObject(response.stats)
  ) {
    return response.stats;
  }

  if (
    response.data &&
    isObject(response.data)
  ) {
    if (
      response.data.statistics &&
      isObject(response.data.statistics)
    ) {
      return response.data.statistics;
    }

    if (
      response.data.stats &&
      isObject(response.data.stats)
    ) {
      return response.data.stats;
    }

    return response.data;
  }

  return response;
};

const normalizeEligibilityResponse = (
  response
) => {
  if (!response) {
    return null;
  }

  if (
    response.eligibility &&
    isObject(response.eligibility)
  ) {
    return response.eligibility;
  }

  if (
    response.data &&
    isObject(response.data)
  ) {
    if (
      response.data.eligibility &&
      isObject(response.data.eligibility)
    ) {
      return response.data.eligibility;
    }

    return response.data;
  }

  return response;
};

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

const useSavingPlan = (
  planId,
  {
    autoFetch = true,
    fetchStatisticsOnMount = false,
    fetchEligibilityOnMount = false,
  } = {}
) => {
  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [plan, setPlan] =
    useState(null);

  const [
    statistics,
    setStatistics,
  ] = useState(null);

  const [
    eligibility,
    setEligibility,
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    statisticsLoading,
    setStatisticsLoading,
  ] = useState(false);

  const [
    eligibilityLoading,
    setEligibilityLoading,
  ] = useState(false);

  const [error, setError] =
    useState(null);

  const [
    statisticsError,
    setStatisticsError,
  ] = useState(null);

  const [
    eligibilityError,
    setEligibilityError,
  ] = useState(null);

  const [
    activating,
    setActivating,
  ] = useState(false);

  const [
    pausing,
    setPausing,
  ] = useState(false);

  const [
    resuming,
    setResuming,
  ] = useState(false);

  const [
    completing,
    setCompleting,
  ] = useState(false);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    recalculating,
    setRecalculating,
  ] = useState(false);

  const [
    refreshingProgress,
    setRefreshingProgress,
  ] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Refs                                                                     */
  /* ------------------------------------------------------------------------ */

  const mountedRef =
    useRef(false);

  const planRequestIdRef =
    useRef(0);

  const statisticsRequestIdRef =
    useRef(0);

  const eligibilityRequestIdRef =
    useRef(0);

  const mutationRequestIdRef =
    useRef(0);

  const activePlanIdRef =
    useRef(planId);

  /* ------------------------------------------------------------------------ */
  /* Mount lifecycle                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      planRequestIdRef.current += 1;
      statisticsRequestIdRef.current += 1;
      eligibilityRequestIdRef.current += 1;
      mutationRequestIdRef.current += 1;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Track current plan identity                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    activePlanIdRef.current = planId;
  }, [planId]);

  /* ------------------------------------------------------------------------ */
  /* Fetch plan                                                                */
  /* ------------------------------------------------------------------------ */

  const fetchPlan =
    useCallback(async () => {
      if (!planId) {
        if (!mountedRef.current) {
          return null;
        }

        setPlan(null);
        setError(null);
        setLoading(false);

        return null;
      }

      const requestId =
        ++planRequestIdRef.current;

      const requestedPlanId =
        planId;

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const response =
          await smartSaveService.getSavingPlan(
            requestedPlanId
          );

        if (
          !mountedRef.current ||
          requestId !==
            planRequestIdRef.current ||
          activePlanIdRef.current !==
            requestedPlanId
        ) {
          return null;
        }

        const normalizedPlan =
          normalizePlanResponse(
            response
          );

        setPlan(
          normalizedPlan
        );

        return normalizedPlan;
      } catch (requestError) {
        if (
          isAbortError(
            requestError
          )
        ) {
          return null;
        }

        if (
          !mountedRef.current ||
          requestId !==
            planRequestIdRef.current ||
          activePlanIdRef.current !==
            requestedPlanId
        ) {
          return null;
        }

        const normalizedError =
          requestError instanceof
          SmartSaveServiceError
            ? requestError
            : getErrorMessage(
                requestError,
                "Unable to load the saving plan."
              );

        setError(
          normalizedError
        );

        setPlan(null);

        return null;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            planRequestIdRef.current &&
          activePlanIdRef.current ===
            requestedPlanId
        ) {
          setLoading(false);
        }
      }
    }, [planId]);

  /* ------------------------------------------------------------------------ */
  /* Fetch statistics                                                          */
  /* ------------------------------------------------------------------------ */

  const fetchStatistics =
    useCallback(async () => {
      if (!planId) {
        if (!mountedRef.current) {
          return null;
        }

        setStatistics(null);
        setStatisticsError(null);
        setStatisticsLoading(false);

        return null;
      }

      const requestId =
        ++statisticsRequestIdRef.current;

      const requestedPlanId =
        planId;

      if (mountedRef.current) {
        setStatisticsLoading(true);
        setStatisticsError(null);
      }

      try {
        const response =
          await smartSaveService.getSavingPlanStatistics(
            requestedPlanId
          );

        if (
          !mountedRef.current ||
          requestId !==
            statisticsRequestIdRef.current ||
          activePlanIdRef.current !==
            requestedPlanId
        ) {
          return null;
        }

        const normalizedStatistics =
          normalizeStatisticsResponse(
            response
          );

        setStatistics(
          normalizedStatistics
        );

        return normalizedStatistics;
      } catch (requestError) {
        if (
          isAbortError(
            requestError
          )
        ) {
          return null;
        }

        if (
          !mountedRef.current ||
          requestId !==
            statisticsRequestIdRef.current ||
          activePlanIdRef.current !==
            requestedPlanId
        ) {
          return null;
        }

        const normalizedError =
          requestError instanceof
          SmartSaveServiceError
            ? requestError
            : getErrorMessage(
                requestError,
                "Unable to load saving plan statistics."
              );

        setStatisticsError(
          normalizedError
        );

        return null;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            statisticsRequestIdRef.current &&
          activePlanIdRef.current ===
            requestedPlanId
        ) {
          setStatisticsLoading(
            false
          );
        }
      }
    }, [planId]);

  /* ------------------------------------------------------------------------ */
  /* Fetch eligibility                                                         */
  /* ------------------------------------------------------------------------ */

  const fetchEligibility =
    useCallback(async () => {
      if (!planId) {
        if (!mountedRef.current) {
          return null;
        }

        setEligibility(null);
        setEligibilityError(null);
        setEligibilityLoading(false);

        return null;
      }

      const requestId =
        ++eligibilityRequestIdRef.current;

      const requestedPlanId =
        planId;

      if (mountedRef.current) {
        setEligibilityLoading(true);
        setEligibilityError(null);
      }

      try {
        const response =
          await smartSaveService.checkSavingPlanEligibility(
            requestedPlanId
          );

        if (
          !mountedRef.current ||
          requestId !==
            eligibilityRequestIdRef.current ||
          activePlanIdRef.current !==
            requestedPlanId
        ) {
          return null;
        }

        const normalizedEligibility =
          normalizeEligibilityResponse(
            response
          );

        setEligibility(
          normalizedEligibility
        );

        return normalizedEligibility;
      } catch (requestError) {
        if (
          isAbortError(
            requestError
          )
        ) {
          return null;
        }

        if (
          !mountedRef.current ||
          requestId !==
            eligibilityRequestIdRef.current ||
          activePlanIdRef.current !==
            requestedPlanId
        ) {
          return null;
        }

        const normalizedError =
          requestError instanceof
          SmartSaveServiceError
            ? requestError
            : getErrorMessage(
                requestError,
                "Unable to check saving plan eligibility."
              );

        setEligibilityError(
          normalizedError
        );

        return null;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            eligibilityRequestIdRef.current &&
          activePlanIdRef.current ===
            requestedPlanId
        ) {
          setEligibilityLoading(
            false
          );
        }
      }
    }, [planId]);

  /* ------------------------------------------------------------------------ */
  /* Refresh plan                                                              */
  /* ------------------------------------------------------------------------ */

  const refreshPlan =
    useCallback(async () => {
      return fetchPlan();
    }, [fetchPlan]);

  /* ------------------------------------------------------------------------ */
  /* Generic mutation executor                                                 */
  /* ------------------------------------------------------------------------ */

  const executeMutation =
    useCallback(
      async ({
        operation,
        setMutationLoading,
        fallbackMessage,
      }) => {
        if (!planId) {
          const validationError =
            new Error(
              "A saving plan ID is required."
            );

          if (mountedRef.current) {
            setError(
              validationError
            );
          }

          return {
            success: false,
            error: validationError,
          };
        }

        const mutationId =
          ++mutationRequestIdRef.current;

        const requestedPlanId =
          planId;

        setMutationLoading(true);
        setError(null);

        try {
          const response =
            await operation();

          if (
            !mountedRef.current ||
            mutationId !==
              mutationRequestIdRef.current ||
            activePlanIdRef.current !==
              requestedPlanId
          ) {
            return null;
          }

          /*
           * Refresh the resource explicitly after
           * a successful mutation.
           *
           * There is deliberately no effect watching
           * `plan`, so this cannot create:
           *
           * mutation → plan update → effect → mutation
           */
          const refreshedPlan =
            await fetchPlan();

          return {
            success: true,
            response,
            plan:
              refreshedPlan,
          };
        } catch (mutationError) {
          if (
            !mountedRef.current ||
            mutationId !==
              mutationRequestIdRef.current ||
            activePlanIdRef.current !==
              requestedPlanId
          ) {
            return null;
          }

          const normalizedError =
            mutationError instanceof
            SmartSaveServiceError
              ? mutationError
              : getErrorMessage(
                  mutationError,
                  fallbackMessage
                );

          setError(
            normalizedError
          );

          return {
            success: false,
            error: mutationError,
          };
        } finally {
          if (
            mountedRef.current &&
            mutationId ===
              mutationRequestIdRef.current &&
            activePlanIdRef.current ===
              requestedPlanId
          ) {
            setMutationLoading(
              false
            );
          }
        }
      },
      [fetchPlan, planId]
    );

  /* ------------------------------------------------------------------------ */
  /* Activate                                                                  */
  /* ------------------------------------------------------------------------ */

  const activatePlan =
    useCallback(async () => {
      return executeMutation({
        operation: () =>
          smartSaveService.activateSavingPlan(
            planId
          ),
        setMutationLoading:
          setActivating,
        fallbackMessage:
          "Unable to activate saving plan.",
      });
    }, [
      executeMutation,
      planId,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Pause                                                                     */
  /* ------------------------------------------------------------------------ */

  const pausePlan =
    useCallback(
      async (payload = {}) => {
        return executeMutation({
          operation: () =>
            smartSaveService.pauseSavingPlan(
              planId,
              payload
            ),
          setMutationLoading:
            setPausing,
          fallbackMessage:
            "Unable to pause saving plan.",
        });
      },
      [
        executeMutation,
        planId,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* Resume                                                                    */
  /* ------------------------------------------------------------------------ */

  const resumePlan =
    useCallback(async () => {
      return executeMutation({
        operation: () =>
          smartSaveService.resumeSavingPlan(
            planId
          ),
        setMutationLoading:
          setResuming,
        fallbackMessage:
          "Unable to resume saving plan.",
      });
    }, [
      executeMutation,
      planId,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Complete                                                                  */
  /* ------------------------------------------------------------------------ */

  const completePlan =
    useCallback(
      async (payload = {}) => {
        return executeMutation({
          operation: () =>
            smartSaveService.completeSavingPlan(
              planId,
              payload
            ),
          setMutationLoading:
            setCompleting,
          fallbackMessage:
            "Unable to complete saving plan.",
        });
      },
      [
        executeMutation,
        planId,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* Cancel                                                                    */
  /* ------------------------------------------------------------------------ */

  const cancelPlan =
    useCallback(
      async (payload = {}) => {
        return executeMutation({
          operation: () =>
            smartSaveService.cancelSavingPlan(
              planId,
              payload
            ),
          setMutationLoading:
            setCancelling,
          fallbackMessage:
            "Unable to cancel saving plan.",
        });
      },
      [
        executeMutation,
        planId,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* Recalculate metrics                                                       */
  /* ------------------------------------------------------------------------ */

  const recalculateMetrics =
    useCallback(async () => {
      return executeMutation({
        operation: () =>
          smartSaveService.recalculateSavingPlanMetrics(
            planId
          ),
        setMutationLoading:
          setRecalculating,
        fallbackMessage:
          "Unable to recalculate saving plan metrics.",
      });
    }, [
      executeMutation,
      planId,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Refresh progress                                                          */
  /* ------------------------------------------------------------------------ */

  const refreshProgress =
    useCallback(async () => {
      return executeMutation({
        operation: () =>
          smartSaveService.refreshSavingPlanProgress(
            planId
          ),
        setMutationLoading:
          setRefreshingProgress,
        fallbackMessage:
          "Unable to refresh saving plan progress.",
      });
    }, [
      executeMutation,
      planId,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Clear errors                                                              */
  /* ------------------------------------------------------------------------ */

  const clearError =
    useCallback(() => {
      setError(null);
      setStatisticsError(null);
      setEligibilityError(null);
    }, []);

  /* ------------------------------------------------------------------------ */
  /* Automatic plan fetch                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!autoFetch || !planId) {
      return undefined;
    }

    /*
     * Defer the fetch until after the effect body has
     * completed. This prevents the effect from directly
     * performing synchronous state updates.
     */
    let cancelled = false;

    const scheduleFetch =
      Promise.resolve().then(() => {
        if (
          !cancelled &&
          mountedRef.current
        ) {
          return fetchPlan();
        }

        return null;
      });

    void scheduleFetch;

    return () => {
      cancelled = true;

      planRequestIdRef.current += 1;
    };
  }, [
    autoFetch,
    planId,
    fetchPlan,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Optional statistics fetch                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !fetchStatisticsOnMount ||
      !planId
    ) {
      return undefined;
    }

    let cancelled = false;

    const scheduleStatistics =
      Promise.resolve().then(() => {
        if (
          !cancelled &&
          mountedRef.current
        ) {
          return fetchStatistics();
        }

        return null;
      });

    void scheduleStatistics;

    return () => {
      cancelled = true;

      statisticsRequestIdRef.current += 1;
    };
  }, [
    fetchStatisticsOnMount,
    planId,
    fetchStatistics,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Optional eligibility fetch                                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !fetchEligibilityOnMount ||
      !planId
    ) {
      return undefined;
    }

    let cancelled = false;

    const scheduleEligibility =
      Promise.resolve().then(() => {
        if (
          !cancelled &&
          mountedRef.current
        ) {
          return fetchEligibility();
        }

        return null;
      });

    void scheduleEligibility;

    return () => {
      cancelled = true;

      eligibilityRequestIdRef.current += 1;
    };
  }, [
    fetchEligibilityOnMount,
    planId,
    fetchEligibility,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Derived state                                                             */
  /* ------------------------------------------------------------------------ */

  const hasPlan =
    Boolean(plan);

  const isMutating =
    activating ||
    pausing ||
    resuming ||
    completing ||
    cancelling ||
    recalculating ||
    refreshingProgress;

  const isBusy =
    loading ||
    statisticsLoading ||
    eligibilityLoading ||
    isMutating;

  const currentPlanId =
    getPlanId(plan);

  /* ------------------------------------------------------------------------ */
  /* Public API                                                                */
  /* ------------------------------------------------------------------------ */

  return useMemo(
    () => ({
      /* Plan */
      plan,
      planId:
        currentPlanId ?? planId,
      hasPlan,

      /* Detail data */
      statistics,
      eligibility,

      /* Fetching */
      loading,
      statisticsLoading,
      eligibilityLoading,

      fetchPlan,
      refreshPlan,
      fetchStatistics,
      fetchEligibility,

      /* Errors */
      error,
      statisticsError,
      eligibilityError,
      clearError,

      /* Lifecycle */
      activatePlan,
      pausePlan,
      resumePlan,
      completePlan,
      cancelPlan,

      /* Metrics / progress */
      recalculateMetrics,
      refreshProgress,

      /* Mutation state */
      activating,
      pausing,
      resuming,
      completing,
      cancelling,
      recalculating,
      refreshingProgress,

      /* Aggregate state */
      isMutating,
      isBusy,
    }),
    [
      plan,
      currentPlanId,
      planId,
      hasPlan,
      statistics,
      eligibility,
      loading,
      statisticsLoading,
      eligibilityLoading,
      fetchPlan,
      refreshPlan,
      fetchStatistics,
      fetchEligibility,
      error,
      statisticsError,
      eligibilityError,
      clearError,
      activatePlan,
      pausePlan,
      resumePlan,
      completePlan,
      cancelPlan,
      recalculateMetrics,
      refreshProgress,
      activating,
      pausing,
      resuming,
      completing,
      cancelling,
      recalculating,
      refreshingProgress,
      isMutating,
      isBusy,
    ]
  );
};

export default useSavingPlan;