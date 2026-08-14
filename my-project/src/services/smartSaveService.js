// src/services/smartSaveService.js

import api from "./api";

/**
 * ============================================================
 * SMARTSAVE SERVICE
 * ============================================================
 *
 * Frontend API gateway for the SmartBudget Savings module.
 *
 * Responsibilities:
 * - Communicate with SmartBudget savings endpoints
 * - Normalize IDs
 * - Normalize query parameters
 * - Normalize pagination
 * - Sanitize request payloads
 * - Normalize API responses
 * - Normalize API errors
 *
 * This service MUST NOT:
 * - Contain financial business logic
 * - Perform savings calculations
 * - Duplicate backend service logic
 * - Manipulate React state
 * - Contain UI logic
 *
 * Backend source of truth:
 *
 * /api/savings/accounts
 * /api/savings/goals
 * /api/savings/plans
 * /api/savings/schedules
 * /api/savings/executions
 * /api/savings/challenges
 * /api/savings/insights
 *
 * AutoSave:
 *
 * /api/savings/auto-save
 *
 * AutoSave is intentionally isolated because its route was
 * supplied separately and is not currently mounted by the
 * provided savingsRoutes.js parent router.
 *
 * ============================================================
 */


/* ============================================================
   ENDPOINT CONSTANTS
============================================================ */

export const SMART_SAVE_ENDPOINTS = Object.freeze({
  accounts: "/savings/accounts",
  goals: "/savings/goals",
  plans: "/savings/plans",
  schedules: "/savings/schedules",
  executions: "/savings/executions",
  challenges: "/savings/challenges",
  insights: "/savings/insights",

  /*
   * AutoSave is isolated from the main savings router.
   *
   * Backend route supplied:
   * /api/savings/auto-save
   */
  autoSave: "/savings/auto-save",
});


/* ============================================================
   HTTP METHOD CONSTANTS
============================================================ */

const HTTP_METHODS = Object.freeze({
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
});


/* ============================================================
   DEFAULTS
============================================================ */

export const SMART_SAVE_DEFAULTS = Object.freeze({
  page: 1,
  limit: 20,
  maxLimit: 100,
});


/* ============================================================
   ERROR CLASS
============================================================ */

export class SmartSaveServiceError extends Error {
  constructor({
    message = "SmartSave request failed",
    code = "SMART_SAVE_ERROR",
    status = null,
    details = null,
    originalError = null,
    endpoint = null,
    method = null,
  } = {}) {
    super(message);

    this.name = "SmartSaveServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.originalError = originalError;
    this.endpoint = endpoint;
    this.method = method;

    Error.captureStackTrace?.(
      this,
      SmartSaveServiceError
    );
  }
}


/* ============================================================
   ID VALIDATION
============================================================ */

/**
 * Validate a resource ID.
 *
 * Supports:
 * - MongoDB ObjectId
 * - UUID
 * - Other backend-generated string IDs
 */
export const validateId = (
  value,
  fieldName = "ID"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    throw new SmartSaveServiceError({
      message: `${fieldName} is required`,
      code: "INVALID_ID",
      details: {
        field: fieldName,
      },
    });
  }

  const id = String(value).trim();

  if (!id) {
    throw new SmartSaveServiceError({
      message: `${fieldName} is required`,
      code: "INVALID_ID",
      details: {
        field: fieldName,
      },
    });
  }

  /*
   * Do not force MongoDB ObjectId validation here.
   *
   * The backend contract may eventually support UUID/string IDs.
   */
  return id;
};


/* ============================================================
   NUMBER NORMALIZATION
============================================================ */

const normalizePositiveInteger = (
  value,
  fallback,
  fieldName
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number <= 0
  ) {
    throw new SmartSaveServiceError({
      message: `${fieldName} must be a positive integer`,
      code: "INVALID_QUERY_PARAMETER",
      details: {
        field: fieldName,
        value,
      },
    });
  }

  return number;
};


/* ============================================================
   PAGINATION HELPERS
============================================================ */

/**
 * Normalize pagination parameters.
 *
 * Example:
 *
 * normalizePagination({
 *   page: 2,
 *   limit: 50
 * });
 */
