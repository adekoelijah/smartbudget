// controllers/savingsChallengeController.js

import mongoose from "mongoose";

import savingsChallengeService, {
  SavingsChallengeServiceError,
} from "../../services/savingsChallengeService.js";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = null,
  } = {}
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (
  res,
  {
    statusCode = 500,
    message = "An unexpected error occurred",
    code = "INTERNAL_SERVER_ERROR",
    details = null,
  } = {}
) => {
  const response = {
    success: false,
    message,
    code,
  };

  if (details !== null) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/* =========================================================
   REQUEST HELPERS
========================================================= */

const getUserId = (req) => {
  const userId =
    req.user?._id ??
    req.user?.id ??
    req.user?.userId;

  if (!userId) {
    throw new SavingsChallengeServiceError(
      "Authenticated user could not be identified",
      401,
      "AUTHENTICATED_USER_REQUIRED"
    );
  }

  return String(userId);
};

const getChallengeId = (req) => {
  return (
    req.params?.challengeId ??
    req.params?.id
  );
};

const getOperationReference = (req) => {
  return (
    req.body?.operationReference ??
    req.headers?.["x-operation-reference"] ??
    null
  );
};

const parseBoolean = (
  value,
  defaultValue = undefined
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return defaultValue;
};

const parseInteger = (
  value,
  defaultValue
) => {
  const parsed =
    Number.parseInt(value, 10);

  return Number.isInteger(parsed)
    ? parsed
    : defaultValue;
};

const parseOptionalString = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized || null;
};

/* =========================================================
   TRANSACTION HELPER
========================================================= */

/**
 * Runs a mutation inside a MongoDB transaction.
 *
 * The savings challenge service explicitly requires a
 * session for state-changing operations.
 */
