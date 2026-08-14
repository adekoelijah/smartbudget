// utils/safeToSave.js

/**
 * ============================================================
 * SAFE TO SAVE UTILITIES
 * ============================================================
 *
 * Pure financial-safety utilities for SmartSave.
 *
 * Responsibilities:
 * - Determine whether a proposed saving amount is affordable
 * - Protect minimum cash/balance requirements
 * - Account for known expenses and commitments
 * - Calculate remaining disposable funds
 * - Provide safety levels
 * - Provide actionable safety messages
 *
 * IMPORTANT:
 * This utility MUST NOT:
 * - Call APIs
 * - Access React state
 * - Access localStorage
 * - Mutate financial records
 * - Create transactions
 * - Modify saving goals
 * - Modify accounts
 *
 * Backend/service-layer financial validation remains authoritative.
 * These utilities provide frontend guidance and validation only.
 * ============================================================
 */

/* ============================================================
   CONSTANTS
============================================================ */

export const SAFE_TO_SAVE_LEVELS = Object.freeze({
  SAFE: "safe",
  CAUTION: "caution",
  UNSAFE: "unsafe",
});

export const SAFE_TO_SAVE_STATUS = Object.freeze({
  APPROVED: "approved",
  CAUTION: "caution",
  REJECTED: "rejected",
});

export const DEFAULT_SAFE_TO_SAVE_CONFIG =
  Object.freeze({
    minimumBalance: 0,
    safetyBuffer: 0,
    warningThreshold: 0,
    currency: "NGN",
  });

/* ============================================================
   ERROR
============================================================ */

export class SafeToSaveError extends Error {
  constructor(
    message,
    code = "SAFE_TO_SAVE_ERROR",
    details = null
  ) {
    super(message);

    this.name = "SafeToSaveError";
    this.code = code;
    this.details = details;

    Error.captureStackTrace?.(
      this,
      SafeToSaveError
    );
  }
}

/* ============================================================
   NUMBER NORMALIZATION
============================================================ */

export const toSafeNumber = (
  value,
  fieldName = "Value"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new SafeToSaveError(
      `${fieldName} must be a valid number`,
      "INVALID_NUMBER",
      {
        fieldName,
        value,
      }
    );
  }

  return number;
};

export const toNonNegativeNumber = (
  value,
  fieldName = "Value"
) => {
  const number = toSafeNumber(
    value,
    fieldName
  );

  if (number < 0) {
    throw new SafeToSaveError(
      `${fieldName} cannot be negative`,
      "NEGATIVE_VALUE",
      {
        fieldName,
        value,
      }
    );
  }

  return number;
};

/* ============================================================
   MONEY ROUNDING
============================================================ */

export const roundMoney = (
  value,
  decimals = 2
) => {
  const number = toSafeNumber(
    value,
    "Money value"
  );

  const factor =
    10 ** decimals;

  return (
    Math.round(
      (number + Number.EPSILON) *
        factor
    ) / factor
  );
};

/* ============================================================
   CORE CALCULATIONS
============================================================ */

/**
 * Calculates funds available before applying
 * the proposed saving amount.
 */
export const calculateAvailableFunds = ({
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
}) => {
  const balance =
    toNonNegativeNumber(
      currentBalance,
      "Current balance"
    );

  const expenses =
    toNonNegativeNumber(
      pendingExpenses,
      "Pending expenses"
    );

  const commitments =
    toNonNegativeNumber(
      committedAmount,
      "Committed amount"
    );

  return roundMoney(
    Math.max(
      0,
      balance -
        expenses -
        commitments
    )
  );
};

/**
 * Calculates the minimum amount that should remain
 * after saving.
 */
export const calculateRequiredReserve = ({
  minimumBalance = 0,
  safetyBuffer = 0,
}) => {
  const minimum =
    toNonNegativeNumber(
      minimumBalance,
      "Minimum balance"
    );

  const buffer =
    toNonNegativeNumber(
      safetyBuffer,
      "Safety buffer"
    );

  return roundMoney(
    minimum + buffer
  );
};

/**
 * Calculates the maximum amount that can technically
 * be saved without crossing the reserve threshold.
 */
export const calculateMaximumSafeAmount = ({
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
  minimumBalance = 0,
  safetyBuffer = 0,
}) => {
  const available =
    calculateAvailableFunds({
      currentBalance,
      pendingExpenses,
      committedAmount,
    });

  const reserve =
    calculateRequiredReserve({
      minimumBalance,
      safetyBuffer,
    });

  return roundMoney(
    Math.max(
      0,
      available - reserve
    )
  );
};

/**
 * Calculates the balance remaining after saving.
 */
export const calculateBalanceAfterSaving = ({
  currentBalance = 0,
  savingAmount = 0,
}) => {
  const balance =
    toNonNegativeNumber(
      currentBalance,
      "Current balance"
    );

  const amount =
    toNonNegativeNumber(
      savingAmount,
      "Saving amount"
    );

  return roundMoney(
    balance - amount
  );
};

