// services/autoSaveService.js

import mongoose from "mongoose";

import AutoSave from "../models/AutoSave.js";
import SavingGoal from "../models/SavingsGoal.js";
import SavingAccount from "../models/SavingAccount.js";
import SavingSchedule from "../models/SavingSchedule.js";
import SavingExecution from "../models/SavingExecution.js";
import SavingContribution from "../models/SavingContribution.js";

/* =========================================================
   CONSTANTS
========================================================= */

const AUTO_SAVE_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "cancelled",
  "failed",
];

const TERMINAL_STATUSES = [
  "completed",
  "cancelled",
];

const ACTIVE_CONFIGURATION_STATUSES = [
  "draft",
  "active",
  "paused",
];

const AUTO_SAVE_METHODS = [
  "fixed_amount",
  "percentage",
];

const AUTO_SAVE_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
];

const AUTO_SAVE_SOURCES = [
  "internal_balance",
  "bank_account",
  "card",
  "wallet",
];

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const VALID_OBJECT_ID = mongoose.Types.ObjectId.isValid;

/* =========================================================
   ERROR CLASS
========================================================= */

class AutoSaveServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "AUTO_SAVE_ERROR"
  ) {
    super(message);

    this.name = "AutoSaveServiceError";
    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace?.(
      this,
      AutoSaveServiceError
    );
  }
}

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const assertObjectId = (
  value,
  fieldName = "ID"
) => {
  if (!value || !VALID_OBJECT_ID(value)) {
    throw new AutoSaveServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_ID"
    );
  }
};

const assertUserId = (userId) => {
  assertObjectId(userId, "User ID");
};

const toObjectId = (value) => {
  assertObjectId(value);

  return value instanceof mongoose.Types.ObjectId
    ? value
    : new mongoose.Types.ObjectId(value);
};

