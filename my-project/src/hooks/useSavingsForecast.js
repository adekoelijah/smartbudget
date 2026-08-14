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

const INITIAL_STATE = {
  goals: [],
  plans: [],
  forecasts: [],
  selectedGoalId: null,
};

const INITIAL_LOADING = {
  goals: false,
  plans: false,
  forecast: false,
};

const INITIAL_ERRORS = {
  goals: null,
  plans: null,
  forecast: null,
};

/* ============================================================
   NORMALIZATION
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

  return [];
};

const normalizeObject = (response) => {
  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response)
  ) {
    if (
      response.data &&
      typeof response.data === "object" &&
      !Array.isArray(response.data)
    ) {
      return response.data;
    }

    return response;
  }

  return null;
};

const normalizeError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Unable to load savings forecast.";

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;

  return (
    Math.round(
      toNumber(value) * factor
    ) / factor
  );
};

/* ============================================================
   SERVICE CONTRACT
============================================================ */

/**
 * Never silently invent a service method.
 *
 * If the service contract changes, the hook should fail
 * explicitly rather than silently producing incorrect data.
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
 * Derives a forecast from backend-provided goal/plan data.
 *
 * This is intentionally frontend presentation logic.
 *
 * It does NOT replace:
 *
 * - savingCalculationService
 * - savingPlanService
 * - backend financial calculations
 *
 * Backend values remain authoritative whenever supplied.
 */