export const normalizePagination = ({
  page = SMART_SAVE_DEFAULTS.page,
  limit = SMART_SAVE_DEFAULTS.limit,
  maxLimit = SMART_SAVE_DEFAULTS.maxLimit,
} = {}) => {
  const normalizedPage =
    normalizePositiveInteger(
      page,
      SMART_SAVE_DEFAULTS.page,
      "page"
    );

  const normalizedLimit =
    normalizePositiveInteger(
      limit,
      SMART_SAVE_DEFAULTS.limit,
      "limit"
    );

  return {
    page: normalizedPage,
    limit: Math.min(
      normalizedLimit,
      maxLimit
    ),
  };
};


/* ============================================================
   QUERY PARAMETER NORMALIZATION
============================================================ */

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);


/**
 * Remove undefined/null/empty query values.
 *
 * false and 0 are intentionally preserved.
 */
export const cleanQueryParams = (
  params = {}
) => {
  if (!isPlainObject(params)) {
    return {};
  }

  return Object.entries(params).reduce(
    (result, [key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return result;
      }

      result[key] = value;

      return result;
    },
    {}
  );
};


/**
 * Normalize common list-query parameters.
 *
 * This does not invent query parameters.
 * It only normalizes parameters explicitly supplied
 * by the caller.
 */
export const normalizeListQuery = (
  params = {},
  {
    paginated = true,
    maxLimit = SMART_SAVE_DEFAULTS.maxLimit,
  } = {}
) => {
  const normalized = {
    ...params,
  };

  if (paginated) {
    const pagination =
      normalizePagination({
        page: normalized.page,
        limit: normalized.limit,
        maxLimit,
      });

    normalized.page = pagination.page;
    normalized.limit = pagination.limit;
  }

  return cleanQueryParams(
    normalized
  );
};


/* ============================================================
   REQUEST PAYLOAD SANITIZATION
============================================================ */

/**
 * Recursively remove undefined values.
 *
 * null is preserved intentionally because null may be a
 * meaningful backend value.
 */
export const sanitizePayload = (
  payload
) => {
  if (Array.isArray(payload)) {
    return payload
      .map(sanitizePayload);
  }

  if (!isPlainObject(payload)) {
    return payload;
  }

  return Object.entries(payload).reduce(
    (result, [key, value]) => {
      if (value === undefined) {
        return result;
      }

      result[key] =
        sanitizePayload(value);

      return result;
    },
    {}
  );
};


/**
 * Normalize optional request body.
 */
const normalizeBody = (
  payload = {}
) => {
  if (
    payload === null ||
    payload === undefined
  ) {
    return {};
  }

  if (!isPlainObject(payload)) {
    throw new SmartSaveServiceError({
      message:
        "Request payload must be an object",
      code: "INVALID_PAYLOAD",
    });
  }

  return sanitizePayload(
    payload
  );
};


/* ============================================================
   RESPONSE UNWRAPPING
============================================================ */

/**
 * SmartBudget APIs commonly return one of:
 *
 * {
 *   data: ...
 * }
 *
 * {
 *   success: true,
 *   data: ...
 * }
 *
 * {
 *   success: true,
 *   data: {
 *     data: [...]
 *   }
 * }
 *
 * This helper unwraps only transport wrappers.
 *
 * It does NOT reshape business data.
 */
export const unwrapResponse = (
  response
) => {
  const payload =
    response?.data;

  if (
    payload === undefined ||
    payload === null
  ) {
    return payload;
  }

  /*
   * Axios response.data
   *
   * {
   *   success: true,
   *   data: ...
   * }
   */
  if (
    isPlainObject(payload) &&
    Object.prototype.hasOwnProperty.call(
      payload,
      "data"
    )
  ) {
    return payload.data;
  }

  return payload;
};


/* ============================================================
   RESPONSE METADATA
============================================================ */

/**
 * Return a normalized transport response while preserving
 * backend business data.
 */
export const normalizeResponse = (
  response
) => ({
  data: unwrapResponse(
    response
  ),

  status:
    response?.status ?? null,

  statusText:
    response?.statusText ?? null,

  headers:
    response?.headers ?? null,
});


