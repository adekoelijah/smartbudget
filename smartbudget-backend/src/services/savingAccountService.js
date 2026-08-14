import mongoose from "mongoose";

import SavingAccount from "../models/SavingAccount.js"; 
import SavingContribution from "../models/SavingContribution.js";
import SavingGoal from "../models/SavingsGoal.js";

/* =========================================================
   CONSTANTS
========================================================= */

const ACCOUNT_STATUSES = [
  "active",
  "paused",
  "locked",
  "closed",
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const ZERO = 0;

/* =========================================================
   CUSTOM ERRORS
========================================================= */

class ServiceError extends Error {
  constructor(message, statusCode = 400, code = "SAVING_ACCOUNT_ERROR") {
    super(message);

    this.name = "ServiceError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const assertObjectId = (value, fieldName = "ID") => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new ServiceError(
      `Invalid ${fieldName}`,
      400,
      "INVALID_OBJECT_ID"
    );
  }

  return new mongoose.Types.ObjectId(value);
};

const assertUserId = (userId) => {
  return assertObjectId(userId, "user ID");
};

const assertAccountId = (accountId) => {
  return assertObjectId(accountId, "saving account ID");
};

const assertPositiveAmount = (amount, fieldName = "Amount") => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new ServiceError(
      `${fieldName} must be greater than zero`,
      400,
      "INVALID_AMOUNT"
    );
  }

  return value;
};

const assertNonNegativeAmount = (
  amount,
  fieldName = "Amount"
) => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value < 0) {
    throw new ServiceError(
      `${fieldName} cannot be negative`,
      400,
      "INVALID_AMOUNT"
    );
  }

  return value;
};

const normalizePage = (page) => {
  const value = Number(page);

  if (!Number.isFinite(value) || value < 1) {
    return DEFAULT_PAGE;
  }

  return Math.floor(value);
};

const normalizeLimit = (limit) => {
  const value = Number(limit);

  if (!Number.isFinite(value) || value < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(value), MAX_LIMIT);
};

const normalizeCurrency = (currency = "NGN") => {
  const normalized = String(currency)
    .trim()
    .toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ServiceError(
      "Currency must be a valid ISO currency code",
      400,
      "INVALID_CURRENCY"
    );
  }

  return normalized;
};

const normalizeString = (
  value,
  fieldName,
  {
    required = false,
    maxLength = 255,
  } = {}
) => {
  if (value === undefined || value === null) {
    if (required) {
      throw new ServiceError(
        `${fieldName} is required`,
        400,
        "VALIDATION_ERROR"
      );
    }

    return undefined;
  }

  const normalized = String(value).trim();

  if (required && !normalized) {
    throw new ServiceError(
      `${fieldName} is required`,
      400,
      "VALIDATION_ERROR"
    );
  }

  if (normalized.length > maxLength) {
    throw new ServiceError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      400,
      "VALIDATION_ERROR"
    );
  }

  return normalized;
};

/* =========================================================
   SESSION HELPERS
========================================================= */

const isSession = (session) => {
  return Boolean(session && typeof session === "object");
};

/* =========================================================
   ERROR HANDLING
========================================================= */

const normalizeMongoError = (error) => {
  if (!error) {
    return new ServiceError(
      "An unknown saving account error occurred",
      500,
      "UNKNOWN_ERROR"
    );
  }

  if (error instanceof ServiceError) {
    return error;
  }

  if (error.code === 11000) {
    return new ServiceError(
      "A saving account with the same unique identifier already exists",
      409,
      "DUPLICATE_ACCOUNT"
    );
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");

    return new ServiceError(
      messages || "Saving account validation failed",
      400,
      "VALIDATION_ERROR"
    );
  }

  return new ServiceError(
    error.message || "Saving account operation failed",
    error.statusCode || 500,
    error.code || "SAVING_ACCOUNT_ERROR"
  );
};

/* =========================================================
   SAFE ACCOUNT SERIALIZATION
========================================================= */

const serializeAccount = (account) => {
  if (!account) {
    return null;
  }

  if (typeof account.toJSON === "function") {
    return account.toJSON();
  }

  const value = {
    ...account,
  };

  if (value._id) {
    value.id = value._id;
    delete value._id;
  }

  delete value.__v;

  return value;
};