const withTransaction = async (
  callback
) => {
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
   ERROR HANDLER
========================================================= */

const handleControllerError = (
  res,
  error,
  context = "Savings challenge operation"
) => {
  if (
    error instanceof
    SavingsChallengeServiceError
  ) {
    return sendError(res, {
      statusCode:
        error.statusCode || 400,

      message:
        error.message ||
        "Savings challenge operation failed",

      code:
        error.code ||
        "SAVINGS_CHALLENGE_ERROR",

      details:
        error.details ?? null,
    });
  }

  /*
   * Mongoose validation errors
   */
  if (
    error?.name ===
    "ValidationError"
  ) {
    const details =
      Object.values(
        error.errors || {}
      ).map((item) => ({
        field: item.path,
        message: item.message,
      }));

    return sendError(res, {
      statusCode: 400,
      message:
        "Savings challenge validation failed",
      code: "VALIDATION_ERROR",
      details,
    });
  }

  /*
   * Invalid MongoDB ObjectId.
   */
  if (
    error?.name ===
      "CastError" &&
    error?.kind === "ObjectId"
  ) {
    return sendError(res, {
      statusCode: 400,
      message:
        "Invalid savings challenge identifier",
      code: "INVALID_ID",
    });
  }

  /*
   * MongoDB duplicate key.
   */
  if (
    error?.code === 11000
  ) {
    return sendError(res, {
      statusCode: 409,
      message:
        "A savings challenge with the supplied unique reference already exists",
      code: "DUPLICATE_CHALLENGE",
    });
  }

  /*
   * Transaction-related failures.
   */
  if (
    error?.errorLabels?.includes(
      "TransientTransactionError"
    ) ||
    error?.errorLabels?.includes(
      "UnknownTransactionCommitResult"
    )
  ) {
    console.error(
      `[${context}] Transaction error`,
      error
    );

    return sendError(res, {
      statusCode: 503,
      message:
        "The operation could not be completed safely. Please retry",
      code:
        "TRANSACTION_RETRY_REQUIRED",
    });
  }

  /*
   * Unexpected server error.
   */
  console.error(
    `[${context}]`,
    error
  );

  return sendError(res, {
    statusCode: 500,
    message:
      "An unexpected error occurred while processing the savings challenge request",
    code:
      "INTERNAL_SERVER_ERROR",
  });
};

/* =========================================================
   CREATE SAVINGS CHALLENGE
   POST /api/savings-challenges
========================================================= */

export const createSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const body =
        req.body || {};

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.createSavingsChallenge(
              {
                userId,

                name:
                  body.name,

                slug:
                  body.slug ?? null,

                description:
                  body.description ?? "",

                challengeType:
                  body.challengeType ??
                  "fixed_amount",

                difficulty:
                  body.difficulty ??
                  "beginner",

                source:
                  body.source ??
                  "user",

                visibility:
                  body.visibility ??
                  "private",

                templateId:
                  body.templateId ??
                  null,

                isTemplate:
                  parseBoolean(
                    body.isTemplate,
                    false
                  ),

                currency:
                  body.currency ??
                  "NGN",

                target:
                  body.target,

                frequency:
                  body.frequency,

                startDate:
                  body.startDate,

                endDate:
                  body.endDate,

                status:
                  body.status ??
                  "draft",

                savingAccount:
                  body.savingAccount ??
                  null,

                savingPlan:
                  body.savingPlan ??
                  null,

                autoSaveEnabled:
                  parseBoolean(
                    body.autoSaveEnabled,
                    false
                  ),

                autoSave:
                  body.autoSave ??
                  null,

                participantCount:
                  body.participantCount ??
                  1,

                allowEarlyCompletion:
                  parseBoolean(
                    body.allowEarlyCompletion,
                    true
                  ),

                allowPartialContribution:
                  parseBoolean(
                    body.allowPartialContribution,
                    true
                  ),

                allowOverContribution:
                  parseBoolean(
                    body.allowOverContribution,
                    false
                  ),

                rolloverMissedContribution:
                  parseBoolean(
                    body.rolloverMissedContribution,
                    false
                  ),

                notifyBeforeDue:
                  parseBoolean(
                    body.notifyBeforeDue,
                    true
                  ),

                notificationDaysBefore:
                  body.notificationDaysBefore ??
                  1,

                reward:
                  body.reward ??
                  {},

                creationReference:
                  body.creationReference ??
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        statusCode: 201,
        message:
          "Savings challenge created successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Create savings challenge"
      );
    }
  };

/* =========================================================
   GET SINGLE CHALLENGE
   GET /api/savings-challenges/:challengeId
========================================================= */

export const getSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await savingsChallengeService.getSavingsChallenge(
          {
            userId,
            challengeId,
          }
        );

      return sendSuccess(res, {
        message:
          "Savings challenge retrieved successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Get savings challenge"
      );
    }
  };

/* =========================================================
   LIST USER CHALLENGES
   GET /api/savings-challenges
========================================================= */

export const getUserSavingsChallenges =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const {
        page = 1,
        limit = 20,
        status,
        challengeType,
        difficulty,
        savingPlan,
        savingAccount,
      } = req.query;

      const includeTemplates =
        parseBoolean(
          req.query.includeTemplates,
          false
        );

      const result =
        await savingsChallengeService.getUserSavingsChallenges(
          {
            userId,

            page:
              parseInteger(
                page,
                1
              ),

            limit:
              parseInteger(
                limit,
                20
              ),

            status:
              parseOptionalString(
                status
              ),

            challengeType:
              parseOptionalString(
                challengeType
              ),

            difficulty:
              parseOptionalString(
                difficulty
              ),

            savingPlan:
              parseOptionalString(
                savingPlan
              ),

            savingAccount:
              parseOptionalString(
                savingAccount
              ),

            includeTemplates,
          }
        );

      return sendSuccess(res, {
        message:
          "Savings challenges retrieved successfully",
        data: result.items,
        meta: {
          pagination:
            result.pagination,
        },
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "List savings challenges"
      );
    }
  };

/* =========================================================
   UPDATE DRAFT CHALLENGE
   PATCH /api/savings-challenges/:challengeId
========================================================= */