/* ============================================================
   ERROR NORMALIZATION
============================================================ */

/**
 * Extract backend error information without exposing
 * Axios implementation details to components/hooks.
 */
export const normalizeError = (
  error,
  context = {}
) => {
  if (
    error instanceof SmartSaveServiceError
  ) {
    return error;
  }

  const response =
    error?.response;

  const responseData =
    response?.data;

  const status =
    response?.status ?? null;

  const backendMessage =
    responseData?.message ||
    responseData?.error?.message ||
    responseData?.error ||
    error?.message ||
    "SmartSave request failed";

  const code =
    responseData?.code ||
    responseData?.error?.code ||
    error?.code ||
    "SMART_SAVE_REQUEST_FAILED";

  const details =
    responseData?.details ??
    responseData?.errors ??
    responseData ??
    null;

  return new SmartSaveServiceError({
    message: backendMessage,
    code,
    status,
    details,
    originalError: error,
    endpoint:
      context.endpoint ??
      null,
    method:
      context.method ??
      null,
  });
};


/* ============================================================
   REQUEST WRAPPER
============================================================ */

/**
 * Central request executor.
 *
 * All SmartSave API calls pass through this function.
 */
const request = async ({
  method,
  endpoint,
  params,
  data,
}) => {
  try {
    const config = {};

    if (params) {
      config.params =
        cleanQueryParams(
          params
        );
    }

    if (
      data !== undefined
    ) {
      config.data =
        normalizeBody(data);
    }

    const response =
      await api[method](
        endpoint,
        config
      );

    return normalizeResponse(
      response
    ).data;
  } catch (error) {
    throw normalizeError(
      error,
      {
        endpoint,
        method,
      }
    );
  }
};


/* ============================================================
   ACCOUNTS
============================================================ */

export const createSavingAccount =
  (payload) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        SMART_SAVE_ENDPOINTS.accounts,
      data: payload,
    });


export const getSavingAccounts =
  (params = {}) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.accounts,
      params:
        normalizeListQuery(
          params
        ),
    });


export const getSavingAccount =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}`,
    });


export const getPrimarySavingAccount =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/primary`,
    });


export const updateSavingAccount =
  (
    accountId,
    payload
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}`,
      data: payload,
    });


export const getSavingAccountBalance =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}/balance`,
    });


export const getSavingAccountSummary =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}/summary`,
    });


export const setPrimarySavingAccount =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}/primary`,
    });


export const pauseSavingAccount =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}/pause`,
    });


export const activateSavingAccount =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}/activate`,
    });


export const lockSavingAccount =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}/lock`,
    });


export const closeSavingAccount =
  (accountId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.accounts}/${validateId(
          accountId,
          "Account ID"
        )}/close`,
    });


/* ============================================================
   GOALS
============================================================ */

/**
 * The supplied backend routes currently expose:
 *
 * - list goals
 * - get goal
 * - summary
 * - contributions
 * - history
 * - eligibility
 *
 * No create/update/delete goal endpoints were supplied.
 *
 * Therefore none are invented here.
 */

export const getSavingGoals =
  (params = {}) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.goals,
      params:
        normalizeListQuery(
          params
        ),
    });


export const getSavingGoal =
  (goalId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.goals}/${validateId(
          goalId,
          "Goal ID"
        )}`,
    });


export const getSavingGoalSummary =
  (goalId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.goals}/${validateId(
          goalId,
          "Goal ID"
        )}/summary`,
    });


export const getSavingGoalContributions =
  (
    goalId,
    params = {}
  ) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.goals}/${validateId(
          goalId,
          "Goal ID"
        )}/contributions`,
      params:
        normalizeListQuery(
          params
        ),
    });


export const getSavingHistory =
  (
    goalId,
    params = {}
  ) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.goals}/${validateId(
          goalId,
          "Goal ID"
        )}/history`,
      params:
        cleanQueryParams(
          params
        ),
    });


