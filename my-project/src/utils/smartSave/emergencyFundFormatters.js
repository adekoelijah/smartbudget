export const formatEmergencyCurrency = (
  amount,
  currency = "NGN"
) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "₦0";
  }

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }
  ).format(value);
};

export const formatMonths = (
  months
) => {
  const value = Number(months);

  if (!Number.isFinite(value)) {
    return "0 months";
  }

  if (value === 1) {
    return "1 month";
  }

  return `${value.toFixed(
    value % 1 === 0 ? 0 : 1
  )} months`;
};

// export const formatPercentage = (
//   value
// ) => {
//   const number = Number(value);

//   if (!Number.isFinite(number)) {
//     return "0%";
//   }

//   return `${number.toFixed(0)}%`;
// };


// src/utils/smartSave/emergencyFundFormatters.js

/**
 * ============================================================
 * SMARTSAVE — EMERGENCY FUND FORMATTERS
 * ============================================================
 *
 * Presentation-only utilities for the Emergency Fund module.
 *
 * Responsibilities:
 * - Format monetary values
 * - Format dates
 * - Normalize values safely
 * - Provide predictable fallbacks
 *
 * This module MUST NOT:
 * - Perform financial calculations
 * - Call APIs
 * - Access React state
 * - Contain business logic
 * ============================================================
 */

import {
  DEFAULT_CURRENCY,
} from "../../constants/smartSaveConstants";


/* ============================================================
   SAFE VALUE HELPERS
============================================================ */

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

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};


const normalizeCurrency = (
  currency
) => {
  const value =
    String(
      currency ??
        DEFAULT_CURRENCY ??
        "NGN"
    )
      .trim()
      .toUpperCase();

  return value || "NGN";
};


/* ============================================================
   CURRENCY FORMATTER
============================================================ */

/**
 * Format an amount using the application's currency.
 *
 * Examples:
 *
 * formatCurrency(150000)
 * formatCurrency(150000, "NGN")
 * formatCurrency(2500.5, "USD")
 */
export const formatCurrency = (
  value,
  currency = DEFAULT_CURRENCY
) => {
  const amount =
    toFiniteNumber(value);

  const normalizedCurrency =
    normalizeCurrency(
      currency
    );

  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency:
          normalizedCurrency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    /*
     * Defensive fallback for an invalid
     * currency code.
     */
    return `${normalizedCurrency} ${amount.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    )}`;
  }
};


/* ============================================================
   COMPACT CURRENCY
============================================================ */

export const formatCompactCurrency = (
  value,
  currency = DEFAULT_CURRENCY
) => {
  const amount =
    toFiniteNumber(value);

  const normalizedCurrency =
    normalizeCurrency(
      currency
    );

  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency:
          normalizedCurrency,
        notation: "compact",
        maximumFractionDigits: 1,
      }
    ).format(amount);
  } catch {
    return formatCurrency(
      amount,
      normalizedCurrency
    );
  }
};


/* ============================================================
   NUMBER FORMATTER
============================================================ */

export const formatNumber = (
  value,
  options = {}
) => {
  const amount =
    toFiniteNumber(value);

  const {
    maximumFractionDigits = 2,
    minimumFractionDigits = 0,
  } = options;

  return new Intl.NumberFormat(
    undefined,
    {
      maximumFractionDigits,
      minimumFractionDigits,
    }
  ).format(amount);
};


/* ============================================================
   PERCENTAGE FORMATTER
============================================================ */

export const formatPercentage = (
  value,
  {
    decimals = 0,
    clamp = true,
  } = {}
) => {
  let percentage =
    toFiniteNumber(value);

  /*
   * Support both:
   *
   * 0.25  → 25%
   * 25    → 25%
   */
  if (
    percentage >= 0 &&
    percentage <= 1
  ) {
    percentage *= 100;
  }

  if (clamp) {
    percentage =
      Math.min(
        100,
        Math.max(
          0,
          percentage
        )
      );
  }

  return `${percentage.toFixed(
    decimals
  )}%`;
};


/* ============================================================
   DATE NORMALIZATION
============================================================ */

const toValidDate = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date =
    value instanceof Date
      ? new Date(
          value.getTime()
        )
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};


/* ============================================================
   DATE FORMATTER
============================================================ */

/**
 * Format dates consistently throughout
 * the Emergency Fund UI.
 *
 * Invalid/missing dates return "—".
 */
export const formatDate = (
  value,
  options = {}
) => {
  const date =
    toValidDate(value);

  if (!date) {
    return "—";
  }

  const {
    dateStyle = "medium",
  } = options;

  try {
    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle,
      }
    ).format(date);
  } catch {
    return date.toLocaleDateString();
  }
};


/* ============================================================
   SHORT DATE
============================================================ */

export const formatShortDate = (
  value
) => {
  const date =
    toValidDate(value);

  if (!date) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    ).format(date);
  } catch {
    return date.toLocaleDateString();
  }
};


/* ============================================================
   RELATIVE DATE
============================================================ */

export const formatRelativeDate = (
  value
) => {
  const date =
    toValidDate(value);

  if (!date) {
    return "—";
  }

  const now =
    new Date();

  const difference =
    date.getTime() -
    now.getTime();

  const day =
    24 * 60 * 60 * 1000;

  const days =
    Math.round(
      difference / day
    );

  if (days === 0) {
    return "Today";
  }

  if (days === 1) {
    return "Tomorrow";
  }

  if (days === -1) {
    return "Yesterday";
  }

  if (days > 1 && days <= 7) {
    return `In ${days} days`;
  }

  if (days < -1 && days >= -7) {
    return `${Math.abs(days)} days ago`;
  }

  return formatDate(date);
};


/* ============================================================
   EXPORT DEFAULT
============================================================ */

const emergencyFundFormatters = Object.freeze({
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatShortDate,
  formatRelativeDate,
});

export default emergencyFundFormatters;
