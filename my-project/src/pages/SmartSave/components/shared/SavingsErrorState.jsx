
import {
  AlertCircle,
  ArrowLeft,
  Home,
  Info,
  RefreshCw,
  ShieldAlert,
  WifiOff,
  XCircle,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  SAVINGS_ERROR_TYPES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE CONFIGURATION
========================================================= */

import {
  SMART_SAVE_STRATEGY_CONFIG,
} from "../../../../config/smartSaveConfig"; 

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  normalizeSavingsError,
} from "../../../../utils/smartSave/savingsNormalizers";

/* =========================================================
   ERROR TYPES
========================================================= */

const ERROR_TYPES = {
  NETWORK:
    SAVINGS_ERROR_TYPES?.NETWORK ??
    "network",

  AUTH:
    SAVINGS_ERROR_TYPES?.AUTH ??
    "auth",

  VALIDATION:
    SAVINGS_ERROR_TYPES?.VALIDATION ??
    "validation",

  NOT_FOUND:
    SAVINGS_ERROR_TYPES?.NOT_FOUND ??
    "not_found",

  PERMISSION:
    SAVINGS_ERROR_TYPES?.PERMISSION ??
    "permission",

  SERVER:
    SAVINGS_ERROR_TYPES?.SERVER ??
    "server",

  TIMEOUT:
    SAVINGS_ERROR_TYPES?.TIMEOUT ??
    "timeout",

  UNKNOWN:
    SAVINGS_ERROR_TYPES?.UNKNOWN ??
    "unknown",
};

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const normalizeText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

const normalizeErrorType = (
  value
) => {
  const normalized =
    normalizeText(value)
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  if (!normalized) {
    return ERROR_TYPES.UNKNOWN;
  }

  switch (normalized) {
    case "network_error":
    case "network":
    case "offline":
      return ERROR_TYPES.NETWORK;

    case "unauthorized":
    case "authentication":
    case "auth":
    case "401":
      return ERROR_TYPES.AUTH;

    case "validation_error":
    case "validation":
    case "bad_request":
    case "400":
      return ERROR_TYPES.VALIDATION;

    case "not_found":
    case "404":
      return ERROR_TYPES.NOT_FOUND;

    case "forbidden":
    case "permission":
    case "403":
      return ERROR_TYPES.PERMISSION;

    case "server_error":
    case "internal_server_error":
    case "server":
    case "500":
    case "502":
    case "503":
      return ERROR_TYPES.SERVER;

    case "timeout":
    case "request_timeout":
      return ERROR_TYPES.TIMEOUT;

    default:
      return normalized;
  }
};

const extractStatusCode = (
  error
) => {
  const candidates = [
    error?.status,
    error?.statusCode,
    error?.code,
    error?.response?.status,
    error?.response?.data?.status,
    error?.response?.data?.statusCode,
  ];

  for (const value of candidates) {
    const numericValue =
      Number(value);

    if (
      Number.isInteger(
        numericValue
      ) &&
      numericValue > 0
    ) {
      return numericValue;
    }
  }

  return null;
};

const extractMessage = (
  error
) => {
  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error.trim();
  }

  const candidates = [
    error?.message,
    error?.error,
    error?.detail,
    error?.description,
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.response?.data?.detail,
    error?.response?.data?.description,
  ];

  for (const value of candidates) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
};

/* =========================================================
   ERROR CONFIGURATION
========================================================= */