/* =========================================================
   OWNERSHIP QUERY
========================================================= */

const buildOwnershipQuery = (
  userId,
  accountId
) => ({
  _id: assertAccountId(accountId),
  user: assertUserId(userId),
});

/* =========================================================
   FETCH ACCOUNT
========================================================= */

const findOwnedAccount = async (
  userId,
  accountId,
  {
    session = null,
    includeClosed = true,
  } = {}
) => {
  const query = buildOwnershipQuery(
    userId,
    accountId
  );

  if (!includeClosed) {
    query.status = {
      $ne: "closed",
    };
  }

  let request = SavingAccount.findOne(query);

  if (isSession(session)) {
    request = request.session(session);
  }

  const account = await request;

  if (!account) {
    throw new ServiceError(
      "Saving account not found",
      404,
      "SAVING_ACCOUNT_NOT_FOUND"
    );
  }

  return account;
};

/* =========================================================
   CREATE SAVING ACCOUNT
========================================================= */

export const createSavingAccount = async ({
  userId,
  name,
  description = "",
  currency = "NGN",
  accountType = "savings",
  goal = null,
  isPrimary = false,
  createdBy = null,
  metadata = {},
  session = null,
}) => {
  try {
    const ownerId = assertUserId(userId);

    const normalizedName = normalizeString(
      name,
      "Account name",
      {
        required: true,
        maxLength: 120,
      }
    );

    const normalizedDescription =
      normalizeString(
        description,
        "Description",
        {
          maxLength: 500,
        }
      ) ?? "";

    const normalizedCurrency =
      normalizeCurrency(currency);

    let goalId = null;

    if (goal) {
      goalId = assertObjectId(
        goal,
        "saving goal ID"
      );

      const goalQuery = SavingGoal.findOne({
        _id: goalId,
        user: ownerId,
        isDeleted: false,
      });

      if (isSession(session)) {
        goalQuery.session(session);
      }

      const savingGoal = await goalQuery;

      if (!savingGoal) {
        throw new ServiceError(
          "Saving goal not found",
          404,
          "SAVING_GOAL_NOT_FOUND"
        );
      }
    }

    /*
     * Only one primary saving account should exist
     * for a user.
     */
    if (isPrimary) {
      const primaryQuery = SavingAccount.updateMany(
        {
          user: ownerId,
          isPrimary: true,
          status: {
            $ne: "closed",
          },
        },
        {
          $set: {
            isPrimary: false,
            updatedBy: createdBy || ownerId,
          },
        }
      );

      if (isSession(session)) {
        primaryQuery.session(session);
      }

      await primaryQuery;
    }

    const account = new SavingAccount({
      user: ownerId,
      name: normalizedName,
      description: normalizedDescription,
      currency: normalizedCurrency,
      accountType,
      goal: goalId,
      isPrimary,
      status: "active",

      /*
       * Financial counters start at zero.
       *
       * They should never be accepted from the client.
       */
      balance: ZERO,
      availableBalance: ZERO,
      totalContributed: ZERO,
      totalWithdrawn: ZERO,

      createdBy:
        createdBy
          ? assertObjectId(createdBy, "createdBy")
          : ownerId,

      updatedBy:
        createdBy
          ? assertObjectId(createdBy, "updatedBy")
          : ownerId,

      metadata,
    });

    await account.save(
      isSession(session)
        ? { session }
        : undefined
    );

    return serializeAccount(account);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

/* =========================================================
   GET ACCOUNT
========================================================= */

export const getSavingAccount = async ({
  userId,
  accountId,
  session = null,
}) => {
  try {
    const account = await findOwnedAccount(
      userId,
      accountId,
      {
        session,
      }
    );

    return serializeAccount(account);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

/* =========================================================
   GET USER ACCOUNTS
========================================================= */

export const getUserSavingAccounts = async ({
  userId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  status = null,
  accountType = null,
  currency = null,
  search = null,
  includeClosed = false,
  session = null,
} = {}) => {
  try {
    const ownerId = assertUserId(userId);

    const currentPage = normalizePage(page);
    const pageLimit = normalizeLimit(limit);

    const query = {
      user: ownerId,
    };

    if (!includeClosed) {
      query.status = {
        $ne: "closed",
      };
    } else if (status) {
      query.status = status;
    }

    if (includeClosed && status) {
      query.status = status;
    }

    if (
      status &&
      ACCOUNT_STATUSES.includes(status)
    ) {
      query.status = status;
    }

    if (accountType) {
      query.accountType = String(
        accountType
      ).trim();
    }

    if (currency) {
      query.currency =
        normalizeCurrency(currency);
    }

    if (search) {
      const safeSearch = String(search)
        .trim()
        .slice(0, 100)
        .replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      if (safeSearch) {
        query.$or = [
          {
            name: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            description: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ];
      }
    }

    const skip =
      (currentPage - 1) * pageLimit;

    let countQuery =
      SavingAccount.countDocuments(query);

    let accountQuery = SavingAccount.find(query)
      .sort({
        isPrimary: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageLimit);

    if (isSession(session)) {
      countQuery = countQuery.session(session);
      accountQuery =
        accountQuery.session(session);
    }

    const [total, accounts] =
      await Promise.all([
        countQuery,
        accountQuery,
      ]);

    const totalPages =
      Math.ceil(total / pageLimit);

    return {
      data: accounts.map(serializeAccount),

      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages,
        hasNextPage:
          currentPage < totalPages,
        hasPreviousPage:
          currentPage > 1,
      },
    };
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

/* =========================================================
   GET PRIMARY ACCOUNT
========================================================= */

export const getPrimarySavingAccount =
  async ({
    userId,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      let query = SavingAccount.findOne({
        user: ownerId,
        isPrimary: true,
        status: {
          $ne: "closed",
        },
      });

      if (isSession(session)) {
        query = query.session(session);
      }

      const account = await query;

      return serializeAccount(account);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   SET PRIMARY ACCOUNT
========================================================= */

export const setPrimarySavingAccount =
  async ({
    userId,
    accountId,
    updatedBy = null,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
            includeClosed: false,
          }
        );

      if (account.status !== "active") {
        throw new ServiceError(
          "Only active saving accounts can be made primary",
          400,
          "INVALID_ACCOUNT_STATUS"
        );
      }

      const updateQuery =
        SavingAccount.updateMany(
          {
            user: ownerId,
            isPrimary: true,
            _id: {
              $ne: account._id,
            },
            status: {
              $ne: "closed",
            },
          },
          {
            $set: {
              isPrimary: false,
              updatedBy:
                updatedBy
                  ? assertObjectId(
                      updatedBy,
                      "updatedBy"
                    )
                  : ownerId,
            },
          }
        );

      if (isSession(session)) {
        updateQuery.session(session);
      }

      await updateQuery;

      account.isPrimary = true;
      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return serializeAccount(account);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   UPDATE ACCOUNT DETAILS
========================================================= */

export const updateSavingAccount =
  async ({
    userId,
    accountId,
    name,
    description,
    accountType,
    updatedBy = null,
    metadata,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
            includeClosed: false,
          }
        );

      if (account.status === "locked") {
        throw new ServiceError(
          "Locked saving accounts cannot be modified",
          423,
          "ACCOUNT_LOCKED"
        );
      }

      if (name !== undefined) {
        account.name =
          normalizeString(
            name,
            "Account name",
            {
              required: true,
              maxLength: 120,
            }
          );
      }

      if (description !== undefined) {
        account.description =
          normalizeString(
            description,
            "Description",
            {
              maxLength: 500,
            }
          ) ?? "";
      }

      if (accountType !== undefined) {
        account.accountType =
          normalizeString(
            accountType,
            "Account type",
            {
              required: true,
              maxLength: 50,
            }
          );
      }

      /*
       * Metadata may be updated, but financial fields
       * must never be accepted through this method.
       */
      if (metadata !== undefined) {
        account.metadata = metadata;
      }

      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return serializeAccount(account);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   PAUSE ACCOUNT
========================================================= */

export const pauseSavingAccount =
  async ({
    userId,
    accountId,
    reason = "",
    updatedBy = null,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
            includeClosed: false,
          }
        );

      if (account.status !== "active") {
        throw new ServiceError(
          "Only active saving accounts can be paused",
          400,
          "INVALID_ACCOUNT_STATUS"
        );
      }

      account.status = "paused";
      account.pausedAt = new Date();
      account.pauseReason =
        normalizeString(
          reason,
          "Pause reason",
          {
            maxLength: 500,
          }
        ) ?? "";

      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return serializeAccount(account);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   ACTIVATE ACCOUNT
========================================================= */

export const activateSavingAccount =
  async ({
    userId,
    accountId,
    updatedBy = null,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
          }
        );

      if (account.status === "closed") {
        throw new ServiceError(
          "Closed saving accounts cannot be reactivated",
          400,
          "ACCOUNT_CLOSED"
        );
      }

      if (account.status === "locked") {
        throw new ServiceError(
          "Locked saving accounts must be unlocked through the appropriate security workflow",
          423,
          "ACCOUNT_LOCKED"
        );
      }

      account.status = "active";
      account.pausedAt = null;
      account.pauseReason = null;

      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return serializeAccount(account);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   LOCK ACCOUNT
========================================================= */

export const lockSavingAccount =
  async ({
    userId,
    accountId,
    reason = "",
    updatedBy = null,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
          }
        );

      if (account.status === "closed") {
        throw new ServiceError(
          "Closed saving accounts cannot be locked",
          400,
          "ACCOUNT_CLOSED"
        );
      }

      account.status = "locked";
      account.lockedAt = new Date();
      account.lockReason =
        normalizeString(
          reason,
          "Lock reason",
          {
            maxLength: 500,
          }
        ) ?? "";

      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return serializeAccount(account);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   CLOSE ACCOUNT
========================================================= */

export const closeSavingAccount =
  async ({
    userId,
    accountId,
    reason = "",
    updatedBy = null,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
          }
        );

      if (account.status === "closed") {
        throw new ServiceError(
          "Saving account is already closed",
          400,
          "ACCOUNT_ALREADY_CLOSED"
        );
      }

      const balance =
        Number(account.balance || 0);

      const availableBalance =
        Number(
          account.availableBalance || 0
        );

      /*
       * A financial account should never be silently
       * closed while money remains inside it.
       */
      if (
        balance > 0 ||
        availableBalance > 0
      ) {
        throw new ServiceError(
          "Saving account cannot be closed while it has a remaining balance",
          409,
          "ACCOUNT_HAS_BALANCE"
        );
      }

      account.status = "closed";
      account.closedAt = new Date();
      account.closeReason =
        normalizeString(
          reason,
          "Close reason",
          {
            maxLength: 500,
          }
        ) ?? "";

      account.isPrimary = false;

      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return serializeAccount(account);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   CREDIT ACCOUNT
=========================================================

   IMPORTANT:

   This is an INTERNAL FINANCIAL OPERATION.

   It should normally be called by:
      SavingContributionService
      SavingExecutionService
      reconciliation service

   It should NOT be exposed directly as:
      POST /saving-accounts/:id/deposit

   without proper financial authorization/idempotency.
========================================================= */

export const creditSavingAccount =
  async ({
    userId,
    accountId,
    amount,
    contributionId = null,
    reference = null,
    idempotencyKey = null,
    updatedBy = null,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const creditAmount =
        assertPositiveAmount(
          amount,
          "Credit amount"
        );

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
            includeClosed: false,
          }
        );

      if (
        !["active"].includes(
          account.status
        )
      ) {
        throw new ServiceError(
          "Only active saving accounts can receive funds",
          409,
          "ACCOUNT_NOT_AVAILABLE"
        );
      }

      /*
       * Idempotency protection.
       *
       * If a contribution already produced this
       * account credit, return the current account
       * instead of applying it twice.
       */
      if (idempotencyKey) {
        const existingQuery =
          SavingContribution.findOne({
            user: ownerId,
            idempotencyKey,
          });

        if (isSession(session)) {
          existingQuery.session(session);
        }

        const existing =
          await existingQuery;

        if (existing) {
          return {
            account: serializeAccount(
              account
            ),
            alreadyProcessed: true,
            contribution:
              serializeAccount(existing),
          };
        }
      }

      const previousBalance =
        Number(account.balance || 0);

      const newBalance =
        previousBalance +
        creditAmount;

      account.balance = newBalance;

      if (
        "availableBalance" in account
      ) {
        account.availableBalance =
          Number(
            account.availableBalance || 0
          ) + creditAmount;
      }

      if (
        "totalContributed" in account
      ) {
        account.totalContributed =
          Number(
            account.totalContributed || 0
          ) + creditAmount;
      }

      account.lastTransactionAt =
        new Date();

      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      if (reference) {
        account.lastTransactionReference =
          normalizeString(
            reference,
            "Transaction reference",
            {
              maxLength: 200,
            }
          );
      }

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return {
        account: serializeAccount(
          account
        ),
        alreadyProcessed: false,
        previousBalance,
        newBalance,
        amount: creditAmount,
        contributionId:
          contributionId
            ? assertObjectId(
                contributionId,
                "contribution ID"
              )
            : null,
      };
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   DEBIT ACCOUNT
=========================================================

   Internal operation for withdrawals/reversals.

   Never allow the account balance to become negative.
========================================================= */

export const debitSavingAccount =
  async ({
    userId,
    accountId,
    amount,
    reference = null,
    reason = null,
    updatedBy = null,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const debitAmount =
        assertPositiveAmount(
          amount,
          "Debit amount"
        );

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
            includeClosed: false,
          }
        );

      if (
        account.status !== "active"
      ) {
        throw new ServiceError(
          "Only active saving accounts can be debited",
          409,
          "ACCOUNT_NOT_AVAILABLE"
        );
      }

      const currentBalance =
        Number(account.balance || 0);

      const availableBalance =
        Number(
          account.availableBalance ??
            currentBalance
        );

      if (
        availableBalance <
        debitAmount
      ) {
        throw new ServiceError(
          "Insufficient saving account balance",
          409,
          "INSUFFICIENT_FUNDS"
        );
      }

      const newBalance =
        currentBalance -
        debitAmount;

      account.balance =
        Math.max(newBalance, 0);

      if (
        "availableBalance" in account
      ) {
        account.availableBalance =
          Math.max(
            availableBalance -
              debitAmount,
            0
          );
      }

      if (
        "totalWithdrawn" in account
      ) {
        account.totalWithdrawn =
          Number(
            account.totalWithdrawn || 0
          ) + debitAmount;
      }

      account.lastTransactionAt =
        new Date();

      if (reference) {
        account.lastTransactionReference =
          normalizeString(
            reference,
            "Transaction reference",
            {
              maxLength: 200,
            }
          );
      }

      if (reason) {
        account.lastTransactionReason =
          normalizeString(
            reason,
            "Transaction reason",
            {
              maxLength: 500,
            }
          );
      }

      account.updatedBy =
        updatedBy
          ? assertObjectId(
              updatedBy,
              "updatedBy"
            )
          : ownerId;

      await account.save(
        isSession(session)
          ? { session }
          : undefined
      );

      return {
        account: serializeAccount(
          account
        ),
        previousBalance:
          currentBalance,
        newBalance,
        amount: debitAmount,
      };
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   GET ACCOUNT BALANCE
========================================================= */

export const getSavingAccountBalance =
  async ({
    userId,
    accountId,
    session = null,
  }) => {
    try {
      const account =
        await findOwnedAccount(
          userId,
          accountId,
          {
            session,
          }
        );

      return {
        accountId: account._id,
        currency: account.currency,
        balance:
          Number(account.balance || 0),
        availableBalance:
          Number(
            account.availableBalance ??
              account.balance ??
              0
          ),
        totalContributed:
          Number(
            account.totalContributed || 0
          ),
        totalWithdrawn:
          Number(
            account.totalWithdrawn || 0
          ),
        status: account.status,
      };
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   ACCOUNT SUMMARY
========================================================= */

export const getSavingAccountSummary =
  async ({
    userId,
    accountId,
    session = null,
  }) => {
    try {
      const account =
        await findOwnedAccount(
          userId,
          accountId,
          {
            session,
          }
        );

      const contributionQuery = {
        user: assertUserId(userId),
        status: "completed",
      };

      if (account.goal) {
        contributionQuery.savingGoal =
          account.goal;
      }

      let contributionAggregate =
        SavingContribution.aggregate([
          {
            $match:
              contributionQuery,
          },
          {
            $group: {
              _id: null,
              totalContributions: {
                $sum: "$amount",
              },
              contributionCount: {
                $sum: 1,
              },
            },
          },
        ]);

      if (isSession(session)) {
        contributionAggregate =
          contributionAggregate.session(
            session
          );
      }

      const [result] =
        await contributionAggregate;

      return {
        account: serializeAccount(
          account
        ),

        balance:
          Number(account.balance || 0),

        availableBalance:
          Number(
            account.availableBalance ??
              account.balance ??
              0
          ),

        totalContributed:
          Number(
            account.totalContributed || 0
          ),

        totalWithdrawn:
          Number(
            account.totalWithdrawn || 0
          ),

        ledger: {
          contributionCount:
            result?.contributionCount || 0,

          totalContributions:
            result?.totalContributions || 0,
        },
      };
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   RECONCILE ACCOUNT BALANCE
=========================================================

   IMPORTANT:

   This method does NOT blindly trust account.balance.

   It compares the cached account balance against the
   contribution ledger.

   Reconciliation should be run by:
      - admin tools
      - scheduled workers
      - financial reconciliation jobs
========================================================= */

export const reconcileSavingAccount =
  async ({
    userId,
    accountId,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const account =
        await findOwnedAccount(
          ownerId,
          accountId,
          {
            session,
          }
        );

      const match = {
        user: ownerId,
        status: "completed",
      };

      if (account.goal) {
        match.savingGoal =
          account.goal;
      }

      let aggregation =
        SavingContribution.aggregate([
          {
            $match: match,
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$amount",
              },
              count: {
                $sum: 1,
              },
            },
          },
        ]);

      if (isSession(session)) {
        aggregation =
          aggregation.session(session);
      }

      const [ledger] =
        await aggregation;

      const ledgerBalance =
        Number(ledger?.total || 0);

      const accountBalance =
        Number(account.balance || 0);

      const difference =
        ledgerBalance -
        accountBalance;

      return {
        accountId: account._id,
        currency: account.currency,

        accountBalance,

        ledgerBalance,

        difference,

        isBalanced:
          Math.abs(difference) < 0.01,

        contributionCount:
          ledger?.count || 0,

        reconciledAt: new Date(),
      };
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   ACCOUNT EXISTS
========================================================= */

export const savingAccountExists =
  async ({
    userId,
    accountId,
    session = null,
  }) => {
    try {
      const ownerId =
        assertUserId(userId);

      const normalizedAccountId =
        assertAccountId(accountId);

      let query =
        SavingAccount.exists({
          _id: normalizedAccountId,
          user: ownerId,
        });

      if (isSession(session)) {
        query = query.session(session);
      }

      return Boolean(await query);
    } catch (error) {
      throw normalizeMongoError(error);
    }
  };

/* =========================================================
   DELETE / ARCHIVE
=========================================================

   Financial accounts should normally NOT be physically
   deleted.

   We close them instead.
========================================================= */

export const archiveSavingAccount =
  async ({
    userId,
    accountId,
    reason = "Account archived",
    updatedBy = null,
    session = null,
  }) => {
    return closeSavingAccount({
      userId,
      accountId,
      reason,
      updatedBy,
      session,
    });
  };

/* =========================================================
   TRANSACTION HELPER
=========================================================

   Use this when an operation modifies multiple financial
   documents atomically.

   Example:

      SavingExecution
            +
      SavingContribution
            +
      SavingAccount

   must either ALL succeed or ALL roll back.
========================================================= */

export const withSavingAccountTransaction =
  async (callback) => {
    const session =
      await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(
        async () => {
          result =
            await callback(session);
        }
      );

      return result;
    } finally {
      await session.endSession();
    }
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const savingAccountService = {
  createSavingAccount,

  getSavingAccount,

  getUserSavingAccounts,

  getPrimarySavingAccount,

  setPrimarySavingAccount,

  updateSavingAccount,

  pauseSavingAccount,

  activateSavingAccount,

  lockSavingAccount,

  closeSavingAccount,

  archiveSavingAccount,

  getSavingAccountBalance,

  getSavingAccountSummary,

  creditSavingAccount,

  debitSavingAccount,

  reconcileSavingAccount,

  savingAccountExists,

  withSavingAccountTransaction,
};

export default savingAccountService;