export const updateSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const updates =
        req.body || {};

      const operationReference =
        getOperationReference(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.updateSavingsChallenge(
              {
                userId,
                challengeId,

                updates: {
                  ...updates,

                  ...(operationReference
                    ? {
                        operationReference,
                      }
                    : {}),
                },

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge updated successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Update savings challenge"
      );
    }
  };

/* =========================================================
   ACTIVATE
   POST /api/savings-challenges/:challengeId/activate
========================================================= */

export const activateSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.activateSavingsChallenge(
              {
                userId,
                challengeId,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge activated successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Activate savings challenge"
      );
    }
  };

/* =========================================================
   PAUSE
   POST /api/savings-challenges/:challengeId/pause
========================================================= */

export const pauseSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const body =
        req.body || {};

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.pauseSavingsChallenge(
              {
                userId,
                challengeId,

                reason:
                  body.reason ??
                  null,

                pausedUntil:
                  body.pausedUntil ??
                  null,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge paused successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Pause savings challenge"
      );
    }
  };

/* =========================================================
   RESUME
   POST /api/savings-challenges/:challengeId/resume
========================================================= */

export const resumeSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.resumeSavingsChallenge(
              {
                userId,
                challengeId,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge resumed successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Resume savings challenge"
      );
    }
  };

/* =========================================================
   COMPLETE
   POST /api/savings-challenges/:challengeId/complete
========================================================= */

export const completeSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.completeSavingsChallenge(
              {
                userId,
                challengeId,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge completed successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Complete savings challenge"
      );
    }
  };

/* =========================================================
   CANCEL
   POST /api/savings-challenges/:challengeId/cancel
========================================================= */

export const cancelSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.cancelSavingsChallenge(
              {
                userId,
                challengeId,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge cancelled successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Cancel savings challenge"
      );
    }
  };

/* =========================================================
   FAIL
   POST /api/savings-challenges/:challengeId/fail
========================================================= */

export const failSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.failSavingsChallenge(
              {
                userId,
                challengeId,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge marked as failed",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Fail savings challenge"
      );
    }
  };

/* =========================================================
   EXPIRE
   POST /api/savings-challenges/:challengeId/expire
========================================================= */

export const expireSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.expireSavingsChallenge(
              {
                userId,
                challengeId,

                now:
                  req.body?.now ??
                  new Date(),

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge expired successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Expire savings challenge"
      );
    }
  };

/* =========================================================
   APPLY CONTRIBUTION
   POST /api/savings-challenges/:challengeId/contributions
========================================================= */

/**
 * Important:
 *
 * This endpoint assumes the SavingContribution has already
 * been financially confirmed by the contribution/ledger
 * layer.
 *
 * It only updates the challenge's denormalized progress.
 */
export const applyContributionToChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const {
        contributionId,
        amount,
        contributionDate,
      } = req.body || {};

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.applyContributionToChallenge(
              {
                userId,
                challengeId,

                contributionId,

                amount,

                contributionDate:
                  contributionDate ??
                  new Date(),

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Contribution applied to savings challenge successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Apply contribution to savings challenge"
      );
    }
  };

/* =========================================================
   REGISTER SUCCESSFUL PERIOD
   POST /api/savings-challenges/:challengeId/periods/success
========================================================= */

export const registerSuccessfulChallengePeriod =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.registerSuccessfulChallengePeriod(
              {
                userId,
                challengeId,

                periodDate:
                  req.body?.periodDate ??
                  new Date(),

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Successful challenge period registered",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Register successful challenge period"
      );
    }
  };

/* =========================================================
   REGISTER MISSED PERIOD
   POST /api/savings-challenges/:challengeId/periods/missed
========================================================= */

export const registerMissedChallengePeriod =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.registerMissedChallengePeriod(
              {
                userId,
                challengeId,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Missed challenge period registered",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Register missed challenge period"
      );
    }
  };