/**
 * Calculates disposable funds after all known
 * obligations and the proposed saving amount.
 */
export const calculateRemainingDisposableFunds = ({
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
  savingAmount = 0,
}) => {
  const available =
    calculateAvailableFunds({
      currentBalance,
      pendingExpenses,
      committedAmount,
    });

  const saving =
    toNonNegativeNumber(
      savingAmount,
      "Saving amount"
    );

  return roundMoney(
    available - saving
  );
};

/* ============================================================
   SAFETY CHECKS
============================================================ */

/**
 * Determines whether the requested saving amount
 * exceeds the available funds.
 */
export const exceedsAvailableFunds = ({
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
  savingAmount = 0,
}) => {
  const available =
    calculateAvailableFunds({
      currentBalance,
      pendingExpenses,
      committedAmount,
    });

  const amount =
    toNonNegativeNumber(
      savingAmount,
      "Saving amount"
    );

  return amount > available;
};

/**
 * Determines whether the saving amount would breach
 * the required reserve.
 */
export const breachesSafetyReserve = ({
  currentBalance = 0,
  savingAmount = 0,
  minimumBalance = 0,
  safetyBuffer = 0,
}) => {
  const afterSaving =
    calculateBalanceAfterSaving({
      currentBalance,
      savingAmount,
    });

  const reserve =
    calculateRequiredReserve({
      minimumBalance,
      safetyBuffer,
    });

  return afterSaving < reserve;
};

/**
 * Determines whether a proposed saving amount is
 * technically safe.
 */
export const isSafeToSave = ({
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
  savingAmount = 0,
  minimumBalance = 0,
  safetyBuffer = 0,
}) => {
  const amount =
    toNonNegativeNumber(
      savingAmount,
      "Saving amount"
    );

  if (amount === 0) {
    return false;
  }

  if (
    exceedsAvailableFunds({
      currentBalance,
      pendingExpenses,
      committedAmount,
      savingAmount: amount,
    })
  ) {
    return false;
  }

  if (
    breachesSafetyReserve({
      currentBalance,
      savingAmount: amount,
      minimumBalance,
      safetyBuffer,
    })
  ) {
    return false;
  }

  return true;
};

/* ============================================================
   SAFETY LEVEL
============================================================ */

/**
 * Returns a safety classification.
 *
 * SAFE:
 *   Adequate funds remain after saving.
 *
 * CAUTION:
 *   Saving is possible but leaves limited disposable funds.
 *
 * UNSAFE:
 *   Saving would violate available funds or reserve.
 */
export const getSafeToSaveLevel = ({
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
  savingAmount = 0,
  minimumBalance = 0,
  safetyBuffer = 0,
  warningThreshold = 0,
}) => {
  const amount =
    toNonNegativeNumber(
      savingAmount,
      "Saving amount"
    );

  if (amount <= 0) {
    return SAFE_TO_SAVE_LEVELS.UNSAFE;
  }

  const available =
    calculateAvailableFunds({
      currentBalance,
      pendingExpenses,
      committedAmount,
    });

  const reserve =
    calculateRequiredReserve({
      minimumBalance,
      safetyBuffer,
    });

  const remaining =
    roundMoney(
      available - amount
    );

  if (
    amount > available ||
    remaining < reserve
  ) {
    return SAFE_TO_SAVE_LEVELS.UNSAFE;
  }

  const threshold =
    toNonNegativeNumber(
      warningThreshold,
      "Warning threshold"
    );

  if (
    threshold > 0 &&
    remaining - reserve <= threshold
  ) {
    return SAFE_TO_SAVE_LEVELS.CAUTION;
  }

  return SAFE_TO_SAVE_LEVELS.SAFE;
};

/* ============================================================
   SAFE AMOUNT
============================================================ */

/**
 * Returns the maximum amount that can safely be saved.
 */
export const getMaximumSafeSavingAmount = (
  params = {}
) => {
  return calculateMaximumSafeAmount(
    params
  );
};

/**
 * Suggests a safe saving amount.
 *
 * The requested amount is capped at the maximum
 * safe amount.
 */
export const getSuggestedSafeSavingAmount = ({
  requestedAmount = 0,
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
  minimumBalance = 0,
  safetyBuffer = 0,
}) => {
  const requested =
    toNonNegativeNumber(
      requestedAmount,
      "Requested amount"
    );

  const maximum =
    calculateMaximumSafeAmount({
      currentBalance,
      pendingExpenses,
      committedAmount,
      minimumBalance,
      safetyBuffer,
    });

  return roundMoney(
    Math.min(
      requested,
      maximum
    )
  );
};

/* ============================================================
   VALIDATION
============================================================ */

/**
 * Performs a complete frontend safety assessment.
 */
