
// src/utils/smartSave/savingsNormalizers.js

/**
 * ============================================================
 * SMARTSAVE
 * SAVINGS NORMALIZERS
 * ============================================================
 *
 * Production-grade API -> UI normalization boundary.
 *
 * Responsibilities:
 *
 * - Normalize API response envelopes
 * - Normalize identifiers
 * - Normalize dates
 * - Normalize financial values
 * - Normalize statuses / enums
 * - Normalize pagination
 * - Normalize accounts
 * - Normalize goals
 * - Normalize plans
 * - Normalize schedules
 * - Normalize executions
 * - Normalize challenges
 * - Normalize insights
 * - Normalize AutoSave
 * - Normalize activities
 * - Normalize forecasts
 * - Normalize statistics / summaries
 * - Normalize composite SmartSave data
 *
 * Rules:
 *
 * - Pure functions only
 * - No API calls
 * - No React dependencies
 * - No state
 * - No mutations
 * - No service dependencies
 * - No UI dependencies
 * - Preserve unknown backend fields
 * - Never throw because of malformed API data
 * - Return predictable UI-safe shapes
 *
 * IMPORTANT:
 *
 * Business calculations belong to the backend/service layer.
 *
 * This module may normalize values returned by the backend,
 * but must NOT become a second financial engine.
 * ============================================================
 */

/* ============================================================
   CONSTANTS
============================================================ */

export const DEFAULT_CURRENCY = "NGN";

export const NORMALIZED_EMPTY_ARRAY = Object.freeze([]);

export const DEFAULT_PAGINATION = Object.freeze({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
  hasNext: false,
  hasPrevious: false,
  hasNextPage: false,
  hasPrevPage: false,
});

/* ============================================================
   INTERNAL TYPE HELPERS
============================================================ */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const isArray = Array.isArray;

/* ============================================================
   INTERNAL VALUE HELPERS
============================================================ */

const toStringValue = (
  value,
  fallback = ""
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return fallback;
};

const toNumber = (
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

  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : fallback;
  }

  if (
    typeof value === "string"
  ) {
    const normalized = value
      .replace(/,/g, "")
      .replace(/₦/g, "")
      .trim();

    if (!normalized) {
      return fallback;
    }

    const parsed = Number(
      normalized
    );

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const toNonNegativeNumber = (
  value,
  fallback = 0
) =>
  Math.max(
    0,
    toNumber(
      value,
      fallback
    )
  );

const toInteger = (
  value,
  fallback = 0
) =>
  Math.floor(
    toNumber(
      value,
      fallback
    )
  );

const toBoolean = (
  value,
  fallback = false
) => {
  if (
    value === true ||
    value === false
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const normalized = value
      .trim()
      .toLowerCase();

    if (
      [
        "true",
        "1",
        "yes",
        "y",
        "on",
      ].includes(normalized)
    ) {
      return true;
    }

    if (
      [
        "false",
        "0",
        "no",
        "n",
        "off",
      ].includes(normalized)
    ) {
      return false;
    }
  }

  if (
    typeof value === "number"
  ) {
    return value !== 0;
  }

  return fallback;
};

const firstDefined = (
  ...values
) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null
  );

/* ============================================================
   ID NORMALIZATION
============================================================ */

export const normalizeId = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value).trim();
  }

  if (isObject(value)) {
    return normalizeId(
      firstDefined(
        value.$oid,
        value._id,
        value.id
      )
    );
  }

  if (
    typeof value?.toString ===
    "function"
  ) {
    const stringValue =
      value.toString();

    if (
      stringValue &&
      stringValue !==
        "[object Object]"
    ) {
      return stringValue;
    }
  }

  return "";
};

/* ============================================================
   DATE NORMALIZATION
============================================================ */

export const normalizeDate = (
  value
) => {
  if (!value) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : new Date(value);
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};

export const normalizeDateValue = (
  value
) => {
  const date =
    normalizeDate(value);

  return date
    ? date.toISOString()
    : null;
};

export const normalizeInputDate = (
  value
) => {
  const date =
    normalizeDate(value);

  return date
    ? date.toISOString().slice(
        0,
        10
      )
    : "";
};

/* ============================================================
   ENUM NORMALIZATION
============================================================ */

export const normalizeSavingsStatus = (
  value,
  fallback = "unknown"
) => {
  const normalized =
    toStringValue(
      value
    )
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_");

  return (
    normalized ||
    fallback
  );
};

export const normalizeCurrency = (
  value,
  fallback = DEFAULT_CURRENCY
) => {
  const currency =
    toStringValue(
      value
    ).toUpperCase();

  return (
    currency ||
    fallback
  );
};

export const normalizeFrequency = (
  value,
  fallback = "monthly"
) =>
  normalizeSavingsStatus(
    value,
    fallback
  );

export const normalizeType = (
  value,
  fallback = ""
) =>
  normalizeSavingsStatus(
    value,
    fallback
  );

/* ============================================================
   FINANCIAL NORMALIZATION
============================================================ */

export const normalizeMoney = (
  value,
  fallback = 0
) =>
  toNonNegativeNumber(
    value,
    fallback
  );

/* ============================================================
   PERCENTAGE / PROGRESS
============================================================ */

export const normalizePercentage = (
  value,
  fallback = 0
) => {
  const percentage =
    toNumber(
      value,
      fallback
    );

  return Math.min(
    100,
    Math.max(
      0,
      percentage
    )
  );
};

export const calculateProgressPercentage = (
  currentAmount,
  targetAmount
) => {
  const current =
    normalizeMoney(
      currentAmount
    );

  const target =
    normalizeMoney(
      targetAmount
    );

  if (
    target <= 0
  ) {
    return 0;
  }

  return normalizePercentage(
    (current / target) *
      100
  );
};

/* ============================================================
   API RESPONSE UNWRAPPING
============================================================ */

export const unwrapResponse = (
  response
) => {
  if (
    response === null ||
    response === undefined
  ) {
    return null;
  }

  if (
    isArray(response)
  ) {
    return response;
  }

  if (
    !isObject(response)
  ) {
    return response;
  }

  /*
   * Axios response:
   *
   * {
   *   data: {
   *     success: true,
   *     data: {...}
   *   }
   * }
   */

  if (
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    const data =
      response.data;

    if (
      isObject(data)
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          data,
          "data"
        )
      ) {
        return data.data;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          data,
          "result"
        )
      ) {
        return data.result;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          data,
          "payload"
        )
      ) {
        return data.payload;
      }
    }

    return data;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      response,
      "result"
    )
  ) {
    return response.result;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      response,
      "payload"
    )
  ) {
    return response.payload;
  }

  return response;
};