/* =========================================================
   GET SNAPSHOT
   GET /api/savings-challenges/:challengeId/snapshot
========================================================= */

export const getChallengeSnapshot =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const snapshot =
        await savingsChallengeService.getChallengeSnapshot(
          {
            userId,
            challengeId,
          }
        );

      return sendSuccess(res, {
        message:
          "Savings challenge snapshot retrieved successfully",
        data: snapshot,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Get savings challenge snapshot"
      );
    }
  };

/* =========================================================
   GET SUMMARY
   GET /api/savings-challenges/summary
========================================================= */

export const getSavingsChallengeSummary =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const summary =
        await savingsChallengeService.getSavingsChallengeSummary(
          {
            userId,
          }
        );

      return sendSuccess(res, {
        message:
          "Savings challenge summary retrieved successfully",
        data: summary,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Get savings challenge summary"
      );
    }
  };

/* =========================================================
   ARCHIVE
   DELETE /api/savings-challenges/:challengeId
========================================================= */

export const archiveSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.archiveSavingsChallenge(
              {
                userId,
                challengeId,

                operationReference:
                  getOperationReference(req),

                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge archived successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Archive savings challenge"
      );
    }
  };

/* =========================================================
   RESTORE
   POST /api/savings-challenges/:challengeId/restore
========================================================= */

export const restoreSavingsChallenge =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const challengeId =
        getChallengeId(req);

      const challenge =
        await withTransaction(
          (session) =>
            savingsChallengeService.restoreSavingsChallenge(
              {
                userId,
                challengeId,
                session,
              }
            )
        );

      return sendSuccess(res, {
        message:
          "Savings challenge restored successfully",
        data: challenge,
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Restore savings challenge"
      );
    }
  };

/* =========================================================
   GET ACTIVE CHALLENGES
   GET /api/savings-challenges/active
========================================================= */

export const getActiveSavingsChallenges =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const result =
        await savingsChallengeService.getActiveSavingsChallenges(
          {
            userId,

            page:
              parseInteger(
                req.query.page,
                1
              ),

            limit:
              parseInteger(
                req.query.limit,
                20
              ),
          }
        );

      return sendSuccess(res, {
        message:
          "Active savings challenges retrieved successfully",
        data: result.items,
        meta: {
          pagination:
            result.pagination,
        },
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Get active savings challenges"
      );
    }
  };

/* =========================================================
   GET PAUSED CHALLENGES
   GET /api/savings-challenges/paused
========================================================= */

export const getPausedSavingsChallenges =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const result =
        await savingsChallengeService.getPausedSavingsChallenges(
          {
            userId,

            page:
              parseInteger(
                req.query.page,
                1
              ),

            limit:
              parseInteger(
                req.query.limit,
                20
              ),
          }
        );

      return sendSuccess(res, {
        message:
          "Paused savings challenges retrieved successfully",
        data: result.items,
        meta: {
          pagination:
            result.pagination,
        },
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Get paused savings challenges"
      );
    }
  };

/* =========================================================
   GET COMPLETED CHALLENGES
   GET /api/savings-challenges/completed
========================================================= */

export const getCompletedSavingsChallenges =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      const result =
        await savingsChallengeService.getCompletedSavingsChallenges(
          {
            userId,

            page:
              parseInteger(
                req.query.page,
                1
              ),

            limit:
              parseInteger(
                req.query.limit,
                20
              ),
          }
        );

      return sendSuccess(res, {
        message:
          "Completed savings challenges retrieved successfully",
        data: result.items,
        meta: {
          pagination:
            result.pagination,
        },
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Get completed savings challenges"
      );
    }
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  createSavingsChallenge,

  getSavingsChallenge,

  getUserSavingsChallenges,

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

  getChallengeSnapshot,

  getSavingsChallengeSummary,

  archiveSavingsChallenge,

  restoreSavingsChallenge,

  getActiveSavingsChallenges,

  getPausedSavingsChallenges,

  getCompletedSavingsChallenges,
};