export const checkSavingEligibility =
  (
    goalId,
    amount
  ) => {
    const params = {};

    if (
      amount !== undefined &&
      amount !== null &&
      amount !== ""
    ) {
      params.amount =
        amount;
    }

    return request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.goals}/${validateId(
          goalId,
          "Goal ID"
        )}/eligibility`,
      params:
        cleanQueryParams(
          params
        ),
    });
  };


/* ============================================================
   PLANS
============================================================ */

export const createSavingPlan =
  (payload) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        SMART_SAVE_ENDPOINTS.plans,
      data: payload,
    });


export const getSavingPlans =
  (params = {}) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.plans,
      params:
        normalizeListQuery(
          params
        ),
    });


export const getSavingPlan =
  (planId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}`,
    });


export const updateSavingPlan =
  (
    planId,
    payload
  ) =>
    request({
      method:
        HTTP_METHODS.PUT,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}`,
      data: payload,
    });


export const activateSavingPlan =
  (planId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/activate`,
    });


export const pauseSavingPlan =
  (
    planId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/pause`,
      data: payload,
    });


export const resumeSavingPlan =
  (planId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/resume`,
    });


export const completeSavingPlan =
  (
    planId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/complete`,
      data: payload,
    });


export const cancelSavingPlan =
  (
    planId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/cancel`,
      data: payload,
    });


export const recalculateSavingPlanMetrics =
  (planId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/recalculate-metrics`,
    });


export const refreshSavingPlanProgress =
  (planId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/refresh-progress`,
    });


export const attachSavingPlanAutomation =
  (
    planId,
    payload
  ) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/automation`,
      data: payload,
    });


export const detachSavingPlanAutomation =
  (planId) =>
    request({
      method:
        HTTP_METHODS.DELETE,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/automation`,
    });


export const checkSavingPlanEligibility =
  (planId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/eligibility`,
    });


export const getSavingPlanStatistics =
  (planId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.plans}/${validateId(
          planId,
          "Plan ID"
        )}/stats`,
    });


/* ============================================================
   SCHEDULES
============================================================ */

export const createSavingSchedule =
  (payload) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        SMART_SAVE_ENDPOINTS.schedules,
      data: payload,
    });


export const getSavingSchedules =
  (params = {}) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.schedules,
      params:
        normalizeListQuery(
          params
        ),
    });


export const getActiveSavingSchedules =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/active`,
    });


export const getSavingSchedule =
  (scheduleId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}`,
    });


export const updateSavingSchedule =
  (
    scheduleId,
    payload
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}`,
      data: payload,
    });


export const activateSavingSchedule =
  (
    scheduleId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}/activate`,
      data: payload,
    });


export const pauseSavingSchedule =
  (
    scheduleId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}/pause`,
      data: payload,
    });


export const resumeSavingSchedule =
  (
    scheduleId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}/resume`,
      data: payload,
    });


export const cancelSavingSchedule =
  (
    scheduleId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}/cancel`,
      data: payload,
    });


export const completeSavingSchedule =
  (
    scheduleId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}/complete`,
      data: payload,
    });


export const deleteSavingSchedule =
  (scheduleId) =>
    request({
      method:
        HTTP_METHODS.DELETE,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}`,
    });


export const getSavingScheduleStats =
  (scheduleId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.schedules}/${validateId(
          scheduleId,
          "Schedule ID"
        )}/stats`,
    });


/* ============================================================
   EXECUTIONS
============================================================ */

export const createSavingExecution =
  (payload) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        SMART_SAVE_ENDPOINTS.executions,
      data: payload,
    });


export const getSavingExecutions =
  (params = {}) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.executions,
      params:
        normalizeListQuery(
          params
        ),
    });


export const getSavingExecutionStats =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.executions}/stats`,
    });


export const getSavingExecution =
  (executionId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.executions}/${validateId(
          executionId,
          "Execution ID"
        )}`,
    });


export const cancelSavingExecution =
  (
    executionId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.executions}/${validateId(
          executionId,
          "Execution ID"
        )}/cancel`,
      data: payload,
    });


export const retrySavingExecution =
  (executionId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.executions}/${validateId(
          executionId,
          "Execution ID"
        )}/retry`,
    });