/* ============================================================
   ARRAY NORMALIZATION
============================================================ */

export const normalizeArrayResponse = (
  response,
  keys = []
) => {
  const payload =
    unwrapResponse(response);

  if (
    isArray(payload)
  ) {
    return payload;
  }

  if (
    !isObject(payload)
  ) {
    return [];
  }

  const candidateKeys = [
    ...keys,

    "items",
    "records",
    "results",
    "docs",

    "accounts",
    "savingAccounts",
    "savingsAccounts",

    "goals",
    "savingGoals",
    "savingsGoals",

    "plans",
    "savingPlans",
    "savingsPlans",

    "schedules",
    "savingSchedules",

    "executions",
    "savingExecutions",

    "challenges",
    "savingsChallenges",

    "insights",
    "savingsInsights",

    "autoSaves",
    "automaticSavings",

    "activities",
    "activity",
    "savingsActivity",
    "savingsActivities",

    "forecasts",
    "forecast",
  ];

  for (
    const key of candidateKeys
  ) {
    if (
      isArray(
        payload[key]
      )
    ) {
      return payload[key];
    }
  }

  return [];
};

/* ============================================================
   PAGINATION
============================================================ */

export const normalizePagination = (
  value = {}
) => {
  const payload =
    unwrapResponse(value);

  const source =
    isObject(
      payload?.pagination
    )
      ? payload.pagination
      : isObject(
          payload?.meta
        )
      ? payload.meta
      : isObject(payload)
      ? payload
      : {};

  const page =
    Math.max(
      1,
      toInteger(
        firstDefined(
          source.page,
          source.currentPage
        ),
        1
      )
    );

  const limit =
    Math.max(
      1,
      toInteger(
        firstDefined(
          source.limit,
          source.pageSize,
          source.perPage
        ),
        20
      )
    );

  const total =
    Math.max(
      0,
      toInteger(
        firstDefined(
          source.total,
          source.totalItems,
          source.count
        ),
        0
      )
    );

  const pages =
    Math.max(
      0,
      toInteger(
        firstDefined(
          source.pages,
          source.totalPages
        ),
        Math.ceil(
          total / limit
        )
      )
    );

  const hasNext =
    source.hasNext !==
      undefined
      ? toBoolean(
          source.hasNext
        )
      : source.hasNextPage !==
          undefined
      ? toBoolean(
          source.hasNextPage
        )
      : page < pages;

  const hasPrevious =
    source.hasPrevious !==
      undefined
      ? toBoolean(
          source.hasPrevious
        )
      : source.hasPrev !==
          undefined
      ? toBoolean(
          source.hasPrev
        )
      : source.hasPreviousPage !==
          undefined
      ? toBoolean(
          source.hasPreviousPage
        )
      : page > 1;

  return {
    page,
    limit,
    total,
    pages,

    hasNext,

    hasPrevious,

    /*
     * Compatibility aliases.
     */
    hasNextPage:
      hasNext,

    hasPrevPage:
      hasPrevious,
  };
};

export const normalizePaginatedResponse = (
  response,
  arrayKeys = []
) => ({
  data:
    normalizeArrayResponse(
      response,
      arrayKeys
    ),

  pagination:
    normalizePagination(
      response
    ),
});

/* ============================================================
   ACCOUNT NORMALIZER
============================================================ */

export const normalizeSavingAccount = (
  account
) => {
  if (
    !isObject(account)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        account.id,
        account._id,
        account.accountId
      )
    );

  const balance =
    normalizeMoney(
      firstDefined(
        account.balance,
        account.currentBalance,
        account.amount
      )
    );

  const availableBalance =
    normalizeMoney(
      firstDefined(
        account.availableBalance,
        balance
      )
    );

  const status =
    normalizeSavingsStatus(
      account.status,
      "active"
    );

  return {
    ...account,

    id,

    _id:
      id || undefined,

    name:
      toStringValue(
        firstDefined(
          account.name,
          account.accountName,
          account.title
        ),
        "Savings Account"
      ),

    accountType:
      normalizeType(
        firstDefined(
          account.accountType,
          account.type
        ),
        "savings"
      ),

    currency:
      normalizeCurrency(
        account.currency
      ),

    balance,

    currentBalance:
      balance,

    availableBalance,

    status,

    isPrimary:
      toBoolean(
        firstDefined(
          account.isPrimary,
          account.primary
        )
      ),

    isLocked:
      toBoolean(
        firstDefined(
          account.isLocked,
          account.locked
        )
      ),

    isActive:
      account.isActive !==
      undefined
        ? toBoolean(
            account.isActive
          )
        : status === "active",

    createdAt:
      normalizeDateValue(
        account.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        account.updatedAt
      ),
  };
};

export const normalizeSavingAccounts = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "accounts",
      "savingAccounts",
      "savingsAccounts",
    ]
  )
    .map(
      normalizeSavingAccount
    )
    .filter(Boolean);

export const normalizeAccountResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  if (
    isArray(payload)
  ) {
    return normalizeSavingAccounts(
      payload
    );
  }

  return normalizeSavingAccount(
    payload?.account ??
      payload
  );
};

/* ============================================================
   GOAL NORMALIZER
============================================================ */

