// src/utils/response.js

/**
 * ============================================================
 * SMARTBUDGET RESPONSE UTILITIES
 * ============================================================
 *
 * Centralized HTTP response helpers for SmartBudget.
 *
 * Responsibilities:
 * - Standardize API success responses
 * - Standardize API error responses
 * - Handle validation errors
 * - Handle Mongoose errors
 * - Handle duplicate-key errors
 * - Handle authentication / authorization errors
 * - Support pagination metadata
 * - Prevent leaking internal errors in production
 *
 * Controllers should use these helpers instead of manually
 * constructing response objects.
 *
 * Example:
 *
 * return sendSuccess(res, {
 *   statusCode: 200,
 *   message: "Savings goal retrieved successfully",
 *   data: goal,
 * });
 *
 * Example error:
 *
 * return sendError(res, {
 *   statusCode: 404,
 *   message: "Savings goal not found",
 *   code: "SAVINGS_GOAL_NOT_FOUND",
 * });
 *
 * ============================================================
 */

/* ============================================================
   ENVIRONMENT
============================================================ */

const NODE_ENV =
  process.env.NODE_ENV || "development";

const isProduction =
  NODE_ENV === "production";

/* ============================================================
   DEFAULTS
============================================================ */

const DEFAULT_SUCCESS_STATUS = 200;

const DEFAULT_CREATED_STATUS = 201;

const DEFAULT_NO_CONTENT_STATUS = 204;

const DEFAULT_ERROR_STATUS = 500;

/* ============================================================
   REQUEST ID
============================================================ */

/**
 * Extract request ID when available.
 *
 * This allows responses to be correlated with server logs.
 */
const getRequestId = (req) => {
  if (!req) {
    return undefined;
  }

  return (
    req.id ||
    req.requestId ||
    req.headers?.["x-request-id"] ||
    undefined
  );
};

/* ============================================================
   SAFE ERROR MESSAGE
============================================================ */

/**
 * Determine whether an error message is safe to expose.
 *
 * In production, unexpected internal errors should not expose
 * implementation details, database information, stack traces,
 * file paths, or infrastructure information.
 */
const getSafeErrorMessage = (
  error,
  fallback = "An unexpected error occurred"
) => {
  if (!error) {
    return fallback;
  }

  /*
   * Explicit application/service errors may safely expose
   * their message.
   */
  if (
    error.isOperational === true ||
    error.expose === true
  ) {
    return (
      error.message ||
      fallback
    );
  }

  /*
   * Validation and known database errors are handled
   * separately by normalizeError().
   */
  if (!isProduction) {
    return (
      error.message ||
      fallback
    );
  }

  return fallback;
};

/* ============================================================
   SUCCESS RESPONSE
============================================================ */

/**
 * Send a standardized successful response.
 *
 * Response shape:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {...},
 *   meta: {...}
 * }
 */
export const sendSuccess = (
  res,
  {
    statusCode = DEFAULT_SUCCESS_STATUS,
    message = "Request successful",
    data = null,
    meta = undefined,
    req = undefined,
  } = {}
) => {
  const response = {
    success: true,
    message,
  };

  /*
   * Keep data consistently available.
   */
  if (data !== undefined) {
    response.data = data;
  }

  /*
   * Metadata is optional.
   */
  if (
    meta !== undefined &&
    meta !== null
  ) {
    response.meta = meta;
  }

  /*
   * Attach request ID when available.
   */
  const requestId =
    getRequestId(req);

  if (requestId) {
    response.requestId = requestId;
  }

  return res
    .status(statusCode)
    .json(response);
};

/* ============================================================
   CREATED RESPONSE
============================================================ */

/**
 * Convenience helper for HTTP 201 responses.
 */
export const sendCreated = (
  res,
  {
    message = "Resource created successfully",
    data = null,
    meta = undefined,
    req = undefined,
  } = {}
) => {
  return sendSuccess(res, {
    statusCode:
      DEFAULT_CREATED_STATUS,
    message,
    data,
    meta,
    req,
  });
};

/* ============================================================
   NO CONTENT RESPONSE
============================================================ */

/**
 * Send HTTP 204.
 *
 * Important:
 * HTTP 204 responses must not contain a response body.
 */
export const sendNoContent = (
  res
) => {
  return res
    .status(
      DEFAULT_NO_CONTENT_STATUS
    )
    .send();
};

/* ============================================================
   ERROR RESPONSE
============================================================ */

/**
 * Send a standardized error response.
 *
 * Response shape:
 *
 * {
 *   success: false,
 *   message: "...",
 *   code: "...",
 *   errors: [...],
 *   requestId: "..."
 * }
 */