/* ============================================================
   SAVINGS CHALLENGES
============================================================ */

export const createSavingsChallenge =
  (payload) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        SMART_SAVE_ENDPOINTS.challenges,
      data: payload,
    });


export const getSavingsChallenges =
  (params = {}) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.challenges,
      params:
        normalizeListQuery(
          params
        ),
    });


export const getSavingsChallengeSummary =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/summary`,
    });


export const getActiveSavingsChallenges =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/active`,
    });


export const getPausedSavingsChallenges =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/paused`,
    });


export const getCompletedSavingsChallenges =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/completed`,
    });


export const getSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}`,
    });


export const getChallengeSnapshot =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/snapshot`,
    });


export const updateSavingsChallenge =
  (
    challengeId,
    payload
  ) =>
    request({
      method:
        HTTP_METHODS.PATCH,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}`,
      data: payload,
    });


export const activateSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/activate`,
    });


export const pauseSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/pause`,
    });


export const resumeSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/resume`,
    });


export const completeSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/complete`,
    });


export const cancelSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/cancel`,
    });


export const failSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/fail`,
    });


export const expireSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/expire`,
    });


export const applyContributionToChallenge =
  (
    challengeId,
    payload
  ) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/contributions`,
      data: payload,
    });


export const registerSuccessfulChallengePeriod =
  (
    challengeId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/periods/success`,
      data: payload,
    });


export const registerMissedChallengePeriod =
  (
    challengeId,
    payload = {}
  ) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/periods/missed`,
      data: payload,
    });


export const restoreSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}/restore`,
    });


export const archiveSavingsChallenge =
  (challengeId) =>
    request({
      method:
        HTTP_METHODS.DELETE,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.challenges}/${validateId(
          challengeId,
          "Challenge ID"
        )}`,
    });


/* ============================================================
   SAVINGS INSIGHTS
============================================================ */

/**
 * Dashboard-level savings intelligence.
 *
 * Optional backend query:
 *
 * ?asOfDate=2026-08-13
 */
export const getDashboardSavingInsights =
  (
    params = {}
  ) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.insights,
      params:
        cleanQueryParams(
          params
        ),
    });


export const getSavingInsightSummary =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.insights}/summary`,
    });


export const getTopSavingInsight =
  () =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.insights}/top`,
    });


export const getGoalSavingInsights =
  (
    goalId,
    params = {}
  ) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.insights}/goals/${validateId(
          goalId,
          "Goal ID"
        )}`,
      params:
        cleanQueryParams(
          params
        ),
    });


/* ============================================================
   AUTOSAVE — ISOLATED API
============================================================ */

/**
 * IMPORTANT
 *
 * These methods correspond to the separately supplied:
 *
 * /api/savings/auto-save
 *
 * route.
 *
 * The supplied savingsRoutes.js does NOT currently mount
 * autoSaveRoutes.js.
 *
 * Therefore these methods are intentionally isolated and
 * should not be used by the application until the backend
 * mounts that router.
 */


/* ------------------------------------------------------------
   CREATE
------------------------------------------------------------ */

export const createAutoSave =
  (payload) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        SMART_SAVE_ENDPOINTS.autoSave,
      data: payload,
    });


/* ------------------------------------------------------------
   LIST
------------------------------------------------------------ */

export const getAutoSaves =
  (params = {}) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        SMART_SAVE_ENDPOINTS.autoSave,
      params:
        normalizeListQuery(
          params
        ),
    });


/* ------------------------------------------------------------
   GET SINGLE
------------------------------------------------------------ */

export const getAutoSave =
  (autoSaveId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}`,
    });


/* ------------------------------------------------------------
   UPDATE
------------------------------------------------------------ */

export const updateAutoSave =
  (
    autoSaveId,
    payload
  ) =>
    request({
      method:
        HTTP_METHODS.PUT,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}`,
      data: payload,
    });


/* ------------------------------------------------------------
   DELETE
------------------------------------------------------------ */