export const normalizeSavingsGoal = (
  goal
) => {
  if (
    !isObject(goal)
  ) {
    return null;
  }
  

  const id =
    normalizeId(
      firstDefined(
        goal.id,
        goal._id,
        goal.goalId
      )
    );

  const targetAmount =
    normalizeMoney(
      firstDefined(
        goal.targetAmount,
        goal.goalAmount,
        goal.target,
        goal.targetValue,
        goal.amount
      )
    );

    

  const currentAmount =
    normalizeMoney(
      firstDefined(
        goal.currentAmount,
        goal.savedAmount,
        goal.amountSaved,
        goal.progressAmount,
        goal.totalSaved,
        goal.currentBalance
      )
    );

  const remainingAmount =
    Math.max(
      0,
      normalizeMoney(
        firstDefined(
          goal.remainingAmount,
          targetAmount -
            currentAmount
        )
      )
    );

    

  const progress =
    calculateProgressPercentage(
      currentAmount,
      targetAmount
    );

  const targetDate =
    normalizeDateValue(
      firstDefined(
        goal.targetDate,
        goal.deadline,
        goal.dueDate
      )
    );

  return {
    ...goal,

    id,

    _id:
      id || undefined,

    name:
      toStringValue(
        firstDefined(
          goal.name,
          goal.title,
          goal.goalName
        ),
        "Savings Goal"
      ),

    title:
      toStringValue(
        firstDefined(
          goal.title,
          goal.name,
          goal.goalName
        ),
        "Savings Goal"
      ),

    description:
      toStringValue(
        goal.description
      ),

    targetAmount,

    currentAmount,

    savedAmount:
      currentAmount,

    amountSaved:
      currentAmount,

    remainingAmount,

    progress,

    progressPercentage:
      progress,

    currency:
      normalizeCurrency(
        goal.currency
      ),

    status:
      normalizeSavingsStatus(
        goal.status,
        "active"
      ),

    category:
      normalizeType(
        goal.category,
        "personal"
      ),

    priority:
      normalizeType(
        goal.priority,
        "medium"
      ),

    targetDate,

    deadline:
      targetDate,

    isCompleted:
      goal.isCompleted !==
      undefined
        ? toBoolean(
            goal.isCompleted
          )
        : progress >= 100,

    createdAt:
      normalizeDateValue(
        goal.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        goal.updatedAt
      ),
  };
};

export const normalizeSavingGoals = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "goals",
      "savingGoals",
      "savingsGoals",
    ]
  )
    .map(
      normalizeSavingsGoal
    )
    .filter(Boolean);

export const normalizeGoalResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeSavingsGoal(
    payload?.goal ??
      payload
  );
};

/* ============================================================
   PLAN NORMALIZER
============================================================ */

export const normalizeSavingPlan = (
  plan
) => {
  if (
    !isObject(plan)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        plan.id,
        plan._id,
        plan.planId
      )
    );

  const contributionAmount =
    normalizeMoney(
      firstDefined(
        plan.contributionAmount,
        plan.amount,
        plan.savingAmount
      )
    );

  const savedAmount =
    normalizeMoney(
      firstDefined(
        plan.savedAmount,
        plan.currentAmount,
        plan.amountSaved
      )
    );

  return {
    ...plan,

    id,

    _id:
      id || undefined,

    name:
      toStringValue(
        firstDefined(
          plan.name,
          plan.title,
          plan.planName
        ),
        "Savings Plan"
      ),

    title:
      toStringValue(
        firstDefined(
          plan.title,
          plan.name,
          plan.planName
        ),
        "Savings Plan"
      ),

    description:
      toStringValue(
        plan.description
      ),

    amount:
      contributionAmount,

    contributionAmount,

    savingAmount:
      contributionAmount,

    targetAmount:
      normalizeMoney(
        plan.targetAmount
      ),

    savedAmount,

    currentAmount:
      savedAmount,

    progressPercentage:
      normalizePercentage(
        firstDefined(
          plan.progressPercentage,
          plan.progress
        )
      ),

    currency:
      normalizeCurrency(
        plan.currency
      ),

    frequency:
      normalizeFrequency(
        plan.frequency
      ),

    status:
      normalizeSavingsStatus(
        plan.status,
        "draft"
      ),

    automated:
      toBoolean(
        firstDefined(
          plan.automated,
          plan.isAutomated
        )
      ),

    goalId:
      normalizeId(
        firstDefined(
          plan.goalId,
          plan.savingGoalId,
          plan.goal?._id,
          plan.goal?.id
        )
      ),

    savingAccountId:
      normalizeId(
        firstDefined(
          plan.savingAccountId,
          plan.accountId,
          plan.savingAccount?._id,
          plan.savingAccount?.id
        )
      ),

    dailyContribution:
      normalizeMoney(
        plan.dailyContribution
      ),

    weeklyContribution:
      normalizeMoney(
        plan.weeklyContribution
      ),

    monthlyContribution:
      normalizeMoney(
        plan.monthlyContribution
      ),

    startDate:
      normalizeDateValue(
        plan.startDate
      ),

    endDate:
      normalizeDateValue(
        plan.endDate
      ),

    createdAt:
      normalizeDateValue(
        plan.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        plan.updatedAt
      ),
  };
};

export const normalizeSavingPlans = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "plans",
      "savingPlans",
      "savingsPlans",
    ]
  )
    .map(
      normalizeSavingPlan
    )
    .filter(Boolean);

export const normalizePlanResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeSavingPlan(
    payload?.plan ??
      payload
  );
};

/* ============================================================
   SCHEDULE NORMALIZER
============================================================ */

export const normalizeSavingSchedule = (
  schedule
) => {
  if (
    !isObject(schedule)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        schedule.id,
        schedule._id,
        schedule.scheduleId
      )
    );

  const amount =
    normalizeMoney(
      firstDefined(
        schedule.amount,
        schedule.baseAmount,
        schedule.contributionAmount
      )
    );

  return {
    ...schedule,

    id,

    _id:
      id || undefined,

    name:
      toStringValue(
        firstDefined(
          schedule.name,
          schedule.title,
          schedule.scheduleName
        ),
        "Savings Schedule"
      ),

    amount,

    baseAmount:
      amount,

    contributionAmount:
      amount,

    currency:
      normalizeCurrency(
        schedule.currency
      ),

    status:
      normalizeSavingsStatus(
        schedule.status,
        "active"
      ),

    frequency:
      normalizeFrequency(
        schedule.frequency
      ),

    fundingSource:
      normalizeType(
        schedule.fundingSource,
        "wallet"
      ),

    strategy:
      normalizeType(
        schedule.strategy,
        "fixed"
      ),

    isAutomatic:
      toBoolean(
        firstDefined(
          schedule.isAutomatic,
          schedule.automatic
        ),
        true
      ),

    savingGoalId:
      normalizeId(
        firstDefined(
          schedule.savingGoalId,
          schedule.goalId,
          schedule.savingGoal?._id,
          schedule.savingGoal?.id
        )
      ),

    goalId:
      normalizeId(
        firstDefined(
          schedule.goalId,
          schedule.savingGoalId,
          schedule.savingGoal?._id,
          schedule.savingGoal?.id
        )
      ),

    nextExecutionAt:
      normalizeDateValue(
        firstDefined(
          schedule.nextExecutionAt,
          schedule.nextExecutionDate,
          schedule.nextDate
        )
      ),

    nextExecutionDate:
      normalizeDateValue(
        firstDefined(
          schedule.nextExecutionDate,
          schedule.nextExecutionAt,
          schedule.nextDate
        )
      ),

    lastExecutionAt:
      normalizeDateValue(
        firstDefined(
          schedule.lastExecutionAt,
          schedule.lastExecutionDate,
          schedule.lastDate
        )
      ),

    lastExecutionDate:
      normalizeDateValue(
        firstDefined(
          schedule.lastExecutionDate,
          schedule.lastExecutionAt,
          schedule.lastDate
        )
      ),

    createdAt:
      normalizeDateValue(
        schedule.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        schedule.updatedAt
      ),
  };
};

