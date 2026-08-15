
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  calculateProgressPercentage,
  calculateEmergencyFundProgress,
} from "../utils/smartSave/emergencyFundProgress";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const EMPTY_FUND = {
  id: "",
  name: "Emergency Fund",
  targetAmount: 0,
  currentAmount: 0,
  currency: DEFAULT_CURRENCY,
  targetDate: null,
  description: "",
};

/* =========================================================
   SAFE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const toNumber = (value, fallback = 0) => {
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

const toString = (value, fallback = "") =>
  typeof value === "string"
    ? value.trim()
    : fallback;

const getId = (value) =>
  value?._id ||
  value?.id ||
  value?.fundId ||
  value?.emergencyFundId ||
  "";

const extractPayload = (response) => {
  if (!response) {
    return null;
  }

  if (isObject(response.data)) {
    return (
      response.data.emergencyFund ||
      response.data.fund ||
      response.data.result ||
      response.data
    );
  }

  if (isObject(response.emergencyFund)) {
    return response.emergencyFund;
  }

  if (isObject(response.fund)) {
    return response.fund;
  }

  if (isObject(response.result)) {
    return response.result;
  }

  return isObject(response)
    ? response
    : null;
};

/* =========================================================
   NORMALIZER
========================================================= */

const normalizeEmergencyFund = (source) => {
  const value = extractPayload(source);

  if (!value) {
    return {
      ...EMPTY_FUND,
    };
  }

  const targetAmount = Math.max(
    0,
    toNumber(
      value.targetAmount ??
        value.target ??
        value.goalAmount ??
        value.amount ??
        0
    )
  );

  const currentAmount = Math.max(
    0,
    toNumber(
      value.currentAmount ??
        value.savedAmount ??
        value.balance ??
        value.amountSaved ??
        value.progressAmount ??
        0
    )
  );

  const currency =
    toString(
      value.currency ??
        value.currencyCode
    ).toUpperCase() ||
    DEFAULT_CURRENCY;

  return {
    ...EMPTY_FUND,

    ...value,

    id: getId(value),

    name:
      toString(
        value.name ??
          value.title
      ) ||
      EMPTY_FUND.name,

    targetAmount,

    currentAmount,

    currency,

    targetDate:
      value.targetDate ??
      value.deadline ??
      null,

    description:
      toString(
        value.description
      ),
  };
};

/* =========================================================
   PROGRESS
========================================================= */

const calculateProgress = (fund) => {
  const targetAmount = toNumber(
    fund?.targetAmount
  );

  const currentAmount = toNumber(
    fund?.currentAmount
  );

  /*
   * Prefer the shared SmartSave progress utility.
   */
  try {
    const result =
      calculateEmergencyFundProgress?.(
        fund
      );

    if (
      isObject(result)
    ) {
      return {
        percentage:
          Number.isFinite(
            Number(
              result.percentage
            )
          )
            ? Number(
                result.percentage
              )
            : 0,

        remaining:
          Math.max(
            0,
            toNumber(
              result.remaining ??
                result.remainingAmount
            )
          ),

        targetAmount,

        currentAmount,
      };
    }

    if (
      Number.isFinite(
        Number(result)
      )
    ) {
      return {
        percentage: Math.max(
          0,
          Math.min(
            100,
            Number(result)
          )
        ),

        remaining: Math.max(
          0,
          targetAmount -
            currentAmount
        ),

        targetAmount,

        currentAmount,
      };
    }
  } catch {
    /*
     * Fall back to the simpler percentage helper.
     */
  }

  let percentage = 0;

  try {
    percentage =
      calculateProgressPercentage(
        currentAmount,
        targetAmount
      );
  } catch {
    percentage =
      targetAmount > 0
        ? (currentAmount /
            targetAmount) *
          100
        : 0;
  }

  percentage = Math.max(
    0,
    Math.min(
      100,
      toNumber(
        percentage
      )
    )
  );

  return {
    percentage,

    remaining: Math.max(
      0,
      targetAmount -
        currentAmount
    ),

    targetAmount,

    currentAmount,
  };
};

/* =========================================================
   HOOK
========================================================= */

