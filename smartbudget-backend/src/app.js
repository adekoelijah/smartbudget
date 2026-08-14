

// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// // ===============================
// // ROUTES
// // ===============================

// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import budgetRoutes from "./routes/budgetRoutes.js";
// import transactionRoutes from "./routes/transactionRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import exportRoutes from "./routes/exportRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import preferenceRoutes from "./routes/preferenceRoutes.js";
// import cookieParser from "cookie-parser";

// const app = express();

// //cookie
// app.use(cookieParser());


// app.use((req, res, next) => {

//   console.log(
//     "REQUEST:",
//     req.method,
//     req.originalUrl
//   );

//   next();

// });


// // ===============================
// // TRUST PROXY
// // Required for Vercel, reverse proxies,
// // rate limiting, secure cookies
// // ===============================

// app.set("trust proxy", 1);


// // ===============================
// // SECURITY MIDDLEWARE
// // ===============================

// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );


// app.use(
//   morgan(
//     process.env.NODE_ENV === "production"
//       ? "combined"
//       : "dev"
//   )
// );


// // ===============================
// // CORS CONFIGURATION
// // ===============================

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://nexatech-smartbudget.vercel.app",
  
// ];
// credentials:true



// const corsOptions = {

//   origin: (origin, callback) => {

//     // Allow:
//     // - Postman
//     // - server-to-server calls
//     // - mobile applications

//     if (!origin) {
//       return callback(null, true);
//     }


//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }


//     console.warn(
//       "Blocked CORS origin:",
//       origin
//     );


//     return callback(
//       new Error("Not allowed by CORS")
//     );
//   },


//   credentials: true,


//   methods: [
//     "GET",
//     "POST",
//     "PUT",
//     "PATCH",
//     "DELETE",
//     "OPTIONS",
//   ],


//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//   ],
// };


// app.use(cors(corsOptions));


// // ===============================
// // BODY PARSING
// // ===============================

// app.use(
//   express.json({
//     limit: "10mb",
//   })
// );


// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );


// // ===============================
// // HEALTH CHECKS
// // ===============================


// app.get("/api/health", (req, res)=>{

//   res.status(200).json({

//     success:true,

//     service:"SmartBudget API",

//     status:"running",

//     environment:
//       process.env.NODE_ENV || "development",

//     timestamp:
//       new Date().toISOString(),

//   });

// });



// app.get("/api/db-test", (req,res)=>{

//   const states = [
//     "disconnected",
//     "connected",
//     "connecting",
//     "disconnecting",
//   ];


//   const state =
//     mongoose.connection.readyState;


//   res.status(200).json({

//     success:
//       state === 1,

//     mongodb:
//       states[state] || "unknown",

//   });

// });


// // ===============================
// // API ROUTES
// // ===============================


// app.use(
//   "/api/auth",
//   authRoutes
// );


// app.use(
//   "/api/users",
//   userRoutes
// );


// app.use(
//   "/api/budgets",
//   budgetRoutes
// );


// app.use(
//   "/api/transactions",
//   transactionRoutes
// );


// app.use(
//   "/api/dashboard",
//   dashboardRoutes
// );


// app.use(
//   "/api/export",
//   exportRoutes
// );


// app.use(
// "/api/notifications",
// notificationRoutes
// );
// app.use("/api/preferences", preferenceRoutes);

// // ===============================
// // ROOT ROUTE
// // ===============================

// app.get("/", (req,res)=>{

//   res.status(200).json({

//     success:true,

//     message:
//       "SmartBudget API is running 🚀",

//   });

// });


// app.get("/api/", (req, res) => {
//   res.json({
//     success: true,
//     message: "SmartBudget API endpoint",
//     version: "1.0.0"
//   });
// });

// // ===============================
// // 404 HANDLER
// // ===============================

// app.use(
//   (req,res)=>{

//     res.status(404).json({

//       success:false,

//       message:
//         `Route not found: ${req.originalUrl}`,

//     });

//   }
// );


// // ===============================
// // GLOBAL ERROR HANDLER
// // ===============================

// app.use(
//   (err,req,res,next)=>{

//     console.error(
//       "SERVER ERROR:",
//       err
//     );


//     if(err.message === "Not allowed by CORS"){

//       return res.status(403).json({

//         success:false,

//         message:
//           "CORS policy blocked this request",

//       });

//     }


//     res.status(
//       err.status || 500
//     )
//     .json({

//       success:false,

//       message:
//         process.env.NODE_ENV === "production"
//         ? "Internal Server Error"
//         : err.message,

//     });

//   }
// );


// export default app;



import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import crypto from "crypto";

// =========================================================
// ROUTES
// =========================================================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";

import savingsRoutes from "./routes/savingsRoutes.js";


// =========================================================
// APP
// =========================================================

const app = express();


// =========================================================
// ENVIRONMENT
// =========================================================