export const normalizeSavingSchedules = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "schedules",
      "savingSchedules",
    ]
  )
    .map(
      normalizeSavingSchedule
    )
    .filter(Boolean);

export const normalizeScheduleResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeSavingSchedule(
    payload?.schedule ??
      payload
  );
};

/* ============================================================
   EXECUTION NORMALIZER
============================================================ */

export const normalizeSavingExecution = (
  execution
) => {
  if (
    !isObject(execution)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        execution.id,
        execution._id,
        execution.executionId
      )
    );

  const amount =
    normalizeMoney(
      firstDefined(
        execution.amount,
        execution.baseAmount
      )
    );

  return {
    ...execution,

    id,

    _id:
      id || undefined,

    scheduleId:
      normalizeId(
        firstDefined(
          execution.scheduleId,
          execution.savingScheduleId,
          execution.savingSchedule?._id,
          execution.savingSchedule?.id
        )
      ),

    savingGoalId:
      normalizeId(
        firstDefined(
          execution.savingGoalId,
          execution.goalId,
          execution.savingGoal?._id,
          execution.savingGoal?.id
        )
      ),

    goalId:
      normalizeId(
        firstDefined(
          execution.goalId,
          execution.savingGoalId,
          execution.savingGoal?._id,
          execution.savingGoal?.id
        )
      ),

    status:
      normalizeSavingsStatus(
        execution.status,
        "pending"
      ),

    amount,

    baseAmount:
      normalizeMoney(
        firstDefined(
          execution.baseAmount,
          amount
        )
      ),

    currency:
      normalizeCurrency(
        execution.currency
      ),

    executionAt:
      normalizeDateValue(
        firstDefined(
          execution.executionAt,
          execution.executionDate,
          execution.executedAt
        )
      ),

    executedAt:
      normalizeDateValue(
        firstDefined(
          execution.executedAt,
          execution.executionAt,
          execution.executionDate
        )
      ),

    executionDate:
      normalizeDateValue(
        firstDefined(
          execution.executionDate,
          execution.executedAt,
          execution.executionAt
        )
      ),

    cancelledAt:
      normalizeDateValue(
        execution.cancelledAt
      ),

    createdAt:
      normalizeDateValue(
        execution.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        execution.updatedAt
      ),
  };
};

export const normalizeSavingExecutions = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "executions",
      "savingExecutions",
    ]
  )
    .map(
      normalizeSavingExecution
    )
    .filter(Boolean);

export const normalizeExecutionResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeSavingExecution(
    payload?.execution ??
      payload
  );
};


/* ============================================================
   CHALLENGE PAYLOAD NORMALIZER
============================================================ */

/**
 * Normalize a savings challenge request payload before it is
 * sent to the SmartSave API.
 *
 * Responsibilities:
 * - Normalize supported challenge input fields
 * - Remove frontend-only derived fields
 * - Preserve backend-compatible values
 * - Avoid financial calculations
 * - Avoid mutating the original payload
 *
 * This function is intentionally different from
 * normalizeSavingsChallenge().
 *
 * normalizeSavingsChallenge()
 * ---------------------------
 * Backend → Frontend
 *
 * normalizeChallengePayload()
 * ---------------------------
 * Frontend → Backend
 *
 * ============================================================
 */