export const evaluateSafeToSave = ({
  currentBalance = 0,
  pendingExpenses = 0,
  committedAmount = 0,
  savingAmount = 0,
  minimumBalance = 0,
  safetyBuffer = 0,
  warningThreshold = 0,
  currency = "NGN",
} = {}) => {
  const balance =
    toNonNegativeNumber(
      currentBalance,
      "Current balance"
    );

  const expenses =
    toNonNegativeNumber(
      pendingExpenses,
      "Pending expenses"
    );

  const commitments =
    toNonNegativeNumber(
      committedAmount,
      "Committed amount"
    );

  const amount =
    toNonNegativeNumber(
      savingAmount,
      "Saving amount"
    );

  const reserve =
    calculateRequiredReserve({
      minimumBalance,
      safetyBuffer,
    });

  const available =
    calculateAvailableFunds({
      currentBalance: balance,
      pendingExpenses: expenses,
      committedAmount: commitments,
    });

  const remaining =
    calculateRemainingDisposableFunds({
      currentBalance: balance,
      pendingExpenses: expenses,
      committedAmount: commitments,
      savingAmount: amount,
    });

  const maximumSafeAmount =
    calculateMaximumSafeAmount({
      currentBalance: balance,
      pendingExpenses: expenses,
      committedAmount: commitments,
      minimumBalance,
      safetyBuffer,
    });

  const level =
    getSafeToSaveLevel({
      currentBalance: balance,
      pendingExpenses: expenses,
      committedAmount: commitments,
      savingAmount: amount,
      minimumBalance,
      safetyBuffer,
      warningThreshold,
    });

  const safe =
    level ===
    SAFE_TO_SAVE_LEVELS.SAFE;

  const caution =
    level ===
    SAFE_TO_SAVE_LEVELS.CAUTION;

  let status =
    SAFE_TO_SAVE_STATUS.REJECTED;

  if (safe) {
    status =
      SAFE_TO_SAVE_STATUS.APPROVED;
  } else if (caution) {
    status =
      SAFE_TO_SAVE_STATUS.CAUTION;
  }

  const reserveAfterSaving =
    roundMoney(
      balance - amount
    );

  const reserveBreached =
    reserveAfterSaving < reserve;

  const insufficientFunds =
    amount > available;

  let reason = null;

  if (amount <= 0) {
    reason =
      "Enter a saving amount greater than zero.";
  } else if (insufficientFunds) {
    reason =
      "This amount exceeds the funds available after known commitments.";
  } else if (reserveBreached) {
    reason =
      "This amount would reduce your balance below your required safety reserve.";
  } else if (caution) {
    reason =
      "This amount is possible, but it leaves a limited financial buffer.";
  }

  return {
    safe,
    caution,

    status,
    level,

    currency,

    savingAmount:
      roundMoney(amount),

    currentBalance:
      roundMoney(balance),

    pendingExpenses:
      roundMoney(expenses),

    committedAmount:
      roundMoney(commitments),

    availableFunds:
      available,

    requiredReserve:
      reserve,

    remainingAfterSaving:
      roundMoney(
        remaining
      ),

    maximumSafeAmount,

    reserveAfterSaving,

    insufficientFunds,

    reserveBreached,

    reason,
  };
};

/* ============================================================
   HUMAN-READABLE MESSAGE
============================================================ */

export const getSafeToSaveMessage = (
  evaluation
) => {
  if (
    !evaluation ||
    typeof evaluation !== "object"
  ) {
    return "Unable to evaluate saving safety.";
  }

  switch (evaluation.level) {
    case SAFE_TO_SAVE_LEVELS.SAFE:
      return "This saving amount appears safe based on your current available funds and safety reserve.";

    case SAFE_TO_SAVE_LEVELS.CAUTION:
      return "You can save this amount, but it would leave you with a limited financial buffer.";

    case SAFE_TO_SAVE_LEVELS.UNSAFE:
    default:
      return (
        evaluation.reason ||
        "This saving amount may put your available funds or safety reserve at risk."
      );
  }
};

/* ============================================================
   QUICK CHECK
============================================================ */

/**
 * Lightweight boolean helper for UI controls.
 */
export const canSaveAmount = (
  params = {}
) => {
  return isSafeToSave(
    params
  );
};

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default {
  SAFE_TO_SAVE_LEVELS,
  SAFE_TO_SAVE_STATUS,
  DEFAULT_SAFE_TO_SAVE_CONFIG,

  SafeToSaveError,

  toSafeNumber,
  toNonNegativeNumber,
  roundMoney,

  calculateAvailableFunds,
  calculateRequiredReserve,
  calculateMaximumSafeAmount,
  calculateBalanceAfterSaving,
  calculateRemainingDisposableFunds,

  exceedsAvailableFunds,
  breachesSafetyReserve,
  isSafeToSave,

  getSafeToSaveLevel,

  getMaximumSafeSavingAmount,
  getSuggestedSafeSavingAmount,

  evaluateSafeToSave,

  getSafeToSaveMessage,

  canSaveAmount,
};