const NODE_ENV =
  process.env.NODE_ENV || "development";

const isProduction =
  NODE_ENV === "production";


// =========================================================
// TRUST PROXY
// =========================================================
//
// Required when deployed behind:
// - Vercel
// - Nginx
// - Load balancers
// - Reverse proxies
//
// This is especially important for:
// - secure cookies
// - req.ip
// - rate limiting
// - HTTPS detection
//

app.set(
  "trust proxy",
  isProduction ? 1 : 0
);


// =========================================================
// REQUEST ID
// =========================================================
//
// Gives every request a traceable identifier.
//
// Useful for:
// - Vercel logs
// - production debugging
// - support investigations
// - correlating frontend/API failures
//

app.use((req, res, next) => {
  const requestId =
    req.headers["x-request-id"] ||
    crypto.randomUUID();

  req.requestId =
    String(requestId);

  res.setHeader(
    "X-Request-ID",
    req.requestId
  );

  next();
});


// =========================================================
// SECURITY
// =========================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,

    // API does not need browser DNS prefetching.
    dnsPrefetchControl: {
      allow: false,
    },

    // Prevent MIME sniffing.
    noSniff: true,

    // Basic referrer protection.
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  })
);


// =========================================================
// COOKIE PARSER
// =========================================================

app.use(cookieParser());


// =========================================================
// CORS
// =========================================================

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://nexatech-smartbudget.vercel.app",
  ].join(",")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);


const corsOptions = {
  origin: (origin, callback) => {
    /*
     * Requests without an Origin header can include:
     *
     * - Postman
     * - curl
     * - server-to-server requests
     * - some mobile clients
     */
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    console.warn(
      `[CORS] Blocked origin: ${origin}`
    );

    return callback(
      new Error("Not allowed by CORS")
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Request-ID",
  ],

  exposedHeaders: [
    "X-Request-ID",
  ],

  optionsSuccessStatus: 204,
};

app.use(
  cors(corsOptions)
);


// =========================================================
// BODY PARSING
// =========================================================
//
// Keep request payloads intentionally bounded.
//
// 10 MB is unnecessarily large for most SmartBudget
// API requests.
//

app.use(
  express.json({
    limit: "1mb",

    strict: true,
  })
);

app.use(
  express.urlencoded({
    extended: false,

    limit: "1mb",
  })
);


// =========================================================
// HTTP LOGGING
// =========================================================

app.use(
  morgan(
    isProduction
      ? "combined"
      : "dev"
  )
);


// =========================================================
// HEALTH CHECK
// =========================================================
//
// Lightweight liveness endpoint.
//
// IMPORTANT:
// This endpoint does NOT require MongoDB to be available.
// A process can be alive while MongoDB is temporarily
// unavailable.
//

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,

      service:
        "SmartBudget API",

      status:
        "running",

      environment:
        NODE_ENV,

      timestamp:
        new Date().toISOString(),

      requestId:
        req.requestId,
    });
  }
);


// =========================================================
// READINESS CHECK
// =========================================================
//
// Unlike /health, this endpoint verifies MongoDB.
//
// Useful for:
// - deployment monitoring
// - uptime systems
// - load balancers
//

app.get(
  "/api/ready",
  (req, res) => {
    const state =
      mongoose.connection.readyState;

    const ready =
      state === 1;

    res.status(
      ready ? 200 : 503
    ).json({
      success: ready,

      service:
        "SmartBudget API",

      status:
        ready
          ? "ready"
          : "not_ready",

      mongodb:
        ready
          ? "connected"
          : "disconnected",

      timestamp:
        new Date().toISOString(),

      requestId:
        req.requestId,
    });
  }
);


// =========================================================
// DATABASE STATUS
// =========================================================
//
// Keep this endpoint lightweight.
// Do not expose MongoDB connection details.
//

app.get(
  "/api/db-test",
  (req, res) => {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const state =
      mongoose.connection.readyState;

    const connected =
      state === 1;

    res.status(
      connected ? 200 : 503
    ).json({
      success: connected,

      mongodb:
        states[state] ||
        "unknown",

      requestId:
        req.requestId,
    });
  }
);


// =========================================================
// API ROUTES
// =========================================================

/*
=========================================================
AUTH
=========================================================
*/

app.use(
  "/api/auth",
  authRoutes
);


/*
=========================================================
USERS
=========================================================
*/

app.use(
  "/api/users",
  userRoutes
);


/*
=========================================================
BUDGETS
=========================================================
*/

app.use(
  "/api/budgets",
  budgetRoutes
);


/*
=========================================================
TRANSACTIONS
=========================================================
*/

app.use(
  "/api/transactions",
  transactionRoutes
);


/*
=========================================================
DASHBOARD
=========================================================
*/

app.use(
  "/api/dashboard",
  dashboardRoutes
);