export const normalizeChallengePayload = (
  payload
) => {
  if (!isObject(payload)) {
    return {};
  }

  /*
   * ----------------------------------------------------------
   * ID
   * ----------------------------------------------------------
   *
   * IDs are generally not required when creating a challenge.
   * Preserve one only when explicitly supplied.
   */

  const id = normalizeId(
    firstDefined(
      payload.id,
      payload._id,
      payload.challengeId
    )
  );

  /*
   * ----------------------------------------------------------
   * NAME / TITLE
   * ----------------------------------------------------------
   */

  const name = toStringValue(
    firstDefined(
      payload.name,
      payload.title,
      payload.challengeName
    )
  );

  const title = toStringValue(
    firstDefined(
      payload.title,
      payload.name,
      payload.challengeName
    )
  );

  /*
   * ----------------------------------------------------------
   * DESCRIPTION
   * ----------------------------------------------------------
   */

  const description =
    toStringValue(
      payload.description
    );

  /*
   * ----------------------------------------------------------
   * CHALLENGE TYPE
   * ----------------------------------------------------------
   */

  const challengeType =
    normalizeType(
      firstDefined(
        payload.challengeType,
        payload.type
      ),
      "custom"
    );

  /*
   * ----------------------------------------------------------
   * DIFFICULTY
   * ----------------------------------------------------------
   */

  const difficulty =
    normalizeType(
      payload.difficulty,
      "beginner"
    );

  /*
   * ----------------------------------------------------------
   * TARGET AMOUNT
   * ----------------------------------------------------------
   *
   * The target amount is an input supplied by the user.
   */

  const targetAmount =
    normalizeMoney(
      firstDefined(
        payload.targetAmount,
        payload.target
      )
    );

  /*
   * ----------------------------------------------------------
   * CURRENCY
   * ----------------------------------------------------------
   */

  const currency =
    normalizeCurrency(
      payload.currency
    );

  /*
   * ----------------------------------------------------------
   * DATES
   * ----------------------------------------------------------
   */

  const startDate =
    normalizeDateValue(
      payload.startDate
    );

  const endDate =
    normalizeDateValue(
      payload.endDate
    );

  /*
   * ----------------------------------------------------------
   * BUILD PAYLOAD
   * ----------------------------------------------------------
   *
   * Start from an explicit allowlist rather than spreading
   * the entire frontend object.
   *
   * This prevents frontend-only properties from accidentally
   * being sent to the backend.
   */

  const normalized = {};

  if (id) {
    normalized.id = id;
  }

  if (name) {
    normalized.name = name;
  }

  if (title) {
    normalized.title = title;
  }

  if (description) {
    normalized.description =
      description;
  }

  normalized.challengeType =
    challengeType;

  normalized.difficulty =
    difficulty;

  normalized.targetAmount =
    targetAmount;

  if (currency) {
    normalized.currency =
      currency;
  }

  if (startDate) {
    normalized.startDate =
      startDate;
  }

  if (endDate) {
    normalized.endDate =
      endDate;
  }

  /*
   * ----------------------------------------------------------
   * OPTIONAL BACKEND INPUTS
   * ----------------------------------------------------------
   *
   * These are preserved only when explicitly supplied.
   *
   * They should only be kept here if they are part of the
   * backend challenge creation/update contract.
   */

  if (
    payload.duration !==
      undefined &&
    payload.duration !== null
  ) {
    normalized.duration =
      toInteger(
        payload.duration
      );
  }

  if (
    payload.frequency !==
      undefined &&
    payload.frequency !== null
  ) {
    normalized.frequency =
      normalizeType(
        payload.frequency
      );
  }

  if (
    payload.contributionAmount !==
      undefined &&
    payload.contributionAmount !== null
  ) {
    normalized.contributionAmount =
      normalizeMoney(
        payload.contributionAmount
      );
  }

  if (
    payload.contributionFrequency !==
      undefined &&
    payload.contributionFrequency !==
      null
  ) {
    normalized.contributionFrequency =
      normalizeType(
        payload.contributionFrequency
      );
  }

  /*
   * ----------------------------------------------------------
   * RETURN
   * ----------------------------------------------------------
   */

  return normalized;
};



/* ============================================================
   CHALLENGE NORMALIZER
============================================================ */

export const normalizeSavingsChallenge = (
  challenge
) => {
  if (
    !isObject(challenge)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        challenge.id,
        challenge._id,
        challenge.challengeId
      )
    );

  const targetAmount =
    normalizeMoney(
      firstDefined(
        challenge.targetAmount,
        challenge.target
      )
    );

  const currentAmount =
    normalizeMoney(
      firstDefined(
        challenge.currentAmount,
        challenge.savedAmount,
        challenge.progressAmount,
        challenge.amountSaved
      )
    );

  const progress =
    calculateProgressPercentage(
      currentAmount,
      targetAmount
    );

  return {
    ...challenge,

    id,

    _id:
      id || undefined,

    name:
      toStringValue(
        firstDefined(
          challenge.name,
          challenge.title,
          challenge.challengeName
        ),
        "Savings Challenge"
      ),

    title:
      toStringValue(
        firstDefined(
          challenge.title,
          challenge.name,
          challenge.challengeName
        ),
        "Savings Challenge"
      ),

    description:
      toStringValue(
        challenge.description
      ),

    challengeType:
      normalizeType(
        firstDefined(
          challenge.challengeType,
          challenge.type
        ),
        "custom"
      ),

    difficulty:
      normalizeType(
        challenge.difficulty,
        "beginner"
      ),

    status:
      normalizeSavingsStatus(
        challenge.status,
        "active"
      ),

    targetAmount,

    currentAmount,

    savedAmount:
      currentAmount,

    remainingAmount:
      Math.max(
        0,
        targetAmount -
          currentAmount
      ),

    progress,

    progressPercentage:
      progress,

    currentStreak:
      Math.max(
        0,
        toInteger(
          challenge.currentStreak
        )
      ),

    longestStreak:
      Math.max(
        0,
        toInteger(
          challenge.longestStreak
        )
      ),

    successfulPeriods:
      Math.max(
        0,
        toInteger(
          challenge.successfulPeriods
        )
      ),

    missedPeriods:
      Math.max(
        0,
        toInteger(
          challenge.missedPeriods
        )
      ),

    currency:
      normalizeCurrency(
        challenge.currency
      ),

    startDate:
      normalizeDateValue(
        challenge.startDate
      ),

    endDate:
      normalizeDateValue(
        challenge.endDate
      ),

    createdAt:
      normalizeDateValue(
        challenge.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        challenge.updatedAt
      ),
  };
};

export const normalizeSavingsChallenges = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "challenges",
      "savingsChallenges",
    ]
  )
    .map(
      normalizeSavingsChallenge
    )
    .filter(Boolean);

export const normalizeChallengeResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeSavingsChallenge(
    payload?.challenge ??
      payload
  );
};

/* ============================================================
   INSIGHT NORMALIZER
============================================================ */

export const normalizeSavingsInsight = (
  insight
) => {
  if (
    !isObject(insight)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        insight.id,
        insight._id,
        insight.insightId
      )
    );

  return {
    ...insight,

    id,

    _id:
      id || undefined,

    type:
      normalizeType(
        firstDefined(
          insight.type,
          insight.insightType
        ),
        "general"
      ),

    priority:
      normalizeType(
        insight.priority,
        "medium"
      ),

    severity:
      normalizeType(
        insight.severity,
        "info"
      ),

    title:
      toStringValue(
        firstDefined(
          insight.title,
          insight.name
        ),
        "Savings Insight"
      ),

    message:
      toStringValue(
        firstDefined(
          insight.message,
          insight.description,
          insight.content
        )
      ),

    description:
      toStringValue(
        firstDefined(
          insight.description,
          insight.message
        )
      ),

    recommendation:
      toStringValue(
        insight.recommendation
      ),

    actionable:
      toBoolean(
        insight.actionable
      ),

    goalId:
      normalizeId(
        firstDefined(
          insight.goalId,
          insight.savingGoalId,
          insight.goal?._id,
          insight.goal?.id
        )
      ),

    createdAt:
      normalizeDateValue(
        insight.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        insight.updatedAt
      ),
  };
};