const calculateForecast = ({
  goal,
  plan = null,
}) => {
  if (!goal) {
    return null;
  }

  const targetAmount =
    toNumber(
      goal.targetAmount
    );

  const currentAmount =
    toNumber(
      goal.currentAmount
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
    periodsRequired = Math.ceil(
      remainingAmount /
        monthlyContribution
    );
  }

  return {
    goalId:
      goal._id ??
      goal.id ??
      null,

    name:
      goal.name ??
      goal.title ??
      "Savings Goal",

    currency:
      goal.currency ??
      "NGN",

    targetAmount,

    currentAmount,

    remainingAmount,

    progressPercentage,

    dailyContribution,

    weeklyContribution,

    monthlyContribution,

    periodsRequired,

    targetDate:
      goal.targetDate ?? null,

    status:
      goal.status ??
      "active",

    isCompleted:
      goal.status ===
        "completed" ||
      progressPercentage >=
        100,

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
   HOOK
============================================================ */

const useSavingsForecast = ({
  autoFetch = true,
  goalId = null,
  goalsQuery = {},
  plansQuery = {},
} = {}) => {
  /* ==========================================================
     STATE
  ========================================================== */

  const [state, setState] =
    useState(INITIAL_STATE);

  const [loading, setLoading] =
    useState(INITIAL_LOADING);

  const [errors, setErrors] =
    useState(INITIAL_ERRORS);

  const mountedRef =
    useRef(false);

  const requestRef =
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
     STATE HELPERS
  ========================================================== */

  const setLoadingState =
    useCallback(
      (key, value) => {
        if (!mountedRef.current) {
          return;
        }

        setLoading(
          (previous) => ({
            ...previous,
            [key]: value,
          })
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

        setErrors(
          (previous) => ({
            ...previous,
            [key]:
              normalizeError(error),
          })
        );
      },
      []
    );

  const clearError =
    useCallback(
      (key) => {
        if (!mountedRef.current) {
          return;
        }

        setErrors(
          (previous) => ({
            ...previous,
            [key]: null,
          })
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
        query = goalsQuery
      ) => {
        const requestId =
          ++requestRef.current;

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
              requestRef.current
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
              requestRef.current
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
              requestRef.current
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
        goalsQuery,
        setErrorState,
        setLoadingState,
      ]
    );

  /* ==========================================================
     FETCH PLANS
  ========================================================== */

  const fetchPlans =
    useCallback(
      async (
        query = plansQuery
      ) => {
        const requestId =
          ++requestRef.current;

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
              requestRef.current
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
              requestRef.current
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
              requestRef.current
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
        plansQuery,
        setErrorState,
        setLoadingState,
      ]
    );

  /* ==========================================================
     BUILD FORECASTS
  ========================================================== */

  const buildForecasts =
    useCallback(
      (goals, plans) => {
        return goals
          .map((goal) => {
            const currentGoalId =
              goal?._id ??
              goal?.id;

            const matchingPlan =
              plans.find(
                (plan) => {
                  const planGoalId =
                    plan?.savingGoal ??
                    plan?.savingGoalId ??
                    plan?.goalId;

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
      },
      []
    );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(
      async () => {
        const results =
          await Promise.allSettled([
            fetchGoals(),
            fetchPlans(),
          ]);

        if (
          !mountedRef.current
        ) {
          return results;
        }

        /*
         * Forecasts are derived from the latest
         * state inside the following effect.
         */

        return results;
      },
      [
        fetchGoals,
        fetchPlans,
      ]
    );

  /* ==========================================================
     INITIAL FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      if (cancelled) {
        return;
      }

      await refresh();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    autoFetch,
    refresh,
  ]);

  /* ==========================================================
     DERIVE FORECASTS
  ========================================================== */

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }

    const forecasts =
      buildForecasts(
        state.goals,
        state.plans
      );

    setState(
      (previous) => {
        /*
         * Prevent unnecessary state updates.
         *
         * This also prevents an effect from continuously
         * updating itself.
         */
        const previousIds =
          previous.forecasts.map(
            (item) =>
              item?.goalId
          );

        const nextIds =
          forecasts.map(
            (item) =>
              item?.goalId
          );

        const sameLength =
          previousIds.length ===
          nextIds.length;

        const sameIds =
          sameLength &&
          previousIds.every(
            (id, index) =>
              String(id) ===
              String(
                nextIds[index]
              )
          );

        if (
          sameIds &&
          previous.forecasts.every(
            (item, index) =>
              JSON.stringify(
                item
              ) ===
              JSON.stringify(
                forecasts[index]
              )
          )
        ) {
          return previous;
        }

        return {
          ...previous,
          forecasts,
        };
      }
    );
  }, [
    buildForecasts,
    state.goals,
    state.plans,
  ]);

  /* ==========================================================
     SELECTED GOAL
  ========================================================== */

  const selectedForecast =
    useMemo(() => {
      if (!goalId) {
        return null;
      }

      return (
        state.forecasts.find(
          (forecast) =>
            String(
              forecast.goalId
            ) ===
            String(goalId)
        ) || null
      );
    }, [
      goalId,
      state.forecasts,
    ]);

  /* ==========================================================
     PORTFOLIO FORECAST
  ========================================================== */

  const portfolioForecast =
    useMemo(() => {
      const forecasts =
        state.forecasts;

      const totalTarget =
        forecasts.reduce(
          (sum, item) =>
            sum +
            toNumber(
              item.targetAmount
            ),
          0
        );

      const totalSaved =
        forecasts.reduce(
          (sum, item) =>
            sum +
            toNumber(
              item.currentAmount
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
            item.isCompleted
        ).length;

      const activeGoals =
        forecasts.filter(
          (item) =>
            item.status ===
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
    }, [
      state.forecasts,
    ]);

  /* ==========================================================
     RISK / STATUS DERIVATIONS
  ========================================================== */

  const forecastSummary =
    useMemo(() => {
      const forecasts =
        state.forecasts;

      return {
        total:
          forecasts.length,

        completed:
          forecasts.filter(
            (item) =>
              item.isCompleted
          ).length,

        active:
          forecasts.filter(
            (item) =>
              item.status ===
              "active"
          ).length,

        withoutPlan:
          forecasts.filter(
            (item) =>
              !item.hasContributionPlan
          ).length,

        withPlan:
          forecasts.filter(
            (item) =>
              item.hasContributionPlan
          ).length,

        overdue:
          forecasts.filter(
            (item) => {
              if (
                !item.targetDate ||
                item.isCompleted
              ) {
                return false;
              }

              return (
                new Date(
                  item.targetDate
                ).getTime() <
                Date.now()
              );
            }
          ).length,
      };
    }, [
      state.forecasts,
    ]);

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
          (previous) => ({
            ...previous,
            selectedGoalId:
              id || null,
          })
        );
      },
      []
    );

  /* ==========================================================
     GET FORECAST BY GOAL
  ========================================================== */

  const getForecast =
    useCallback(
      (id) => {
        if (!id) {
          return null;
        }

        return (
          state.forecasts.find(
            (forecast) =>
              String(
                forecast.goalId
              ) ===
              String(id)
          ) || null
        );
      },
      [state.forecasts]
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

      requestRef.current += 1;

      setState(
        INITIAL_STATE
      );

      setLoading(
        INITIAL_LOADING
      );

      setErrors(
        INITIAL_ERRORS
      );
    }, []);

  /* ==========================================================
     DERIVED FLAGS
  ========================================================== */

  const isLoading =
    Object.values(
      loading
    ).some(Boolean);

  const hasError =
    Object.values(
      errors
    ).some(Boolean);

  const error =
    Object.values(
      errors
    ).find(Boolean) ||
    null;

  const hasForecast =
    state.forecasts.length >
    0;

  /* ==========================================================
     RETURN
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

      forecasts:
        state.forecasts,

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
      state.forecasts,
      state.goals,
      state.plans,
    ]
  );
};

export default useSavingsForecast;