const normalizeDate = (
  value,
  fieldName,
  {
    allowNull = true,
  } = {}
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    if (allowNull) {
      return null;
    }

    throw new AutoSaveServiceError(
      `${fieldName} is required`,
      400,
      "INVALID_DATE"
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AutoSaveServiceError(
      `${fieldName} must be a valid date`,
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

const normalizePagination = ({
  page = 1,
  limit = 20,
} = {}) => {
  const normalizedPage = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const normalizedLimit = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || 20,
      1
    ),
    100
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip:
      (normalizedPage - 1) *
      normalizedLimit,
  };
};

const applySession = (
  query,
  session
) => {
  if (session) {
    query.session(session);
  }

  return query;
};

const saveWithSession = async (
  document,
  session
) => {
  return document.save(
    session ? { session } : undefined
  );
};

const createWithSession = async (
  Model,
  payload,
  session
) => {
  const [document] = await Model.create(
    [payload],
    session ? { session } : undefined
  );

  return document;
};

/* =========================================================
   GOAL HELPERS
========================================================= */

const findUserGoal = async ({
  goalId,
  userId,
  session = null,
  allowTerminal = false,
}) => {
  assertObjectId(
    goalId,
    "Saving goal ID"
  );

  assertUserId(userId);

  const query = SavingGoal.findOne({
    _id: goalId,
    user: userId,
    isDeleted: false,
  });

  applySession(query, session);

  const goal = await query;

  if (!goal) {
    throw new AutoSaveServiceError(
      "Saving goal not found",
      404,
      "SAVING_GOAL_NOT_FOUND"
    );
  }

  if (
    !allowTerminal &&
    TERMINAL_STATUSES.includes(
      goal.status
    )
  ) {
    throw new AutoSaveServiceError(
      "Saving goal is no longer available",
      409,
      "GOAL_NOT_AVAILABLE"
    );
  }

  return goal;
};

/* =========================================================
   SAVING ACCOUNT HELPERS
========================================================= */

const findUserSavingAccount = async ({
  accountId,
  userId,
  session = null,
}) => {
  if (!accountId) {
    return null;
  }

  assertObjectId(
    accountId,
    "Saving account ID"
  );

  assertUserId(userId);

  const query = SavingAccount.findOne({
    _id: accountId,
    user: userId,
    isDeleted: false,
  });

  applySession(query, session);

  const account = await query;

  if (!account) {
    throw new AutoSaveServiceError(
      "Saving account not found",
      404,
      "SAVING_ACCOUNT_NOT_FOUND"
    );
  }

  return account;
};

/* =========================================================
   AUTOSAVE OWNERSHIP
========================================================= */

const findUserAutoSave = async ({
  autoSaveId,
  userId,
  session = null,
}) => {
  assertObjectId(
    autoSaveId,
    "AutoSave ID"
  );

  assertUserId(userId);

  const query = AutoSave.findOne({
    _id: autoSaveId,
    user: userId,
    isDeleted: false,
  });

  applySession(query, session);

  const autoSave = await query;

  if (!autoSave) {
    throw new AutoSaveServiceError(
      "AutoSave configuration not found",
      404,
      "AUTO_SAVE_NOT_FOUND"
    );
  }

  return autoSave;
};

/* =========================================================
   CONFIGURATION VALIDATION
========================================================= */

const validateAutoSaveConfiguration = (
  data = {},
  {
    partial = false,
  } = {}
) => {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new AutoSaveServiceError(
      "AutoSave configuration must be an object",
      400,
      "INVALID_INPUT"
    );
  }

  if (
    !partial ||
    Object.prototype.hasOwnProperty.call(
      data,
      "method"
    )
  ) {
    if (
      !AUTO_SAVE_METHODS.includes(
        data.method
      )
    ) {
      throw new AutoSaveServiceError(
        "method must be fixed_amount or percentage",
        400,
        "INVALID_METHOD"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "frequency"
    )
  ) {
    if (
      !AUTO_SAVE_FREQUENCIES.includes(
        data.frequency
      )
    ) {
      throw new AutoSaveServiceError(
        "Invalid AutoSave frequency",
        400,
        "INVALID_FREQUENCY"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "source"
    )
  ) {
    if (
      !AUTO_SAVE_SOURCES.includes(
        data.source
      )
    ) {
      throw new AutoSaveServiceError(
        "Invalid AutoSave source",
        400,
        "INVALID_SOURCE"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "dayOfWeek"
    ) &&
    data.dayOfWeek !== null &&
    data.dayOfWeek !== undefined
  ) {
    if (
      !DAYS_OF_WEEK.includes(
        data.dayOfWeek
      )
    ) {
      throw new AutoSaveServiceError(
        "Invalid dayOfWeek",
        400,
        "INVALID_DAY_OF_WEEK"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "dayOfMonth"
    ) &&
    data.dayOfMonth !== null &&
    data.dayOfMonth !== undefined
  ) {
    const day = Number(data.dayOfMonth);

    if (
      !Number.isInteger(day) ||
      day < 1 ||
      day > 31
    ) {
      throw new AutoSaveServiceError(
        "dayOfMonth must be between 1 and 31",
        400,
        "INVALID_DAY_OF_MONTH"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "executionTime"
    ) &&
    data.executionTime
  ) {
    if (
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(
        data.executionTime
      )
    ) {
      throw new AutoSaveServiceError(
        "executionTime must use HH:mm format",
        400,
        "INVALID_EXECUTION_TIME"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "startDate"
    )
  ) {
    normalizeDate(
      data.startDate,
      "Start date",
      { allowNull: false }
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "endDate"
    ) &&
    data.endDate !== null
  ) {
    normalizeDate(
      data.endDate,
      "End date"
    );
  }

  if (
    !partial ||
    Object.prototype.hasOwnProperty.call(
      data,
      "method"
    ) ||
    Object.prototype.hasOwnProperty.call(
      data,
      "amount"
    ) ||
    Object.prototype.hasOwnProperty.call(
      data,
      "percentage"
    )
  ) {
    const method = data.method;

    if (
      method === "fixed_amount"
    ) {
      if (
        !Number.isFinite(
          Number(data.amount)
        ) ||
        Number(data.amount) <= 0
      ) {
        throw new AutoSaveServiceError(
          "A positive amount is required for fixed_amount AutoSave",
          400,
          "INVALID_AUTO_SAVE_AMOUNT"
        );
      }
    }

    if (
      method === "percentage"
    ) {
      if (
        !Number.isFinite(
          Number(data.percentage)
        ) ||
        Number(data.percentage) <= 0 ||
        Number(data.percentage) > 100
      ) {
        throw new AutoSaveServiceError(
          "Percentage must be greater than 0 and not exceed 100",
          400,
          "INVALID_AUTO_SAVE_PERCENTAGE"
        );
      }
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "minimumBalanceRequired"
    )
  ) {
    if (
      data.minimumBalanceRequired !== null &&
      (
        !Number.isFinite(
          Number(
            data.minimumBalanceRequired
          )
        ) ||
        Number(
          data.minimumBalanceRequired
        ) < 0
      )
    ) {
      throw new AutoSaveServiceError(
        "minimumBalanceRequired must be zero or greater",
        400,
        "INVALID_MINIMUM_BALANCE"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "maximumPerExecution"
    )
  ) {
    if (
      data.maximumPerExecution !== null &&
      (
        !Number.isFinite(
          Number(
            data.maximumPerExecution
          )
        ) ||
        Number(
          data.maximumPerExecution
        ) <= 0
      )
    ) {
      throw new AutoSaveServiceError(
        "maximumPerExecution must be greater than zero",
        400,
        "INVALID_MAXIMUM_EXECUTION"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "maximumTotalAmount"
    )
  ) {
    if (
      data.maximumTotalAmount !== null &&
      (
        !Number.isFinite(
          Number(
            data.maximumTotalAmount
          )
        ) ||
        Number(
          data.maximumTotalAmount
        ) <= 0
      )
    ) {
      throw new AutoSaveServiceError(
        "maximumTotalAmount must be greater than zero",
        400,
        "INVALID_MAXIMUM_TOTAL"
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "maxRetries"
    )
  ) {
    const maxRetries =
      Number(data.maxRetries);

    if (
      !Number.isInteger(maxRetries) ||
      maxRetries < 0 ||
      maxRetries > 10
    ) {
      throw new AutoSaveServiceError(
        "maxRetries must be between 0 and 10",
        400,
        "INVALID_MAX_RETRIES"
      );
    }
  }

  if (
    data.method === "fixed_amount" &&
    data.maximumPerExecution !== null &&
    data.maximumPerExecution !== undefined &&
    Number(data.amount) >
      Number(data.maximumPerExecution)
  ) {
    throw new AutoSaveServiceError(
      "AutoSave amount exceeds maximumPerExecution",
      400,
      "EXECUTION_LIMIT_EXCEEDED"
    );
  }

  if (
    data.startDate &&
    data.endDate &&
    new Date(data.endDate) <
      new Date(data.startDate)
  ) {
    throw new AutoSaveServiceError(
      "endDate cannot be earlier than startDate",
      400,
      "INVALID_DATE_RANGE"
    );
  }

  if (
    data.frequency === "daily"
  ) {
    if (
      data.dayOfWeek !== undefined &&
      data.dayOfWeek !== null
    ) {
      throw new AutoSaveServiceError(
        "Daily AutoSave cannot define dayOfWeek",
        400,
        "INVALID_SCHEDULE_CONFIGURATION"
      );
    }

    if (
      data.dayOfMonth !== undefined &&
      data.dayOfMonth !== null
    ) {
      throw new AutoSaveServiceError(
        "Daily AutoSave cannot define dayOfMonth",
        400,
        "INVALID_SCHEDULE_CONFIGURATION"
      );
    }
  }

  if (
    ["weekly", "biweekly"].includes(
      data.frequency
    ) &&
    !data.dayOfWeek
  ) {
    throw new AutoSaveServiceError(
      "dayOfWeek is required for weekly and biweekly AutoSave",
      400,
      "INVALID_SCHEDULE_CONFIGURATION"
    );
  }

  if (
    data.frequency === "monthly" &&
    !data.dayOfMonth
  ) {
    throw new AutoSaveServiceError(
      "dayOfMonth is required for monthly AutoSave",
      400,
      "INVALID_SCHEDULE_CONFIGURATION"
    );
  }

  if (
    data.source &&
    data.source === "internal_balance" &&
    data.sourceAccount
  ) {
    throw new AutoSaveServiceError(
      "sourceAccount must not be supplied for internal_balance",
      400,
      "INVALID_SOURCE_ACCOUNT"
    );
  }

  if (
    data.source &&
    data.source !== "internal_balance" &&
    !data.sourceAccount
  ) {
    throw new AutoSaveServiceError(
      "sourceAccount is required for external AutoSave sources",
      400,
      "SOURCE_ACCOUNT_REQUIRED"
    );
  }
};

/* =========================================================
   DUPLICATE CONFIGURATION
========================================================= */

const ensureNoDuplicateAutoSave = async ({
  userId,
  savingGoal,
  excludeId = null,
  session = null,
}) => {
  const filter = {
    user: userId,
    savingGoal,
    isDeleted: false,
    status: {
      $in:
        ACTIVE_CONFIGURATION_STATUSES,
    },
  };

  if (excludeId) {
    filter._id = {
      $ne: excludeId,
    };
  }

  const query = AutoSave.findOne(
    filter
  );

  applySession(query, session);

  const existing = await query;

  if (existing) {
    throw new AutoSaveServiceError(
      "An AutoSave configuration already exists for this saving goal",
      409,
      "DUPLICATE_AUTO_SAVE"
    );
  }
};

/* =========================================================
   CREATE AUTOSAVE
========================================================= */

export const createAutoSave = async ({
  userId,
  data,
  session = null,
}) => {
  assertUserId(userId);

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new AutoSaveServiceError(
      "AutoSave configuration is required",
      400,
      "INVALID_INPUT"
    );
  }

  validateAutoSaveConfiguration(
    data
  );

  const goal =
    await findUserGoal({
      goalId: data.savingGoal,
      userId,
      session,
    });

  await ensureNoDuplicateAutoSave({
    userId,
    savingGoal: goal._id,
    session,
  });

  let sourceAccount = null;

  if (data.sourceAccount) {
    sourceAccount =
      await findUserSavingAccount({
        accountId:
          data.sourceAccount,
        userId,
        session,
      });
  }

  const payload = {
    ...data,

    user: userId,

    savingGoal: goal._id,

    sourceAccount:
      sourceAccount?._id || null,

    lastModifiedBy: userId,

    isDeleted: false,
  };

  /*
   * Never allow clients to forge runtime
   * statistics or lifecycle timestamps.
   */

  delete payload.executionCount;
  delete payload.successfulExecutionCount;
  delete payload.failedExecutionCount;
  delete payload.totalSaved;
  delete payload.consecutiveFailures;
  delete payload.lastExecutionAt;
  delete payload.lastFailureAt;
  delete payload.lastFailureReason;
  delete payload.completedAt;
  delete payload.pausedAt;
  delete payload.cancelledAt;
  delete payload.activatedAt;

  const autoSave =
    await createWithSession(
      AutoSave,
      payload,
      session
    );

  return autoSave;
};

/* =========================================================
   GET AUTOSAVE
========================================================= */

export const getAutoSaveById = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  return findUserAutoSave({
    autoSaveId,
    userId,
    session,
  });
};

/* =========================================================
   LIST USER AUTOSAVES
========================================================= */

export const getUserAutoSaves = async ({
  userId,
  page = 1,
  limit = 20,
  status = null,
  savingGoal = null,
  savingAccount = null,
  session = null,
}) => {
  assertUserId(userId);

  const pagination =
    normalizePagination({
      page,
      limit,
    });

  const filter = {
    user: userId,
    isDeleted: false,
  };

  if (status) {
    if (
      !AUTO_SAVE_STATUSES.includes(
        status
      )
    ) {
      throw new AutoSaveServiceError(
        "Invalid AutoSave status",
        400,
        "INVALID_STATUS"
      );
    }

    filter.status = status;
  }

  if (savingGoal) {
    assertObjectId(
      savingGoal,
      "Saving goal ID"
    );

    filter.savingGoal =
      savingGoal;
  }

  if (savingAccount) {
    assertObjectId(
      savingAccount,
      "Saving account ID"
    );

    filter.savingAccount =
      savingAccount;
  }

  const query = AutoSave.find(
    filter
  )
    .sort({
      createdAt: -1,
    })
    .skip(pagination.skip)
    .limit(pagination.limit);

  const countQuery =
    AutoSave.countDocuments(
      filter
    );

  applySession(query, session);
  applySession(
    countQuery,
    session
  );

  const [items, total] =
    await Promise.all([
      query,
      countQuery,
    ]);

  const totalPages =
    Math.ceil(
      total / pagination.limit
    );

  return {
    items,

    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage:
        pagination.page <
        totalPages,
      hasPreviousPage:
        pagination.page > 1,
    },
  };
};

/* =========================================================
   UPDATE AUTOSAVE
========================================================= */

export const updateAutoSave = async ({
  userId,
  autoSaveId,
  updates,
  session = null,
}) => {
  assertUserId(userId);

  if (
    !updates ||
    typeof updates !== "object" ||
    Array.isArray(updates)
  ) {
    throw new AutoSaveServiceError(
      "Updates are required",
      400,
      "INVALID_INPUT"
    );
  }

  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  if (
    TERMINAL_STATUSES.includes(
      autoSave.status
    )
  ) {
    throw new AutoSaveServiceError(
      "Completed or cancelled AutoSave configurations cannot be modified",
      409,
      "AUTOSAVE_TERMINAL"
    );
  }

  validateAutoSaveConfiguration(
    {
      ...autoSave.toObject(),
      ...updates,
    },
    {
      partial: false,
    }
  );

  if (
    updates.savingGoal &&
    String(updates.savingGoal) !==
      String(autoSave.savingGoal)
  ) {
    const goal =
      await findUserGoal({
        goalId:
          updates.savingGoal,
        userId,
        session,
      });

    await ensureNoDuplicateAutoSave({
      userId,
      savingGoal: goal._id,
      excludeId: autoSave._id,
      session,
    });
  }

  if (
    updates.sourceAccount ||
    (
      updates.source &&
      updates.source !==
        "internal_balance"
    )
  ) {
    const accountId =
      updates.sourceAccount ||
      autoSave.sourceAccount;

    if (!accountId) {
      throw new AutoSaveServiceError(
        "sourceAccount is required for external AutoSave sources",
        400,
        "SOURCE_ACCOUNT_REQUIRED"
      );
    }

    await findUserSavingAccount({
      accountId,
      userId,
      session,
    });
  }

  const protectedFields = new Set([
    "_id",
    "user",
    "createdAt",
    "updatedAt",
    "__v",

    "executionCount",
    "successfulExecutionCount",
    "failedExecutionCount",
    "totalSaved",
    "consecutiveFailures",

    "lastExecutionAt",
    "lastFailureAt",
    "lastFailureReason",

    "activatedAt",
    "completedAt",
    "pausedAt",
    "cancelledAt",

    "isDeleted",
    "deletedAt",
  ]);

  for (
    const [key, value]
    of Object.entries(updates)
  ) {
    if (
      !protectedFields.has(key)
    ) {
      autoSave[key] = value;
    }
  }

  if (
    autoSave.source ===
    "internal_balance"
  ) {
    autoSave.sourceAccount =
      null;
  }

  autoSave.lastModifiedBy =
    userId;

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   ACTIVATE
========================================================= */

export const activateAutoSave = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  if (
    autoSave.status ===
    "cancelled"
  ) {
    throw new AutoSaveServiceError(
      "Cancelled AutoSave cannot be activated",
      409,
      "AUTOSAVE_CANCELLED"
    );
  }

  if (
    autoSave.status ===
    "completed"
  ) {
    throw new AutoSaveServiceError(
      "Completed AutoSave cannot be activated",
      409,
      "AUTOSAVE_COMPLETED"
    );
  }

  if (
    autoSave.status ===
    "active"
  ) {
    return autoSave;
  }

  if (
    autoSave.endDate &&
    new Date() >=
      new Date(autoSave.endDate)
  ) {
    throw new AutoSaveServiceError(
      "AutoSave end date has already passed",
      409,
      "AUTOSAVE_EXPIRED"
    );
  }

  autoSave.status =
    "active";

  autoSave.activatedAt =
    autoSave.activatedAt ||
    new Date();

  autoSave.pausedAt = null;
  autoSave.lastModifiedBy =
    userId;

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   PAUSE
========================================================= */

export const pauseAutoSave = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  if (
    autoSave.status !==
    "active"
  ) {
    throw new AutoSaveServiceError(
      "Only active AutoSave configurations can be paused",
      409,
      "INVALID_STATUS_TRANSITION"
    );
  }

  autoSave.status =
    "paused";

  autoSave.pausedAt =
    new Date();

  autoSave.lastModifiedBy =
    userId;

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   RESUME
========================================================= */

export const resumeAutoSave = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  if (
    autoSave.status !==
    "paused"
  ) {
    throw new AutoSaveServiceError(
      "Only paused AutoSave configurations can be resumed",
      409,
      "INVALID_STATUS_TRANSITION"
    );
  }

  if (
    autoSave.endDate &&
    new Date() >=
      new Date(autoSave.endDate)
  ) {
    throw new AutoSaveServiceError(
      "AutoSave end date has already passed",
      409,
      "AUTOSAVE_EXPIRED"
    );
  }

  autoSave.status =
    "active";

  autoSave.pausedAt =
    null;

  autoSave.lastModifiedBy =
    userId;

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   CANCEL
========================================================= */

export const cancelAutoSave = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  if (
    autoSave.status ===
    "cancelled"
  ) {
    return autoSave;
  }

  if (
    autoSave.status ===
    "completed"
  ) {
    throw new AutoSaveServiceError(
      "Completed AutoSave cannot be cancelled",
      409,
      "AUTOSAVE_COMPLETED"
    );
  }

  autoSave.status =
    "cancelled";

  autoSave.cancelledAt =
    new Date();

  autoSave.nextExecutionAt =
    null;

  autoSave.lastModifiedBy =
    userId;

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   SOFT DELETE
========================================================= */

export const deleteAutoSave = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  if (
    autoSave.status ===
    "active"
  ) {
    throw new AutoSaveServiceError(
      "Active AutoSave must be paused or cancelled before deletion",
      409,
      "AUTOSAVE_ACTIVE"
    );
  }

  autoSave.isDeleted =
    true;

  autoSave.deletedAt =
    new Date();

  autoSave.lastModifiedBy =
    userId;

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   RESTORE
========================================================= */

export const restoreAutoSave = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  assertObjectId(
    autoSaveId,
    "AutoSave ID"
  );

  assertUserId(userId);

  const query =
    AutoSave.findOne({
      _id: autoSaveId,
      user: userId,
      isDeleted: true,
    });

  applySession(
    query,
    session
  );

  const autoSave =
    await query;

  if (!autoSave) {
    throw new AutoSaveServiceError(
      "Deleted AutoSave configuration not found",
      404,
      "AUTO_SAVE_NOT_FOUND"
    );
  }

  await ensureNoDuplicateAutoSave({
    userId,
    savingGoal:
      autoSave.savingGoal,
    excludeId:
      autoSave._id,
    session,
  });

  autoSave.isDeleted =
    false;

  autoSave.deletedAt =
    null;

  autoSave.lastModifiedBy =
    userId;

  /*
   * Restore as paused rather than silently
   * starting an automatic money movement.
   */

  if (
    !TERMINAL_STATUSES.includes(
      autoSave.status
    )
  ) {
    autoSave.status =
      "paused";
  }

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   SYNC SAVING SCHEDULE
========================================================= */

/**
 * Creates or updates the SavingSchedule belonging
 * to this AutoSave configuration.
 *
 * This method does NOT execute money movement.
 *
 * SavingSchedule -> SavingExecution remains the
 * responsibility of the scheduling/execution layer.
 */
export const syncAutoSaveSchedule = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  if (!session) {
    throw new AutoSaveServiceError(
      "A database transaction session is required when syncing an AutoSave schedule",
      500,
      "TRANSACTION_REQUIRED"
    );
  }

  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  const goal =
    await findUserGoal({
      goalId:
        autoSave.savingGoal,
      userId,
      session,
    });

  const schedulePayload = {
    user: userId,

    savingGoal:
      goal._id,

    name:
      autoSave.name,

    description:
      autoSave.description || "",

    method:
      autoSave.method,

    amount:
      autoSave.amount,

    percentage:
      autoSave.percentage,

    currency:
      autoSave.currency,

    frequency:
      autoSave.frequency,

    dayOfWeek:
      autoSave.dayOfWeek,

    dayOfMonth:
      autoSave.dayOfMonth,

    executionTime:
      autoSave.executionTime,

    timezone:
      autoSave.timezone,

    startDate:
      autoSave.startDate,

    endDate:
      autoSave.endDate,

    status:
      autoSave.status ===
      "active"
        ? "active"
        : "paused",

    isAutomatic:
      true,

    updatedBy:
      userId,
  };

  let schedule = null;

  if (
    autoSave.savingSchedule
  ) {
    const query =
      SavingSchedule.findOne({
        _id:
          autoSave.savingSchedule,
        user: userId,
      });

    applySession(
      query,
      session
    );

    schedule =
      await query;

    if (!schedule) {
      throw new AutoSaveServiceError(
        "Linked SavingSchedule was not found",
        404,
        "SCHEDULE_NOT_FOUND"
      );
    }

    Object.assign(
      schedule,
      schedulePayload
    );

    await saveWithSession(
      schedule,
      session
    );
  } else {
    schedule =
      await createWithSession(
        SavingSchedule,
        schedulePayload,
        session
      );

    autoSave.savingSchedule =
      schedule._id;

    autoSave.lastModifiedBy =
      userId;

    await saveWithSession(
      autoSave,
      session
    );
  }

  return schedule;
};

/* =========================================================
   REMOVE SCHEDULE LINK
========================================================= */

export const unlinkAutoSaveSchedule = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  autoSave.savingSchedule =
    null;

  autoSave.lastModifiedBy =
    userId;

  await saveWithSession(
    autoSave,
    session
  );

  return autoSave;
};

/* =========================================================
   ELIGIBILITY
========================================================= */

export const checkAutoSaveEligibility = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  const reasons = [];

  if (
    autoSave.status !==
    "active"
  ) {
    reasons.push(
      "AutoSave configuration is not active"
    );
  }

  if (
    autoSave.endDate &&
    new Date() >=
      new Date(autoSave.endDate)
  ) {
    reasons.push(
      "AutoSave end date has been reached"
    );
  }

  const goal =
    await findUserGoal({
      goalId:
        autoSave.savingGoal,
      userId,
      session,
      allowTerminal: true,
    }).catch(() => null);

  if (!goal) {
    reasons.push(
      "Saving goal is unavailable"
    );
  } else if (
    [
      "completed",
      "cancelled",
      "expired",
    ].includes(goal.status)
  ) {
    reasons.push(
      "Saving goal is not available for contributions"
    );
  }

  if (
    autoSave.maximumTotalAmount !==
      null &&
    autoSave.totalSaved >=
      autoSave.maximumTotalAmount
  ) {
    reasons.push(
      "AutoSave maximum total amount has been reached"
    );
  }

  if (
    autoSave.source !==
    "internal_balance"
  ) {
    const account =
      await findUserSavingAccount({
        accountId:
          autoSave.sourceAccount,
        userId,
        session,
      }).catch(() => null);

    if (!account) {
      reasons.push(
        "AutoSave source account is unavailable"
      );
    }
  }

  return {
    eligible:
      reasons.length === 0,

    reasons,

    autoSave,

    goal,
  };
};

/* =========================================================
   STATUS
========================================================= */

export const getAutoSaveStatus = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  const goal =
    await findUserGoal({
      goalId:
        autoSave.savingGoal,
      userId,
      session,
      allowTerminal: true,
    }).catch(() => null);

  let schedule = null;

  if (
    autoSave.savingSchedule
  ) {
    const query =
      SavingSchedule.findOne({
        _id:
          autoSave.savingSchedule,
        user: userId,
      });

    applySession(
      query,
      session
    );

    schedule =
      await query;
  }

  const executionFilter = {
    user: toObjectId(userId),
  };

  if (schedule) {
    executionFilter.schedule =
      schedule._id;
  } else {
    executionFilter.goal =
      toObjectId(
        autoSave.savingGoal
      );
  }

  const [
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    pendingExecutions,
    processingExecutions,
    cancelledExecutions,
  ] = await Promise.all([
    SavingExecution.countDocuments(
      executionFilter
    ),

    SavingExecution.countDocuments({
      ...executionFilter,
      status: "successful",
    }),

    SavingExecution.countDocuments({
      ...executionFilter,
      status: "failed",
    }),

    SavingExecution.countDocuments({
      ...executionFilter,
      status: "pending",
    }),

    SavingExecution.countDocuments({
      ...executionFilter,
      status: "processing",
    }),

    SavingExecution.countDocuments({
      ...executionFilter,
      status: "cancelled",
    }),
  ].map((query) =>
    applySession(query, session)
  ));

  const contributionQuery =
    SavingContribution.aggregate([
      {
        $match: {
          user:
            toObjectId(userId),

          savingGoal:
            toObjectId(
              autoSave.savingGoal
            ),

          status:
            "completed",
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

  if (session) {
    contributionQuery.session(
      session
    );
  }

  const [
    contributionResult,
  ] = await Promise.all([
    contributionQuery,
  ]);

  return {
    autoSave,

    goal,

    schedule,

    statistics: {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      pendingExecutions,
      processingExecutions,
      cancelledExecutions,

      totalContributed:
        contributionResult[0]
          ?.total || 0,
    },
  };
};

/* =========================================================
   STATISTICS
========================================================= */

export const getAutoSaveStatistics = async ({
  userId,
  autoSaveId,
  session = null,
}) => {
  const autoSave =
    await findUserAutoSave({
      autoSaveId,
      userId,
      session,
    });

  const match = {
    user:
      toObjectId(userId),
  };

  if (
    autoSave.savingSchedule
  ) {
    match.schedule =
      toObjectId(
        autoSave.savingSchedule
      );
  } else {
    match.goal =
      toObjectId(
        autoSave.savingGoal
      );
  }

  const executionQuery =
    SavingExecution.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },
    ]);

  if (session) {
    executionQuery.session(
      session
    );
  }

  const executionResults =
    await executionQuery;

  const statistics = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    cancelledExecutions: 0,
    pendingExecutions: 0,
    processingExecutions: 0,
    totalContributed: 0,
  };

  for (
    const result
    of executionResults
  ) {
    statistics.totalExecutions +=
      result.count;

    switch (result._id) {
      case "successful":
        statistics.successfulExecutions =
          result.count;
        break;

      case "failed":
        statistics.failedExecutions =
          result.count;
        break;

      case "cancelled":
        statistics.cancelledExecutions =
          result.count;
        break;

      case "pending":
        statistics.pendingExecutions =
          result.count;
        break;

      case "processing":
        statistics.processingExecutions =
          result.count;
        break;

      default:
        break;
    }
  }

  const contributionQuery =
    SavingContribution.aggregate([
      {
        $match: {
          user:
            toObjectId(userId),

          savingGoal:
            toObjectId(
              autoSave.savingGoal
            ),

          status:
            "completed",
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

  if (session) {
    contributionQuery.session(
      session
    );
  }

  const [
    contributionResult,
  ] = await Promise.all([
    contributionQuery,
  ]);

  statistics.totalContributed =
    contributionResult[0]
      ?.total || 0;

  return statistics;
};

/* =========================================================
   DUE AUTOSAVES
========================================================= */

export const getDueAutoSaves = async ({
  now = new Date(),
  limit = 50,
  session = null,
} = {}) => {
  const normalizedLimit =
    Math.min(
      Math.max(
        Number.parseInt(
          limit,
          10
        ) || 50,
        1
      ),
      100
    );

  const query = AutoSave.find({
    status: "active",

    isDeleted: false,

    nextExecutionAt: {
      $lte: now,
    },

    $or: [
      {
        endDate: null,
      },

      {
        endDate: {
          $gt: now,
        },
      },
    ],
  })
    .sort({
      nextExecutionAt: 1,
    })
    .limit(normalizedLimit);

  applySession(
    query,
    session
  );

  return query;
};

/* =========================================================
   EXPORT ERROR
========================================================= */

export {
  AutoSaveServiceError,
};