export const normalizeSavingsInsights = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "insights",
      "savingsInsights",
    ]
  )
    .map(
      normalizeSavingsInsight
    )
    .filter(Boolean);

export const normalizeInsightResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeSavingsInsight(
    payload?.insight ??
      payload
  );
};

/* ============================================================
   AUTOSAVE NORMALIZER
============================================================ */

export const normalizeAutoSave = (
  autoSave
) => {
  if (
    !isObject(autoSave)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        autoSave.id,
        autoSave._id,
        autoSave.autoSaveId
      )
    );

  const amount =
    normalizeMoney(
      firstDefined(
        autoSave.amount,
        autoSave.contributionAmount,
        autoSave.savingAmount
      )
    );

  const status =
    normalizeSavingsStatus(
      autoSave.status,
      "active"
    );

  return {
    ...autoSave,

    id,

    _id:
      id || undefined,

    amount,

    contributionAmount:
      amount,

    currency:
      normalizeCurrency(
        autoSave.currency
      ),

    frequency:
      normalizeFrequency(
        autoSave.frequency
      ),

    status,

    isActive:
      autoSave.isActive !==
      undefined
        ? toBoolean(
            autoSave.isActive
          )
        : status === "active",

    goalId:
      normalizeId(
        firstDefined(
          autoSave.goalId,
          autoSave.savingGoalId,
          autoSave.goal?._id,
          autoSave.goal?.id
        )
      ),

    nextExecutionAt:
      normalizeDateValue(
        firstDefined(
          autoSave.nextExecutionAt,
          autoSave.nextExecutionDate,
          autoSave.nextDate
        )
      ),

    nextExecutionDate:
      normalizeDateValue(
        firstDefined(
          autoSave.nextExecutionDate,
          autoSave.nextExecutionAt,
          autoSave.nextDate
        )
      ),

    lastExecutionAt:
      normalizeDateValue(
        firstDefined(
          autoSave.lastExecutionAt,
          autoSave.lastExecutionDate,
          autoSave.lastDate
        )
      ),

    lastExecutionDate:
      normalizeDateValue(
        firstDefined(
          autoSave.lastExecutionDate,
          autoSave.lastExecutionAt,
          autoSave.lastDate
        )
      ),

    createdAt:
      normalizeDateValue(
        autoSave.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        autoSave.updatedAt
      ),
  };
};

export const normalizeAutoSaves = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "autoSaves",
      "automaticSavings",
      "autoSave",
    ]
  )
    .map(
      normalizeAutoSave
    )
    .filter(Boolean);

export const normalizeAutoSaveResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeAutoSave(
    payload?.autoSave ??
      payload
  );
};

/* ============================================================
   ACTIVITY NORMALIZER
============================================================ */

export const normalizeSavingsActivity = (
  activity
) => {
  if (
    !isObject(activity)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        activity.id,
        activity._id,
        activity.activityId,
        activity.transactionId,
        activity.executionId,
        activity.contributionId
      )
    );

  const amount =
    normalizeMoney(
      firstDefined(
        activity.amount,
        activity.value,
        activity.contributionAmount,
        activity.savedAmount
      )
    );

  const type =
    normalizeType(
      firstDefined(
        activity.type,
        activity.activityType,
        activity.action,
        activity.eventType
      ),
      "contribution"
    );

  const date =
    normalizeDateValue(
      firstDefined(
        activity.date,
        activity.activityDate,
        activity.createdAt,
        activity.timestamp
      )
    );

  return {
    ...activity,

    id,

    _id:
      id || undefined,

    type,

    activityType:
      type,

    title:
      toStringValue(
        firstDefined(
          activity.title,
          activity.name,
          activity.label
        ),
        "Savings Activity"
      ),

    description:
      toStringValue(
        firstDefined(
          activity.description,
          activity.message
        )
      ),

    amount,

    currency:
      normalizeCurrency(
        activity.currency
      ),

    goalId:
      normalizeId(
        firstDefined(
          activity.goalId,
          activity.savingGoalId,
          activity.goal?._id,
          activity.goal?.id
        )
      ),

    planId:
      normalizeId(
        firstDefined(
          activity.planId,
          activity.savingPlanId,
          activity.plan?._id,
          activity.plan?.id
        )
      ),

    scheduleId:
      normalizeId(
        firstDefined(
          activity.scheduleId,
          activity.savingScheduleId,
          activity.schedule?._id,
          activity.schedule?.id
        )
      ),

    challengeId:
      normalizeId(
        firstDefined(
          activity.challengeId,
          activity.challenge?._id,
          activity.challenge?.id
        )
      ),

    executionId:
      normalizeId(
        firstDefined(
          activity.executionId,
          activity.execution?._id,
          activity.execution?.id
        )
      ),

    status:
      normalizeSavingsStatus(
        activity.status,
        "completed"
      ),

    date,

    activityDate:
      date,

    createdAt:
      normalizeDateValue(
        activity.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        activity.updatedAt
      ),
  };
};

export const normalizeSavingsActivities = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "activities",
      "activity",
      "savingsActivity",
      "savingsActivities",
    ]
  )
    .map(
      normalizeSavingsActivity
    )
    .filter(Boolean);

export const normalizeActivityResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  return normalizeSavingsActivity(
    payload?.activity ??
      payload
  );
};

/* ============================================================
   FORECAST NORMALIZER
============================================================ */

/**
 * Forecast is a composite SmartSave feature.
 *
 * The backend may return a forecast directly or wrapped in:
 *
 * {
 *   forecast: {...}
 * }
 *
 * The normalizer intentionally preserves backend fields and
 * only standardizes common financial/projection properties.
 *
 * No forecast calculation is performed here.
 */