const ERROR_CONFIG = {
  network: {
    title:
      "Connection problem",

    message:
      "We couldn't connect to SmartSave. Check your internet connection and try again.",

    icon:
      WifiOff,

    tone:
      "border-amber-200 bg-amber-50 text-amber-900",

    iconTone:
      "text-amber-600",
  },

  auth: {
    title:
      "Your session has expired",

    message:
      "Please sign in again to continue using SmartSave.",

    icon:
      ShieldAlert,

    tone:
      "border-amber-200 bg-amber-50 text-amber-900",

    iconTone:
      "text-amber-600",
  },

  validation: {
    title:
      "Something needs attention",

    message:
      "Some of the information provided could not be processed. Review your details and try again.",

    icon:
      Info,

    tone:
      "border-orange-200 bg-orange-50 text-orange-900",

    iconTone:
      "text-orange-600",
  },

  not_found: {
    title:
      "Savings information not found",

    message:
      "The savings information you're looking for is no longer available or could not be found.",

    icon:
      XCircle,

    tone:
      "border-slate-200 bg-slate-50 text-slate-900",

    iconTone:
      "text-slate-600",
  },

  permission: {
    title:
      "Access unavailable",

    message:
      "You don't have permission to access this savings information.",

    icon:
      ShieldAlert,

    tone:
      "border-red-200 bg-red-50 text-red-900",

    iconTone:
      "text-red-600",
  },

  server: {
    title:
      "SmartSave is temporarily unavailable",

    message:
      "Something went wrong while processing your request. Please try again shortly.",

    icon:
      AlertCircle,

    tone:
      "border-red-200 bg-red-50 text-red-900",

    iconTone:
      "text-red-600",
  },

  timeout: {
    title:
      "The request took too long",

    message:
      "SmartSave didn't receive a response in time. Please try again.",

    icon:
      RefreshCw,

    tone:
      "border-amber-200 bg-amber-50 text-amber-900",

    iconTone:
      "text-amber-600",
  },

  unknown: {
    title:
      "We couldn't load your savings data",

    message:
      "Something unexpected happened. Please try again.",

    icon:
      AlertCircle,

    tone:
      "border-red-200 bg-red-50 text-red-900",

    iconTone:
      "text-red-600",
  },
};

/* =========================================================
   STATUS CODE → ERROR TYPE
========================================================= */