export const deleteAutoSave =
  (autoSaveId) =>
    request({
      method:
        HTTP_METHODS.DELETE,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}`,
    });


/* ------------------------------------------------------------
   ACTIVATE
------------------------------------------------------------ */

export const activateAutoSave =
  (autoSaveId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}/activate`,
    });


/* ------------------------------------------------------------
   PAUSE
------------------------------------------------------------ */

export const pauseAutoSave =
  (autoSaveId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}/pause`,
    });


/* ------------------------------------------------------------
   RESUME
------------------------------------------------------------ */

export const resumeAutoSave =
  (autoSaveId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}/resume`,
    });


/* ------------------------------------------------------------
   CANCEL
------------------------------------------------------------ */

export const cancelAutoSave =
  (autoSaveId) =>
    request({
      method:
        HTTP_METHODS.POST,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}/cancel`,
    });


/* ------------------------------------------------------------
   STATISTICS
------------------------------------------------------------ */

export const getAutoSaveStats =
  (autoSaveId) =>
    request({
      method:
        HTTP_METHODS.GET,
      endpoint:
        `${SMART_SAVE_ENDPOINTS.autoSave}/${validateId(
          autoSaveId,
          "AutoSave ID"
        )}/stats`,
    });


/* ============================================================
   SERVICE OBJECT
============================================================ */

const smartSaveService = Object.freeze({
  /* Accounts */
  createSavingAccount,
  getSavingAccounts,
  getSavingAccount,
  getPrimarySavingAccount,
  updateSavingAccount,
  getSavingAccountBalance,
  getSavingAccountSummary,
  setPrimarySavingAccount,
  pauseSavingAccount,
  activateSavingAccount,
  lockSavingAccount,
  closeSavingAccount,

  /* Goals */
  getSavingGoals,
  getSavingGoal,
  getSavingGoalSummary,
  getSavingGoalContributions,
  getSavingHistory,
  checkSavingEligibility,

  /* Plans */
  createSavingPlan,
  getSavingPlans,
  getSavingPlan,
  updateSavingPlan,
  activateSavingPlan,
  pauseSavingPlan,
  resumeSavingPlan,
  completeSavingPlan,
  cancelSavingPlan,
  recalculateSavingPlanMetrics,
  refreshSavingPlanProgress,
  attachSavingPlanAutomation,
  detachSavingPlanAutomation,
  checkSavingPlanEligibility,
  getSavingPlanStatistics,

  /* Schedules */
  createSavingSchedule,
  getSavingSchedules,
  getActiveSavingSchedules,
  getSavingSchedule,
  updateSavingSchedule,
  activateSavingSchedule,
  pauseSavingSchedule,
  resumeSavingSchedule,
  cancelSavingSchedule,
  completeSavingSchedule,
  deleteSavingSchedule,
  getSavingScheduleStats,

  /* Executions */
  createSavingExecution,
  getSavingExecutions,
  getSavingExecutionStats,
  getSavingExecution,
  cancelSavingExecution,
  retrySavingExecution,

  /* Challenges */
  createSavingsChallenge,
  getSavingsChallenges,
  getSavingsChallengeSummary,
  getActiveSavingsChallenges,
  getPausedSavingsChallenges,
  getCompletedSavingsChallenges,
  getSavingsChallenge,
  getChallengeSnapshot,
  updateSavingsChallenge,
  activateSavingsChallenge,
  pauseSavingsChallenge,
  resumeSavingsChallenge,
  completeSavingsChallenge,
  cancelSavingsChallenge,
  failSavingsChallenge,
  expireSavingsChallenge,
  applyContributionToChallenge,
  registerSuccessfulChallengePeriod,
  registerMissedChallengePeriod,
  restoreSavingsChallenge,
  archiveSavingsChallenge,

  /* Insights */
  getDashboardSavingInsights,
  getSavingInsightSummary,
  getTopSavingInsight,
  getGoalSavingInsights,

  /* AutoSave — isolated */
  createAutoSave,
  getAutoSaves,
  getAutoSave,
  updateAutoSave,
  deleteAutoSave,
  activateAutoSave,
  pauseAutoSave,
  resumeAutoSave,
  cancelAutoSave,
  getAutoSaveStats,
});


/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default smartSaveService;