export const normalizeForecast = (
  forecast
) => {
  if (
    !isObject(forecast)
  ) {
    return null;
  }

  const id =
    normalizeId(
      firstDefined(
        forecast.id,
        forecast._id,
        forecast.forecastId
      )
    );

  const currentAmount =
    normalizeMoney(
      firstDefined(
        forecast.currentAmount,
        forecast.savedAmount,
        forecast.amountSaved,
        forecast.currentBalance,
        forecast.current
      )
    );

  const targetAmount =
    normalizeMoney(
      firstDefined(
        forecast.targetAmount,
        forecast.goalAmount,
        forecast.target
      )
    );

  const projectedAmount =
    normalizeMoney(
      firstDefined(
        forecast.projectedAmount,
        forecast.forecastAmount,
        forecast.expectedAmount,
        forecast.projectedSavings,
        forecast.projection
      )
    );

  const remainingAmount =
    normalizeMoney(
      firstDefined(
        forecast.remainingAmount,
        forecast.amountRemaining,
        Math.max(
          0,
          targetAmount -
            currentAmount
        )
      )
    );

  const progressPercentage =
    normalizePercentage(
      firstDefined(
        forecast.progressPercentage,
        forecast.progress,
        forecast.progressPercent
      ),
      calculateProgressPercentage(
        currentAmount,
        targetAmount
      )
    );

  return {
    ...forecast,

    id,

    _id:
      id || undefined,

    currency:
      normalizeCurrency(
        forecast.currency
      ),

    status:
      normalizeSavingsStatus(
        forecast.status,
        "active"
      ),

    type:
      normalizeType(
        firstDefined(
          forecast.type,
          forecast.forecastType
        ),
        "goal"
      ),

    currentAmount,

    savedAmount:
      currentAmount,

    targetAmount,

    projectedAmount,

    forecastAmount:
      projectedAmount,

    remainingAmount,

    progressPercentage,

    progress:
      progressPercentage,

    goalId:
      normalizeId(
        firstDefined(
          forecast.goalId,
          forecast.savingGoalId,
          forecast.goal?._id,
          forecast.goal?.id
        )
      ),

    planId:
      normalizeId(
        firstDefined(
          forecast.planId,
          forecast.savingPlanId,
          forecast.plan?._id,
          forecast.plan?.id
        )
      ),

    scheduleId:
      normalizeId(
        firstDefined(
          forecast.scheduleId,
          forecast.savingScheduleId,
          forecast.schedule?._id,
          forecast.schedule?.id
        )
      ),

    startDate:
      normalizeDateValue(
        firstDefined(
          forecast.startDate,
          forecast.forecastStartDate
        )
      ),

    targetDate:
      normalizeDateValue(
        firstDefined(
          forecast.targetDate,
          forecast.deadline,
          forecast.forecastDate,
          forecast.projectedCompletionDate
        )
      ),

    projectedCompletionDate:
      normalizeDateValue(
        firstDefined(
          forecast.projectedCompletionDate,
          forecast.completionDate,
          forecast.targetDate
        )
      ),

    frequency:
      normalizeFrequency(
        forecast.frequency
      ),

    contributionAmount:
      normalizeMoney(
        firstDefined(
          forecast.contributionAmount,
          forecast.amountPerPeriod,
          forecast.savingAmount
        )
      ),

    createdAt:
      normalizeDateValue(
        forecast.createdAt
      ),

    updatedAt:
      normalizeDateValue(
        forecast.updatedAt
      ),
  };
};

export const normalizeForecasts = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "forecasts",
      "forecast",
    ]
  )
    .map(
      normalizeForecast
    )
    .filter(Boolean);

export const normalizeForecastResponse = (
  response
) => {
  const payload =
    unwrapResponse(response);

  if (
    isArray(payload)
  ) {
    return normalizeForecasts(
      payload
    );
  }

  return normalizeForecast(
    payload?.forecast ??
      payload
  );
};

/* ============================================================
   STATISTICS
============================================================ */

export const normalizeStatistics = (
  value
) => {
  const payload =
    unwrapResponse(value);

  if (
    !isObject(payload)
  ) {
    return {
      totalSaved: 0,
      totalTarget: 0,
      totalRemaining: 0,

      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,

      progress: 0,
      progressPercentage: 0,

      currency:
        DEFAULT_CURRENCY,
    };
  }

  const source =
    isObject(
      payload.statistics
    )
      ? payload.statistics
      : isObject(
          payload.stats
        )
      ? payload.stats
      : payload;

  const totalSaved =
    normalizeMoney(
      firstDefined(
        source.totalSaved,
        source.totalAmountSaved,
        source.savedAmount,
        source.saved
      )
    );

  const totalTarget =
    normalizeMoney(
      firstDefined(
        source.totalTarget,
        source.totalTargetAmount,
        source.targetAmount
      )
    );

  const totalRemaining =
    normalizeMoney(
      firstDefined(
        source.totalRemaining,
        source.remainingAmount,
        source.remaining
      ),
      Math.max(
        0,
        totalTarget -
          totalSaved
      )
    );

  const progress =
    normalizePercentage(
      firstDefined(
        source.progressPercentage,
        source.progress
      ),
      calculateProgressPercentage(
        totalSaved,
        totalTarget
      )
    );

  return {
    ...source,

    totalSaved,

    totalTarget,

    totalRemaining,

    totalGoals:
      Math.max(
        0,
        toInteger(
          firstDefined(
            source.totalGoals,
            source.goalsCount,
            source.goalCount
          )
        )
      ),

    activeGoals:
      Math.max(
        0,
        toInteger(
          firstDefined(
            source.activeGoals,
            source.activeCount
          )
        )
      ),

    completedGoals:
      Math.max(
        0,
        toInteger(
          firstDefined(
            source.completedGoals,
            source.completedCount
          )
        )
      ),

    progress,

    progressPercentage:
      progress,

    currency:
      normalizeCurrency(
        source.currency
      ),
  };
};

/* ============================================================
   SUMMARY
============================================================ */

export const normalizeSavingsSummary = (
  value
) =>
  normalizeStatistics(
    value
  );

/* ============================================================
   EMPTY SMARTSAVE DATA
============================================================ */

const createEmptySavingsData = () => ({
  accounts: [],
  goals: [],
  plans: [],
  schedules: [],
  executions: [],
  challenges: [],
  insights: [],
  autoSaves: [],
  activities: [],
  forecasts: [],

  statistics:
    normalizeStatistics(),

  summary:
    normalizeSavingsSummary(),

  pagination:
    normalizePagination(),
});

/* ============================================================
   COMPLETE SMARTSAVE DATA
============================================================ */