const typeFromStatusCode = (
  statusCode
) => {
  switch (statusCode) {
    case 400:
      return ERROR_TYPES.VALIDATION;

    case 401:
      return ERROR_TYPES.AUTH;

    case 403:
      return ERROR_TYPES.PERMISSION;

    case 404:
      return ERROR_TYPES.NOT_FOUND;

    case 408:
      return ERROR_TYPES.TIMEOUT;

    case 429:
      return ERROR_TYPES.SERVER;

    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;

    default:
      return null;
  }
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const resolveError = (
  error
) => {
  const statusCode =
    extractStatusCode(error);

  let type =
    normalizeErrorType(
      error?.type ??
        error?.errorType ??
        error?.code
    );

  const statusDerivedType =
    typeFromStatusCode(
      statusCode
    );

  /*
   * HTTP status is more reliable than a generic
   * "error" code when the backend provides one.
   */
  if (
    statusDerivedType
  ) {
    type =
      statusDerivedType;
  }

  /*
   * Prefer the project's normalizer when it
   * returns a usable normalized object.
   */
  try {
    if (
      typeof normalizeSavingsError ===
      "function"
    ) {
      const normalized =
        normalizeSavingsError(
          error
        );

      if (
        normalized &&
        typeof normalized ===
          "object"
      ) {
        const normalizedType =
          normalizeErrorType(
            normalized.type ??
              normalized.errorType
          );

        return {
          type:
            normalizedType ||
            type,

          statusCode:
            normalized.statusCode ??
            statusCode,

          message:
            normalizeText(
              normalized.message
            ) ||
            extractMessage(error),
        };
      }
    }
  } catch {
    /*
     * The local fallback below intentionally
     * keeps this presentation component resilient.
     */
  }

  return {
    type:
      ERROR_CONFIG[type]
        ? type
        : ERROR_TYPES.UNKNOWN,

    statusCode,

    message:
      extractMessage(error),
  };
};

/* =========================================================
   AUTH ERROR DETECTION
========================================================= */

const isAuthenticationError = (
  type,
  statusCode
) =>
  type === ERROR_TYPES.AUTH ||
  statusCode === 401;

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsErrorState = ({
  /* =======================================================
     ERROR
  ======================================================= */

  error,

  /* =======================================================
     PRIMARY ACTION
  ======================================================= */

  onRetry,

  retryLabel = "Try again",

  retrying = false,

  showRetry = true,

  /* =======================================================
     NAVIGATION ACTIONS
  ======================================================= */

  onBack,

  backLabel = "Go back",

  onHome,

  homeLabel = "Back to SmartSave",

  showBack = false,

  showHome = false,

  /* =======================================================
     AUTH ACTION
  ======================================================= */

  onSignIn,

  signInLabel = "Sign in again",

  /* =======================================================
     CONTENT OVERRIDES
  ======================================================= */

  title,

  message,

  /* =======================================================
     VISUAL OPTIONS
  ======================================================= */

  icon,

  compact = false,

  bordered = true,

  className = "",

  /* =======================================================
     ACCESSIBILITY
  ======================================================= */

  role = "alert",

  live = true,
}) => {
  /* =======================================================
     NORMALIZE ERROR
  ======================================================= */

  const normalizedError =
    resolveError(error);

  const errorType =
    normalizedError.type;

  const statusCode =
    normalizedError.statusCode;

  const config =
    ERROR_CONFIG[
      errorType
    ] ??
    ERROR_CONFIG.unknown;

  /* =======================================================
     CONTENT
  ======================================================= */

  const resolvedTitle =
    normalizeText(title) ||
    config.title ||
    SMART_SAVE_STRATEGY_CONFIG
      ?.errorTitle ||
    "Something went wrong";

  const resolvedMessage =
    normalizeText(message) ||
    normalizedError.message ||
    config.message ||
    SMART_SAVE_STRATEGY_CONFIG
      ?.errorMessage ||
    "We couldn't complete your request.";

  /* =======================================================
     ICON
  ======================================================= */

  const Icon =
    icon ??
    config.icon ??
    AlertCircle;

  /* =======================================================
     CALLBACK AVAILABILITY
  ======================================================= */

  const canRetry =
    showRetry &&
    typeof onRetry ===
      "function";

  const canGoBack =
    showBack &&
    typeof onBack ===
      "function";

  const canGoHome =
    showHome &&
    typeof onHome ===
      "function";

  const canSignIn =
    isAuthenticationError(
      errorType,
      statusCode
    ) &&
    typeof onSignIn ===
      "function";

  /* =======================================================
     RETRY LABEL
  ======================================================= */

  const resolvedRetryLabel =
    retrying
      ? "Trying again..."
      : retryLabel;

  /* =======================================================
     COMPACT MODE
  ======================================================= */

  if (compact) {
    return (
      <div
        className={`
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-8
          text-center
          ${bordered
            ? `
              rounded-2xl
              border
              border-slate-200
              bg-white
            `
            : ""}
          ${className}
        `}
        role={role}
        aria-live={
          live
            ? "polite"
            : undefined
        }
      >
        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-white
            ${config.iconTone}
          `}
          aria-hidden="true"
        >
          <Icon
            size={20}
          />
        </div>

        <h3
          className="
            mt-3
            font-semibold text-slate-900 text-sm
          "
        >
          {resolvedTitle}
        </h3>

        <p
          className="
            max-w-sm
            mt-1.5
            text-slate-500 text-xs leading-5
          "
        >
          {resolvedMessage}
        </p>

        {canRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="
              inline-flex justify-center items-center
              min-h-9
              mt-4 px-3.5 py-2
              font-semibold text-white text-xs
              bg-slate-900 hover:bg-slate-800
              rounded-lg focus:outline-none
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              disabled:opacity-60 transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <RefreshCw
              size={14}
              className={
                retrying
                  ? "animate-spin"
                  : ""
              }
              aria-hidden="true"
            />

            {resolvedRetryLabel}
          </button>
        )}
      </div>
    );
  }

  /* =======================================================
     FULL ERROR STATE
  ======================================================= */

  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-2xl
        bg-white
        ${bordered
          ? "border border-slate-200"
          : ""}
        ${className}
      `}
      role={role}
      aria-live={
        live
          ? "polite"
          : undefined
      }
    >
      {/* ===================================================
          DECORATIVE BACKGROUND
      =================================================== */}

      <div
        className="
          absolute
          w-40 h-40
          bg-slate-100
          rounded-full
          opacity-60 blur-3xl
          pointer-events-none
          -top-16 -right-16
        "
        aria-hidden="true"
      /
      >

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative flex flex-col items-center
          px-6 sm:px-10 py-12 sm:py-14
          text-center
        "
      >
        {/* =================================================
            ERROR ICON
        ================================================= */}

        <div
          className={`
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            border
            ${config.tone}
          `}
          aria-hidden="true"
        >
          <Icon
            size={29}
            strokeWidth={1.8}
            className={
              config.iconTone
            }
          />
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          className="
            max-w-lg
            mt-5
            font-bold text-slate-900 text-lg sm:text-xl tracking-tight
          "
        >
          {resolvedTitle}
        </h2>

        {/* =================================================
            MESSAGE
        ================================================= */}

        <p
          className="
            max-w-xl
            mt-2
            text-slate-500 text-sm leading-6
          "
        >
          {resolvedMessage}
        </p>

        {/* =================================================
            ERROR TYPE
        ================================================= */}

        {errorType !==
          ERROR_TYPES.UNKNOWN && (
          <span
            className={`
              mt-4
              inline-flex
              items-center
              rounded-full
              border
              px-2.5
              py-1
              text-[11px]
              font-semibold
              ${config.tone}
            `}
          >
            {config.title}
          </span>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        {(canRetry ||
          canSignIn ||
          canGoBack ||
          canGoHome) && (
          <div
            className="
              flex flex-col sm:flex-row sm:flex-wrap justify-center items-center
              w-full sm:w-auto
              mt-7
              gap-2.5
            "
          >
            {/* =============================================
                AUTH ACTION
            ============================================= */}

            {canSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="
                  inline-flex justify-center items-center
                  w-full sm:w-auto min-h-11
                  px-5 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  shadow-sm transition
                  gap-2
                "
              >
                <ShieldAlert
                  size={16}
                  aria-hidden="true"
                />

                {signInLabel}
              </button>
            )}

            {/* =============================================
                RETRY ACTION
            ============================================= */}

            {canRetry &&
              !canSignIn && (
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={retrying}
                  className="
                    inline-flex justify-center items-center
                    w-full sm:w-auto min-h-11
                    px-5 py-2.5
                    font-semibold text-white text-sm
                    bg-slate-900 hover:bg-slate-800
                    rounded-xl focus:outline-none
                    focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                    disabled:opacity-60 shadow-sm transition
                    disabled:cursor-not-allowed
                    gap-2
                  "
                >
                  <RefreshCw
                    size={16}
                    className={
                      retrying
                        ? "animate-spin"
                        : ""
                    }
                    aria-hidden="true"
                  />

                  {resolvedRetryLabel}
                </button>
              )}

            {/* =============================================
                BACK
            ============================================= */}

            {canGoBack && (
              <button
                type="button"
                onClick={onBack}
                className="
                  inline-flex justify-center items-center
                  w-full sm:w-auto min-h-11
                  px-5 py-2.5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                  transition
                  gap-2
                "
              >
                <ArrowLeft
                  size={16}
                  aria-hidden="true"
                />

                {backLabel}
              </button>
            )}

            {/* =============================================
                HOME
            ============================================= */}

            {canGoHome && (
              <button
                type="button"
                onClick={onHome}
                className="
                  inline-flex justify-center items-center
                  w-full sm:w-auto min-h-11
                  px-5 py-2.5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                  transition
                  gap-2
                "
              >
                <Home
                  size={16}
                  aria-hidden="true"
                />

                {homeLabel}
              </button>
            )}
          </div>
        )}

        {/* =================================================
            SUPPORTING MESSAGE
        ================================================= */}

        <div
          className="
            flex items-start
            max-w-lg
            mt-7
            text-left
            gap-2
          "
        >
          <Info
            size={15}
            className="
              mt-0.5
              text-slate-400
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <p
            className="
              text-slate-500 text-xs leading-5
            "
          >
            Your savings data remains
            protected. Retrying this request
            will not create or duplicate a
            savings transaction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsErrorState;