export const sendError = (
  res,
  {
    statusCode = DEFAULT_ERROR_STATUS,
    message = "An unexpected error occurred",
    code = "INTERNAL_SERVER_ERROR",
    errors = undefined,
    req = undefined,
    error = undefined,
  } = {}
) => {
  const response = {
    success: false,
    message,
    code,
  };

  /*
   * Detailed field-level errors.
   */
  if (
    errors !== undefined &&
    errors !== null
  ) {
    response.errors = errors;
  }

  /*
   * Request correlation ID.
   */
  const requestId =
    getRequestId(req);

  if (requestId) {
    response.requestId = requestId;
  }

  /*
   * Never expose stack traces or internal error objects
   * through production API responses.
   */
  if (
    !isProduction &&
    error
  ) {
    response.debug = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return res
    .status(statusCode)
    .json(response);
};

/* ============================================================
   PAGINATION
============================================================ */

/**
 * Build standardized pagination metadata.
 *
 * Example:
 *
 * {
 *   page: 1,
 *   limit: 20,
 *   total: 87,
 *   totalPages: 5,
 *   hasNextPage: true,
 *   hasPreviousPage: false
 * }
 */
export const buildPaginationMeta = ({
  page = 1,
  limit = 20,
  total = 0,
} = {}) => {
  const normalizedPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const normalizedLimit =
    Math.max(
      Number(limit) || 20,
      1
    );

  const normalizedTotal =
    Math.max(
      Number(total) || 0,
      0
    );

  const totalPages =
    normalizedTotal === 0
      ? 0
      : Math.ceil(
          normalizedTotal /
            normalizedLimit
        );

  return {
    page: normalizedPage,

    limit: normalizedLimit,

    total: normalizedTotal,

    totalPages,

    hasNextPage:
      totalPages > 0 &&
      normalizedPage <
        totalPages,

    hasPreviousPage:
      normalizedPage > 1,
  };
};

/* ============================================================
   PAGINATED SUCCESS
============================================================ */

/**
 * Send a paginated successful response.
 */
export const sendPaginated = (
  res,
  {
    data = [],
    page = 1,
    limit = 20,
    total = 0,
    message = "Data retrieved successfully",
    req = undefined,
    meta = {},
  } = {}
) => {
  const pagination =
    buildPaginationMeta({
      page,
      limit,
      total,
    });

  return sendSuccess(res, {
    statusCode:
      DEFAULT_SUCCESS_STATUS,
    message,
    data,
    meta: {
      ...meta,
      pagination,
    },
    req,
  });
};

/* ============================================================
   VALIDATION ERROR
============================================================ */

/**
 * Normalize Mongoose validation errors.
 */
const normalizeMongooseValidationErrors = (
  error
) => {
  if (
    !error?.errors
  ) {
    return [];
  }

  return Object.entries(
    error.errors
  ).map(
    ([field, validationError]) => ({
      field,

      message:
        validationError.message ||
        "Invalid value",

      kind:
        validationError.kind ||
        "validation",

      value:
        isProduction
          ? undefined
          : validationError.value,
    })
  );
};

/**
 * Send validation error.
 */
export const sendValidationError = (
  res,
  {
    message = "Validation failed",
    errors = [],
    req = undefined,
  } = {}
) => {
  return sendError(res, {
    statusCode: 400,

    message,

    code:
      "VALIDATION_ERROR",

    errors,

    req,
  });
};

/* ============================================================
   NOT FOUND
============================================================ */

/**
 * Send resource-not-found response.
 */
export const sendNotFound = (
  res,
  {
    message = "Resource not found",
    code = "RESOURCE_NOT_FOUND",
    req = undefined,
  } = {}
) => {
  return sendError(res, {
    statusCode: 404,
    message,
    code,
    req,
  });
};

/* ============================================================
   UNAUTHORIZED
============================================================ */

/**
 * Send authentication failure.
 */
export const sendUnauthorized = (
  res,
  {
    message = "Authentication required",
    code = "UNAUTHORIZED",
    req = undefined,
  } = {}
) => {
  return sendError(res, {
    statusCode: 401,
    message,
    code,
    req,
  });
};

/* ============================================================
   FORBIDDEN
============================================================ */

/**
 * Send authorization failure.
 */
export const sendForbidden = (
  res,
  {
    message = "You do not have permission to perform this action",
    code = "FORBIDDEN",
    req = undefined,
  } = {}
) => {
  return sendError(res, {
    statusCode: 403,
    message,
    code,
    req,
  });
};

/* ============================================================
   CONFLICT
============================================================ */

/**
 * Send resource conflict response.
 */
export const sendConflict = (
  res,
  {
    message = "Resource conflict",
    code = "RESOURCE_CONFLICT",
    errors = undefined,
    req = undefined,
  } = {}
) => {
  return sendError(res, {
    statusCode: 409,
    message,
    code,
    errors,
    req,
  });
};

/* ============================================================
   TOO MANY REQUESTS
============================================================ */

/**
 * Send rate-limit response.
 */
export const sendTooManyRequests = (
  res,
  {
    message = "Too many requests. Please try again later.",
    code = "RATE_LIMIT_EXCEEDED",
    req = undefined,
  } = {}
) => {
  return sendError(res, {
    statusCode: 429,
    message,
    code,
    req,
  });
};

/* ============================================================
   MONGOOSE DUPLICATE KEY
============================================================ */

/**
 * Extract duplicate MongoDB key information.
 */
const getDuplicateKeyErrors = (
  error
) => {
  if (
    error?.code !== 11000 ||
    !error?.keyValue
  ) {
    return [];
  }

  return Object.entries(
    error.keyValue
  ).map(
    ([field, value]) => ({
      field,
      value: isProduction
        ? undefined
        : value,
      message:
        `${field} already exists`,
    })
  );
};

/**
 * Send duplicate-key conflict.
 */
export const sendDuplicateKeyError = (
  res,
  {
    error,
    req = undefined,
    message = "A resource with the supplied value already exists",
  } = {}
) => {
  const errors =
    getDuplicateKeyErrors(error);

  return sendError(res, {
    statusCode: 409,

    message,

    code:
      "DUPLICATE_RESOURCE",

    errors,

    req,
  });
};

/* ============================================================
   MONGOOSE CAST ERROR
============================================================ */

/**
 * Handle invalid MongoDB ObjectId / cast errors.
 */
export const sendCastError = (
  res,
  {
    error,
    req = undefined,
  } = {}
) => {
  const field =
    error?.path || "field";

  return sendError(res, {
    statusCode: 400,

    message:
      `Invalid ${field}`,

    code:
      "INVALID_FIELD",

    errors: [
      {
        field,
        message:
          `Invalid value supplied for ${field}`,
      },
    ],

    req,
  });
};

/* ============================================================
   ERROR NORMALIZATION
============================================================ */

/**
 * Convert application/database errors into a standardized
 * response configuration.
 *
 * This function does not send the response.
 */
export const normalizeError = (
  error
) => {
  /*
   * Mongoose validation error
   */
  if (
    error?.name ===
    "ValidationError"
  ) {
    return {
      statusCode: 400,

      message:
        "Validation failed",

      code:
        "VALIDATION_ERROR",

      errors:
        normalizeMongooseValidationErrors(
          error
        ),
    };
  }

  /*
   * Mongo duplicate key
   */
  if (
    error?.code === 11000
  ) {
    return {
      statusCode: 409,

      message:
        "A resource with the supplied value already exists",

      code:
        "DUPLICATE_RESOURCE",

      errors:
        getDuplicateKeyErrors(
          error
        ),
    };
  }

  /*
   * Mongoose cast error.
   */
  if (
    error?.name ===
    "CastError"
  ) {
    const field =
      error.path || "field";

    return {
      statusCode: 400,

      message:
        `Invalid ${field}`,

      code:
        "INVALID_FIELD",

      errors: [
        {
          field,

          message:
            `Invalid value supplied for ${field}`,
        },
      ],
    };
  }

  /*
   * Explicit application/service error.
   */
  if (
    error?.statusCode
  ) {
    return {
      statusCode:
        error.statusCode,

      message:
        getSafeErrorMessage(
          error
        ),

      code:
        error.code ||
        "APPLICATION_ERROR",

      errors:
        error.errors ||
        undefined,
    };
  }

  /*
   * Unexpected error.
   */
  return {
    statusCode: 500,

    message:
      getSafeErrorMessage(
        error,
        "Internal server error"
      ),

    code:
      "INTERNAL_SERVER_ERROR",
  };
};

/* ============================================================
   CONTROLLER ERROR HANDLER
============================================================ */

/**
 * Central helper for controller catch blocks.
 *
 * Usage:
 *
 * catch (error) {
 *   return handleControllerError(
 *     res,
 *     error,
 *     req
 *   );
 * }
 */
export const handleControllerError = (
  res,
  error,
  req = undefined
) => {
  const normalized =
    normalizeError(error);

  return sendError(res, {
    ...normalized,
    req,
    error,
  });
};

/* ============================================================
   ASYNC CONTROLLER WRAPPER
============================================================ */

/**
 * Optional async controller wrapper.
 *
 * This prevents repetitive try/catch blocks when the Express
 * application has not yet adopted centralized async error
 * middleware.
 *
 * Usage:
 *
 * export const getGoal = asyncHandler(
 *   async (req, res) => {
 *     ...
 *   }
 * );
 */
export const asyncHandler = (
  controller
) => {
  if (
    typeof controller !==
    "function"
  ) {
    throw new TypeError(
      "asyncHandler requires a controller function"
    );
  }

  return (
    req,
    res,
    next
  ) => {
    Promise.resolve(
      controller(
        req,
        res,
        next
      )
    ).catch(next);
  };
};

/* ============================================================
   EXPRESS ERROR MIDDLEWARE
============================================================ */

/**
 * Central Express error middleware.
 *
 * This can be registered near the bottom of server.js:
 *
 * app.use(errorHandler);
 */
export const errorHandler = (
  error,
  req,
  res,
  next
) => {
  /*
   * If headers have already been sent, delegate to Express.
   */
  if (
    res.headersSent
  ) {
    return next(error);
  }

  return handleControllerError(
    res,
    error,
    req
  );
};

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default {
  sendSuccess,
  sendCreated,
  sendNoContent,

  sendError,
  sendPaginated,

  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  sendTooManyRequests,

  sendDuplicateKeyError,
  sendCastError,

  buildPaginationMeta,

  normalizeError,
  handleControllerError,

  asyncHandler,
  errorHandler,
};