export const normalizeSavingsData = (
  response
) => {
  const payload =
    unwrapResponse(response);

  const empty =
    createEmptySavingsData();

  if (
    payload === null ||
    payload === undefined
  ) {
    return empty;
  }

  if (
    isArray(payload)
  ) {
    return {
      ...empty,

      goals:
        normalizeSavingGoals(
          payload
        ),
    };
  }

  if (
    !isObject(payload)
  ) {
    return empty;
  }

  const nested =
    isObject(
      payload.data
    )
      ? payload.data
      : null;

  const source =
    nested
      ? {
          ...payload,
          ...nested,
        }
      : payload;

  return {
    ...source,

    accounts:
      normalizeSavingAccounts(
        firstDefined(
          source.accounts,
          source.savingAccounts,
          source.savingsAccounts,
          []
        )
      ),

    goals:
      normalizeSavingGoals(
        firstDefined(
          source.goals,
          source.savingGoals,
          source.savingsGoals,
          []
        )
      ),

    plans:
      normalizeSavingPlans(
        firstDefined(
          source.plans,
          source.savingPlans,
          source.savingsPlans,
          []
        )
      ),

    schedules:
      normalizeSavingSchedules(
        firstDefined(
          source.schedules,
          source.savingSchedules,
          []
        )
      ),

    executions:
      normalizeSavingExecutions(
        firstDefined(
          source.executions,
          source.savingExecutions,
          []
        )
      ),

    challenges:
      normalizeSavingsChallenges(
        firstDefined(
          source.challenges,
          source.savingsChallenges,
          []
        )
      ),

    insights:
      normalizeSavingsInsights(
        firstDefined(
          source.insights,
          source.savingsInsights,
          []
        )
      ),

    autoSaves:
      normalizeAutoSaves(
        firstDefined(
          source.autoSaves,
          source.autoSave,
          source.automaticSavings,
          []
        )
      ),

    activities:
      normalizeSavingsActivities(
        firstDefined(
          source.activities,
          source.activity,
          source.savingsActivity,
          source.savingsActivities,
          []
        )
      ),

    forecasts:
      normalizeForecasts(
        firstDefined(
          source.forecasts,
          source.forecast,
          source.savingsForecasts,
          []
        )
      ),

    statistics:
      normalizeStatistics(
        firstDefined(
          source.statistics,
          source.stats,
          {}
        )
      ),

    summary:
      normalizeSavingsSummary(
        firstDefined(
          source.summary,
          source.savingsSummary,
          {}
        )
      ),

    pagination:
      normalizePagination(
        firstDefined(
          source.pagination,
          source.meta,
          {}
        )
      ),
  };
};


/* ============================================================
   ERROR NORMALIZER
============================================================ */

export const normalizeSavingsError = (
  error
) => {
  if (
    error === null ||
    error === undefined
  ) {
    return {
      message: "",
      code: "",
      type: "unknown",
      status: null,
      fieldErrors: {},
      details: null,
    };
  }

  if (
    typeof error === "string"
  ) {
    return {
      message: error.trim(),
      code: "",
      type: "unknown",
      status: null,
      fieldErrors: {},
      details: null,
    };
  }

  if (
    !isObject(error)
  ) {
    return {
      message: String(error),
      code: "",
      type: "unknown",
      status: null,
      fieldErrors: {},
      details: null,
    };
  }

  const responseData =
    isObject(error.response?.data)
      ? error.response.data
      : {};

  const source = {
    ...error,
    ...responseData,
  };

  const message =
    toStringValue(
      firstDefined(
        source.message,
        source.error,
        source.errorMessage,
        responseData.message,
        responseData.error
      )
    );

  const code =
    toStringValue(
      firstDefined(
        source.code,
        responseData.code
      )
    );

  const statusValue =
    firstDefined(
      source.status,
      source.statusCode,
      error.response?.status
    );

  const status =
    statusValue === null ||
    statusValue === undefined
      ? null
      : toInteger(
          statusValue,
          null
        );

  let type = "unknown";

  if (
    status === 401
  ) {
    type = "authentication";
  } else if (
    status === 403
  ) {
    type = "authorization";
  } else if (
    status === 404
  ) {
    type = "not_found";
  } else if (
    status >= 400 &&
    status < 500
  ) {
    type = "validation";
  } else if (
    status >= 500
  ) {
    type = "server";
  } else if (
    error.code === "ERR_NETWORK"
  ) {
    type = "network";
  }

  return {
    ...source,

    message:
      message ||
      "Something went wrong while processing your savings request.",

    code,

    type,

    status,

    fieldErrors:
      isObject(
        source.fieldErrors
      )
        ? source.fieldErrors
        : isObject(
            source.errors
          )
          ? source.errors
          : {},

    details:
      firstDefined(
        source.details,
        source.data,
        null
      ),
  };
};
/* ============================================================
   DEFAULT EXPORT
============================================================ */

const savingsNormalizers =
  Object.freeze({
    DEFAULT_CURRENCY,

    NORMALIZED_EMPTY_ARRAY,

    DEFAULT_PAGINATION,

    normalizeId,

    normalizeDate,
    normalizeDateValue,
    normalizeInputDate,
    normalizeSavingsError,

    normalizeSavingsStatus,
    normalizeCurrency,
    normalizeFrequency,
    normalizeType,

    normalizeMoney,

    normalizePercentage,
    calculateProgressPercentage,

    unwrapResponse,
    normalizeArrayResponse,

    normalizePagination,
    normalizePaginatedResponse,

    normalizeSavingAccount,
    normalizeSavingAccounts,
    normalizeAccountResponse,

    normalizeSavingsGoal,
    normalizeSavingGoals,
    normalizeGoalResponse,

    normalizeSavingPlan,
    normalizeSavingPlans,
    normalizePlanResponse,

    normalizeSavingSchedule,
    normalizeSavingSchedules,
    normalizeScheduleResponse,

    normalizeSavingExecution,
    normalizeSavingExecutions,
    normalizeExecutionResponse,

    normalizeSavingsChallenge,
    normalizeSavingsChallenges,
    normalizeChallengeResponse,

    normalizeSavingsInsight,
    normalizeSavingsInsights,
    normalizeInsightResponse,

    normalizeAutoSave,
    normalizeAutoSaves,
    normalizeAutoSaveResponse,

    normalizeSavingsActivity,
    normalizeSavingsActivities,
    normalizeActivityResponse,

    normalizeForecast,
    normalizeForecasts,
    normalizeForecastResponse,

    normalizeStatistics,
    normalizeSavingsSummary,

    normalizeSavingsData,
  });

export default savingsNormalizers;
