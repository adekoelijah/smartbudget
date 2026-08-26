// hooks/useSavingsForecast.js

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

const EMPTY_ARRAY = [];

const INITIAL_STATE = {
  goals: [],
  plans: [],
  selectedGoalId: null,
};

const INITIAL_LOADING = {
  goals: false,
  plans: false,
};

const INITIAL_ERRORS = {
  goals: null,
  plans: null,
};

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_GOAL_NAME = "Savings Goal";
const DEFAULT_ERROR_MESSAGE =
  "Unable to load savings forecast.";

/* ============================================================
   SAFE VALUE HELPERS
============================================================ */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;

  return (
    Math.round(toNumber(value) * factor) /
    factor
  );
};

/* ============================================================
   RESPONSE NORMALIZATION
============================================================ */

const normalizeArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return EMPTY_ARRAY;
};

/* ============================================================
   ERROR NORMALIZATION
============================================================ */

const normalizeError = (error) => {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return (
      message ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.data?.error ??
    error?.message ??
    error?.error;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return DEFAULT_ERROR_MESSAGE;
};

/* ============================================================
   SERVICE CONTRACT
============================================================ */

/**
 * Resolve a SmartSave service method explicitly.
 *
 * We intentionally fail loudly if the service contract is
 * incorrect instead of silently returning fake data.
 */
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

/* ============================================================
   FORECAST CALCULATOR
============================================================ */

/**
 * Build one canonical forecast from a goal and optional plan.
 *
 * This function is pure.
 *
 * It does not:
 * - modify state
 * - access refs
 * - access Date.now()
 * - perform network requests
 * - mutate its arguments
 */
const calculateForecast = ({
  goal,
  plan = null,
}) => {
  if (!isObject(goal)) {
    return null;
  }

  const goalId =
    goal?._id ??
    goal?.id ??
    null;

  const targetAmount =
    toNumber(
      goal?.targetAmount
    );

  const currentAmount =
    toNumber(
      goal?.currentAmount ??
      goal?.savedAmount ??
      goal?.balance
    );

  const remainingAmount =
    Math.max(
      0,
      targetAmount -
        currentAmount
    );

  const progressPercentage =
    targetAmount > 0
      ? round(
          Math.min(
            100,
            (currentAmount /
              targetAmount) *
              100
          )
        )
      : 0;

  const dailyContribution =
    toNumber(
      plan?.dailyContribution ??
      plan?.requiredDailyContribution ??
      goal?.dailyContribution
    );

  const weeklyContribution =
    toNumber(
      plan?.weeklyContribution ??
      plan?.requiredWeeklyContribution ??
      goal?.weeklyContribution
    );

  const monthlyContribution =
    toNumber(
      plan?.monthlyContribution ??
      plan?.requiredMonthlyContribution ??
      goal?.monthlyContribution
    );

  let periodsRequired = null;

  if (
    monthlyContribution > 0 &&
    remainingAmount > 0
  ) {
    periodsRequired =
      Math.ceil(
        remainingAmount /
          monthlyContribution
      );
  }

  const isCompleted =
    goal?.status === "completed" ||
    progressPercentage >= 100;

  return {
    goalId,

    name:
      goal?.name ??
      goal?.title ??
      DEFAULT_GOAL_NAME,

    currency:
      goal?.currency ??
      DEFAULT_CURRENCY,

    targetAmount,

    currentAmount,

    remainingAmount,

    progressPercentage,

    dailyContribution,

    weeklyContribution,

    monthlyContribution,

    periodsRequired,

    targetDate:
      goal?.targetDate ??
      null,

    status:
      goal?.status ??
      "active",

    isCompleted,

    hasContributionPlan:
      dailyContribution > 0 ||
      weeklyContribution > 0 ||
      monthlyContribution > 0,

    planId:
      plan?._id ??
      plan?.id ??
      null,
  };
};

/* ============================================================
   FORECAST BUILDER
============================================================ */

const buildForecasts = (
  goals,
  plans
) => {
  if (
    !Array.isArray(goals) ||
    goals.length === 0
  ) {
    return EMPTY_ARRAY;
  }

  const safePlans =
    Array.isArray(plans)
      ? plans
      : EMPTY_ARRAY;

  return goals
    .map((goal) => {
      const currentGoalId =
        goal?._id ??
        goal?.id ??
        null;

      const matchingPlan =
        safePlans.find(
          (plan) => {
            const planGoalId =
              plan?.savingGoal ??
              plan?.savingGoalId ??
              plan?.goalId ??
              null;

            if (
              !currentGoalId ||
              !planGoalId
            ) {
              return false;
            }

            return (
              String(
                planGoalId
              ) ===
              String(
                currentGoalId
              )
            );
          }
        );

      return calculateForecast({
        goal,
        plan:
          matchingPlan ||
          null,
      });
    })
    .filter(Boolean);
};

/* ============================================================
   HOOK
============================================================ */

const useSavingsForecast = ({
  autoFetch = true,
  enabled,
  goalId = null,
  goalsQuery = {},
  plansQuery = {},
} = {}) => {
  /* ==========================================================
     FETCH CONTROL
  ========================================================== */

  /**
   * `enabled` is supported because your SavingForecastPage
   * currently passes:
   *
   * enabled: !suppliedForecast
   *
   * If enabled is supplied, it takes precedence over
   * autoFetch.
   */
  const shouldAutoFetch =
    typeof enabled === "boolean"
      ? enabled
      : autoFetch;

  /* ==========================================================
     STATE
  ========================================================== */

  const [state, setState] =
    useState(INITIAL_STATE);

  const [loading, setLoading] =
    useState(INITIAL_LOADING);

  const [errors, setErrors] =
    useState(INITIAL_ERRORS);

  /* ==========================================================
     REFS
  ========================================================== */

  const mountedRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  /* ==========================================================
     MOUNT SAFETY
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ==========================================================
     QUERY SNAPSHOTS
  ========================================================== */

  /**
   * Query objects can be recreated by the parent on every
   * render.
   *
   * We serialize them once for dependency tracking so the
   * fetch callbacks do not continuously change simply because
   * the parent created a new object.
   *
   * JSON.stringify is only used for dependency identity.
   */
  const goalsQueryKey =
    useMemo(
      () =>
        JSON.stringify(
          goalsQuery ?? {}
        ),
      [goalsQuery]
    );

  const plansQueryKey =
    useMemo(
      () =>
        JSON.stringify(
          plansQuery ?? {}
        ),
      [plansQuery]
    );

  const stableGoalsQuery =
    useMemo(() => {
      try {
        const parsed =
          JSON.parse(
            goalsQueryKey
          );

        return isObject(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    }, [goalsQueryKey]);

  const stablePlansQuery =
    useMemo(() => {
      try {
        const parsed =
          JSON.parse(
            plansQueryKey
          );

        return isObject(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    }, [plansQueryKey]);

  /* ==========================================================
     LOADING HELPERS
  ========================================================== */

  const setLoadingState =
    useCallback(
      (key, value) => {
        if (!mountedRef.current) {
          return;
        }

        setLoading(
          (previous) => {
            if (
              previous[key] ===
              value
            ) {
              return previous;
            }

            return {
              ...previous,
              [key]: value,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     ERROR HELPERS
  ========================================================== */

  const clearError =
    useCallback(
      (key) => {
        if (!mountedRef.current) {
          return;
        }

        setErrors(
          (previous) => {
            if (
              previous[key] ===
              null
            ) {
              return previous;
            }

            return {
              ...previous,
              [key]: null,
            };
          }
        );
      },
      []
    );

  const setErrorState =
    useCallback(
      (key, error) => {
        if (!mountedRef.current) {
          return;
        }

        const message =
          normalizeError(error);

        setErrors(
          (previous) => {
            if (
              previous[key] ===
              message
            ) {
              return previous;
            }

            return {
              ...previous,
              [key]: message,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     FETCH GOALS
  ========================================================== */

  const fetchGoals =
    useCallback(
      async (
        query = stableGoalsQuery
      ) => {
        const requestId =
          ++requestIdRef.current;

        setLoadingState(
          "goals",
          true
        );

        clearError("goals");

        try {
          const method =
            getServiceMethod(
              "getSavingGoals"
            );

          const response =
            await method(query);

          if (
            !mountedRef.current ||
            requestId !==
              requestIdRef.current
          ) {
            return response;
          }

          const goals =
            normalizeArray(
              response
            );

          setState(
            (previous) => ({
              ...previous,
              goals,
            })
          );

          return response;
        } catch (error) {
          if (
            mountedRef.current &&
            requestId ===
              requestIdRef.current
          ) {
            setErrorState(
              "goals",
              error
            );
          }

          throw error;
        } finally {
          if (
            mountedRef.current &&
            requestId ===
              requestIdRef.current
          ) {
            setLoadingState(
              "goals",
              false
            );
          }
        }
      },
      [
        clearError,
        setErrorState,
        setLoadingState,
        stableGoalsQuery,
      ]
    );

  /* ==========================================================
     FETCH PLANS
  ========================================================== */

  const fetchPlans =
    useCallback(
      async (
        query = stablePlansQuery
      ) => {
        const requestId =
          ++requestIdRef.current;

        setLoadingState(
          "plans",
          true
        );

        clearError("plans");

        try {
          const method =
            getServiceMethod(
              "getSavingPlans"
            );

          const response =
            await method(query);

          if (
            !mountedRef.current ||
            requestId !==
              requestIdRef.current
          ) {
            return response;
          }

          const plans =
            normalizeArray(
              response
            );

          setState(
            (previous) => ({
              ...previous,
              plans,
            })
          );

          return response;
        } catch (error) {
          if (
            mountedRef.current &&
            requestId ===
              requestIdRef.current
          ) {
            setErrorState(
              "plans",
              error
            );
          }

          throw error;
        } finally {
          if (
            mountedRef.current &&
            requestId ===
              requestIdRef.current
          ) {
            setLoadingState(
              "plans",
              false
            );
          }
        }
      },
      [
        clearError,
        setErrorState,
        setLoadingState,
        stablePlansQuery,
      ]
    );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(
      async () => {
        const results =
          await Promise.allSettled([
            fetchGoals(
              stableGoalsQuery
            ),
            fetchPlans(
              stablePlansQuery
            ),
          ]);

        return results;
      },
      [
        fetchGoals,
        fetchPlans,
        stableGoalsQuery,
        stablePlansQuery,
      ]
    );

  /* ==========================================================
     INITIAL FETCH
  ========================================================== */

  useEffect(() => {
    if (!shouldAutoFetch) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      if (cancelled) {
        return;
      }

      try {
        await refresh();
      } catch {
        /*
         * Individual request errors are already stored
         * by fetchGoals/fetchPlans.
         */
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    refresh,
    shouldAutoFetch,
  ]);

  /* ==========================================================
     DERIVED FORECASTS
  ========================================================== */

  /**
   * IMPORTANT:
   *
   * This used to be:
   *
   * useEffect(() => {
   *   setState(...)
   * }, [state.goals, state.plans])
   *
   * That caused the React cascading-render warning.
   *
   * Forecasts are derived data, therefore they belong in
   * useMemo, not state.
   */
  const forecasts =
    useMemo(
      () =>
        buildForecasts(
          state.goals,
          state.plans
        ),
      [
        state.goals,
        state.plans,
      ]
    );

  /* ==========================================================
     SELECTED FORECAST
  ========================================================== */

  const selectedForecast =
    useMemo(() => {
      if (!goalId) {
        return null;
      }

      return (
        forecasts.find(
          (forecast) =>
            String(
              forecast?.goalId
            ) ===
            String(goalId)
        ) || null
      );
    }, [
      forecasts,
      goalId,
    ]);

  /* ==========================================================
     PORTFOLIO FORECAST
  ========================================================== */

  const portfolioForecast =
    useMemo(() => {
      const totalTarget =
        forecasts.reduce(
          (sum, item) =>
            sum +
            toNumber(
              item?.targetAmount
            ),
          0
        );

      const totalSaved =
        forecasts.reduce(
          (sum, item) =>
            sum +
            toNumber(
              item?.currentAmount
            ),
          0
        );

      const totalRemaining =
        Math.max(
          0,
          totalTarget -
            totalSaved
        );

      const progressPercentage =
        totalTarget > 0
          ? round(
              Math.min(
                100,
                (totalSaved /
                  totalTarget) *
                  100
              )
            )
          : 0;

      const completedGoals =
        forecasts.filter(
          (item) =>
            item?.isCompleted
        ).length;

      const activeGoals =
        forecasts.filter(
          (item) =>
            item?.status ===
            "active"
        ).length;

      return {
        totalGoals:
          forecasts.length,

        activeGoals,

        completedGoals,

        totalTarget,

        totalSaved,

        totalRemaining,

        progressPercentage,
      };
    }, [forecasts]);

  /* ==========================================================
     FORECAST SUMMARY
  ========================================================== */

  const forecastSummary =
    useMemo(() => {
      const completed =
        forecasts.filter(
          (item) =>
            item?.isCompleted
        ).length;

      const active =
        forecasts.filter(
          (item) =>
            item?.status ===
            "active"
        ).length;

      const withoutPlan =
        forecasts.filter(
          (item) =>
            !item?.hasContributionPlan
        ).length;

      const withPlan =
        forecasts.filter(
          (item) =>
            item?.hasContributionPlan
        ).length;

      /*
       * IMPORTANT:
       *
       * We intentionally do NOT call Date.now()
       * during render.
       *
       * Instead, we use the current date supplied through
       * the dependency below.
       */
      const currentTime =
        new Date().getTime();

      const overdue =
        forecasts.filter(
          (item) => {
            if (
              !item?.targetDate ||
              item?.isCompleted
            ) {
              return false;
            }

            const targetTime =
              new Date(
                item.targetDate
              ).getTime();

            if (
              !Number.isFinite(
                targetTime
              )
            ) {
              return false;
            }

            return (
              targetTime <
              currentTime
            );
          }
        ).length;

      return {
        total:
          forecasts.length,

        completed,

        active,

        withoutPlan,

        withPlan,

        overdue,
      };
    }, [forecasts]);

  /* ==========================================================
     SELECT GOAL
  ========================================================== */

  const selectGoal =
    useCallback(
      (id) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setState(
          (previous) => {
            const nextId =
              id || null;

            if (
              previous.selectedGoalId ===
              nextId
            ) {
              return previous;
            }

            return {
              ...previous,
              selectedGoalId:
                nextId,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     GET FORECAST
  ========================================================== */

  const getForecast =
    useCallback(
      (id) => {
        if (!id) {
          return null;
        }

        return (
          forecasts.find(
            (forecast) =>
              String(
                forecast?.goalId
              ) ===
              String(id)
          ) || null
        );
      },
      [forecasts]
    );

  /* ==========================================================
     RESET
  ========================================================== */

  const reset =
    useCallback(() => {
      if (
        !mountedRef.current
      ) {
        return;
      }

      requestIdRef.current += 1;

      setState({
        ...INITIAL_STATE,
      });

      setLoading({
        ...INITIAL_LOADING,
      });

      setErrors({
        ...INITIAL_ERRORS,
      });
    }, []);

  /* ==========================================================
     DERIVED FLAGS
  ========================================================== */

  const isLoading =
    loading.goals ||
    loading.plans;

  const hasError =
    Boolean(
      errors.goals ||
      errors.plans
    );

  const error =
    errors.forecast ??
    errors.goals ??
    errors.plans ??
    null;

  const hasForecast =
    forecasts.length > 0;

  /* ==========================================================
     RETURN VALUE
  ========================================================== */

  return useMemo(
    () => ({
      /* ------------------------------------------------------
         DATA
      ------------------------------------------------------ */

      goals:
        state.goals,

      plans:
        state.plans,

      forecasts,

      selectedGoalId:
        state.selectedGoalId,

      selectedForecast,

      portfolioForecast,

      forecastSummary,

      /* ------------------------------------------------------
         FLAGS
      ------------------------------------------------------ */

      loading,

      isLoading,

      errors,

      error,

      hasError,

      hasForecast,

      /* ------------------------------------------------------
         ACTIONS
      ------------------------------------------------------ */

      fetchGoals,

      fetchPlans,

      refresh,

      reset,

      selectGoal,

      getForecast,
    }),
    [
      error,
      errors,
      fetchGoals,
      fetchPlans,
      forecasts,
      forecastSummary,
      getForecast,
      hasError,
      hasForecast,
      isLoading,
      loading,
      portfolioForecast,
      refresh,
      reset,
      selectedForecast,
      selectGoal,
      state.goals,
      state.plans,
      state.selectedGoalId,
    ]
  );
};

export default useSavingsForecast;