const useEmergencyFund = ({
  initialData = null,
  fetchEmergencyFund = null,
  onError = null,
  autoFetch = true,
} = {}) => {
  const [fund, setFund] = useState(
    () =>
      normalizeEmergencyFund(
        initialData
      )
  );

  const [loading, setLoading] =
    useState(
      Boolean(
        autoFetch &&
          typeof fetchEmergencyFund ===
            "function"
      )
    );

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

 ;

  /* =======================================================
     FETCH
  ======================================================= */

  const fetchFund = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (
        typeof fetchEmergencyFund !==
        "function"
      ) {
        return null;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response =
          await fetchEmergencyFund();

        const normalized =
          normalizeEmergencyFund(
            response
          );

        setFund(normalized);

        return normalized;
      } catch (requestError) {
        const message =
          requestError?.response?.data
            ?.message ||
          requestError?.response?.data
            ?.error ||
          requestError?.message ||
          "Unable to load your emergency fund.";

        setError(message);

        if (
          typeof onError ===
          "function"
        ) {
          onError(
            requestError
          );
        }

        return null;
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [
      fetchEmergencyFund,
      onError,
    ]
  );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
  let cancelled = false;

  const loadInitialFund = async () => {
    if (
      !autoFetch ||
      typeof fetchEmergencyFund !== "function"
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetchEmergencyFund();

      if (cancelled) {
        return;
      }

      const normalized =
        normalizeEmergencyFund(response);

      setFund(normalized);
    } catch (requestError) {
      if (cancelled) {
        return;
      }

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.message ||
        "Unable to load your emergency fund.";

      setError(message);

      if (typeof onError === "function") {
        onError(requestError);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadInitialFund();

  return () => {
    cancelled = true;
  };
}, [
  autoFetch,
  fetchEmergencyFund,
  onError,
]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = useCallback(
    () =>
      fetchFund({
        silent: true,
      }),
    [fetchFund]
  );

  /* =======================================================
     UPDATE LOCAL FUND
  ======================================================= */

  const updateFund = useCallback(
    (updates) => {
      setFund((current) =>
        normalizeEmergencyFund({
          ...current,

          ...(typeof updates ===
          "function"
            ? updates(current)
            : updates),
        })
      );
    },
    []
  );

  /* =======================================================
     ADD SAVINGS
  ======================================================= */

  const addSavings = useCallback(
    (amount) => {
      const value = toNumber(
        amount
      );

      if (value <= 0) {
        return;
      }

      setFund((current) =>
        normalizeEmergencyFund({
          ...current,

          currentAmount:
            current.currentAmount +
            value,
        })
      );
    },
    []
  );

  /* =======================================================
     REMOVE SAVINGS
  ======================================================= */

  const removeSavings =
    useCallback(
      (amount) => {
        const value =
          toNumber(amount);

        if (value <= 0) {
          return;
        }

        setFund((current) =>
          normalizeEmergencyFund({
            ...current,

            currentAmount:
              Math.max(
                0,
                current.currentAmount -
                  value
              ),
          })
        );
      },
      []
    );

  /* =======================================================
     RESET
  ======================================================= */

  const reset = useCallback(() => {
    setFund({
      ...EMPTY_FUND,
    });

    setError("");
  }, []);

  /* =======================================================
     DERIVED PROGRESS
  ======================================================= */

  const progress = useMemo(
    () =>
      calculateProgress(
        fund
      ),
    [fund]
  );

  const isComplete = useMemo(
    () =>
      progress.percentage >=
      100,
    [progress.percentage]
  );

  const hasFund = useMemo(
    () =>
      Boolean(
        fund?.id ||
          fund?.targetAmount > 0 ||
          fund?.currentAmount > 0
      ),
    [fund]
  );

  const remainingAmount = useMemo(
    () =>
      Math.max(
        0,
        toNumber(
          progress.remaining
        )
      ),
    [progress.remaining]
  );

  /* =======================================================
     RETURN API
  ======================================================= */

  return {
    /* Fund */
    fund,

    emergencyFund: fund,

    data: fund,

    /* State */
    loading,

    refreshing,

    error,

    hasError: Boolean(error),

    hasFund,

    /* Progress */
    progress,

    progressPercentage:
      progress.percentage,

    percentage:
      progress.percentage,

    remainingAmount,

    isComplete,

    isGoalReached:
      isComplete,

    /* Actions */
    fetchFund,

    refresh,

    updateFund,

    addSavings,

    removeSavings,

    reset,

    /* Compatibility */
    refetch: refresh,
  };
};

export {
  EMPTY_FUND,
  normalizeEmergencyFund,
};

export default useEmergencyFund;