/*
=========================================================
EXPORT
=========================================================
*/

app.use(
  "/api/export",
  exportRoutes
);


/*
=========================================================
NOTIFICATIONS
=========================================================
*/

app.use(
  "/api/notifications",
  notificationRoutes
);


/*
=========================================================
PREFERENCES
=========================================================
*/

app.use(
  "/api/preferences",
  preferenceRoutes
);


/*
=========================================================
SAVINGS
=========================================================
*/

/**
 * Savings domain:
 *
 * /api/savings/accounts
 * /api/savings/contributions
 * /api/savings/goals
 * /api/savings/plans
 * /api/savings/schedules
 * /api/savings/executions
 * /api/savings/challenges
 * /api/savings/insights
 */

app.use(
  "/api/savings",
  savingsRoutes
);


// =========================================================
// API ROOT
// =========================================================

app.get(
  "/api/",
  (req, res) => {
    res.status(200).json({
      success: true,

      service:
        "SmartBudget API",

      version:
        process.env.API_VERSION ||
        "1.0.0",

      status:
        "running",

      timestamp:
        new Date().toISOString(),

      requestId:
        req.requestId,
    });
  }
);


// =========================================================
// ROOT
// =========================================================

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "SmartBudget API is running 🚀",

      version:
        process.env.API_VERSION ||
        "1.0.0",

      requestId:
        req.requestId,
    });
  }
);


// =========================================================
// 404 HANDLER
// =========================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,

      code:
        "ROUTE_NOT_FOUND",

      message:
        "The requested route was not found",

      path:
        req.originalUrl,

      method:
        req.method,

      requestId:
        req.requestId,
    });
  }
);


// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    /*
     * Prevent Express from complaining about
     * unused next in environments where it is
     * required by the middleware signature.
     */
    void next;

    const statusCode =
      Number(err.statusCode) ||
      Number(err.status) ||
      500;

    const isCorsError =
      err.message ===
      "Not allowed by CORS";

    /*
     * CORS errors.
     */
    if (isCorsError) {
      console.warn(
        `[CORS_ERROR] ${req.method} ${req.originalUrl}`,
        {
          origin:
            req.headers.origin,

          requestId:
            req.requestId,
        }
      );

      return res.status(403).json({
        success: false,

        code:
          "CORS_FORBIDDEN",

        message:
          "CORS policy blocked this request",

        requestId:
          req.requestId,
      });
    }


    /*
     * Malformed JSON.
     */
    if (
      err instanceof SyntaxError &&
      err.status === 400 &&
      "body" in err
    ) {
      return res.status(400).json({
        success: false,

        code:
          "INVALID_JSON",

        message:
          "The request body contains invalid JSON",

        requestId:
          req.requestId,
      });
    }


    /*
     * Mongo duplicate-key error.
     */
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,

        code:
          "DUPLICATE_RESOURCE",

        message:
          "A resource with the supplied unique value already exists",

        requestId:
          req.requestId,
      });
    }


    /*
     * Mongoose validation error.
     */
    if (
      err.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          err.errors || {}
        ).map(
          (item) => ({
            field:
              item.path,

            message:
              item.message,
          })
        );

      return res.status(400).json({
        success: false,

        code:
          "VALIDATION_ERROR",

        message:
          "Request validation failed",

        errors,

        requestId:
          req.requestId,
      });
    }


    /*
     * Mongoose CastError.
     */
    if (
      err.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,

        code:
          "INVALID_PARAMETER",

        message:
          `Invalid value for ${err.path}`,

        requestId:
          req.requestId,
      });
    }


    /*
     * Determine whether this is a trusted/application
     * error.
     */
    const safeStatus =
      statusCode >= 400 &&
      statusCode < 600
        ? statusCode
        : 500;


    /*
     * Production logging.
     *
     * Avoid returning stack traces to clients.
     */
    console.error(
      "[SERVER_ERROR]",
      {
        requestId:
          req.requestId,

        method:
          req.method,

        url:
          req.originalUrl,

        statusCode:
          safeStatus,

        error:
          err.message,

        stack:
          err.stack,
      }
    );


    /*
     * Production response.
     */
    if (isProduction) {
      return res.status(
        safeStatus
      ).json({
        success: false,

        code:
          err.code ||
          "INTERNAL_SERVER_ERROR",

        message:
          safeStatus >= 500
            ? "Internal Server Error"
            : err.message,

        requestId:
          req.requestId,
      });
    }


    /*
     * Development response.
     *
     * Useful while building the application.
     */
    return res.status(
      safeStatus
    ).json({
      success: false,

      code:
        err.code ||
        "INTERNAL_SERVER_ERROR",

      message:
        err.message ||
        "An unexpected error occurred",

      requestId:
        req.requestId,

      stack:
        err.stack,
    });
  }
);


// =========================================================
// EXPORT
// =========================================================

export default app;